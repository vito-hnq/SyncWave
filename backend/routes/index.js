// backend/routes/index.js
const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes'); // Importa as rotas de autenticação
const fileRoutes = require('./fileRoutes'); // Importa as rotas de arquivos

// Define as rotas
router.use('/auth', authRoutes); // Rotas de autenticação
router.use('/files', fileRoutes); // Rotas de arquivos

module.exports = router; // Exporta o roteador principal