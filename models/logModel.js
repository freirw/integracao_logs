// models/logModel.js
const mongoose = require("../config/db"); // Certifique-se de que está importando a conexão corretamente

const logSchema = new mongoose.Schema({
  id_log: String,
  id_usuario: String,
  acao: String,
  timestamp: Date,
  detalhes: String,
});

// Aqui você exporta o modelo corretamente
module.exports = mongoose.model("Log", logSchema);
