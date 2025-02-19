const express = require('express');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

const requiredEnv = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
for (const envVar of requiredEnv) {
  if (!process.env[envVar]) {
    console.error(`Erro: A variável de ambiente ${envVar} não está definida.`);
    process.exit(1);
  }
}

const app = express();
app.use(express.json());

let db;

(async () => {
  try {
    db = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    console.log('Conectado ao MySQL!');
  } catch (err) {
    console.error('Erro ao conectar ao MySQL:', err);
    process.exit(1);
  }
})();

// Rota para cadastrar usuário
app.post('/usuarios', async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
  }

  try {
    const query = 'INSERT INTO usuarios (username, email, password) VALUES (?, ?, ?)';
    const [result] = await db.execute(query, [username, email, password]);

    res.status(201).json({ message: 'Usuário cadastrado com sucesso!', userId: result.insertId });
  } catch (err) {
    console.error('Erro ao inserir usuário:', err);
    res.status(500).json({ message: 'Erro ao cadastrar usuário.' });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});


