const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken'); // Importando o jsonwebtoken
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

// Chave secreta para gerar o JWT
const JWT_SECRET = 'secreta_syncwave';

// Função para verificar o token JWT
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1]; // Pegando o token do cabeçalho
  
  if (!token) return res.sendStatus(403); // Se não houver token
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403); // Se o token for inválido
    req.user = user;
    next();
  });
};

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

// Rota para autenticação de login e geração do JWT
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
        // Gerar o token JWT após o login bem-sucedido
        const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '1h' });
        return res.status(200).json({ message: 'Login bem-sucedido', token: token });
      } else {
        return res.status(400).json({ message: 'E-mail ou senha inválidos.' });
      }
    });
  });
});

// Rota para obter o nome do usuário logado
app.get('/getUserName', authenticateToken, (req, res) => {
  const userId = req.user.id;

  // Buscar o usuário no banco de dados usando o ID do usuário
  connection.query('SELECT username FROM usuarios WHERE id = ?', [userId], (err, results) => {
    if (err) {
      console.error('Erro ao buscar nome do usuário:', err);
      return res.status(500).json({ message: 'Erro ao buscar nome do usuário.' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    const user = results[0];
    return res.json({ name: user.username });
  });
});

// Rota para obter o nome do usuário logado
app.get('/getUserName', (req, res) => {
  const token = req.headers['authorization'];
  if (!token) {
    return res.status(401).json({ message: 'Acesso não autorizado.' });
  }

  // Decodificar o token (supondo que você use algo como JWT)
  jwt.verify(token.split(' ')[1], 'seu-segredo', (err, decoded) => {
    if (err) {
      return res.status(500).json({ message: 'Erro ao verificar o token.' });
    }

    // Buscar o usuário no banco de dados usando o ID decodificado do token
    connection.query('SELECT username FROM usuarios WHERE id = ?', [decoded.id], (err, results) => {
      if (err) {
        console.error('Erro ao buscar usuário:', err);
        return res.status(500).json({ message: 'Erro ao buscar o nome do usuário.' });
      }

      if (results.length > 0) {
        return res.status(200).json({ name: results[0].username });
      } else {
        return res.status(404).json({ message: 'Usuário não encontrado.' });
      }
    });
  });
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
