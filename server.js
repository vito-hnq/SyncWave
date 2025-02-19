const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcryptjs'); // Use bcryptjs, que é mais adequado para Node.js
const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'syncwave',
  password: '1234',
  database: 'syncwave_db'
});

connection.connect((err) => {
  if (err) {
    console.error('Erro ao conectar ao MySQL:', err);
    return;
  }
  console.log('Conectado ao MySQL!');
});

// Rota para cadastrar um novo usuário
app.post('/usuarios', (req, res) => {
  const { username, email, password } = req.body;

  // Verificando se todos os campos foram fornecidos
  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
  }

  // Verificar se o e-mail já existe
  connection.query('SELECT * FROM usuarios WHERE email = ?', [email], (err, results) => {
    if (err) {
      console.error('Erro ao verificar e-mail:', err);
      return res.status(500).json({ message: 'Erro ao verificar e-mail.' });
    }

    if (results.length > 0) {
      return res.status(400).json({ message: 'E-mail já cadastrado.' });
    }

    // Criptografar a senha antes de salvar
    bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) {
        console.error('Erro ao criptografar senha:', err);
        return res.status(500).json({ message: 'Erro ao cadastrar usuário.' });
      }

      // Inserir o novo usuário no banco de dados com a senha criptografada
      connection.query('INSERT INTO usuarios (username, email, password) VALUES (?, ?, ?)', [username, email, hashedPassword], (err, results) => {
        if (err) {
          console.error('Erro ao inserir usuário:', err);
          return res.status(500).json({ message: 'Erro ao cadastrar usuário.' });
        }

        return res.status(201).json({ message: 'Usuário cadastrado com sucesso!' });
      });
    });
  });
});

// Rota para autenticação de login
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'E-mail e senha são obrigatórios.' });
  }

  // Verificar se o e-mail existe no banco de dados
  connection.query('SELECT * FROM usuarios WHERE email = ?', [email], (err, results) => {
    if (err) {
      console.error('Erro ao verificar e-mail:', err);
      return res.status(500).json({ message: 'Erro ao verificar e-mail.' });
    }

    if (results.length === 0) {
      return res.status(400).json({ message: 'E-mail ou senha inválidos.' });
    }

    const user = results[0];

    // Verificar se a senha fornecida corresponde ao hash da senha no banco de dados
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) {
        console.error('Erro ao comparar senha:', err);
        return res.status(500).json({ message: 'Erro ao comparar senha.' });
      }

      if (isMatch) {
        return res.status(200).json({ message: 'Login bem-sucedido' });
      } else {
        return res.status(400).json({ message: 'E-mail ou senha inválidos.' });
      }
    });
  });
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
