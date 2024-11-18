// config/db_analysis.js (CouchDB)
const nano = require('nano')('http://admin:123@localhost:5984'); // A porta padrão do CouchDB é 5984

const logsDB = nano.db.use('logs_database'); // O banco de dados que você quer usar no CouchDB

module.exports = { logsDB };
