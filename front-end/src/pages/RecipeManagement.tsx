import { useState } from "react";
import recipeManagement from "../assets/recipe-management.jpg";
import { Search } from "lucide-react";
import RecipeCarousel from "../components/RecipeCarousel";
import { Button } from "@mui/material";

const recipes: RecipeProps[] = [
  {
    id: 1,
    title: "Pasta Carbonara",
    imageUrl: "/assets/pasta.jpg",
    time: "30 mins",
    rating: 4.5,
    difficulty: "Fácil",
  },
  {
    id: 2,
    title: "Salmão Grelhado",
    imageUrl: "/assets/salmao.jpg",
    time: "20 mins",
    rating: 4.8,
    difficulty: "Fácil",
  },
  {
    id: 3,
    title: "Torrada de abacate",
    imageUrl: "/assets/torrada.jpg",
    time: "10 mins",
    rating: 4.7,
    difficulty: "Fácil",
  },
  {
    id: 4,
    title: "Risoto de Cogumelos",
    imageUrl: "/assets/risoto.jpg",
    time: "40 mins",
    rating: 4.6,
    difficulty: "Fácil",
  },
];

export default function RecipeManagement() {
  const [query, setQuery] = useState("");
  function handleSearch() {
    console.log(query);
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
        <div className="flex items-center gap-1">
          <input
            type="text"
            placeholder="Buscar..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="bg-white rounded-sm px-2 py-1 w-100"
          />
          <Button
            onClick={handleSearch}
            title="Buscar"
            type="button"
            sx={{
              backgroundColor: "#D9D9D9",
              "&:hover": { backgroundColor: "#f0f0f0" },
              color: "#000000",
            }}
            variant="contained"
          >
            <Search className="size-5" />
          </Button>
        </div>
      </div>
      <RecipeCarousel
        title="Minhas Receitas"
        subTitle=""
        recipes={recipes}
      />
      <RecipeCarousel
        title="Receitas Favoritas"
        subTitle=""
        recipes={recipes}
      />
    </>
  );
}
