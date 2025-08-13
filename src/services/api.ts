import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 60000,
});

// Interceptor de requisição
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor de resposta
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (refreshToken) {
                  const response = await axios.post(
          "/api/auth/refresh/",
          { refresh: refreshToken }
        );

          const newAccessToken = response.data.access;
          localStorage.setItem("accessToken", newAccessToken);

          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.error("Failed to refresh token:", refreshError);
      }

      // Se chegou aqui, o refresh falhou ou não existe
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("userId");
      window.location.href = "/login";
    }

    // Tratamento para outros tipos de erro
    if (error.response?.status === 500) {
      console.error("Erro interno do servidor");
    } else if (error.response?.status === 404) {
      console.error("Endpoint não encontrado");
    } else if (error.response?.status === 403) {
      console.error("Acesso negado");
    } else if (!error.response) {
      console.error("Erro de rede - verifique sua conexão");
    }

    return Promise.reject(error);
  }
);

export default api;
