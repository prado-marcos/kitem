import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import homeBanner from "../assets/home_banner.png";
import { Search, ChevronUp, ChevronDown } from "lucide-react";
import RecipeCarousel from "../components/RecipeCarousel";
// @ts-expect-error importe funciona normalmente
import "swiper/css";
// @ts-expect-error importe funciona normalmente
import "swiper/css/navigation";
import { Box, Button, CircularProgress } from "@mui/material";
import api from "../services/api";
const altImage = "https://freesvg.org/img/mealplate.png";
interface FilterProps {
  label: string;
  children: React.ReactNode;
}

interface FilterOptionProps {
  label: string;
  name: string;
  value: string;
}

interface RecipeProps {
  id: number;
  title: string;
  imageUrl: string;
  time: string;
  viewCount: number;
  difficulty: string;
}

export default function Home() {
  const [query, setQuery] = useState("");
  const [toggleAdvancedSearch, setToggleAdvancedSearch] = useState(false);
  const [recipes, setRecipes] = useState<RecipeProps[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRecipes() {
      try {
        const response = await api.get("/receitas");
        const formattedRecipes = response.data.map((recipe: any) => ({
          id: recipe.id,
          title: recipe.titulo,
          imageUrl: recipe?.url_imagem || altImage,
          // imageUrl: recipe.url_imagem,
          time: converterHoraParaMinutos(recipe.tempo_preparo),
          viewCount: recipe.quantidade_visualizacao, // A API não retorna viewCount, então definimos um valor padrão
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
  }, []);

  function handleSearch() {
    console.log(query);
  }

  function handleAdvancedSearch(toggleButton: boolean) {
    setToggleAdvancedSearch(toggleButton);
  }

  if (loading) {
    return (
      <Box sx={{ display: "flex flex-col items-center" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <div
        className="w-full bg-cover py-10 px-6 shadow-lg flex flex-col items-center gap-4"
        style={{ backgroundImage: `url(${homeBanner})` }}
      >
        <h1 className="text-5xl font-bold text-white text-shadow-lg">
          Encontre a receita perfeita!
        </h1>
        <h3 className="text-1xl font-bold text-white text-shadow-lg">
          Busque por receitas do seu interesse
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
          <Button
            onClick={() => handleAdvancedSearch(!toggleAdvancedSearch)}
            title="Busca Avançada"
            type="button"
            sx={{
              backgroundColor: "#D9D9D9",
              "&:hover": { backgroundColor: "#f0f0f0" },
              color: "#000000",
            }}
            variant="contained"
          >
            {toggleAdvancedSearch ? (
              <ChevronUp className="size-5" />
            ) : (
              <ChevronDown className="size-5" />
            )}
          </Button>
        </div>
      </div>
      <AnimatePresence>
        {toggleAdvancedSearch && <AdvancedSearch />}
      </AnimatePresence>
      <RecipeCarousel
        title="Receitas Populares"
        subTitle="Explore as mais acessadas"
        recipes={recipes.toSorted((a, b) => b.viewCount - a.viewCount)}
      />
      <RecipeCarousel
        title="Sugestões de receitas"
        subTitle="Receitas para te inspirar"
        recipes={recipes}
      />
    </>
  );
}

function AdvancedSearch() {
  // const [minTime, setMinTime] = useState("");

  // function handleMinTimeChange(
  //   e: React.ChangeEvent<HTMLInputElement>,
  //   setState: React.Dispatch<React.SetStateAction<string>>
  // ) {
  //   const value = e.target.value;
  //   if (/^\d*$/.test(value) && parseInt(value) > 0) {
  //     setState(value);
  //   }
  // }

  return (
    <motion.div
      className="w-full overflow-hidden bg-gray-300 py-0 px-6 shadow-lg flex flex-col items-center gap-4"
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
    >
      <div className="py-10 flex flex-col gap-5">
        <Filter label="Restrição Alimentar">
          <FilterOption label="Vegano" name="restricao" value="vegano" />
          <FilterOption
            label="Vegetariano"
            name="restricao"
            value="vegetariano"
          />
          <FilterOption
            label="Sem Glúten"
            name="restricao"
            value="sem-gluten"
          />
          <FilterOption
            label="Baixa Caloria"
            name="restricao"
            value="baixa-caloria"
          />
          <FilterOption
            label="Sem Lactose"
            name="restricao"
            value="sem-lactose"
          />
        </Filter>

        <Filter label="Tipo">
          <FilterOption label="Doce" name="tipo" value="doce" />
          <FilterOption label="Salgado" name="tipo" value="salgado" />
        </Filter>

        <Filter label="Nível de Dificuldade">
          <FilterOption label="Fácil" name="dificuldade" value="facil" />
          <FilterOption label="Médio" name="dificuldade" value="medio" />
          <FilterOption label="Difícil" name="dificuldade" value="dificil" />
          <FilterOption
            label="Master Chef"
            name="dificuldade"
            value="master-chef"
          />
        </Filter>

        <Filter label="Tempo de preparo">
          <FilterOption label="Menos de 20min" name="tempo" value="20" />
          <FilterOption label="Menos de 30min" name="tempo" value="30" />
          <FilterOption label="Menos de 40min" name="tempo" value="40" />
          <FilterOption label="Menos de 1h" name="tempo" value="60" />
          <FilterOption label="Mais de 1h" name="tempo" value="61" />
        </Filter>
      </div>
    </motion.div>
  );
}

function Filter({ label, children }: FilterProps) {
  return (
    <div className="flex flex-col gap-2">
      <span className="font-semibold text-gray-700">{label}</span>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function FilterOption({ label, name, value }: FilterOptionProps) {
  return (
    <label className="cursor-pointer">
      <input type="radio" name={name} value={value} className="peer hidden" />
      <div className="px-4 py-2 rounded bg-gray-200 peer-checked:bg-gray-500 peer-checked:text-white transition-all">
        {label}
      </div>
    </label>
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
