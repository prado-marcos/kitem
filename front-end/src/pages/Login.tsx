import { Alert, Box, Button, Snackbar, TextField } from "@mui/material";
import { useState, ChangeEvent, FormEvent } from "react";
import loginBanner from "../assets/login_banner.jpg";
import { Eye, EyeOff } from "lucide-react";

interface LoginProps {
  onLogin: (userData: any) => void;
}

interface FormData {
  email: string;
  password: string;
}

interface FormErrors {
  email?: string;
  password?: string;
}

export default function Login({ onLogin }: LoginProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [snackBarOpen, setSnackBarOpen] = useState(false);
  const [snackBarMessage, setSnackBarMessage] = useState("");
  const [snackBarSeverity, setSnackBarSeverity] = useState<"success" | "error">("success");

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  }

  function validate() {
    const newErrors: FormErrors = {};

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

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!validate()) return;

    fetch("/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    })
      .then((response) => {
        if (!response.ok) throw new Error("Falha no login");
        return response.json();
      })
      .then((userData) => {
        onLogin(userData);
        setSnackBarMessage("Login realizado com sucesso!");
        setSnackBarSeverity("success");
        setSnackBarOpen(true);
      })
      .catch(() => {
        setSnackBarMessage("Falha no login");
        setSnackBarSeverity("error");
        setSnackBarOpen(true);
      });
  }

  return (
    <Box className="flex flex-row flex-center justify-evenly items-center my-12">
      <img
        src={loginBanner}
        alt="Banner Login"
        className="max-w-md h-auto object-cover rounded-sm"
      />
      <form onSubmit={handleSubmit}>
        <h1 className="text-4xl font-bold text-black mb-4">Login</h1>
        <TextField
          name="email"
          label="Email"
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
            title="Entrar"
            sx={{
              backgroundColor: "#ffffff",
              "&:hover": { backgroundColor: "#f0f0f0" },
              color: "#000000",
            }}
            variant="contained"
          >
            Esqueceu a senha?
          </Button>
          <Button
            type="submit"
            className="w-[50%]"
            title="Entrar"
            color="primary"
            variant="contained"
            sx={{
              backgroundColor: "#000000",
              "&:hover": { backgroundColor: "#5C5C5C" },
              color: "#ffffff",
            }}
          >
            Entrar
          </Button>
        </Box>
      </form>
      <Snackbar
        open={snackBarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackBarOpen(false)}
      >
        <Alert
          severity={snackBarSeverity}
          onClose={() => setSnackBarOpen(false)}
        >
          {snackBarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}
