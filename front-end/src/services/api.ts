import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: true,  // Adicione esta linha se usar autenticação
});

// // Opcional: Log de erros de rede para debug
// api.interceptors.response.use(
//   response => response,
//   error => {
//     if (error.message === 'Network Error') {
//       console.error('Erro de rede! Verifique se o servidor Django está rodando e o CORS está configurado.');
//     }
//     return Promise.reject(error);
//   }
// );

export default api;