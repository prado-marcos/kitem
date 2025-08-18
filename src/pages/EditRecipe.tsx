import {
  Box,
  Button,
  TextField,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Snackbar,
  Alert,
  CircularProgress,
} from "@mui/material";
import { useState, ChangeEvent, FormEvent, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";
import api from "../services/api";
import { useNavigate, useParams } from "react-router-dom";
import Select from "react-select";
import { selectStyles } from "../components/SelectStyles";
import { UNIDADES_MEDIDA_OPTIONS } from "../constants/units";

type Ingredient = {
  quantity: string;
  unit: string;
  name: string;
};

type RecipeData = {
  titulo: string;
  descricao: string;
  tempo_preparo: string;
  dificuldade: string;
  tipo: string;
  restricao_alimentar: string;
  imagem: string;
  ingredientes: Ingredient[];
};

type RecipeEditProps = {
  titlePage?: string;
  initialData?: RecipeData;
  onSubmit?: (data: RecipeData) => void;
};

export default function RecipeEdit({
  titlePage = "Editar receita",
  initialData,
  onSubmit,
}: RecipeEditProps) {
  const userId = localStorage.getItem("userId");
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [ingredientIds, setIngredientIds] = useState<number[]>([]);
  const [errorUsuario, setErrorUsuario] = useState(false);
  const [formData, setFormData] = useState<RecipeData>({
    titulo: "",
    descricao: "",
    tempo_preparo: "",
    dificuldade: "",
    tipo: "",
    restricao_alimentar: "",
    imagem: "",
    ingredientes: [],
  });
  const [errors, setErrors] = useState({
    titulo: "",
    tempo_preparo: "",
    imagem: "",
    descricao: "",
    ingredientes: "",
    dificuldade: "",
    restricao_alimentar: "",
    tipo: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Snackbar states
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
    "success"
  );
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchRecipe() {
      try {
        // Busca dados principais da receita
        const response = await api.get(`/receitas/${id}/`);
        const receita = response.data;
        if (String(receita.id_usuario) !== String(userId)) {
          setErrorUsuario(true);
          throw new Error("Usuário não tem permissão de editar essa receita");
        } else {
          const ingredientsResponse = await api.get(
            `/receitas/${id}/ingredientes/`
          );
          const ingredientIdsArray = ingredientsResponse.data.map(
            (item: any) => item.id_ingrediente
          );
          setIngredientIds(ingredientIdsArray);

          const ingredientes = await Promise.all(
            ingredientsResponse.data.map(async (item: any) => {
              const ingrediente = await api.get(
                `/ingredientes/${item.id_ingrediente}/`
              );
              const nomeIngrediente = ingrediente.data.nome;
              return {
                quantity: item.quantidade || "",
                unit: item.unidade_medida || "",
                name: nomeIngrediente || "",
              };
            })
          );

          receita["tempo_preparo"] = converterHoraParaMinutos(
            receita.tempo_preparo
          );
          setFormData({
            ...receita,
            ingredientes,
          });
        }
      } catch (error) {
        console.error("Erro ao carregar a receita:", error);
      } finally {
        setLoading(false);
      }
    }

    if (id) fetchRecipe();
  }, [id]);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  }

  function handleIngredientChange(
    index: number,
    field: keyof Ingredient,
    value: string
  ) {
    const newIngredients = [...formData.ingredientes];
    newIngredients[index][field] = value;
    setFormData((prev) => ({ ...prev, ingredientes: newIngredients }));
    setErrors((prev) => ({ ...prev, ingredientes: "" }));
  }

  function handleAddIngredient() {
    setFormData((prev) => ({
      ...prev,
      ingredientes: [
        ...prev.ingredientes,
        { quantity: "", unit: "", name: "" },
      ],
    }));
  }

  function handleRemoveIngredient(index: number) {
    setFormData((prev) => ({
      ...prev,
      ingredientes: prev.ingredientes.filter((_, i) => i !== index),
    }));
  }

  function handleDifficultySelect(level: string) {
    setFormData((prev) => ({ ...prev, dificuldade: level }));
    setErrors((prev) => ({ ...prev, dificuldade: "" }));
  }

  function handleRestrictionSelect(level: string) {
    setFormData((prev) => ({ ...prev, restricao_alimentar: level }));
    setErrors((prev) => ({ ...prev, restricao_alimentar: "" }));
  }

  function handleTypeSelect(level: string) {
    setFormData((prev) => ({ ...prev, tipo: level }));
    setErrors((prev) => ({ ...prev, tipo: "" }));
  }

  function validate() {
    let valid = true;
    const newErrors = {
      titulo: "",
      tempo_preparo: "",
      imagem: "",
      descricao: "",
      ingredientes: "",
      dificuldade: "",
      restricao_alimentar: "",
      tipo: "",
    };

    if (!formData.titulo.trim()) {
      newErrors.titulo = "Título é obrigatório";
      valid = false;
    }
    if (!String(formData.tempo_preparo).trim()) {
      console.log(
        "Campo tempo_preparo está vazio ou inválido:",
        formData.tempo_preparo
      );
      newErrors.tempo_preparo = "Tempo de preparo é obrigatório";
      valid = false;
    } else {
      const tempoNumero = parseInt(formData.tempo_preparo, 10);
      if (isNaN(tempoNumero) || tempoNumero <= 0) {
        console.log(
          "Campo tempo_preparo não é um número válido:",
          formData.tempo_preparo
        );
        newErrors.tempo_preparo =
          "Tempo de preparo deve ser um número maior que zero";
        valid = false;
      } else {
        console.log("Campo tempo_preparo é válido:", formData.tempo_preparo);
      }
    }
    if (!formData.imagem.trim()) {
      newErrors.imagem = "URL da foto é obrigatória";
      valid = false;
    } else if (
      !/^https?:\/\/.*\.(?:png|jpg|jpeg|gif|bmp|webp)$/i.test(
        formData.imagem.trim()
      )
    ) {
      newErrors.imagem = "Informe uma URL válida de imagem (ex: .jpg, .png)";
      valid = false;
    }
    if (!formData.descricao.trim()) {
      newErrors.descricao = "Descrição é obrigatória";
      valid = false;
    }
    if (formData.ingredientes.length === 0) {
      newErrors.ingredientes = "Adicione pelo menos um ingrediente";
      valid = false;
    } else {
      const hasInvalid = formData.ingredientes.some(
        (ing) => !String(ing.quantity).trim() || !ing.name.trim()
      );
      if (hasInvalid) {
        newErrors.ingredientes =
          "Preencha quantidade e ingrediente em todas as linhas";
        valid = false;
      }
    }
    if (!formData.dificuldade) {
      newErrors.dificuldade = "Selecione a dificuldade";
      valid = false;
    }
    if (!formData.restricao_alimentar) {
      newErrors.restricao_alimentar = ""; // Remove a mensagem de erro para restrição alimentar
    }
    if (!formData.tipo) {
      newErrors.tipo = "Selecione o tipo de comida";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        throw new Error("Usuário não autenticado");
      }

      // Converte minutos para formato de tempo da API (hh:mm:ss)
      console.log(
        "Valor do campo tempo_preparo antes da conversão:",
        formData.tempo_preparo
      );
      const tempoFormatado = converterMinutosParaHora(formData.tempo_preparo);

      const payload = {
        titulo: formData.titulo || null,
        descricao: formData.descricao || null,
        tempo_preparo: tempoFormatado,
        dificuldade: formData.dificuldade || null,
        tipo: formData.tipo || null,
        restricao_alimentar: formData.restricao_alimentar || null,
        imagem: formData.imagem || null,
        id_usuario: parseInt(userId),
      };

      console.log("Payload sendo enviado para a API:", payload);

      await Promise.all(
        ingredientIds.map(async (item: any) => {
          return await api.delete(`/ingredientes/${item}/`);
        })
      );

      // editar a receita
      const recipeResponse = await api.patch(`/receitas/${id}/`, payload);

      const recipeId = recipeResponse.data.id;

      // editar relação com ingredientes
      for (const ingredient of formData.ingredientes) {
        const ingredientResponse = await api.post("/ingredientes/", {
          nome: ingredient.name,
        });
        const ingredientId = ingredientResponse.data.id;

        await api.post("/receita_ingredientes/", {
          quantidade: ingredient.quantity || null,
          unidade_medida: ingredient.unit || "",
          id_ingrediente: ingredientId,
          id_receita: recipeId,
        });
      }

      if (onSubmit) {
        onSubmit(formData);
      }

      // Sucesso: abre Snackbar
      setSnackbarMessage("Receita editada com sucesso!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);

      // Redireciona após 2 segundos
      setTimeout(() => {
        navigate("/gerenciamento-receitas");
      }, 2000);
    } catch (error) {
      console.error("Erro ao editar receita:", error);

      setSnackbarMessage(
        "Ocorreu um erro ao editar a receita. Por favor, tente novamente."
      );
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleCloseSnackbar() {
    setSnackbarOpen(false);
  }

  if (errorUsuario) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "300px",
          textAlign: "center",
          gap: 2,
          padding: "16px",
        }}
      >
        <Typography variant="h4" color="text.primary" fontWeight="bold">
          Você não tem permissão para editar essa receita.
        </Typography>
        <button
          onClick={() => navigate("/")} // Use navigate aqui
          className="mt-6 px-6 py-2 text-white font-semibold rounded-md shadow-md transition-transform transform hover:scale-105"
          style={{
            backgroundColor: "#9e000e", // Cor principal
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)", // Sombra
          }}
          onMouseOver={(e) =>
            (e.currentTarget.style.backgroundColor = "#7c000b")
          }
          onMouseOut={(e) =>
            (e.currentTarget.style.backgroundColor = "#9e000e")
          }
        >
          Voltar
        </button>
      </Box>
    );
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
          Carregando dados da receita, por favor aguarde...
        </p>
      </div>
    );
  }

  return (
    <Box className="flex flex-col justify-center items-center my-12 w-full">
      <Typography variant="h4" sx={{ mb: 2 }}>
        {titlePage}
      </Typography>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>

      <form
        onSubmit={handleSubmit}
        className="w-full flex flex-col items-center gap-8"
      >
        <Box className="flex flex-col md:flex-row w-full gap-8 justify-center">
          {/* Bloco Esquerdo - Dados da Receita */}
          <Box className="flex flex-col w-full md:w-[45%] bg-white rounded-lg shadow-md p-6">
            <Typography
              variant="h6"
              sx={{ mb: 3, color: "#9e000e", fontWeight: "bold" }}
            >
              Dados da Receita
            </Typography>
            <TextField
              label="Título"
              name="titulo"
              value={formData.titulo}
              onChange={handleChange}
              placeholder="Insira o título da receita"
              variant="outlined"
              sx={{
                mb: 3,
                "& .MuiOutlinedInput-root": {
                  "& fieldset": {
                    borderColor: "#d1d5db",
                  },
                  "&:hover fieldset": {
                    borderColor: "#9e000e",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#9e000e",
                  },
                },
                "& .MuiInputLabel-root": {
                  "&.Mui-focused": {
                    color: "#9e000e",
                  },
                },
                "& .MuiOutlinedInput-input": {
                  "&:hover": {
                    color: "#374151",
                  },
                },
              }}
              inputProps={{ maxLength: 50 }}
              helperText={errors.titulo || "Máximo de 50 caracteres"}
              error={!!errors.titulo}
              fullWidth
            />
            <TextField
              type="number"
              label="Tempo de Preparo (minutos)"
              name="tempo_preparo"
              value={formData.tempo_preparo}
              onChange={handleChange}
              placeholder="Ex: 30"
              variant="outlined"
              sx={{
                mb: 3,
                "& .MuiOutlinedInput-root": {
                  "& fieldset": {
                    borderColor: "#d1d5db",
                  },
                  "&:hover fieldset": {
                    borderColor: "#9e000e",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#9e000e",
                  },
                },
                "& .MuiInputLabel-root": {
                  "&.Mui-focused": {
                    color: "#9e000e",
                  },
                },
                "& .MuiOutlinedInput-input": {
                  "&:hover": {
                    color: "#374151",
                  },
                },
              }}
              helperText={errors.tempo_preparo}
              error={!!errors.tempo_preparo}
              fullWidth
              inputProps={{ min: 1, max: 999 }}
            />
            <TextField
              label="URL da foto"
              name="imagem"
              value={formData.imagem}
              onChange={handleChange}
              placeholder="https://exemplo.com/foto.jpg"
              variant="outlined"
              sx={{
                mb: 3,
                "& .MuiOutlinedInput-root": {
                  "& fieldset": {
                    borderColor: "#d1d5db",
                  },
                  "&:hover fieldset": {
                    borderColor: "#9e000e",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#9e000e",
                  },
                },
                "& .MuiInputLabel-root": {
                  "&.Mui-focused": {
                    color: "#9e000e",
                  },
                },
                "& .MuiOutlinedInput-input": {
                  "&:hover": {
                    color: "#374151",
                  },
                },
              }}
              helperText={errors.imagem}
              error={!!errors.imagem}
              fullWidth
            />

            <TextField
              label="Descrição"
              name="descricao"
              value={formData.descricao}
              onChange={handleChange}
              placeholder="Descreva a receita"
              variant="outlined"
              multiline
              rows={4}
              sx={{
                mb: 4,
                "& .MuiOutlinedInput-root": {
                  "& fieldset": {
                    borderColor: "#d1d5db",
                  },
                  "&:hover fieldset": {
                    borderColor: "#9e000e",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#9e000e",
                  },
                },
                "& .MuiInputLabel-root": {
                  "&.Mui-focused": {
                    color: "#9e000e",
                  },
                },
                "& .MuiOutlinedInput-input": {
                  "&:hover": {
                    color: "#374151",
                  },
                },
              }}
              helperText={errors.descricao}
              error={!!errors.descricao}
              fullWidth
            />
            <Box id="div-type" sx={{ mb: 4 }}>
              <Typography
                variant="subtitle1"
                sx={{ mb: 2, fontWeight: "600", color: "#374151" }}
              >
                Tipo de Receita
              </Typography>
              <Box className="flex gap-3 mb-2 flex-wrap">
                {["Doce", "Salgado"].map((level) => (
                  <label key={level}>
                    <input
                      type="radio"
                      name="tipo"
                      value={level}
                      checked={formData.tipo === level}
                      onChange={() => handleTypeSelect(level)}
                      style={{ display: "none" }}
                    />
                    <Button
                      variant={
                        formData.tipo === level ? "contained" : "outlined"
                      }
                      component="span"
                      sx={{
                        textTransform: "none",
                        borderRadius: "12px",
                        px: 3,
                        py: 1,
                        backgroundColor:
                          formData.tipo === level ? "#9e000e" : "transparent",
                        borderColor:
                          formData.tipo === level ? "#9e000e" : "#d1d5db",
                        color: formData.tipo === level ? "white" : "#374151",
                        "&:hover": {
                          backgroundColor:
                            formData.tipo === level ? "#7c000b" : "#f3f4f6",
                          borderColor: "#9e000e",
                        },
                      }}
                    >
                      {level}
                    </Button>
                  </label>
                ))}
              </Box>
              {errors.tipo && (
                <Typography
                  variant="caption"
                  sx={{ color: "#dc2626", display: "block", mt: 1 }}
                >
                  {errors.tipo}
                </Typography>
              )}
            </Box>

            <Box id="div-restriction" sx={{ mb: 4 }}>
              <Typography
                variant="subtitle1"
                sx={{ mb: 2, fontWeight: "600", color: "#374151" }}
              >
                Restrição Alimentar
              </Typography>
              <Box className="flex gap-2 mb-2 flex-wrap">
                {[
                  "Vegano",
                  "Vegetariano",
                  "Sem Glúten",
                  "Baixa Caloria",
                  "Sem Lactose",
                ].map((level) => (
                  <label key={level}>
                    <input
                      type="radio"
                      name="restricao_alimentar"
                      value={level}
                      checked={formData.restricao_alimentar === level}
                      onChange={() => handleRestrictionSelect(level)}
                      style={{ display: "none" }}
                    />
                    <Button
                      variant={
                        formData.restricao_alimentar === level
                          ? "contained"
                          : "outlined"
                      }
                      component="span"
                      sx={{
                        textTransform: "none",
                        borderRadius: "12px",
                        px: 2,
                        py: 0.5,
                        fontSize: "0.875rem",
                        backgroundColor:
                          formData.restricao_alimentar === level
                            ? "#9e000e"
                            : "transparent",
                        borderColor:
                          formData.restricao_alimentar === level
                            ? "#9e000e"
                            : "#d1d5db",
                        color:
                          formData.restricao_alimentar === level
                            ? "white"
                            : "#374151",
                        "&:hover": {
                          backgroundColor:
                            formData.restricao_alimentar === level
                              ? "#7c000b"
                              : "#f3f4f6",
                          borderColor: "#9e000e",
                        },
                      }}
                    >
                      {level}
                    </Button>
                  </label>
                ))}
              </Box>
              {errors.restricao_alimentar && (
                <Typography
                  variant="caption"
                  sx={{ color: "#dc2626", display: "block", mt: 1 }}
                >
                  {errors.restricao_alimentar}
                </Typography>
              )}
            </Box>

            <Box id="div-difficulty" sx={{ mb: 2 }}>
              <Typography
                variant="subtitle1"
                sx={{ mb: 2, fontWeight: "600", color: "#374151" }}
              >
                Nível de Dificuldade
              </Typography>
              <Box className="flex gap-2 mb-2 flex-wrap">
                {["Fácil", "Médio", "Difícil", "Master Chef"].map((level) => (
                  <label key={level}>
                    <input
                      type="radio"
                      name="dificuldade"
                      value={level}
                      checked={formData.dificuldade === level}
                      onChange={() => handleDifficultySelect(level)}
                      style={{ display: "none" }}
                    />
                    <Button
                      variant={
                        formData.dificuldade === level
                          ? "contained"
                          : "outlined"
                      }
                      component="span"
                      sx={{
                        textTransform: "none",
                        borderRadius: "12px",
                        px: 3,
                        py: 1,
                        backgroundColor:
                          formData.dificuldade === level
                            ? "#9e000e"
                            : "transparent",
                        borderColor:
                          formData.dificuldade === level
                            ? "#9e000e"
                            : "#d1d5db",
                        color:
                          formData.dificuldade === level ? "white" : "#374151",
                        "&:hover": {
                          backgroundColor:
                            formData.dificuldade === level
                              ? "#7c000b"
                              : "#f3f4f6",
                          borderColor: "#9e000e",
                        },
                      }}
                    >
                      {level}
                    </Button>
                  </label>
                ))}
              </Box>
              {errors.dificuldade && (
                <Typography
                  variant="caption"
                  sx={{ color: "#dc2626", display: "block", mt: 1 }}
                >
                  {errors.dificuldade}
                </Typography>
              )}
            </Box>
          </Box>

          {/* Bloco Direito - Ingredientes */}
          <Box className="flex flex-col w-full md:w-[50%] bg-white rounded-lg shadow-md p-6">
            <Typography
              variant="h6"
              sx={{ mb: 3, color: "#9e000e", fontWeight: "bold" }}
            >
              Ingredientes
            </Typography>

            <Paper variant="outlined" sx={{ mb: 3, borderRadius: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#f9fafb" }}>
                    <TableCell
                      sx={{ fontWeight: "600", color: "#374151", width: "20%" }}
                    >
                      Quantidade
                    </TableCell>
                    <TableCell
                      sx={{ fontWeight: "600", color: "#374151", width: "35%" }}
                    >
                      Unidade de Medida
                    </TableCell>
                    <TableCell
                      sx={{ fontWeight: "600", color: "#374151", width: "35%" }}
                    >
                      Ingrediente
                    </TableCell>
                    <TableCell sx={{ width: "10%" }}></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {formData.ingredientes.map((ing, index) => (
                    <TableRow key={index}>
                      <TableCell sx={{ py: 1 }}>
                        <TextField
                          value={ing.quantity}
                          onChange={(e) =>
                            handleIngredientChange(
                              index,
                              "quantity",
                              e.target.value
                            )
                          }
                          placeholder="Ex: 2"
                          variant="outlined"
                          size="small"
                          fullWidth
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: "8px",
                              fontSize: "0.875rem",
                              "& fieldset": {
                                borderColor: "#d1d5db",
                              },
                              "&:hover fieldset": {
                                borderColor: "#9e000e",
                              },
                              "&.Mui-focused fieldset": {
                                borderColor: "#9e000e",
                              },
                            },
                            "& .MuiOutlinedInput-input": {
                              "&:hover": {
                                color: "#374151",
                              },
                            },
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ py: 1 }}>
                        <Select
                          value={{ value: ing.unit, label: ing.unit }}
                          onChange={(option) =>
                            handleIngredientChange(
                              index,
                              "unit",
                              option?.value || ""
                            )
                          }
                          options={UNIDADES_MEDIDA_OPTIONS}
                          placeholder="Selecione..."
                          isSearchable
                          menuPortalTarget={document.body}
                          styles={selectStyles}
                          isClearable
                        />
                      </TableCell>
                      <TableCell sx={{ py: 1 }}>
                        <TextField
                          value={ing.name}
                          onChange={(e) =>
                            handleIngredientChange(
                              index,
                              "name",
                              e.target.value
                            )
                          }
                          placeholder="Ex: Farinha"
                          variant="outlined"
                          size="small"
                          fullWidth
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: "8px",
                              fontSize: "0.875rem",
                              "& fieldset": {
                                borderColor: "#d1d5db",
                              },
                              "&:hover fieldset": {
                                borderColor: "#9e000e",
                              },
                              "&.Mui-focused fieldset": {
                                borderColor: "#9e000e",
                              },
                            },
                            "& .MuiOutlinedInput-input": {
                              "&:hover": {
                                color: "#374151",
                              },
                            },
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ py: 1, textAlign: "center" }}>
                        <IconButton
                          onClick={() => handleRemoveIngredient(index)}
                          sx={{
                            color: "#dc2626",
                            "&:hover": {
                              backgroundColor: "#fef2f2",
                              color: "#b91c1c",
                            },
                          }}
                        >
                          <Trash2 size={16} />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>
            {errors.ingredientes && (
              <Typography
                variant="caption"
                sx={{ color: "#dc2626", display: "block", mb: 2 }}
              >
                {errors.ingredientes}
              </Typography>
            )}
            <Button
              variant="outlined"
              startIcon={<Plus />}
              onClick={handleAddIngredient}
              sx={{
                mb: 2,
                borderColor: "#9e000e",
                color: "#9e000e",
                "&:hover": {
                  borderColor: "#7c000b",
                  backgroundColor: "#fef2f2",
                },
                borderRadius: "8px",
                px: 3,
                py: 1.5,
              }}
            >
              Adicionar ingrediente
            </Button>
          </Box>
        </Box>

        <Box className="w-full flex justify-center">
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting}
            sx={{
              backgroundColor: "#9e000e",
              "&:hover": { backgroundColor: "#7c000b" },
              color: "#ffffff",
              borderRadius: "12px",
              px: 6,
              py: 2,
              fontSize: "1.1rem",
              fontWeight: "600",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              "&:disabled": {
                backgroundColor: "#9ca3af",
              },
            }}
          >
            {isSubmitting ? "Salvando..." : "Salvar receita"}
          </Button>
        </Box>
      </form>
    </Box>
  );
}

