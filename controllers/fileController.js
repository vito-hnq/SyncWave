// controllers/fileController.js
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const SftpService = require('../services/sftpService');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Diretório temporário para armazenar uploads antes de enviar para SFTP
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// Configuração do multer para upload de arquivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// Middleware para o upload
exports.uploadMiddleware = upload.single('arquivo');

// Obter configuração do SFTP do usuário
async function getSftpConfig(userId) {
  try {
    const userConfig = await prisma.sftpConfig.findUnique({
      where: { userId: parseInt(userId) }
    });
    
    if (!userConfig) {
      throw new Error('Configuração SFTP não encontrada para este usuário');
    }
    
    return {
      host: userConfig.host,
      port: userConfig.port,
      username: userConfig.username,
      password: userConfig.password,
      privateKey: userConfig.privateKeyPath
    };
  } catch (error) {
    console.error('Erro ao obter configuração SFTP:', error);
    throw new Error(`Erro na configuração SFTP: ${error.message}`);
  }
}

// Lista arquivos via SFTP
exports.listFiles = async (req, res) => {
  try {
    const userId = req.user.id;
    const { path: remotePath = '.' } = req.query;
    
    const config = await getSftpConfig(userId);
    const sftpService = new SftpService(config);
    
    const files = await sftpService.listFiles(remotePath);
    await sftpService.disconnect();
    
    // Registra a listagem no histórico
    await prisma.fileHistory.create({
      data: {
        userId: parseInt(userId),
        action: 'LIST',
        path: remotePath,
        timestamp: new Date()
      }
    });
    
    res.status(200).json(files);
  } catch (error) {
    console.error('Erro ao listar arquivos:', error);
    res.status(500).json({ message: 'Erro ao listar arquivos', error: error.message });
  }
};

// Realiza o upload
exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Nenhum arquivo enviado' });
    }
    
    const userId = req.user.id;
    const localPath = path.join(uploadDir, req.file.filename);
    const { path: remotePath = '.' } = req.body;
    const remoteFilePath = path.posix.join(remotePath, req.file.originalname);
    
    const config = await getSftpConfig(userId);
    const sftpService = new SftpService(config);
    
    const uploadedFile = await sftpService.uploadFile(localPath, remoteFilePath);
    await sftpService.disconnect();
    
    // Limpar o arquivo temporário
    fs.unlinkSync(localPath);
    
    // Registra o upload no histórico
    await prisma.fileHistory.create({
      data: {
        userId: parseInt(userId),
        action: 'UPLOAD',
        path: remoteFilePath,
        filename: req.file.originalname,
        size: req.file.size,
        timestamp: new Date()
      }
    });
    
    res.status(201).json({
      message: 'Arquivo enviado com sucesso',
      file: uploadedFile
    });
  } catch (error) {
    console.error('Erro ao fazer upload:', error);
    res.status(500).json({ message: 'Erro ao fazer upload do arquivo', error: error.message });
  }
};

// Realiza o download
exports.downloadFile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { path: remotePath } = req.params;
    const fileName = path.basename(remotePath);
    const localPath = path.join(uploadDir, fileName);
    
    const config = await getSftpConfig(userId);
    const sftpService = new SftpService(config);
    
    await sftpService.downloadFile(remotePath, localPath);
    await sftpService.disconnect();
    
    // Registra o download no histórico
    await prisma.fileHistory.create({
      data: {
        userId: parseInt(userId),
        action: 'DOWNLOAD',
        path: remotePath,
        filename: fileName,
        timestamp: new Date()
      }
    });
    
    res.download(localPath, fileName, (err) => {
      if (err) {
        res.status(500).json({ message: 'Erro ao baixar o arquivo', error: err.message });
      }
      
      // Limpeza após o download
      fs.unlink(localPath, (unlinkErr) => {
        if (unlinkErr) console.error('Erro ao remover arquivo temporário:', unlinkErr);
      });
    });
  } catch (error) {
    console.error('Erro ao fazer download:', error);
    res.status(500).json({ message: 'Erro ao baixar o arquivo', error: error.message });
  }
};

// Deleta arquivo
exports.deleteFile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { path: remotePath } = req.params;
    const { isDirectory = false } = req.query;
    
    const config = await getSftpConfig(userId);
    const sftpService = new SftpService(config);
    
    if (isDirectory === 'true' || isDirectory === true) {
      await sftpService.deleteDirectory(remotePath);
    } else {
      await sftpService.deleteFile(remotePath);
    }
    
    await sftpService.disconnect();
    
    // Registra a exclusão no histórico
    await prisma.fileHistory.create({
      data: {
        userId: parseInt(userId),
        action: 'DELETE',
        path: remotePath,
        timestamp: new Date()
      }
    });
    
    res.status(200).json({ message: 'Arquivo excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir arquivo:', error);
    res.status(500).json({ message: 'Erro ao excluir o arquivo', error: error.message });
  }
};

// Cria diretório
exports.createDirectory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { path: remotePath } = req.body;
    
    if (!remotePath) {
      return res.status(400).json({ message: 'Caminho do diretório é obrigatório' });
    }
    
    const config = await getSftpConfig(userId);
    const sftpService = new SftpService(config);
    
    const result = await sftpService.createDirectory(remotePath);
    await sftpService.disconnect();
    
    // Registra a criação no histórico
    await prisma.fileHistory.create({
      data: {
        userId: parseInt(userId),
        action: 'CREATE_DIR',
        path: remotePath,
        timestamp: new Date()
      }
    });
    
    res.status(201).json({
      message: 'Diretório criado com sucesso',
      directory: result
    });
  } catch (error) {
    console.error('Erro ao criar diretório:', error);
    res.status(500).json({ message: 'Erro ao criar diretório', error: error.message });
  }
};

// Renomeia arquivo ou diretório
exports.renameFile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { oldPath, newPath } = req.body;
    
    if (!oldPath || !newPath) {
      return res.status(400).json({ message: 'Os caminhos de origem e destino são obrigatórios' });
    }
    
    const config = await getSftpConfig(userId);
    const sftpService = new SftpService(config);
    
    const result = await sftpService.renameFile(oldPath, newPath);
    await sftpService.disconnect();
    
    // Registra a renomeação no histórico
    await prisma.fileHistory.create({
      data: {
        userId: parseInt(userId),
        action: 'RENAME',
        path: `${oldPath} -> ${newPath}`,
        timestamp: new Date()
      }
    });
    
    res.status(200).json({
      message: 'Arquivo renomeado com sucesso',
      file: result
    });
  } catch (error) {
    console.error('Erro ao renomear arquivo:', error);
    res.status(500).json({ message: 'Erro ao renomear arquivo', error: error.message });
  }
};