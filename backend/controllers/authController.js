// backend/controllers/authController.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const login = async (req, res) => {
  const { email, senha } = req.body;

  try {
    const user = await User.findByEmail(email);

    if (!user || user.senha !== senha) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    res.json({ token });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ message: 'Erro interno no servidor' });
  }
};

const register = async (req, res) => {
  const { nome, email, senha } = req.body;

  try {
    const newUser = await User.create({ nome, email, senha });
    res.status(201).json({ message: 'Usuário registrado com sucesso', user: newUser });
  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({ message: 'Erro interno no servidor' });
  }
};

module.exports = { login, register };