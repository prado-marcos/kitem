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

import Select, {
  MultiValue,
  components,
  ValueContainerProps,
  GroupBase,
} from "react-select";

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
  rating: number;
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

  const [ingredients, setIngredients] = useState<
    MultiValue<{ value: string; label: string }>
  >([]);
  const [selectedIngredients, setSelectedIngredients] = useState<
    MultiValue<{ value: string; label: string }>
  >([]);
  const [isMultiSelectOpen, setIsMultiSelectOpen] = useState(false);
  const [searchInputValue, setSearchInputValue] = useState("");
  const [isMultiSelectFocused, setIsMultiSelectFocused] = useState(false);
  const [isSearchInputFocused, setIsSearchInputFocused] = useState(false);

  // Componente personalizado para exibir os valores selecionados
  const CustomValueContainer = <OptionType, IsMulti extends boolean = true>(
    props: ValueContainerProps<OptionType, IsMulti, GroupBase<OptionType>>
  ) => {
    const selected = props.getValue();

    // Se não há ingredientes selecionados, mostra o placeholder
    if (!selected || selected.length === 0) {
      return (
        <components.ValueContainer {...props}>
          {props.children}
        </components.ValueContainer>
      );
    }

         // Se há múltiplos ingredientes, mostra "X itens selecionados"
     return (
       <components.ValueContainer {...props}>
         <span style={{ 
           fontSize: '14px', 
           color: '#333', 
           fontWeight: '400',
           whiteSpace: 'nowrap',
           overflow: 'hidden',
           textOverflow: 'ellipsis',
           maxWidth: '100%'
         }}>
           {`${selected.length} itens selecionados`}
         </span>
       </components.ValueContainer>
     );
  };

  useEffect(() => {
    async function fetchRecipes() {
      try {
        console.log("Fazendo chamada para /receitas...");
        const response = await api.get("/receitas");
        console.log("Resposta da API:", response.data);
        const formattedRecipes = response.data.map((recipe: any) => ({
          id: recipe.id,
          title: recipe.titulo,
          imageUrl: recipe?.imagem || altImage,
          time: converterHoraParaMinutos(recipe.tempo_preparo),
          viewCount: recipe.quantidade_visualizacao,
          difficulty: recipe.dificuldade,
          rating: recipe.rating || 0,
        }));
        console.log("Receitas formatadas:", formattedRecipes);
        setRecipes(formattedRecipes);
      } catch (error: any) {
        console.error("Erro ao buscar receitas:", error);
        console.error("Detalhes do erro:", error.response?.data);
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
        console.log("Fazendo chamada para /ingredientes...");
        const response = await api.get("/ingredientes"); // Endpoint para buscar ingredientes
        console.log("Resposta de ingredientes:", response.data);
        const formattedIngredients = response.data.map((ingredient: any) => ({
          value: ingredient.nome,
          label: ingredient.nome,
        }));
        console.log("Ingredientes formatados:", formattedIngredients);
        setIngredients(formattedIngredients);
      } catch (error: any) {
        console.error("Erro ao buscar ingredientes:", error);
        console.error("Detalhes do erro:", error.response?.data);
      }
    }

    fetchIngredients();
  }, []);

  useEffect(() => {
    async function fetchMostAccessedRecipes() {
      try {
        const response = await api.get("/receitas/mais-acessadas/");
        const formattedRecipes = response.data.map((recipe: any) => ({
          id: recipe.id,
          title: recipe.titulo,
          imageUrl: recipe?.imagem || altImage,
          time: converterHoraParaMinutos(recipe.tempo_preparo),
          viewCount: recipe.quantidade_visualizacao,
          difficulty: recipe.dificuldade,
          rating: recipe.rating || 0,
        }));
        setRecipes(formattedRecipes);
      } catch (error) {
        console.error("Erro ao buscar receitas mais acessadas:", error);
      }
    }

    fetchMostAccessedRecipes();
  }, []);

  useEffect(() => {
    async function fetchRandomRecipes() {
      try {
        const response_random = await api.get("/receitas/aleatorias/");
        console.log("Resposta do endpoint aleatório:", response_random.data);
        const shuffledRecipes_random = response_random.data
          .sort(() => 0.5 - Math.random())
          .slice(0, 10); // Seleciona 10 receitas aleatórias
        const formattedRecipes_random = shuffledRecipes_random.map(
          (recipe: any) => ({
            id: recipe.id,
            title: recipe.titulo,
            imageUrl: recipe?.imagem || altImage,
            time: converterHoraParaMinutos(recipe.tempo_preparo),
            viewCount: recipe.quantidade_visualizacao,
            difficulty: recipe.dificuldade,
            rating: recipe.rating || 0,
          })
        );
        setRecipes_Random(formattedRecipes_random);
        console.log("Receitas aleatórias:", recipes_random);
      } catch (error) {
        console.error("Erro ao buscar receitas aleatórias:", error);
      }
    }

    fetchRandomRecipes();
  }, []);

  // Monitora quando ambos os elementos perdem o foco
  useEffect(() => {
    if (!isMultiSelectFocused && !isSearchInputFocused) {
      setIsMultiSelectOpen(false);
    }
  }, [isMultiSelectFocused, isSearchInputFocused]);

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
        params.append("tempo_preparo", converterMinutosParaHora(selectedFilters.tempo));

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
        
                 <div className="flex items-center justify-center gap-2 w-full max-w-4xl mx-auto">
                     <input
             type="text"
             placeholder="Buscar por titulo..."
             value={query}
             onChange={(e) => setQuery(e.target.value)}
             onKeyDown={(e) => {
               if (e.key === "Enter" && query.trim()) {
                 handleSearch(); // Chama a função de busca ao pressionar Enter
               }
             }}
             className="bg-white rounded-sm w-80 border border-[#d1d5db] focus:outline-none hover:border-[#960711] transition-colors duration-200 h-[35px] px-3"
           />
          
                     {/* MultiSelect com input separado */}
           <div className="flex gap-2">
                             <Select
                  isMulti
                  options={(() => {
                    const filteredIngredients = Array.from(
                      new Map(ingredients.map((item) => [item.label, item])).values()
                    ).filter((item) => 
                      item.label.toLowerCase().includes(searchInputValue.toLowerCase())
                    );
                    
                    // Separa ingredientes selecionados e não selecionados
                    const selected = filteredIngredients.filter(item => 
                      selectedIngredients.some(selected => selected.value === item.value)
                    );
                    const notSelected = filteredIngredients.filter(item => 
                      !selectedIngredients.some(selected => selected.value === item.value)
                    );
                    
                    // Cria grupos
                    const groups = [];
                    
                    if (selected.length > 0) {
                      groups.push({
                        label: "Selecionados",
                        options: selected.sort((a, b) => a.label.localeCompare(b.label))
                      });
                    }
                    
                    if (notSelected.length > 0) {
                      groups.push({
                        label: "Disponíveis",
                        options: notSelected.sort((a, b) => a.label.localeCompare(b.label))
                      });
                    }
                    
                    return groups;
                  })()}
                  placeholder={"Selecione os ingredientes..."}
                  onChange={(selected) => {
                    console.log("Ingredientes selecionados:", selected);
                    setSelectedIngredients(selected || []);
                  }}
                  onMenuOpen={() => {
                    console.log("Menu aberto!");
                    setIsMultiSelectOpen(true);
                  }}
                  className="w-80 z-50"
                  isSearchable={false}
                  closeMenuOnSelect={false}
                  hideSelectedOptions={false}
                  blurInputOnSelect={false}
                  components={{
                    Option: (props) => (
                      <components.Option {...props}>
                        <div className="flex items-center gap-2 py-1">
                          <input
                            type="checkbox"
                            checked={props.isSelected}
                            onChange={() => null}
                            className="w-4 h-4 text-[#960711] bg-gray-100 border-gray-300 rounded focus:ring-[#960711] focus:ring-2"
                          />
                          <span className="text-sm text-gray-700">{props.label}</span>
                        </div>
                      </components.Option>
                    ),
                    ValueContainer: CustomValueContainer,
                    MultiValue: (props) => (
                      <components.MultiValue {...props}>
                        <span className="text-xs text-white bg-[#960711] px-2 py-1 rounded">
                          {props.data.label}
                        </span>
                      </components.MultiValue>
                    ),
                    GroupHeading: (props) => (
                      <components.GroupHeading {...props}>
                        <div className="px-3 py-2 bg-gray-100 text-gray-700 font-semibold text-sm border-b border-gray-200">
                          {props.children}
                        </div>
                      </components.GroupHeading>
                    ),
                  }}
                  value={selectedIngredients}
                  styles={{
                    control: (base) => ({
                      ...base,
                      height: "35px",
                      minHeight: "35px",
                      maxHeight: "35px",
                      boxShadow: "none",
                      borderColor: "#d1d5db",
                      "&:hover": {
                        borderColor: "#960711",
                      },
                      "&:focus-within": {
                        borderColor: "#960711",
                        boxShadow: "none",
                      },
                    }),
                    valueContainer: (base) => ({
                      ...base,
                      padding: "2px 8px",
                      height: "31px",
                      minHeight: "31px",
                      maxHeight: "31px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "flex-start",
                      overflow: "hidden",
                      whiteSpace: "nowrap",
                      textOverflow: "ellipsis",
                    }),
                    multiValue: (base) => ({
                      ...base,
                      backgroundColor: "#960711",
                      borderRadius: "4px",
                      padding: "2px 6px",
                      margin: "1px",
                      color: "white",
                    }),
                    multiValueLabel: (base) => ({
                      ...base,
                      color: "white",
                      fontSize: "12px",
                      fontWeight: "500",
                    }),
                    multiValueRemove: (base) => ({
                      ...base,
                      color: "white",
                      ":hover": {
                        backgroundColor: "#7a0009",
                        color: "white",
                      },
                    }),
                    menu: (base) => ({
                      ...base,
                      zIndex: 999999,
                      marginTop: "5px",
                      border: "1px solid #d1d5db",
                      borderRadius: "4px",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    }),
                    option: (base, state) => ({
                      ...base,
                      backgroundColor: state.isSelected ? "#f3f4f6" : "white",
                      color: state.isSelected ? "#374151" : "#6b7280",
                      "&:hover": {
                        backgroundColor: "#f9fafb",
                      },
                    }),
                    groupHeading: (base) => ({
                      ...base,
                      backgroundColor: "#f3f4f6",
                      color: "#374151",
                      fontWeight: "600",
                      fontSize: "12px",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }),
                    indicatorSeparator: (base) => ({
                      ...base,
                      display: "none",
                    }),
                    placeholder: (base) => ({
                      ...base,
                      color: "#6b7280",
                      fontSize: "14px",
                      fontWeight: "400",
                    }),
                    singleValue: (base) => ({
                      ...base,
                      color: "#333",
                      fontSize: "14px",
                      fontWeight: "400",
                    }),
                    input: (base) => ({
                      ...base,
                      fontSize: "14px",
                      fontWeight: "400",
                      margin: "0",
                      padding: "0",
                    }),
                  }}
                />
             
             {/* Input de busca ao lado do multiselect */}
             <div className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-sm h-[35px]">
               <Search className="w-4 h-4 text-gray-400" />
               <input
                 type="text"
                 value={searchInputValue}
                 onChange={(e) => setSearchInputValue(e.target.value)}
                 placeholder="Filtrar ingredientes..."
                 className="border-none outline-none text-sm bg-transparent placeholder-gray-400 w-48"
               />
             </div>
           </div>

          <Button
            onClick={handleSearch}
            title="Buscar"
            type="button"
            sx={{
              backgroundColor:
                query.trim() ||
                selectedIngredients.length > 0 ||
                Object.values(selectedFilters).some((value) => value)
                  ? "#D9D9D9"
                  : "#f0f0f0",
              "&:hover":
                query.trim() ||
                selectedIngredients.length > 0 ||
                Object.values(selectedFilters).some((value) => value)
                  ? { backgroundColor: "#f0f0f0" }
                  : undefined,
              color:
                query.trim() ||
                selectedIngredients.length > 0 ||
                Object.values(selectedFilters).some((value) => value)
                  ? "#000000"
                  : "#a0a0a0",
            }}
            variant="contained"
            disabled={
              !query.trim() &&
              selectedIngredients.length === 0 &&
              !Object.values(selectedFilters).some((value) => value)
            }
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
        recipes={recipes
          .slice()
          .sort((a: RecipeProps, b: RecipeProps) => b.viewCount - a.viewCount)}
      />
      <RecipeCarousel
        title="Sugestões de receitas"
        subTitle="Receitas para te inspirar"
        recipes={recipes_random
          .slice()
          .sort((a: RecipeProps, b: RecipeProps) => b.viewCount - a.viewCount)}
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
      [name]: prev[name] === value ? "" : value,
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
        type="checkbox"
        name={name}
        value={value}
        className="peer hidden"
        onChange={() => onChange(name, value)}
        checked={selectedFilters[name] === value}
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

function converterMinutosParaHora(minutos: string): string {
  try {
    console.log('Convertendo minutos para hora (filtro):', minutos);
    const totalMinutos = parseInt(minutos, 10);
    
    if (isNaN(totalMinutos) || totalMinutos < 0) {
      console.warn('Minutos inválidos fornecidos (filtro):', minutos);
      return "00:00:00";
    }

    const horas = Math.floor(totalMinutos / 60);
    const minutosRestantes = totalMinutos % 60;
    
    // Formata para hh:mm:ss
    const horasFormatadas = horas.toString().padStart(2, '0');
    const minutosFormatados = minutosRestantes.toString().padStart(2, '0');
    
    const resultado = `${horasFormatadas}:${minutosFormatados}:00`;
    console.log('Resultado da conversão (filtro):', resultado);
    return resultado;
  } catch (error) {
    console.error('Erro ao converter minutos para hora (filtro):', error, 'Minutos fornecidos:', minutos);
    return "00:00:00";
  }
}
