import { Alert, Box, Button, Snackbar, TextField } from "@mui/material";
import { useState, ChangeEvent, FormEvent } from "react";
import { Eye, EyeOff } from "lucide-react";

type FormData = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

type FormErrors = {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
};

export default function UpdatePassword() {
  const [formData, setFormData] = useState<FormData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});

  // Estado individual para visualização de cada campo
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [snackBarOpen, setSnackBarOpen] = useState(false);
  const [snackBarMessage, setSnackBarMessage] = useState("");
  const [snackBarSeverity, setSnackBarSeverity] = useState<"success" | "error">(
    "success"
  );

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  }

  function validate() {
    const newErrors: FormErrors = {};

    if (!formData.currentPassword) {
      newErrors.currentPassword = "Informe a senha atual";
    }

    if (!formData.newPassword) {
      newErrors.newPassword = "Informe a nova senha";
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = "Nova senha deve ter pelo menos 6 caracteres";
    }

    if (formData.confirmPassword !== formData.newPassword) {
      newErrors.confirmPassword = "As senhas não coincidem";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!validate()) return;

    // Simula envio para API
    fetch("/update-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    })
      .then((response) => {
        if (!response.ok) throw new Error("Erro ao atualizar senha");
        return response.json();
      })
      .then(() => {
        setSnackBarMessage("Senha atualizada com sucesso!");
        setSnackBarSeverity("success");
        setSnackBarOpen(true);
        setFormData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      })
      .catch(() => {
        setSnackBarMessage("Erro ao atualizar senha");
        setSnackBarSeverity("error");
        setSnackBarOpen(true);
      });
  }

  return (
    <Box className="flex flex-col justify-center items-center my-12 w-full">
      <h2 className="text-2xl font-bold mb-4">Editar Senha</h2>
      <form onSubmit={handleSubmit} className="w-full max-w-sm">
        {/* Senha Atual */}
        <Box className="relative">
          <TextField
            name="currentPassword"
            type={showCurrentPassword ? "text" : "password"}
            label="Senha atual"
            value={formData.currentPassword}
            onChange={handleChange}
            variant="outlined"
            sx={{ mb: 2 }}
            className="w-100"
            error={Boolean(errors.currentPassword)}
            helperText={errors.currentPassword}
          />
          <button
            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
            className="absolute top-5 right-5"
            type="button"
          >
            {showCurrentPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        </Box>

        {/* Nova Senha */}
        <Box className="relative">
          <TextField
            name="newPassword"
            type={showNewPassword ? "text" : "password"}
            label="Digite a nova senha"
            value={formData.newPassword}
            onChange={handleChange}
            variant="outlined"
            sx={{ mb: 2 }}
            className="w-100"
            error={Boolean(errors.newPassword)}
            helperText={errors.newPassword}
          />
          <button
            onClick={() => setShowNewPassword(!showNewPassword)}
            className="absolute top-5 right-5"
            type="button"
          >
            {showNewPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        </Box>

        {/* Confirmar Nova Senha */}
        <Box className="relative">
          <TextField
            name="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            label="Confirme a nova senha"
            value={formData.confirmPassword}
            onChange={handleChange}
            variant="outlined"
            sx={{ mb: 2 }}
            className="w-100"
            error={Boolean(errors.confirmPassword)}
            helperText={errors.confirmPassword}
          />
          <button
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute top-5 right-5"
            type="button"
          >
            {showConfirmPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        </Box>

        <Button
          type="submit"
          className="w-100"
          variant="contained"
          sx={{
            backgroundColor: "#000000",
            "&:hover": { backgroundColor: "#5C5C5C" },
            color: "#ffffff",
          }}
        >
          Confirmar
        </Button>
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
