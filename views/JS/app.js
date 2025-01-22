document.addEventListener('DOMContentLoaded', function () {
    const userName = document.getElementById('user-name');
    userName.textContent = 'Carlos';
  
    loadFiles();
    loadActivities();
  
    async function loadFiles() {
      const files = await fetchFiles();
      const filesContainer = document.querySelector('.content .row');
  
      filesContainer.innerHTML = '';
  
      files.forEach(file => {
        const fileCard = document.createElement('div');
        fileCard.classList.add('col-md-3', 'mb-3');
        fileCard.innerHTML = `
          <div class="file-card">
            <i class="file-icon fas fa-${file.type === 'folder' ? 'folder' : 'file-alt'}"></i>
            <div class="file-name">${file.name}</div>
          </div>
        `;
        filesContainer.appendChild(fileCard);
      });
    }
  
    async function loadActivities() {
      const activities = await fetchActivities();
      const activitiesList = document.querySelector('.activity-card ul');
  
      activitiesList.innerHTML = '';
  
      activities.forEach(activity => {
        const activityItem = document.createElement('li');
        activityItem.textContent = activity.description;
        activitiesList.appendChild(activityItem);
      });
    }
  
    async function fetchFiles() {
      try {
        const response = await fetch('http://localhost:3000/arquivos');
        return await response.json();
      } catch (error) {
        console.error('Erro ao buscar arquivos:', error);
      }
    }
  
    async function fetchActivities() {
      try {
        const response = await fetch('http://localhost:3000/atividades');
        return await response.json();
      } catch (error) {
        console.error('Erro ao buscar atividades:', error);
      }
    }
  
    async function uploadFile(fileData) {
      try {
        const response = await fetch('http://localhost:3000/arquivos', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(fileData)
        });
  
        if (!response.ok) {
          throw new Error('Falha no upload');
        }
        return await response.json();
      } catch (error) {
        console.error('Erro no upload:', error);
      }
    }
  
    const uploadButton = document.querySelector('.btn-upload');
    uploadButton.addEventListener('click', () => {
      const fileData = {
        name: "NovoArquivo.txt",
        type: "file"
      };
  
      uploadFile(fileData)
        .then(response => {
          console.log('Arquivo enviado com sucesso:', response);
          loadFiles();
        })
        .catch(error => {
          console.error('Erro no upload:', error);
        });
    });
  
    async function loginUsuario(email, senha) {
      try {
        const response = await fetch(`http://localhost:3000/usuarios?email=${email}&senha=${senha}`);
        const usuarios = await response.json();
  
        if (usuarios.length > 0) {
          alert('Login realizado com sucesso!');
          window.location.href = '/dashboard.html';
        } else {
          alert('Email ou senha incorretos.');
        }
      } catch (error) {
        console.error('Erro ao fazer login:', error);
      }
    }
  
    async function registrarUsuario(nome, email, senha) {
      try {
        const response = await fetch('http://localhost:3000/usuarios', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ nome, email, senha })
        });
  
        if (response.ok) {
          alert('Usuário registrado com sucesso!');
          window.location.href = '/login.html';
        } else {
          alert('Erro ao registrar usuário.');
        }
      } catch (error) {
        console.error('Erro ao registrar usuário:', error);
      }
    }
  
    document.getElementById('login-form')?.addEventListener('submit', function (event) {
      event.preventDefault();
  
      const email = document.getElementById('email').value;
      const senha = document.getElementById('senha').value;
  
      loginUsuario(email, senha);
    });
  
    document.getElementById('registro-form')?.addEventListener('submit', function (event) {
      event.preventDefault();
  
      const nome = document.getElementById('nome').value;
      const email = document.getElementById('email').value;
      const senha = document.getElementById('senha').value;
  
      registrarUsuario(nome, email, senha);
    });
  });

  const express = require('express');
const app = express();
const cors = require('cors');
const fs = require('fs');
const path = require('path');

app.use(cors());
app.use(express.json());

const dbPath = path.join(__dirname, 'db.json');

const readDb = () => {
  const data = fs.readFileSync(dbPath, 'utf-8');
  return JSON.parse(data);
};

const writeDb = (data) => {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf-8');
};

app.get('/arquivos', (req, res) => {
  const db = readDb();
  res.json(db.arquivos);
});

app.post('/arquivos', (req, res) => {
  const { nome, tipo, tamanho } = req.body;
  const db = readDb();
  
  const newFile = {
    nome,
    tipo,
    tamanho,
    id: Date.now()
  };

  db.arquivos.push(newFile);
  writeDb(db);

  res.status(201).json(newFile);
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

  