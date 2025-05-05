import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return !!localStorage.getItem("accessToken");
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Verificação inicial
    const token = localStorage.getItem("accessToken");
    setIsAuthenticated(!!token);
    setIsLoading(false);

    // Listener para mudanças no localStorage
    const handleStorageChange = () => {
      const newToken = localStorage.getItem("accessToken");
      setIsAuthenticated(!!newToken);
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  async function login(username: string, password: string) {
    try {
      // Limpa tokens antigos
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("userId");

      const response = await api.post("/auth/login2/", { username, password });

      const { access, refresh, user_id } = response.data;
      localStorage.setItem("accessToken", access);
      localStorage.setItem("refreshToken", refresh);
      localStorage.setItem("userId", user_id);

      setIsAuthenticated(true);
      navigate("/gerenciamento-receitas");
      window.location.reload();
      return true;
    } catch (error) {
      console.error("Login failed:", error);
      logout();
      return false;
    }
  }

  function logout() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userId");
    setIsAuthenticated(false);
    navigate("/login");
  }

  return { isAuthenticated, isLoading, login, logout };
}
