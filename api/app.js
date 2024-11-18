// Time 1: appTime1.js (API para acessar logs do MongoDB)
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
const port = 3002;

// Conectar ao MongoDB
mongoose.connect('mongodb://localhost:27017/logsDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const Log = mongoose.model('Log', new mongoose.Schema({
  id_log: String,
  id_usuario: String,
  acao: String,
  timestamp: Date,
  detalhes: String,
}));

app.use(bodyParser.json());

// Rota para expor os logs (com filtro opcional por usuário)
app.get('/logs', async (req, res) => {
  try {
    const { userId } = req.query; // Permitir filtrar por usuário, se necessário
    const query = userId ? { id_usuario: userId } : {};
    const logs = await Log.find(query);

    res.status(200).json(logs);
  } catch (error) {
    console.error('Erro ao buscar logs:', error);
    res.status(500).json({ message: 'Erro ao buscar logs', error: error.message });
  }
});

// Iniciar servidor do Time 1
app.listen(port, () => {
  console.log(`API do Time 1 rodando na porta ${port}`);
});
