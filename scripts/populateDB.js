const Log = require("../models/logModel");
const logsData = require("../data/logs_uso.json");

async function populateDB() {
  try {
    await Log.insertMany(logsData);
    console.log("Logs inseridos com sucesso!");
  } catch (err) {
    console.error("Erro ao inserir logs:", err);
  } finally {
    process.exit();
  }
}

populateDB();
