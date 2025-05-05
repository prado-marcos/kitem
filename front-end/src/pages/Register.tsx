import { Box, Button, TextField, Snackbar, Alert } from "@mui/material";
import { useState, ChangeEvent, FormEvent } from "react";
import registerBanner from "../assets/register_banner.jpg";
import { Eye, EyeOff } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../services/api";

interface RegisterProps {
  onSwitchToLogin: () => void;
}

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  userName: string;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  userName?: string;
}

export default function Register({ onSwitchToLogin }: RegisterProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    userName: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<
    "success" | "error" | "info" | "warning"
  >("success");

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" })); // limpa o erro ao digitar
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
      newErrors.lastName = "Nome é obrigatório";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email é obrigatório";
    } else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(formData.email)) {
      newErrors.email = "Email inválido";
    }

    if (!formData.password) {
      newErrors.password = "Senha é obrigatória";
    } else if (formData.password.length < 6) {
      newErrors.password = "Senha deve ter pelo menos 6 caracteres";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!validate()) return;

    try {
      await api.post('/usuarios/', {
        username: formData.userName,
        email: formData.email,
        first_name: formData.firstName,
        last_name: formData.lastName,
        password: formData.password,
      }, {
        headers: { 'Content-Type': 'application/json' }
      });

      setSnackbarMessage("Cadastro realizado com sucesso!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);

      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        userName: "",
      });
    } catch (error:any) {
      setSnackbarMessage("Erro ao realizar cadastro: " + JSON.parse(error.request.response).username);
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  }

  function handleCloseSnackbar() {
    setSnackbarOpen(false);
  }

  return (
    <Box className="flex flex-row flex-center justify-evenly items-center my-12">
      <form className="flex flex-col" onSubmit={handleSubmit}>
        <TextField
          name="userName"
          label="Nome de Usuário"
          value={formData.userName}
          onChange={handleChange}
          variant="outlined"
          sx={{ mb: 2 }}
          className="w-100"
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
          className="w-100"
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
          className="w-100"
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
          className="w-100"
          error={Boolean(errors.email)}
          helperText={errors.email}
        />
        <Box className="relative">
          <TextField
            name="password"
            type={showPassword ? "text" : "password"}
            label="Senha"
            value={formData.password}
            onChange={handleChange}
            variant="outlined"
            sx={{ mb: 2 }}
            className="w-100"
            error={Boolean(errors.password)}
            helperText={errors.password}
          />
          <button
            onClick={() => setShowPassword(!showPassword)}
            className="absolute top-5 right-5"
            type="button"
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        </Box>
        <Box className="flex flex-row gap-2">
          <Button
            type="button"
            className="w-[50%]"
            onClick={onSwitchToLogin}
            sx={{
              backgroundColor: "#ffffff",
              "&:hover": { backgroundColor: "#f0f0f0" },
              color: "#000000",
            }}
            variant="contained"
          >
            <Link to="/login">Já é cadastrado?</Link>
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
            Cadastrar
          </Button>
        </Box>
      </form>
      <img
        src={registerBanner}
        alt="Banner Cadastro"
        className="max-h-[300px] w-auto object-cover rounded-sm"
      />

      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}