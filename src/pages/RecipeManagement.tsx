// import { Search } from "lucide-react";
// import { Button } from "@mui/material";
import { useEffect, useState } from "react";
import recipeManagement from "../assets/recipe-management.jpg";
import RecipeCarousel from "../components/RecipeCarousel";
import api from "../services/api";
import { CircularProgress } from "@mui/material";
const altImage = "https://freesvg.org/img/mealplate.png";

type RecipeProps = {
  id: number;
  title: string;
  imageUrl: string;
  time: string;
  rating: number;
  difficulty: string;
};

export default function RecipeManagement() {
  // const [query, setQuery] = useState("");
  const [myRecipes, setMyRecipes] = useState<RecipeProps[]>([]);
  const [loading, setLoading] = useState(true);

  // function handleSearch() {
  //   console.log(query);
  // }

  useEffect(() => {
    async function fetchRecipes() {
      try {
        const userId = localStorage.getItem("userId");
        const response = await api.get(`/receitas/usuario/${userId}/`);
        const formattedRecipes = response.data.map((recipe: any) => ({
          id: recipe.id,
          title: recipe.titulo,
          imageUrl: recipe?.imagem || altImage,
          time: converterHoraParaMinutos(recipe.tempo_preparo),
          viewCount: recipe.quantidade_visualizacao,
          difficulty: recipe.dificuldade,
        }));
        setMyRecipes(formattedRecipes);
      } catch (error) {
        console.error("Erro ao buscar receitas:", error);
        setMyRecipes([]);
      } finally {
        setLoading(false);
      }
    }

    fetchRecipes();
  }, []);

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
    <>
      <div
        className="w-full bg-cover py-10 px-6 shadow-lg flex flex-col items-center gap-4"
        style={{ backgroundImage: `url(${recipeManagement})` }}
      >
        <h1 className="text-5xl font-bold text-white text-shadow-lg">
          Bem-vindo ao Gerenciamento de receitas!
        </h1>
        <h3 className="text-1xl font-bold text-white text-shadow-lg">
          Adicione e gerencie suas receitas facilmente.
        </h3>
      </div>
      {myRecipes.length ? (
        <RecipeCarousel
          title="Minhas Receitas"
          subTitle=""
          recipes={myRecipes}
          managementMode={true} // <- habilita botões
        />
      ) : (
        ""
      )}
      {/* <RecipeCarousel
        title="Receitas Favoritas"
        subTitle=""
        recipes={recipes}
      /> */}
    </>
  );
}

function converterHoraParaMinutos(hora: string): number {
  const partes = hora.split(":");
  const horas = parseInt(partes[0], 10);
  const minutos = parseInt(partes[1], 10);
  const segundos = partes[2] ? parseInt(partes[2], 10) : 0;
  return horas * 60 + minutos + Math.round(segundos / 60);
}
