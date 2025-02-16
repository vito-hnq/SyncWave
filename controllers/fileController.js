const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '../uploads');

if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// Lista 
exports.listFiles = async (req, res) => {
  try {
    const files = fs.readdirSync(uploadDir).map((fileName) => ({
      nome: fileName,
      id: fileName, // Usamos o nome como identificador único
    }));
    res.status(200).json(files);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao listar arquivos', error });
  }
};

// Realiza o upload
exports.uploadFile = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Nenhum arquivo enviado' });
  }

  res.status(201).json({
    message: 'Arquivo enviado com sucesso',
    file: { nome: req.file.filename, id: req.file.filename },
  });
};

// Realiza o download 
exports.downloadFile = (req, res) => {
  const { id } = req.params;
  const filePath = path.join(uploadDir, id);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: 'Arquivo não encontrado' });
  }

  res.download(filePath, id, (err) => {
    if (err) {
      res.status(500).json({ message: 'Erro ao baixar o arquivo', error: err });
    }
  });
};

// Deleta 
exports.deleteFile = (req, res) => {
  const { id } = req.params;
  const filePath = path.join(uploadDir, id);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: 'Arquivo não encontrado' });
  }

  fs.unlink(filePath, (err) => {
    if (err) {
      return res.status(500).json({ message: 'Erro ao excluir o arquivo', error: err });
    }

    res.status(200).json({ message: 'Arquivo excluído com sucesso' });
  });
};
