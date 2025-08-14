import { Box, Button, TextField, Typography, Snackbar, Alert } from "@mui/material";
import { useState, ChangeEvent, FormEvent } from "react";

interface FormData {
  name: string;
  email: string;
}

interface FormErrors {
  name?: string;
  email?: string;
}

export default function EditProfile() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});

  // Snackbar states
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error" | "info">("success");

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" })); // Limpa erro ao digitar
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

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!validate()) return;

    // Envio para API
    fetch("/api/update-profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    })
      .then((response) => {
        if (!response.ok) throw new Error("Falha ao atualizar dados");
        return response.json();
      })
      .then(() => {
        setSnackbarMessage("Dados atualizados com sucesso!");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
      })
      .catch(() => {
        setSnackbarMessage("Erro ao atualizar dados");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      });
  }

  function handleChangePassword() {
    setSnackbarMessage("Funcionalidade de alterar senha ainda não implementada");
    setSnackbarSeverity("info"); // Assuming 'info' for a placeholder
    setSnackbarOpen(true);
  }

  return (
    <Box className="flex flex-col items-center my-12">
      <form className="flex flex-col" onSubmit={handleSubmit}>
        <Typography variant="h4" sx={{ mb: 2 }}>
          Editar Dados
        </Typography>
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

      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={() => setSnackbarOpen(false)}>
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}
