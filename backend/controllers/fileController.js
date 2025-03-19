// backend/controllers/fileController.js
const listFiles = (req, res) => {
  res.json({ message: 'Lista de arquivos' });
};

const uploadFile = (req, res) => {
  res.json({ message: 'Arquivo enviado com sucesso' });
};

const deleteFile = (req, res) => {
  res.json({ message: 'Arquivo deletado com sucesso' });
};

module.exports = {
  listFiles,
  uploadFile,
  deleteFile,
};