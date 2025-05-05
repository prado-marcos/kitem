import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import homeBanner from "../assets/home_banner.png";
import { Search, ChevronUp, ChevronDown } from "lucide-react";
import RecipeCarousel from "../components/RecipeCarousel";
// @ts-expect-error importe funciona normalmente
import "swiper/css";
// @ts-expect-error importe funciona normalmente
import "swiper/css/navigation";
import { Button, CircularProgress } from "@mui/material";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import Select, { MultiValue, components, ValueContainerProps, GroupBase } from "react-select";

const altImage = "https://freesvg.org/img/mealplate.png";

interface FilterProps {
  label: string;
  children: React.ReactNode;
}

interface FilterOptionProps {
  label: string;
  name: string;
  value: string;
  onChange: (name: string, value: string) => void;
}

interface RecipeProps {
  id: number;
  title: string;
  imageUrl: string;
  time: string;
  viewCount: number;
  difficulty: string;
  rating?: number;
}

export default function Home() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [toggleAdvancedSearch, setToggleAdvancedSearch] = useState(false);
  const [recipes, setRecipes] = useState<RecipeProps[]>([]);
  const [recipes_random, setRecipes_Random] = useState<RecipeProps[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedFilters, setSelectedFilters] = useState({
    restricao: "",
    tipo: "",
    dificuldade: "",
    tempo: "",
  });

  const [ingredients, setIngredients] = useState<MultiValue<{ value: string; label: string }>>([]);
  const [selectedIngredients, setSelectedIngredients] = useState<MultiValue<{ value: string; label: string }>>([]);
  const CustomValueContainer = <
    OptionType,
    IsMulti extends boolean = true
  >(
    props: ValueContainerProps<OptionType, IsMulti, GroupBase<OptionType>>
  ) => {
    const selected = props.getValue();


    if (selected.length === 1) {
      const label = (selected[0] as any).label; // você pode tipar melhor aqui se souber a estrutura
      const truncated = label.length > 10 ? `${label.slice(0, 10)}...` : label;
      return (
        <components.ValueContainer {...props}>
          {truncated}
        </components.ValueContainer>
      );
    }

    return <components.ValueContainer {...props} />;
  };

  useEffect(() => {
    async function fetchRecipes() {
      try {
        const response = await api.get("/receitas");
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
  }, []);

  useEffect(() => {
    async function fetchIngredients() {
      try {
        const response = await api.get("/ingredientes"); // Endpoint para buscar ingredientes
        const formattedIngredients = response.data.map((ingredient: any) => ({
          value: ingredient.nome,
          label: ingredient.nome,
        }));
        setIngredients(formattedIngredients);
      } catch (error) {
        console.error("Erro ao buscar ingredientes:", error);
      }
    }

    fetchIngredients();
  }, []);

  useEffect(() => {
    async function fetchMostAccessedRecipes() {
      try {
        const response = await api.get('/receitas/mais-acessadas/');
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
        console.error('Erro ao buscar receitas mais acessadas:', error);
      }
    }

    fetchMostAccessedRecipes();
  }, []);

  useEffect(() => {
    async function fetchRandomRecipes() {
      try {
        const response_random = await api.get('/receitas/aleatorias/');
        console.log('Resposta do endpoint aleatório:', response_random.data);
        const shuffledRecipes_random = response_random.data.sort(() => 0.5 - Math.random()).slice(0, 10); // Seleciona 10 receitas aleatórias
        const formattedRecipes_random = shuffledRecipes_random.map((recipe: any) => ({
          id: recipe.id,
          title: recipe.titulo,
          imageUrl: recipe?.imagem || altImage,
          time: converterHoraParaMinutos(recipe.tempo_preparo),
          viewCount: recipe.quantidade_visualizacao,
          difficulty: recipe.dificuldade,
        }));
        setRecipes_Random(formattedRecipes_random);
        console.log('Receitas aleatórias:', recipes_random);
      } catch (error) {
        console.error('Erro ao buscar receitas aleatórias:', error);
      }
    }

    fetchRandomRecipes();
  }, []);

  async function handleSearch() {
    setLoading(true);

    try {
      const params = new URLSearchParams();

      if (query) params.append("search", query);
      if (selectedFilters.restricao)
        params.append("restricao_alimentar", selectedFilters.restricao);
      if (selectedFilters.tipo) params.append("tipo", selectedFilters.tipo);
      if (selectedFilters.dificuldade)
        params.append("dificuldade", selectedFilters.dificuldade);
      if (selectedFilters.tempo)
        params.append("tempo_preparo", selectedFilters.tempo);

      // Adiciona os ingredientes selecionados ao payload
      if (selectedIngredients.length > 0) {
        selectedIngredients.forEach((item) => {
          params.append("ingredientes", item.value);
        });
      }

      // Redireciona para a página de receitas com os parâmetros de busca
      navigate(`/receitas?${params.toString()}`);
    } catch (error) {
      console.error("Erro ao buscar receitas:", error);
    } finally {
      setLoading(false);
    }
  }

  function handleAdvancedSearch(toggleButton: boolean) {
    setToggleAdvancedSearch(toggleButton);
  }

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
        style={{ backgroundImage: `url(${homeBanner})` }}
      >
        <h1 className="text-5xl font-bold text-white text-shadow-lg">
          Encontre a receita perfeita!
        </h1>
        <h3 className="text-1xl font-bold text-white text-shadow-lg">
          Busque por receitas do seu interesse
        </h3>
        <div className="flex items-center gap-1 w-full max-w-2xl">
          <input
            type="text"
            placeholder="Buscar..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && query.trim()) {
                handleSearch(); // Chama a função de busca ao pressionar Enter
              }
            }}
            className="bg-white rounded-sm px-3 py-1.5 w-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Select
            isMulti
            options={Array.from(new Map(ingredients.map(item => [item.label, item])).values()).sort((a, b) => a.label.localeCompare(b.label))} // Remove duplicados e ordena em ordem alfabética
            placeholder={"Selecione os ingredientes..."}
            onChange={(selected) => {
              setSelectedIngredients(selected || []);
            }}
            className="w-full z-50" // Adiciona z-index para garantir que o MultiSelect fique acima de outros elementos
            isSearchable={true} // Permite busca no MultiSelect
            closeMenuOnSelect={false} // Mantém o menu aberto ao selecionar
            hideSelectedOptions={false} // Mostra os itens selecionados na lista
            components={{
              Option: (props) => {
                return (
                  <div>
                    <components.Option {...props}>
                      <input
                        type="checkbox"
                        checked={props.isSelected}
                        onChange={() => null} // O react-select já gerencia o estado
                        style={{ marginRight: 10 }}
                      />
                      {props.label}
                    </components.Option>
                  </div>
                );
              }, // Usa o ValueContainer personalizado
            }}
            value={selectedIngredients}
            styles={{
              multiValue: (base) => ({
                ...base,
                backgroundColor: "#e0e0e0", // Cor de fundo para itens selecionados
                borderRadius: "4px",
                padding: "2px 6px",
              }),
              multiValueLabel: (base) => ({
                ...base,
                color: "#333", // Cor do texto dos itens selecionados
              }),
              multiValueRemove: (base) => ({
                ...base,
                color: "#666",
                ':hover': {
                  backgroundColor: "#ccc",
                  color: "#000",
                },
              }),
              menu: (base) => ({
                ...base,
                zIndex: 9999, // Garante que o menu do MultiSelect fique acima de outros elementos
              }),
            }}
          />
          <Button
            onClick={handleSearch}
            title="Buscar"
            type="button"
            sx={{
              backgroundColor: query.trim() || selectedIngredients.length > 0 || Object.values(selectedFilters).some((value) => value) ? "#D9D9D9" : "#f0f0f0", // Cor diferente quando habilitado/desabilitado
              "&:hover": query.trim() || selectedIngredients.length > 0 || Object.values(selectedFilters).some((value) => value) ? { backgroundColor: "#f0f0f0" } : undefined,
              color: query.trim() || selectedIngredients.length > 0 || Object.values(selectedFilters).some((value) => value) ? "#000000" : "#a0a0a0", // Cor do texto desabilitada
            }}
            variant="contained"
            disabled={!query.trim() && (selectedIngredients.length || Object.values(selectedFilters).some((value) => value)) === 0} // Habilita o botão se houver texto ou ingredientes selecionados
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
        {toggleAdvancedSearch && (
          <AdvancedSearch
            selectedFilters={selectedFilters}
            setSelectedFilters={setSelectedFilters}
          />
        )}
      </AnimatePresence>
      <RecipeCarousel
        title="Receitas Populares"
        subTitle="Explore as mais acessadas"
        recipes={recipes.slice().sort((a: RecipeProps, b: RecipeProps) => b.viewCount - a.viewCount)}
      />
      <RecipeCarousel
        title="Sugestões de receitas"
        subTitle="Receitas para te inspirar"
        recipes={recipes_random.slice().sort((a: RecipeProps, b: RecipeProps) => b.viewCount - a.viewCount)}
      />
    </>
  );
}

