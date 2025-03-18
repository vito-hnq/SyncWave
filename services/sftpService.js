// services/sftpService.js
const Client = require('ssh2-sftp-client');
const path = require('path');
const fs = require('fs');

class SftpService {
  constructor(config) {
    this.client = new Client();
    this.config = config || {};
    this.isConnected = false;
  }

  async connect() {
    try {
      await this.client.connect({
        host: this.config.host || 'localhost',
        port: this.config.port || 22,
        username: this.config.username || 'user',
        password: this.config.password || '',
        privateKey: this.config.privateKey ? fs.readFileSync(this.config.privateKey) : undefined
      });
      this.isConnected = true;
      console.log('Conectado ao servidor SFTP com sucesso!');
      return true;
    } catch (error) {
      console.error('Erro ao conectar ao servidor SFTP:', error);
      throw new Error(`Falha na conexão SFTP: ${error.message}`);
    }
  }

  async disconnect() {
    if (this.isConnected) {
      await this.client.end();
      this.isConnected = false;
      console.log('Desconectado do servidor SFTP');
    }
  }

  async ensureConnection() {
    if (!this.isConnected) {
      await this.connect();
    }
  }

  async listFiles(remotePath = '.') {
    try {
      await this.ensureConnection();
      const list = await this.client.list(remotePath);
      return list.map(item => ({
        id: path.posix.join(remotePath, item.name),
        nome: item.name,
        path: path.posix.join(remotePath, item.name),
        tipo: item.type === 'd' ? 'diretório' : 'arquivo',
        tamanho: item.size,
        modificado: item.modifyTime,
        isDirectory: item.type === 'd'
      }));
    } catch (error) {
      console.error('Erro ao listar arquivos:', error);
      throw new Error(`Erro ao listar arquivos: ${error.message}`);
    }
  }

  async uploadFile(localPath, remotePath) {
    try {
      await this.ensureConnection();
      await this.client.put(localPath, remotePath);
      return {
        id: remotePath,
        nome: path.basename(remotePath),
        path: remotePath
      };
    } catch (error) {
      console.error('Erro ao fazer upload do arquivo:', error);
      throw new Error(`Erro no upload: ${error.message}`);
    }
  }

  async downloadFile(remotePath, localPath) {
    try {
      await this.ensureConnection();
      await this.client.get(remotePath, localPath);
      return {
        id: remotePath,
        nome: path.basename(remotePath),
        localPath: localPath
      };
    } catch (error) {
      console.error('Erro ao fazer download do arquivo:', error);
      throw new Error(`Erro no download: ${error.message}`);
    }
  }

  async deleteFile(remotePath) {
    try {
      await this.ensureConnection();
      await this.client.delete(remotePath);
      return { success: true, message: 'Arquivo excluído com sucesso' };
    } catch (error) {
      console.error('Erro ao excluir arquivo:', error);
      throw new Error(`Erro ao excluir: ${error.message}`);
    }
  }

  async createDirectory(remotePath) {
    try {
      await this.ensureConnection();
      await this.client.mkdir(remotePath, true);
      return {
        id: remotePath,
        nome: path.basename(remotePath),
        path: remotePath,
        tipo: 'diretório'
      };
    } catch (error) {
      console.error('Erro ao criar diretório:', error);
      throw new Error(`Erro ao criar diretório: ${error.message}`);
    }
  }

  async deleteDirectory(remotePath) {
    try {
      await this.ensureConnection();
      await this.client.rmdir(remotePath, true);
      return { success: true, message: 'Diretório excluído com sucesso' };
    } catch (error) {
      console.error('Erro ao excluir diretório:', error);
      throw new Error(`Erro ao excluir diretório: ${error.message}`);
    }
  }

  async renameFile(oldPath, newPath) {
    try {
      await this.ensureConnection();
      await this.client.rename(oldPath, newPath);
      return {
        id: newPath,
        nome: path.basename(newPath),
        path: newPath
      };
    } catch (error) {
      console.error('Erro ao renomear arquivo:', error);
      throw new Error(`Erro ao renomear: ${error.message}`);
    }
  }
}

module.exports = SftpService;