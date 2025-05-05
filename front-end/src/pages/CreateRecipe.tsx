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
} from "@mui/material";
import { useState, ChangeEvent, FormEvent, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";
import api from "../services/api";

interface Ingredient {
  quantity: string;
  unit: string;
  name: string;
}

interface RecipeData {
  titulo: string;
  descricao: string;
  tempo_preparo: string;
  dificuldade: string;
  tipo: string;
  restricao_alimentar: string;
  imagem: string;
  ingredientes: Ingredient[];
}

interface RecipeRegisterProps {
  titlePage: string;
  initialData?: RecipeData;
  onSubmit?: (data: RecipeData) => void;
}

export default function RecipeRegister({
  titlePage = "Adicionar nova receita",
  initialData,
  onSubmit,
}: RecipeRegisterProps) {
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
      ingredientes: [...prev.ingredientes, { quantity: "", unit: "", name: "" }],
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
    if (!formData.tempo_preparo.trim()) {
      newErrors.tempo_preparo = "Tempo de preparo é obrigatório";
      valid = false;
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
        (ing) => !ing.quantity.trim() || !ing.name.trim()
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
      newErrors.restricao_alimentar = "Selecione a restrição";
      valid = false;
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

      // 1. Criar a receita
      const recipeResponse = await api.post("/receitas/", {
        titulo: formData.titulo,
        descricao: formData.descricao,
        tempo_preparo: parseTimeToSeconds(formData.tempo_preparo) || null,
        dificuldade: formData.dificuldade,
        tipo: formData.tipo,
        restricao_alimentar: formData.restricao_alimentar,
        imagem: formData.imagem,
        id_usuario: parseInt(userId),
      });

      const recipeId = recipeResponse.data.id;

      // 2. Para cada ingrediente:
      for (const ingredient of formData.ingredientes) {
        // 2.1 Criar ou obter o ingrediente
        const ingredientResponse = await api.post("/ingredientes/", {
          nome: ingredient.name,
        });
        const ingredientId = ingredientResponse.data.id;

        // 2.2 Criar a relação receita_ingrediente
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

      alert("Receita criada com sucesso!");
    } catch (error) {
      console.error("Erro ao criar receita:", error);
      alert("Ocorreu um erro ao criar a receita. Por favor, tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Box className="flex flex-col justify-center items-center my-12 w-full">
      <Typography variant="h4" sx={{ mb: 2 }}>
        {titlePage}
      </Typography>
      <form
        onSubmit={handleSubmit}
        className="w-full flex flex-col items-center gap-5"
      >
        <Box className="flex flex-col w-full md:w-[45%]">
          <TextField
            label="Título"
            name="titulo"
            value={formData.titulo}
            onChange={handleChange}
            placeholder="Insira o título da receita"
            variant="outlined"
            sx={{ mb: 2 }}
            inputProps={{ maxLength: 50 }}
            helperText={errors.titulo || "Máximo de 50 caracteres"}
            error={!!errors.titulo}
          />
          <TextField
            label="Tempo de Preparo"
            name="tempo_preparo"
            value={formData.tempo_preparo}
            onChange={handleChange}
            placeholder="Insira o tempo estimado"
            variant="outlined"
            sx={{ mb: 2 }}
            helperText={errors.tempo_preparo}
            error={!!errors.tempo_preparo}
          />

          <TextField
            label="URL da foto"
            name="imagem"
            value={formData.imagem}
            onChange={handleChange}
            placeholder="https://exemplo.com/foto.jpg"
            variant="outlined"
            sx={{ mb: 2 }}
            helperText={errors.imagem}
            error={!!errors.imagem}
          />

          <TextField
            label="Descrição"
            name="descricao"
            value={formData.descricao}
            onChange={handleChange}
            placeholder="Descreva a receita"
            variant="outlined"
            multiline
            rows={5}
            sx={{ mb: 2 }}
            helperText={errors.descricao}
            error={!!errors.descricao}
          />
          <Box id="div-type">
            <p className="mb-2 font-medium">Tipo</p>
            <Box className="flex gap-2 mb-2 flex-wrap">
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
                    }}
                  >
                    {level}
                  </Button>
                </label>
              ))}
            </Box>
            {errors.tipo && (
              <p className="text-red-500 text-sm mb-4">{errors.tipo}</p>
            )}
          </Box>

          <Box id="div-restriction">
            <p className="mb-2 font-medium">Restrição Alimentar</p>
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
                      formData.restricao_alimentar === level ? "contained" : "outlined"
                    }
                    component="span"
                    sx={{
                      textTransform: "none",
                      borderRadius: "12px",
                    }}
                  >
                    {level}
                  </Button>
                </label>
              ))}
            </Box>
            {errors.restricao_alimentar && (
              <p className="text-red-500 text-sm mb-4">{errors.restricao_alimentar}</p>
            )}
          </Box>

          <Box id="div-difficulty">
            <p className="mb-2 font-medium">Dificuldade</p>
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
                      formData.dificuldade === level ? "contained" : "outlined"
                    }
                    component="span"
                    sx={{
                      textTransform: "none",
                      borderRadius: "12px",
                    }}
                  >
                    {level}
                  </Button>
                </label>
              ))}
            </Box>
            {errors.dificuldade && (
              <p className="text-red-500 text-sm mb-4">{errors.dificuldade}</p>
            )}
          </Box>
        </Box>

        <Box className="flex flex-col w-full md:w-[45%]">
          <p className="mb-2 font-medium">Ingredientes</p>
          <Paper variant="outlined" sx={{ mb: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Quantidade</TableCell>
                  <TableCell>Unidade de Medida</TableCell>
                  <TableCell>Ingrediente</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {formData.ingredientes.map((ing, index) => (
                  <TableRow key={index}>
                    <TableCell>
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
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        value={ing.unit}
                        onChange={(e) =>
                          handleIngredientChange(
                            index,
                            "unit",
                            e.target.value
                          )
                        }
                        placeholder="Ex: xícaras"
                        variant="outlined"
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        value={ing.name}
                        onChange={(e) =>
                          handleIngredientChange(index, "name", e.target.value)
                        }
                        placeholder="Ex: Farinha"
                        variant="outlined"
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleRemoveIngredient(index)}>
                        <Trash2 size={16} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
          {errors.ingredientes && (
            <p className="text-red-500 text-sm mb-2">{errors.ingredientes}</p>
          )}
          <Button
            variant="outlined"
            startIcon={<Plus />}
            onClick={handleAddIngredient}
            sx={{ mb: 2 }}
          >
            Adicionar ingrediente
          </Button>
        </Box>

        <Box className="w-full flex justify-center">
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting}
            sx={{
              backgroundColor: "#000000",
              "&:hover": { backgroundColor: "#5C5C5C" },
              color: "#ffffff",
              borderRadius: "12px",
              px: 4,
              py: 1.5,
            }}
          >
            {isSubmitting ? "Salvando..." : "Salvar receita"}
          </Button>
        </Box>
      </form>
    </Box>
  );
}

function parseTimeToSeconds(timeStr: string): number | null {
  if (!timeStr) return null;
  
  const parts = timeStr.split(':');
  let seconds = 0;
  
  if (parts.length === 3) {
    // Formato hh:mm:ss
    seconds += parseInt(parts[0]) * 3600; // horas
    seconds += parseInt(parts[1]) * 60;   // minutos
    seconds += parseInt(parts[2]);        // segundos
  } else if (parts.length === 2) {
    // Formato mm:ss
    seconds += parseInt(parts[0]) * 60;   // minutos
    seconds += parseInt(parts[1]);        // segundos
  } else if (parts.length === 1) {
    // Apenas segundos
    seconds += parseInt(parts[0]);
  }
  
  return isNaN(seconds) ? null : seconds;
}