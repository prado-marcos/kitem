// Receita.tsx
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Heart, Share2 } from "lucide-react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import { Box, CircularProgress, Typography } from "@mui/material";

interface IngredienteRecipeProps {
  quantity: number;
  ingredient: string;
  unitMeasure: string;
}

interface RecipeProps {
  title: string;
  ingredientRecipe: IngredienteRecipeProps[];
  favorite: boolean;
  imageUrl: string;
  description: string;
  difficulty: string;
  time: number;
}

export default function Recipe() {
  const { id } = useParams(); // Obtém o ID da URL
  const [recipe, setRecipe] = useState<RecipeProps | null>(null);
  const [isFavorite, setFavorite] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRecipe() {
      try {
        const response = await api.get(`/receitas/${id}`);
        const responseDetalhada = await api.get(`/receitas/${id}/detalhada`);
        const data = response.data;
        const dataDetalhada = responseDetalhada.data;
        const ingredientes = dataDetalhada.ingredientes;

        setRecipe({
          title: data.titulo,
          description: data.descricao,
          favorite: !!data.favorito,
          ingredientRecipe: ingredientes.map((ingredient: any) => ({
            quantity: ingredient.quantidade,
            ingredient: ingredient.nome_ingrediente,
            unitMeasure: ingredient.unidade_medida,
          })),
          imageUrl: data.imagem || "https://freesvg.org/img/mealplate.png",
          difficulty: data.dificuldade,
          time: converterHoraParaMinutos(data.tempo_preparo),
        });
        setFavorite(dataDetalhada.favorito)

      } catch (error) {
        console.error("Erro ao buscar receita:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchRecipe();
  }, [id]);

  function handleFavorite() {
    setFavorite(!isFavorite);
  }
  const navigate = useNavigate();
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
        <CircularProgress
          style={{ color: "#9e000e" }} // Cor personalizada
          size={64} // Tamanho do spinner
          thickness={4} // Espessura do spinner
        />
        <p className="mt-4 text-lg font-semibold text-gray-600">
          Carregando receita, por favor aguarde...
        </p>
      </div>
    );
  }
  
  if (!recipe) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
        <img
          src="https://png.pngtree.com/png-clipart/20231019/original/pngtree-cartoon-style-school-magnifier-png-image_13358501.png"
          alt="Receita não encontrada"
          className="w-64 h-64 object-contain"
        />
        <h1 className="mt-4 text-3xl font-bold text-gray-800">
          Receita não encontrada
        </h1>
        <p className="mt-2 text-lg text-gray-600">
          Desculpe, não conseguimos encontrar a receita que você está procurando.
        </p>
        <button
          onClick={() => navigate("/")}
          className="mt-6 px-6 py-2 text-white font-semibold rounded-md shadow-md transition-transform transform hover:scale-105"
          style={{
            backgroundColor: "#9e000e", // Cor principal
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)", // Sombra
          }}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#7c000b")} // Hover mais escuro
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#9e000e")} // Voltar ao normal
        >
          Voltar
        </button>
      </div>
    );
  }

  const ingredientsArr = recipe.ingredientRecipe.map((el, index) => (
    <li key={index}>
      {el.quantity + " " + el.unitMeasure + " " + el.ingredient}
    </li>
  ));

  return (
    <div className="flex flex-col my-12 mx-80 gap-5">
      <div className="flex flex-row justify-between items-center">
        <h1 className="text-4xl font-bold mb-2">{recipe.title}</h1>
        <div className="flex flex-row gap-x-2">
          <Share2 className="h-4 w-4 my-1" />
          <button onClick={handleFavorite}>
            {isFavorite ? (
              <Heart className="fill-black h-4 w-4 my-1" />
            ) : (
              <Heart className="fill-white h-4 w-4 my-1" />
            )}
          </button>
        </div>
      </div>
      <span className="flex justify-center">
        <img
          src={recipe.imageUrl}
          alt={recipe.title}
          className="max-w-md h-auto object-cover rounded-sm"
        />
      </span>
      <div className="flex flex-row">
        <p className="font-bold">
          Dificuldade: {recipe.difficulty} | Tempo de Preparo: {recipe.time} min
        </p>
      </div>
      <h3 className="text-lg font-semibold">Ingredientes</h3>
      <ul>{ingredientsArr}</ul>
      <h3 className="text-lg font-semibold">Modo de Preparo</h3>
      <p>{recipe.description}</p>
    </div>
  );
}

function converterHoraParaMinutos(hora: string): number {
  const partes = hora.split(":");
  const horas = parseInt(partes[0], 10);
  const minutos = parseInt(partes[1], 10);
  const segundos = partes[2] ? parseInt(partes[2], 10) : 0;
  const totalMinutos = horas * 60 + minutos + Math.round(segundos / 60);
  return totalMinutos;
}
