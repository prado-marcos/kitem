import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { Box, CircularProgress, Typography } from "@mui/material";
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied';
import { Heart } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

const altImage = "https://freesvg.org/img/mealplate.png";

interface RecipeProps {
  id: number;
  title: string;
  imageUrl: string;
  time: number;
  viewCount: number;
  difficulty: string;
  isFavorite: boolean;
}

export default function Favoritos() {
  const [recipes, setRecipes] = useState<RecipeProps[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Se não estiver autenticado, redireciona para login
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    async function fetchFavorites() {
      try {
        setLoading(true);
        
        // Busca o ID do usuário logado
        const userId = localStorage.getItem("userId");
        if (!userId) {
          console.error("Usuário não autenticado");
          setRecipes([]);
          return;
        }
        
        // Busca favoritos do usuário logado usando a rota correta da API
        const response = await api.get(`/usuarios/${userId}/favoritos/`);
        
        console.log("Dados da API de favoritos:", response.data);
        
        // Os dados já vêm filtrados pelo usuário, não precisa filtrar novamente
        const userFavorites = response.data;
        
        console.log("Favoritos do usuário:", userFavorites);
        
        if (userFavorites.length === 0) {
          setRecipes([]);
          return;
        }
        
        // Extrai os IDs das receitas favoritas do usuário
        const favoriteIds = userFavorites.map((favorite: any) => {
          // A API retorna o ID da receita, não o ID da tabela favorita
          return favorite.receita_id || favorite.receita?.id || favorite.id_receita;
        }).filter((id: any) => id); // Remove IDs undefined/null
        
        console.log("IDs das receitas favoritas (receita_id):", favoriteIds);
        
        if (favoriteIds.length === 0) {
          setRecipes([]);
          return;
        }
        
        // Busca os dados completos de cada receita favorita
        const recipesData = [];
        for (const recipeId of favoriteIds) {
          try {
            const recipeResponse = await api.get(`/receitas/${recipeId}/`);
            const recipe = recipeResponse.data;
            
            const formattedRecipe = {
              id: recipe.id,
              title: recipe.titulo,
              imageUrl: recipe.imagem || altImage,
              time: converterHoraParaMinutos(recipe.tempo_preparo),
              viewCount: recipe.quantidade_visualizacao || 0,
              difficulty: recipe.dificuldade || "Média",
              isFavorite: true,
            };
            
            recipesData.push(formattedRecipe);
            console.log(`Receita ${recipeId} carregada:`, formattedRecipe);
          } catch (error) {
            console.error(`Erro ao carregar receita ${recipeId}:`, error);
          }
        }
        
        console.log("Receitas favoritas carregadas:", recipesData);
        setRecipes(recipesData);
      } catch (error) {
        console.error("Erro ao buscar favoritos:", error);
        setRecipes([]);
      } finally {
        setLoading(false);
      }
    }

    fetchFavorites();
  }, [isAuthenticated, navigate]);

  async function toggleFavorite(recipeId: number) {
    try {
      // Busca o ID do usuário logado
      const userId = localStorage.getItem("userId");
      if (!userId) {
        console.error("Usuário não autenticado");
        return;
      }
      
      // Remove dos favoritos usando a rota recomendada da API
      // DELETE /api/usuarios/{id}/favoritos/{id_receita}/
      await api.delete(`/usuarios/${userId}/favoritos/${recipeId}/`);
      
      // Atualiza a lista removendo a receita
      setRecipes(prev => prev.filter(recipe => recipe.id !== recipeId));
      
      console.log(`Receita ${recipeId} removida dos favoritos com sucesso`);
    } catch (error) {
      console.error("Erro ao remover dos favoritos:", error);
    }
  }

  if (!isAuthenticated) {
    return null; // Não renderiza nada se não estiver autenticado
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
          Carregando seus favoritos, por favor aguarde...
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Meus Favoritos</h1>

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
            Nenhuma receita favorita
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Você ainda não adicionou nenhuma receita aos seus favoritos.
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Explore receitas e adicione as que mais gostar!
          </Typography>
          <button
            onClick={() => navigate("/receitas")}
            className="mt-6 px-6 py-2 text-white font-semibold rounded-md shadow-md transition-transform transform hover:scale-105"
            style={{
              backgroundColor: "#9e000e",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#7c000b")}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#9e000e")}
          >
            Explorar Receitas
          </button>
        </Box>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.map((recipe) => (
            <div
              key={recipe.id}
              className="bg-white shadow rounded overflow-hidden hover:shadow-lg transition-shadow relative"
            >
              <Link to={`/receita/${recipe.id}`}>
                <img
                  src={recipe.imageUrl}
                  alt={recipe.title}
                  className="w-full h-64 object-cover"
                />
              </Link>
              
              {/* Botão de favorito */}
              <button
                onClick={() => toggleFavorite(recipe.id)}
                title="Remover dos favoritos"
                className="absolute top-2 right-2 hover:bg-gray-100 p-2 rounded-full transition-colors cursor-pointer bg-white/80 backdrop-blur-sm"
              >
                <Heart className="fill-red-500 h-5 w-5" />
              </button>
              
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
  if (!hora || typeof hora !== 'string') return 0;
  const partes = hora.split(":");
  if (partes.length < 2) return 0;
  
  const horas = parseInt(partes[0], 10) || 0;
  const minutos = parseInt(partes[1], 10) || 0;
  const segundos = partes[2] ? parseInt(partes[2], 10) || 0 : 0;
  
  return horas * 60 + minutos + Math.round(segundos / 60);
}
