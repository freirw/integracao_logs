// config/db.js (MongoDB)
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/logsDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Erro na conexão com o MongoDB:'));
db.once('open', () => console.log('Conectado ao MongoDB'));

module.exports = mongoose;
