// backend/models/File.js
const { connectDB } = require('../config/ds_db');

class File {
  static async create({ userId, nome, tipo, tamanho, caminho }) {
    const connection = await connectDB();
    const [result] = await connection.execute(
      'INSERT INTO arquivos (userId, nome, tipo, tamanho, caminho) VALUES (?, ?, ?, ?, ?)',
      [userId, nome, tipo, tamanho, caminho]
    );
    return result;
  }

  static async findByUserId(userId) {
    const connection = await connectDB();
    const [rows] = await connection.execute('SELECT * FROM arquivos WHERE userId = ?', [userId]);
    return rows;
  }
}

module.exports = File;