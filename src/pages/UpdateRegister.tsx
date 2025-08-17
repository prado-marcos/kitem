import {
  Box,
  Button,
  TextField,
  Typography,
  Snackbar,
  Alert,
  CircularProgress,
} from "@mui/material";
import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import api from "../services/api";

type FormData = {
  firstName: string;
  lastName: string;
  email: string;
  userName: string;
};

type FormErrors = {
  firstName?: string;
  lastName?: string;
  email?: string;
  userName?: string;
};

export default function EditProfile() {
  const userId = localStorage.getItem("userId");

  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    userName: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(true);

  // Snackbar states
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<
    "success" | "error" | "info"
  >("success");

  // Carregar dados do usuário
  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await api.get(`/usuarios/${userId}`);
        setFormData({
          firstName: res.data.first_name,
          lastName: res.data.last_name,
          email: res.data.email,
          userName: res.data.username,
        });
      } catch (error) {
        setSnackbarMessage("Erro ao carregar dados do usuário.");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      } finally {
        setLoading(false);
      }
    }

    if (userId) {
      fetchUser();
    }
  }, [userId]);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  }

  function validate() {
    const newErrors: FormErrors = {};

    if (!formData.userName.trim()) {
      newErrors.userName = "Nome de usuário é obrigatório";
    }
    if (!formData.firstName.trim()) {
      newErrors.firstName = "Nome é obrigatório";
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Sobrenome é obrigatório";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email é obrigatório";
    } else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(formData.email)) {
      newErrors.email = "Email inválido";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!validate()) return;
    try {
      const res = await api.patch(`/usuarios/${userId}/`, {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        username: formData.userName,
      });
      if (res.status === 200) {
        setSnackbarMessage("Dados atualizados com sucesso!");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
      }
    } catch (error) {
      setSnackbarMessage(
        "Ocorreu um erro ao atualizar o cadastro. Por favor, tente novamente."
      );
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  }

  function handleChangePassword() {
    setSnackbarMessage(
      "Funcionalidade de alterar senha ainda não implementada"
    );
    setSnackbarSeverity("info");
    setSnackbarOpen(true);
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
        <CircularProgress
          style={{ color: "#9e000e" }}
          size={64}
          thickness={4}
        />
        <p className="mt-4 text-lg font-semibold text-gray-600">
          Carregando seus dados, por favor aguarde...
        </p>
      </div>
    );
  }

  return (
    <Box className="flex flex-col items-center my-12">
      <form className="flex flex-col" onSubmit={handleSubmit}>
        <Typography variant="h4" sx={{ mb: 2 }}>
          Editar Dados
        </Typography>
        <TextField
          name="userName"
          label="Nome de Usuário"
          value={formData.userName}
          onChange={handleChange}
          variant="outlined"
          sx={{ mb: 2 }}
          error={Boolean(errors.userName)}
          helperText={errors.userName}
        />
        <TextField
          name="firstName"
          label="Nome"
          value={formData.firstName}
          onChange={handleChange}
          variant="outlined"
          sx={{ mb: 2 }}
          error={Boolean(errors.firstName)}
          helperText={errors.firstName}
        />
        <TextField
          name="lastName"
          label="Sobrenome"
          value={formData.lastName}
          onChange={handleChange}
          variant="outlined"
          sx={{ mb: 2 }}
          error={Boolean(errors.lastName)}
          helperText={errors.lastName}
        />
        <TextField
          name="email"
          label="Email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          variant="outlined"
          sx={{ mb: 2 }}
          error={Boolean(errors.email)}
          helperText={errors.email}
        />
        <Box className="flex flex-row gap-2">
          <Button
            type="button"
            className="w-[50%]"
            onClick={handleChangePassword}
            sx={{
              backgroundColor: "#ffffff",
              "&:hover": { backgroundColor: "#f0f0f0" },
              color: "#000000",
            }}
            variant="contained"
          >
            Alterar Senha
          </Button>
          <Button
            type="submit"
            className="w-[50%]"
            variant="contained"
            sx={{
              backgroundColor: "#000000",
              "&:hover": { backgroundColor: "#5C5C5C" },
              color: "#ffffff",
            }}
          >
            Salvar
          </Button>
        </Box>
      </form>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}
