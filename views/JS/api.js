// api.js

const apiBaseUrl = "http://localhost:3000"; // URL da sua API local (json-server)

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

async function uploadFile(fileData) {
  try {
    const response = await fetch(`${apiBaseUrl}/files`, {
      method: 'POST',
      body: JSON.stringify(fileData),
      headers: {
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) {
      throw new Error('Erro ao fazer upload');
    }
    return await response.json();
  } catch (error) {
    console.error('Erro no upload:', error);
  }
}
