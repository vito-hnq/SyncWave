const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { authenticateUser } = require('../services/authService');

const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  authenticateUser(username, password, (err, token) => {
    if (err) return res.status(500).send('Erro interno');
    if (!token) return res.status(401).send('Credenciais inválidas');

    res.json({ token });
  });
});

router.get('/getUserName', authenticateToken, (req, res) => {
  res.json({ username: req.user.username });
});

module.exports = router;