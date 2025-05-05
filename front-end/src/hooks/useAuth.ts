import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return Boolean(localStorage.getItem("accessToken"));
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      setIsAuthenticated(true);
    } else {
      setIsLoading(false);
    }
  }, []);

  async function login(userName: string, password: string) {
    try {
      const response = await api.post("/auth/login/", {
        username: userName,
        password,
      });
      const { access, refresh } = response.data;

      localStorage.setItem("accessToken", access);
      localStorage.setItem("refreshToken", refresh);

      setIsAuthenticated(true);
      navigate("/minhas-receitas");
    } catch (error) {
      console.error("Login failed:", error);
      return false;
    }
  }

  function logout() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setIsAuthenticated(false);
    navigate("/");
  }

  return { isAuthenticated, isLoading, login, logout };
}
