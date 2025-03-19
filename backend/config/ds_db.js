// backend/config/ds_db.js
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = async () => {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    console.log('Conectado ao banco de dados MySQL!');
    return connection;
  } catch (error) {
    console.error('Erro ao conectar ao banco de dados:', error);
    process.exit(1); // Encerrar o processo em caso de erro
  }
};

module.exports = { connectDB };