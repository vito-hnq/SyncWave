const apiBaseUrl = "http://localhost:3000"; // URL da sua API local (json-server)

// Função para login e armazenamento do token
async function loginUser(email, password) {
  try {
    const response = await fetch(`${apiBaseUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error('Erro ao fazer login');
    }

    const data = await response.json();
    if (data.message === 'Login bem-sucedido') {
      localStorage.setItem('token', data.token); // Armazena o token no localStorage
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error('Erro no login:', error);
    return false;
  }
}

// Função para obter o nome do usuário
async function getUserName() {
  const token = localStorage.getItem('token');
  if (token) {
    try {
      const response = await fetch(`${apiBaseUrl}/getUserName`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao buscar nome do usuário');
      }

      const data = await response.json();
      return data.name || 'Usuário Desconhecido'; // Retorna o nome ou um valor default
    } catch (error) {
      console.error('Erro ao buscar nome do usuário:', error);
      return null;
    }
  } else {
    return null;
  }
}

// Função para logout
function logoutUser() {
  localStorage.removeItem('token');
  window.location.href = 'login.html'; // Redireciona para a página de login após logout
}

// Função para pegar dados dos arquivos
async function fetchFiles() {
  try {
    const response = await fetch(`${apiBaseUrl}/files`);
    if (!response.ok) {
      throw new Error('Erro ao obter arquivos da API');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erro:', error);
  }
}

// Função para pegar atividades
async function fetchActivities() {
  try {
    const response = await fetch(`${apiBaseUrl}/activities`);
    if (!response.ok) {
      throw new Error('Erro ao obter atividades da API');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erro:', error);
  }
}

// Função para upload de arquivos
async function uploadFile(fileData) {
  try {
    const response = await fetch(`${apiBaseUrl}/files`, {
      method: 'POST',
      body: JSON.stringify(fileData),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error('Erro ao fazer upload');
    }
    return await response.json();
  } catch (error) {
    console.error('Erro no upload:', error);
  }
}

// Exports das funções
export { loginUser, getUserName, logoutUser, fetchFiles, fetchActivities, uploadFile };
