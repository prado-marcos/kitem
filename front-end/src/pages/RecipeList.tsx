import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import api from "../services/api";
import { Box, CircularProgress, Typography } from "@mui/material";
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied';

const altImage = "https://freesvg.org/img/mealplate.png";

interface RecipeProps {
  id: number;
  title: string;
  imageUrl: string;
  time: string;
  viewCount: number;
  difficulty: string;
}

export default function RecipeList() {
  const [recipes, setRecipes] = useState<RecipeProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const location = useLocation();

  useEffect(() => {
    async function fetchRecipes() {
      try {
        setLoading(true);
        const searchParams = new URLSearchParams(location.search);
        const query = searchParams.get("busca") || "";
        setSearchQuery(query);
        
        let response;
        if (searchParams.toString()) {
          response = await api.get(`/receitas/filtrar/?${searchParams.toString()}`);
        } else {
          response = await api.get("/receitas");
        }

        const formattedRecipes = response.data.map((recipe: any) => ({
          id: recipe.id,
          title: recipe.titulo,
          imageUrl: recipe?.imagem || altImage,
          time: converterHoraParaMinutos(recipe.tempo_preparo),
          viewCount: recipe.quantidade_visualizacao,
          difficulty: recipe.dificuldade,
        }));
        
        setRecipes(formattedRecipes);
      } catch (error) {
        console.error("Erro ao buscar receitas:", error);
        setRecipes([]);
      } finally {
        setLoading(false);
      }
    }

    fetchRecipes();
  }, [location.search]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">
        {searchQuery ? `Resultados para "${searchQuery}"` : "Receitas Encontradas"}
      </h1>
      
      {recipes.length === 0 ? (
        <Box 
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "300px",
            textAlign: "center",
            gap: 2
          }}
        >
          <SentimentDissatisfiedIcon sx={{ fontSize: 60, color: "text.secondary" }} />
          <Typography variant="h5" color="text.secondary">
            Nenhuma receita encontrada
          </Typography>
          {searchQuery && (
            <Typography variant="body1">
              Não encontramos resultados para "{searchQuery}". Tente ajustar sua busca.
            </Typography>
          )}
          <Typography variant="body1">
            <Link to="/" className="text-blue-500 hover:underline">
              Voltar para a página inicial
            </Link>
          </Typography>
        </Box>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.map((recipe) => (
            <div key={recipe.id} className="bg-white shadow rounded overflow-hidden hover:shadow-lg transition-shadow">
              <Link to={`/receita/${recipe.id}`}>
                <img
                  src={recipe.imageUrl}
                  alt={recipe.title}
                  className="w-full h-64 object-cover"
                />
              </Link>
              <div className="p-4">
                <h3 className="text-lg font-semibold">{recipe.title}</h3>
                <p className="mt-2">
                  {recipe.time} min | Dificuldade: {recipe.difficulty}
                </p>
                <p className="mt-1 text-sm text-gray-600">
                  {recipe.viewCount} visualizações
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function converterHoraParaMinutos(hora: string): number {
  const partes = hora.split(":");
  const horas = parseInt(partes[0], 10);
  const minutos = parseInt(partes[1], 10);
  const segundos = partes[2] ? parseInt(partes[2], 10) : 0;
  return horas * 60 + minutos + Math.round(segundos / 60);
}