// Função para converter minutos para formato de tempo da API (hh:mm:ss)
function converterMinutosParaHora(minutos: string): string {
  try {
    console.log("Convertendo minutos para hora:", minutos);
    const totalMinutos = parseInt(minutos, 10);

    if (isNaN(totalMinutos) || totalMinutos < 0) {
      console.warn("Minutos inválidos fornecidos:", minutos);
      return "00:00:00";
    }

    const horas = Math.floor(totalMinutos / 60);
    const minutosRestantes = totalMinutos % 60;

    // Formata para hh:mm:ss
    const horasFormatadas = horas.toString().padStart(2, "0");
    const minutosFormatados = minutosRestantes.toString().padStart(2, "0");

    const resultado = `${horasFormatadas}:${minutosFormatados}:00`;
    console.log("Resultado da conversão:", resultado);
    return resultado;
  } catch (error) {
    console.error(
      "Erro ao converter minutos para hora:",
      error,
      "Minutos fornecidos:",
      minutos
    );
    return "00:00:00";
  }
}

function converterHoraParaMinutos(hora: string): number {
  try {
    console.log("Convertendo hora para minutos:", hora);

    // Quebra a string pelo separador ":"
    const partes = hora.split(":");

    if (partes.length !== 3) {
      console.warn("Formato de hora inválido:", hora);
      return 0;
    }

    const horas = parseInt(partes[0], 10);
    const minutos = parseInt(partes[1], 10);
    const segundos = parseInt(partes[2], 10);

    // Validação básica
    if (
      isNaN(horas) ||
      horas < 0 ||
      isNaN(minutos) ||
      minutos < 0 ||
      minutos >= 60 ||
      isNaN(segundos) ||
      segundos < 0 ||
      segundos >= 60
    ) {
      console.warn("Valores inválidos na hora fornecida:", hora);
      return 0;
    }

    // Converte tudo para minutos (arredondando segundos)
    const totalMinutos = horas * 60 + minutos + Math.floor(segundos / 60);

    console.log("Resultado da conversão:", totalMinutos, "minutos");
    return totalMinutos;
  } catch (error) {
    console.error(
      "Erro ao converter hora para minutos:",
      error,
      "Hora fornecida:",
      hora
    );
    return 0;
  }
}
