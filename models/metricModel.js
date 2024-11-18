// metricModel.js (adaptado para CouchDB)
const nano = require("nano")("http://localhost:5984"); // Conexão com o CouchDB
const db = nano.db.use("logs_database"); // Usando a database logs_database

// Função para adicionar uma nova métrica (log)
async function addLog(log) {
  try {
    const response = await db.insert(log);  // Inserindo o log no CouchDB
    console.log("Log adicionado com sucesso:", response);
    return response;
  } catch (err) {
    console.error("Erro ao adicionar log:", err);
    throw err;  // Lançando erro para o controlador lidar
  }
}

// Função para atualizar um log
async function updateLog(id, rev, log) {
  try {
    const updatedLog = {
      _id: id,
      _rev: rev,
      ...log,  // Mesclando o conteúdo do log
    };
    const response = await db.insert(updatedLog);  // Atualizando o log no CouchDB
    console.log("Log atualizado com sucesso:", response);
    return response;
  } catch (err) {
    console.error("Erro ao atualizar log:", err);
    throw err;  // Lançando erro para o controlador lidar
  }
}

// Função para excluir um log
async function deleteLog(id, rev) {
  try {
    const response = await db.destroy(id, rev);  // Deletando o log no CouchDB
    console.log("Log excluído com sucesso:", response);
    return response;
  } catch (err) {
    console.error("Erro ao excluir log:", err);
    throw err;  // Lançando erro para o controlador lidar
  }
}

// Função para buscar logs (exemplo: todos os logs)
async function getLogs() {
  try {
    const result = await db.list({ include_docs: true });  // Listando logs no CouchDB
    console.log("Logs encontrados:", result.rows.map(row => row.doc));
    return result.rows.map(row => row.doc);  // Retorna os logs encontrados
  } catch (err) {
    console.error("Erro ao buscar logs:", err);
    throw err;  // Lançando erro para o controlador lidar
  }
}

module.exports = {
  addLog,
  updateLog,
  deleteLog,
  getLogs,
};
