import { Alert, Box, Button, Snackbar, TextField } from "@mui/material";
import { useState, ChangeEvent, FormEvent } from "react";
import loginBanner from "../assets/login_banner.jpg";
import { Eye, EyeOff } from "lucide-react";
interface LoginProps {
  onLogin: (userData: any) => void; // You can replace `any` with a more specific type if you know the shape
}

interface FormData {
  email: string;
  password: string;
}

export default function Login({ onLogin }: LoginProps) {
  const [openSnackBar, setOpenSnackBar] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
  });

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

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
        onLogin(userData); // Pass user data to the parent component
        setSuccessMessage("Sucesso no login");
        setOpenSnackBar(true);
      })
      .catch(() => {
        setSuccessMessage("Falha no login");
        setOpenSnackBar(true);
      });
  }

  return (
    <Box className="flex flex-row flex-center justify-evenly items-center my-15">
      <img
        src={loginBanner}
        alt="Banner Login"
        className="max-w-md h-auto object-cover rounded-sm"
      />
      <form onSubmit={handleSubmit}>
        <TextField
          name="email"
          label="Email"
          value={formData.email}
          onChange={handleChange}
          variant="outlined"
          sx={{ mb: 2 }}
          className="w-100"
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
          ></TextField>
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
        <button
          type="submit"
          className="bg-gray-300 rounded-sm p-2 pointer-button font-bold w-100"
          title="Entrar"
        >
          Entrar
        </button>
      </form>
      <Snackbar
        open={openSnackBar}
        autoHideDuration={6000}
        onClose={() => setOpenSnackBar(false)}
      >
        <Alert
          severity={successMessage.includes("Falha") ? "error" : "success"}
          onClose={() => setOpenSnackBar(false)}
        >
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}