function AdvancedSearch({
  selectedFilters,
  setSelectedFilters,
}: {
  selectedFilters: any;
  setSelectedFilters: any;
}) {
  function handleFilterChange(name: string, value: string) {
    setSelectedFilters((prev: any) => ({
      ...prev,
      [name]: prev[name] === value ? "" : value, // Desmarca se o mesmo valor for selecionado
    }));
  }

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
          <FilterOption
            label="Vegano"
            name="restricao"
            value="vegano"
              onChange={handleFilterChange}
  selectedFilters={selectedFilters}
          />
          <FilterOption
            label="Vegetariano"
            name="restricao"
            value="vegetariano"
              onChange={handleFilterChange}
  selectedFilters={selectedFilters}
          />
          <FilterOption
            label="Sem Glúten"
            name="restricao"
            value="sem-gluten"
              onChange={handleFilterChange}
  selectedFilters={selectedFilters}
          />
          <FilterOption
            label="Baixa Caloria"
            name="restricao"
            value="baixa-caloria"
              onChange={handleFilterChange}
  selectedFilters={selectedFilters}
          />
          <FilterOption
            label="Sem Lactose"
            name="restricao"
            value="sem-lactose"
              onChange={handleFilterChange}
  selectedFilters={selectedFilters}
          />
        </Filter>

        <Filter label="Tipo">
          <FilterOption
            label="Doce"
            name="tipo"
            value="doce"
              onChange={handleFilterChange}
  selectedFilters={selectedFilters}
          />
          <FilterOption
            label="Salgado"
            name="tipo"
            value="salgado"
              onChange={handleFilterChange}
  selectedFilters={selectedFilters}
          />
        </Filter>

        <Filter label="Nível de Dificuldade">
          <FilterOption
            label="Fácil"
            name="dificuldade"
            value="Fácil"
              onChange={handleFilterChange}
  selectedFilters={selectedFilters}
          />
          <FilterOption
            label="Média"
            name="dificuldade"
            value="Média"
              onChange={handleFilterChange}
  selectedFilters={selectedFilters}
          />
          <FilterOption
            label="Difícil"
            name="dificuldade"
            value="Difícil"
              onChange={handleFilterChange}
  selectedFilters={selectedFilters}
          />
          <FilterOption
            label="Master Chef"
            name="dificuldade"
            value="Master Chef"
              onChange={handleFilterChange}
  selectedFilters={selectedFilters}
          />
        </Filter>

        <Filter label="Tempo de preparo">
          <FilterOption
            label="Menos de 20 min"
            name="tempo"
            value="20"
              onChange={handleFilterChange}
  selectedFilters={selectedFilters}
          />
          <FilterOption
            label="Menos de 30 min"
            name="tempo"
            value="30"
              onChange={handleFilterChange}
  selectedFilters={selectedFilters}
          />
          <FilterOption
            label="Menos de 40 min"
            name="tempo"
            value="40"
              onChange={handleFilterChange}
  selectedFilters={selectedFilters}
          />
          <FilterOption
            label="Menos de 1h"
            name="tempo"
            value="60"
              onChange={handleFilterChange}
  selectedFilters={selectedFilters}
          />
          <FilterOption
            label="Mais de 1h"
            name="tempo"
            value="100"
              onChange={handleFilterChange}
  selectedFilters={selectedFilters}
          />
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

function FilterOption({
  label,
  name,
  value,
  onChange,
  selectedFilters,
}: FilterOptionProps & { selectedFilters: any }) {
  return (
    <label className="cursor-pointer">
      <input
        type="checkbox" // Alterado para checkbox para permitir desmarcar
        name={name}
        value={value}
        className="peer hidden"
        onChange={() => onChange(name, value)}
        checked={selectedFilters[name] === value} // Marca o botão se o valor corresponder ao estado
      />
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
  return horas * 60 + minutos + Math.round(segundos / 60);
}
