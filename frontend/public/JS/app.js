document.addEventListener('DOMContentLoaded', function () {
    const userName = document.getElementById('user-name');
    userName.textContent = 'Carlos';
  
    loadFiles();
    loadActivities();
  
    async function loadFiles() {
      try {
        const response = await fetch('/api/files');
        const files = await response.json();
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
      } catch (error) {
        console.error('Erro ao buscar arquivos:', error);
      }
    }
  
    async function loadActivities() {
      try {
        const response = await fetch('/api/activities');
        const activities = await response.json();
        const activitiesList = document.querySelector('.activity-card ul');
  
        activitiesList.innerHTML = '';
  
        activities.forEach(activity => {
          const activityItem = document.createElement('li');
          activityItem.textContent = activity.description;
          activitiesList.appendChild(activityItem);
        });
      } catch (error) {
        console.error('Erro ao buscar atividades:', error);
      }
    }
  
    const uploadButton = document.querySelector('.btn-upload');
    uploadButton.addEventListener('click', async () => {
      const fileData = {
        name: "NovoArquivo.txt",
        type: "file"
      };
  
      try {
        const response = await fetch('/api/files', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(fileData)
        });
  
        if (!response.ok) {
          throw new Error('Falha no upload');
        }
  
        const data = await response.json();
        console.log('Arquivo enviado com sucesso:', data);
        loadFiles();
      } catch (error) {
        console.error('Erro no upload:', error);
      }
    });
  
    document.getElementById('login-form')?.addEventListener('submit', async function (event) {
      event.preventDefault();
  
      const email = document.getElementById('email').value;
      const senha = document.getElementById('senha').value;
  
      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, senha })
        });
  
        if (response.ok) {
          alert('Login realizado com sucesso!');
          window.location.href = '/dashboard.html';
        } else {
          alert('Email ou senha incorretos.');
        }
      } catch (error) {
        console.error('Erro ao fazer login:', error);
      }
    });
  
    document.getElementById('registro-form')?.addEventListener('submit', async function (event) {
      event.preventDefault();
  
      const nome = document.getElementById('nome').value;
      const email = document.getElementById('email').value;
      const senha = document.getElementById('senha').value;
  
      try {
        const response = await fetch('/api/auth/register', {
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
    });
  });