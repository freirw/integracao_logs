const Log = require("../models/logModel");
const logsData = require("./logs_uso.json");

async function logs_uso() {
  try {
    await Log.insertMany(logsData);
    console.log("Logs inseridos com sucesso!");
  } catch (err) {
    console.error("Erro ao inserir logs:", err);
  }
}

logs_uso();
