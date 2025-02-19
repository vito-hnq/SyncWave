const mysql = require('mysql2');
const dotenv = require('dotenv');

dotenv.config();

// Configuração de conexão com o MySQL
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'syncwave',
  password: '1234',
  database: 'syncwave_db'
});


// Conectar ao banco
connection.connect((err) => {
  if (err) {
    console.error('Erro ao conectar ao banco:', err);
    return;
  }
  console.log('Conectado ao banco de dados MySQL!');
});

module.exports = connection;
 