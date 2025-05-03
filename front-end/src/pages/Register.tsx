import { Box, Button, TextField } from "@mui/material";
import { useState, ChangeEvent, FormEvent } from "react";
import registerBanner from "../assets/register_banner.jpg";
import { Eye, EyeOff } from "lucide-react";

interface RegisterProps {
  onSwitchToLogin: () => void;
}

interface FormData {
  name: string;
  email: string;
  password: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
}

export default function Register({ onSwitchToLogin }: RegisterProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" })); // limpa o erro ao digitar
  }

  function validate() {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Nome é obrigatório";
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

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!validate()) return;

    fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    })
      .then((response) => {
        if (!response.ok) throw new Error("Falha no cadastro");
        return response.json();
      })
      .then(() => {
        alert("Cadastro realizado com sucesso!");
        setFormData({ name: "", email: "", password: "" });
      })
      .catch(() => {
        alert("Erro ao realizar cadastro");
      });
  }

  return (
    <Box className="flex flex-row flex-center justify-evenly items-center my-12">
      <form className="flex flex-col" onSubmit={handleSubmit}>
        <TextField
          name="name"
          label="Nome"
          value={formData.name}
          onChange={handleChange}
          variant="outlined"
          sx={{ mb: 2 }}
          className="w-100"
          error={Boolean(errors.name)}
          helperText={errors.name}
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
            Já é cadastrado?
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
    </Box>
  );
}
