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

interface Ingredient {
  quantity: string;
  name: string;
}

interface RecipeData {
  title: string;
  prepTime: string;
  photoUrl: string;
  description: string;
  ingredients: Ingredient[];
  difficulty: string;
}

interface RecipeRegisterProps {
  titlePage: string;
  initialData?: RecipeData;
  onSubmit: (data: RecipeData) => void;
}

export default function RecipeRegister({
  titlePage = "Adicionar nova receita",
  initialData,
  onSubmit,
}: RecipeRegisterProps) {
  const [formData, setFormData] = useState<RecipeData>({
    title: "",
    prepTime: "",
    photoUrl: "",
    description: "",
    ingredients: [],
    difficulty: "",
  });

  const [errors, setErrors] = useState({
    title: "",
    prepTime: "",
    photoUrl: "",
    description: "",
    ingredients: "",
    difficulty: "",
  });

  // Ao carregar, preenche com os dados iniciais se existirem (modo edição)
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
    const newIngredients = [...formData.ingredients];
    newIngredients[index][field] = value;
    setFormData((prev) => ({ ...prev, ingredients: newIngredients }));
    setErrors((prev) => ({ ...prev, ingredients: "" }));
  }

  function handleAddIngredient() {
    setFormData((prev) => ({
      ...prev,
      ingredients: [...prev.ingredients, { quantity: "", name: "" }],
    }));
  }

  function handleRemoveIngredient(index: number) {
    setFormData((prev) => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index),
    }));
  }

  function handleDifficultySelect(level: string) {
    setFormData((prev) => ({ ...prev, difficulty: level }));
    setErrors((prev) => ({ ...prev, difficulty: "" }));
  }

  function validate() {
    let valid = true;
    const newErrors = {
      title: "",
      prepTime: "",
      photoUrl: "",
      description: "",
      ingredients: "",
      difficulty: "",
    };

    if (!formData.title.trim()) {
      newErrors.title = "Título é obrigatório";
      valid = false;
    }
    if (!formData.prepTime.trim()) {
      newErrors.prepTime = "Tempo de preparo é obrigatório";
      valid = false;
    }
    if (!formData.photoUrl.trim()) {
      newErrors.photoUrl = "URL da foto é obrigatória";
      valid = false;
    } else if (
      !/^https?:\/\/.*\.(?:png|jpg|jpeg|gif|bmp|webp)$/i.test(
        formData.photoUrl.trim()
      )
    ) {
      newErrors.photoUrl = "Informe uma URL válida de imagem (ex: .jpg, .png)";
      valid = false;
    }
    if (!formData.description.trim()) {
      newErrors.description = "Descrição é obrigatória";
      valid = false;
    }
    if (formData.ingredients.length === 0) {
      newErrors.ingredients = "Adicione pelo menos um ingrediente";
      valid = false;
    } else {
      const hasInvalid = formData.ingredients.some(
        (ing) => !ing.quantity.trim() || !ing.name.trim()
      );
      if (hasInvalid) {
        newErrors.ingredients =
          "Preencha quantidade e ingrediente em todas as linhas";
        valid = false;
      }
    }
    if (!formData.difficulty) {
      newErrors.difficulty = "Selecione a dificuldade";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!validate()) return;

    onSubmit(formData);
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
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Insira o título da receita"
            variant="outlined"
            sx={{ mb: 2 }}
            inputProps={{ maxLength: 50 }}
            helperText={errors.title || "Máximo de 50 caracteres"}
            error={!!errors.title}
          />
          <TextField
            label="Tempo de Preparo"
            name="prepTime"
            value={formData.prepTime}
            onChange={handleChange}
            placeholder="Insira o tempo estimado"
            variant="outlined"
            sx={{ mb: 2 }}
            helperText={errors.prepTime}
            error={!!errors.prepTime}
          />

          {errors.difficulty && (
            <p className="text-red-500 text-sm mb-4">{errors.difficulty}</p>
          )}
          <TextField
            label="URL da foto"
            name="photoUrl"
            value={formData.photoUrl}
            onChange={handleChange}
            placeholder="https://exemplo.com/foto.jpg"
            variant="outlined"
            sx={{ mb: 2 }}
            helperText={errors.photoUrl}
            error={!!errors.photoUrl}
          />

          <TextField
            label="Descrição"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Descreva a receita"
            variant="outlined"
            multiline
            rows={5}
            sx={{ mb: 2 }}
            helperText={errors.description}
            error={!!errors.description}
          />
          <Box id="div-difficulty">
            <p className="mb-2 font-medium">Dificuldade</p>
            <Box className="flex gap-2 mb-2 flex-wrap">
              {["Fácil", "Médio", "Difícil", "Master Chef"].map((level) => (
                <label key={level}>
                  <input
                    type="radio"
                    name="difficulty"
                    value={level}
                    checked={formData.difficulty === level}
                    onChange={() => handleDifficultySelect(level)}
                    style={{ display: "none" }}
                  />
                  <Button
                    variant={
                      formData.difficulty === level ? "contained" : "outlined"
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
            {errors.difficulty && (
              <p className="text-red-500 text-sm mb-4">{errors.difficulty}</p>
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
                  <TableCell>Ingrediente</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {formData.ingredients.map((ing, index) => (
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
                        placeholder="Ex: 2 xícaras"
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
          {errors.ingredients && (
            <p className="text-red-500 text-sm mb-2">{errors.ingredients}</p>
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
            sx={{
              backgroundColor: "#000000",
              "&:hover": { backgroundColor: "#5C5C5C" },
              color: "#ffffff",
              borderRadius: "12px",
              px: 4,
              py: 1.5,
            }}
          >
            Salvar receita
          </Button>
        </Box>
      </form>
    </Box>
  );
}
