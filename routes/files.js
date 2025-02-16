const express = require('express');
const multer = require('multer');
const path = require('path');
const fileController = require('../controllers/fileController');

const router = express.Router();

// Configuração do multer para uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(__dirname, '../uploads'));
    },
    filename: (req, file, cb) => {
      const uniqueName = Date.now() + '-' + file.originalname;
      cb(null, uniqueName);
    },
  });
  
const upload = multer({ storage });

// Rotas
router.get('/', fileController.listFiles);
router.post('/', upload.single('file'), fileController.uploadFile);
router.get('/:id/download', fileController.downloadFile);
router.delete('/:id', fileController.deleteFile);

module.exports = router;
