// Time 2: appcouch.js (Consome logs do MongoDB e armazena métricas no CouchDB)
const express = require('express');
const axios = require('axios'); // Para consumir a API do Time 1
const nano = require('nano')('http://admin:123@localhost:5984'); // Conectar ao CouchDB
const bodyParser = require('body-parser');
const { calculateAverageTimePerPage, calculateUsagePeaks } = require('../analysis/calculateMetrics');

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

// Função para calcular padrões de navegação
function calculateNavigationPatterns(logs) {
  const userPatterns = {};

  logs.forEach((log) => {
    const { id_usuario, acao, timestamp } = log;

    if (!userPatterns[id_usuario]) {
      userPatterns[id_usuario] = [];
    }

    userPatterns[id_usuario].push({ page: acao, timestamp: new Date(timestamp) });
  });

  // Ordenar os logs por timestamp para cada usuário
  Object.keys(userPatterns).forEach((userId) => {
    userPatterns[userId].sort((a, b) => a.timestamp - b.timestamp);
  });

  return Object.entries(userPatterns).map(([user, pattern]) => ({
    user,
    pattern,
  }));
}

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
    const averageTime = calculateAverageTimePerPage(logs); // Tempo médio por página
    const usagePeaks = calculateUsagePeaks(logs); // Picos de uso
    const navigationPatterns = calculateNavigationPatterns(logs); // Padrões de navegação

    // Preparar documentos para salvar no CouchDB
    const docsToInsert = [
      ...averageTime.map((item) => ({ type: 'average-time', ...item })),
      ...usagePeaks.map((item) => ({ type: 'usage-peak', ...item })),
      ...navigationPatterns.map((item) => ({
        type: 'navigation-pattern',
        user: item.user,
        pattern: item.pattern,
      })),
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
