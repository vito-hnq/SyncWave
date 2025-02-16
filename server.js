const express = require('express');
const mysql = require('mysql2');
const dotenv = require('dotenv');

dotenv.config();

// Criando a conexão com o banco de dados
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

connection.connect(err => {
  if (err) {
    console.error('Erro ao conectar ao MySQL:', err);
    return;
  }
  console.log('Conectado ao MySQL!');
});

// Criando o servidor Express
const app = express();
app.use(express.json());

app.post('/usuarios', (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
  }

  // Inserindo o usuário no banco de dados
  const query = 'INSERT INTO usuarios (username, email, password) VALUES (?, ?, ?)';
  connection.query(query, [username, email, password], (err, results) => {
    if (err) {
      console.error('Erro ao inserir usuário:', err);
      return res.status(500).json({ message: 'Erro ao cadastrar usuário.' });
    }

    res.status(201).json({ message: 'Usuário cadastrado com sucesso!' });
  });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
