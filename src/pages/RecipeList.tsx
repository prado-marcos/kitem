import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import api from "../services/api";
import { Box, CircularProgress, Typography } from "@mui/material";
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied';
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate(); // Mova o useNavigate para o corpo do componente

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
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
        <CircularProgress
          style={{ color: "#9e000e" }} // Cor personalizada
          size={64} // Tamanho do spinner
          thickness={4} // Espessura do spinner
        />
        <p className="mt-4 text-lg font-semibold text-gray-600">
          Carregando receitas, por favor aguarde...
        </p>
      </div>
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
            gap: 2,
            padding: "16px",
          }}
        >
          <SentimentDissatisfiedIcon sx={{ fontSize: 80, color: "#9e000e" }} />
          <Typography variant="h4" color="text.primary" fontWeight="bold">
            Nenhuma receita encontrada
          </Typography>
          {searchQuery && (
            <Typography variant="body1" color="text.secondary">
              Não encontramos resultados para <strong>"{searchQuery}"</strong>. Tente ajustar sua busca ou verificar a ortografia.
            </Typography>
          )}
          <Typography variant="body1" color="text.secondary">
            Explore outras receitas ou volte para a página inicial.
          </Typography>
          <button
            onClick={() => navigate("/")} // Use navigate aqui
            className="mt-6 px-6 py-2 text-white font-semibold rounded-md shadow-md transition-transform transform hover:scale-105"
            style={{
              backgroundColor: "#9e000e", // Cor principal
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)", // Sombra
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#7c000b")}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#9e000e")}
          >
            Voltar
          </button>
        </Box>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.map((recipe) => (
            <div
              key={recipe.id}
              className="bg-white shadow rounded overflow-hidden hover:shadow-lg transition-shadow"
            >
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