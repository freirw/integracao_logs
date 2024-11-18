const express = require('express');
const axios = require('axios'); // Para consumir a API do Time 1
const nano = require('nano')('http://admin:admin@localhost:5984'); // Conectar ao CouchDB
const bodyParser = require('body-parser');
const { calculateAverageTimePerPage, calculateUsagePeaks, calculateNavigationPatterns } = require('../analysis/calculateMetrics');

const app = express();
const port = 3003;

app.use(bodyParser.json());

// Configurar o CouchDB
const dbName = 'logs_database';
const logsDB = nano.db.use(dbName);

// Verificar se o banco de dados do CouchDB existe, senão criar
nano.db.create(dbName, (err, body) => {
  if (err && err.error !== 'file_exists') {
    console.error('Erro ao criar banco de dados no CouchDB:', err);
  } else {
    console.log(`Banco de dados "${dbName}" pronto para uso.`);
  }
});

// Função para consumir logs do MongoDB
async function fetchLogsFromMongoDB() {
  try {
    const response = await axios.get('http://localhost:3002/logs'); // API do Time 1
    return response.data; // Retorna os logs consumidos
  } catch (error) {
    console.error('Erro ao consumir logs do MongoDB:', error.message);
    throw error;
  }
}

// Rota para processar logs e salvar métricas no CouchDB
app.post('/process-logs', async (req, res) => {
  try {
    // Consumir logs do MongoDB (API do Time 1)
    const logs = await fetchLogsFromMongoDB();

    if (!logs || logs.length === 0) {
      return res.status(400).json({ message: 'Nenhum log encontrado no MongoDB.' });
    }

    console.log('Logs consumidos do MongoDB:', logs);

    // Calcular métricas
    const averageTime = calculateAverageTimePerPage(logs);
    const usagePeaks = calculateUsagePeaks(logs);
    console.log('Dados calculados para usage-peaks:', usagePeaks);
    const navigationPatterns = calculateNavigationPatterns(logs);

    // Preparar documentos para salvar no CouchDB
    const docsToInsert = [
      ...averageTime.map((item) => ({ type: 'average-time', ...item })),
      ...usagePeaks.map((item) => ({ type: 'usage-peak', ...item })),
      ...navigationPatterns.map((item) => ({ type: 'navigation-pattern', ...item })),
    ];

    // Salvar métricas no CouchDB
    const response = await logsDB.bulk({ docs: docsToInsert });

    console.log('Métricas salvas no CouchDB:', response);

    res.status(201).json({
      message: 'Logs processados e métricas salvas no CouchDB.',
      data: { averageTime, usagePeaks, navigationPatterns },
    });
  } catch (error) {
    console.error('Erro ao processar logs:', error.message);
    res.status(500).json({ message: 'Erro ao processar logs.', error: error.message });
  }
});

// Iniciar servidor do Time 2
app.listen(port, () => {
  console.log(`API do Time 2 rodando na porta ${port}`);
});
