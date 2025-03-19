// backend/routes/fileRoutes.js
const express = require('express');
const router = express.Router();
const fileController = require('../controllers/fileController'); // Importa o controller

// Rotas para manipulação de arquivos
router.get('/', fileController.listFiles); // Listar arquivos
router.post('/', fileController.uploadFile); // Upload de arquivo
router.delete('/:id', fileController.deleteFile); // Deletar arquivo

module.exports = router; // Exporta o roteador