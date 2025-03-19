// backend/models/User.js
const { connectDB } = require('../config/ds_db');

class User {
  static async create({ nome, email, senha }) {
    const connection = await connectDB();
    const [result] = await connection.execute(
      'INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)',
      [nome, email, senha]
    );
    return result;
  }

  static async findByEmail(email) {
    const connection = await connectDB();
    const [rows] = await connection.execute('SELECT * FROM usuarios WHERE email = ?', [email]);
    return rows[0];
  }
}

module.exports = User;