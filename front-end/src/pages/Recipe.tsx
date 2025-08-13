// Receita.tsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Heart, Share2, ListPlus, X, Plus, Minus, Trash2 } from "lucide-react";
import api from "../services/api";
import { useAuth } from "../hooks/useAuth";
import { CircularProgress } from "@mui/material";

interface IngredienteRecipeProps {
  quantity: number;
  ingredient: string;
  unitMeasure: string;
}

interface IngredienteModalProps {
  id: number;
  nome_ingrediente: string;
  quantidade: number;
  unidade_medida: string;
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
  const { isAuthenticated } = useAuth();
  const [recipe, setRecipe] = useState<RecipeProps | null>(null);
  const [isFavorite, setFavorite] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [ingredientesModal, setIngredientesModal] = useState<IngredienteModalProps[]>([]);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const navigate = useNavigate();

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

  function prepareIngredientesModal() {
    if (!recipe) return;
    
    const ingredientes = recipe.ingredientRecipe.map((ingredient, index) => ({
      id: index,
      nome_ingrediente: ingredient.ingredient,
      quantidade: ingredient.quantity,
      unidade_medida: ingredient.unitMeasure,
    }));
    
    setIngredientesModal(ingredientes);
  }

  function handleFavorite() {
    setFavorite(!isFavorite);
  }
  
  function openModalItemList() {
    setShowModal(true);
    prepareIngredientesModal();
  }

  function closeModal() {
    setShowModal(false);
    setIngredientesModal([]);
  }

  function updateQuantidade(index: number, increment: boolean) {
    console.log('updateQuantidade chamada:', { index, increment });
    setIngredientesModal(prev => {
      console.log('Estado anterior:', prev);
      const newState = prev.map((item, i) => {
        if (i === index) {
          const newQuantity = increment ? item.quantidade + 1 : Math.max(1, item.quantidade - 1);
          console.log('Atualizando quantidade:', { item: item.nome_ingrediente, quantidade: item.quantidade, novaQuantidade: newQuantity });
          return { ...item, quantidade: newQuantity };
        }
        return item;
      });
      console.log('Novo estado:', newState);
      return newState;
    });
  }

  function updateQuantidadeManual(index: number, novaQuantidade: string) {
    const quantidade = parseInt(novaQuantidade) || 1;
    setIngredientesModal(prev => prev.map((item, i) => {
      if (i === index) {
        return { ...item, quantidade: Math.max(1, quantidade) };
      }
      return item;
    }));
  }

  function excluirItem(index: number) {
    setIngredientesModal(prev => prev.filter((_, i) => i !== index));
  }

  async function adicionarALista() {
    // Verifica se o usuário está logado
    if (!isAuthenticated) {
      setShowLoginPopup(true);
      return;
    }

    try {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        alert("Usuário não autenticado");
        return;
      }

      // Verificar se já existe uma lista de compras para o usuário
      let listaCompras;
      try {
        const listasResponse = await api.get('/listas_compras/');
        const userLista = listasResponse.data.find((lista: any) => lista.id_usuario === parseInt(userId));
        
        if (userLista) {
          listaCompras = userLista;
        } else {
          // Criar nova lista de compras
          const novaListaResponse = await api.post('/listas_compras/', {
            id_usuario: parseInt(userId)
          });
          listaCompras = novaListaResponse.data;
        }
      } catch (error) {
        console.error('Erro ao verificar/criar lista de compras:', error);
        alert('Erro ao acessar lista de compras');
        return;
      }

      // Adicionar cada ingrediente à lista de compras
      for (const ingrediente of ingredientesModal) {
        try {
          // Buscar ou criar o ingrediente
          let ingredienteExistente;
          try {
            const ingredientesResponse = await api.get('/ingredientes/');
            ingredienteExistente = ingredientesResponse.data.find((ing: any) => 
              ing.nome.toLowerCase() === ingrediente.nome_ingrediente.toLowerCase()
            );
            
            if (!ingredienteExistente) {
              const novoIngredienteResponse = await api.post('/ingredientes/', {
                nome: ingrediente.nome_ingrediente
              });
              ingredienteExistente = novoIngredienteResponse.data;
            }
          } catch (error) {
            console.error('Erro ao buscar/criar ingrediente:', error);
            continue;
          }

          // Adicionar à lista de compras
          await api.post('/listas_compras_ingredientes/', {
            id_ingrediente: ingredienteExistente.id,
            id_lista: listaCompras.id,
            quantidade: ingrediente.quantidade,
            unidade_medida: ingrediente.unidade_medida
          });
        } catch (error) {
          console.error(`Erro ao adicionar ingrediente ${ingrediente.nome_ingrediente}:`, error);
        }
      }
      
      alert("Ingredientes adicionados à lista de compras com sucesso!");
      closeModal();
      
      // Redireciona para a página de Lista de Itens
      navigate("/lista-itens");
    } catch (error) {
      console.error("Erro ao adicionar à lista:", error);
      alert("Erro ao adicionar ingredientes à lista de compras");
    }
  }

  function closeLoginPopup() {
    setShowLoginPopup(false);
  }

  function goToLogin() {
    setShowLoginPopup(false);
    closeModal();
    navigate("/login");
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
           <button 
             onClick={openModalItemList}
             title="Adicionar ingredientes à lista de itens"
             className="hover:bg-gray-100 p-1 rounded transition-colors cursor-pointer"
           >
             <ListPlus className="h-6 w-6 my-2" />
           </button>
           <button 
             title="Compartilhar receita"
             className="hover:bg-gray-100 p-1 rounded transition-colors cursor-pointer"
           >
             <Share2 className="h-6 w-6 my-2" />
           </button>
           <button 
             onClick={handleFavorite}
             title={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
             className="hover:bg-gray-100 p-1 rounded transition-colors cursor-pointer"
           >
             {isFavorite ? (
               <Heart className="fill-red-500 h-6 w-6 my-2" />
             ) : (
               <Heart className="fill-white h-6 w-6 my-2" />
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
      
             {/* Modal de Ingredientes */}
       <div className={`fixed inset-0 z-50 transition-all duration-150 ease-out ${
         showModal 
           ? 'opacity-100 pointer-events-auto' 
           : 'opacity-0 pointer-events-none'
       }`}>
                   <div className={`fixed inset-0 transition-all duration-150 ease-out ${
            showModal ? 'bg-opacity-10 backdrop-blur-sm' : 'bg-opacity-50 backdrop-blur-none'
          }`} onClick={closeModal}></div>
         <div className={`fixed inset-0 flex items-center justify-center transition-all duration-200 ease-out ${
           showModal ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-4'
         }`}>
           <div className="bg-white/99 backdrop-blur-md rounded-lg p-6 w-[600px] max-h-[80vh] overflow-y-auto shadow-2xl border border-gray-200/50 transform transition-all duration-200 ease-out">
            {/* Header do Modal */} 
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold" style={{ color: "#9e000e" }}>
                Ingredientes da Receita
              </h2>
                             <button
                 onClick={closeModal}
                 className="text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
               >
                 <X className="h-6 w-6" />
               </button>
            </div>

            {/* Lista de Ingredientes */}
            <div className="space-y-3 mb-6">
                             {/* Cabeçalho das Colunas */}
               <div className="grid grid-cols-12 gap-4 items-center p-3 border-b border-gray-300 bg-gray-100 rounded-t-lg">
                 <div className="col-span-6">
                   <p className="font-semibold text-gray-700 text-sm">Ingrediente</p>
                 </div>
                 <div className="col-span-4 text-center">
                   <p className="font-semibold text-gray-700 text-sm">Quantidade & Medida</p>
                 </div>
                 <div className="col-span-2 text-center">
                   <p className="font-semibold text-gray-700 text-sm">Excluir</p>
                 </div>
               </div>
              
              {ingredientesModal.map((ingrediente, index) => (
                                     <div
                     key={ingrediente.id}
                     className="grid grid-cols-12 gap-4 items-center p-4 border border-gray-200 rounded-lg bg-gray-50"
                   >
                     {/* Nome do Ingrediente - Ocupa 6 colunas */}
                     <div className="col-span-6">
                       <p className="font-medium text-gray-800 text-sm">
                         {ingrediente.nome_ingrediente}
                       </p>
                     </div>
                     
                     {/* Controles de Quantidade - Ocupam 4 colunas */}
                     <div className="col-span-4 flex items-center justify-center space-x-2">
                       <button
                         onClick={() => updateQuantidade(index, false)}
                         className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-100 ease-out flex-shrink-0 cursor-pointer hover:scale-105 active:scale-95"
                         style={{
                           backgroundColor: "#9e000e",
                           color: "white"
                         }}
                         onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#7c000b")}
                         onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#9e000e")}
                       >
                         <Minus className="h-4 w-4" />
                       </button>
                       
                                               <div className="flex items-center space-x-1 flex-shrink-0">
                          <input
                            type="number"
                            min="1"
                            value={ingrediente.quantidade}
                            onChange={(e) => updateQuantidadeManual(index, e.target.value)}
                            className="w-16 text-center font-semibold text-gray-700 border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          />
                          <span className="w-20 text-center text-sm text-gray-600 font-medium truncate">
                            {ingrediente.unidade_medida}
                          </span>
                        </div>
                       
                       <button
                         onClick={() => updateQuantidade(index, true)}
                         className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-100 ease-out flex-shrink-0 cursor-pointer hover:scale-105 active:scale-95"
                         style={{
                           backgroundColor: "#9e000e",
                           color: "white"
                         }}
                         onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#7c000b")}
                         onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#9e000e")}
                         >
                         <Plus className="h-4 w-4" />
                       </button>
                     </div>

                     {/* Botão Excluir - Ocupa 2 colunas */}
                     <div className="col-span-2 flex justify-end">
                       <button
                         onClick={() => excluirItem(index)}
                         className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-100 ease-out hover:scale-105 active:scale-95 flex-shrink-0 cursor-pointer"
                         style={{
                           backgroundColor: "#dc2626",
                           color: "white"
                         }}
                         onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#b91c1c")}
                         onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#dc2626")}
                         title="Excluir ingrediente"
                       >
                         <Trash2 className="h-4 w-4" />
                       </button>
                     </div>
                   </div>
                ))}
              </div>
            

                         {/* Botão Adicionar */}
             <div className="flex justify-end">
               <button
                 onClick={adicionarALista}
                 disabled={ingredientesModal.length === 0}
                 className="px-6 py-2 text-white font-semibold rounded-md shadow-md transition-all duration-150 ease-out transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                 style={{
                   backgroundColor: "#9e000e",
                   boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)"
                 }}
                 onMouseOver={(e) => {
                   if (!e.currentTarget.disabled) {
                     e.currentTarget.style.backgroundColor = "#7c000b";
                   }
                 }}
                 onMouseOut={(e) => {
                   if (!e.currentTarget.disabled) {
                     e.currentTarget.style.backgroundColor = "#9e000e";
                   }
                 }}
               >
                 Adicionar
               </button>
             </div>
           </div>
         </div>
       </div>

      {/* Popup de Login */}
      {showLoginPopup && (
        <div className="fixed inset-0 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-4" style={{ color: "#9e000e" }}>
                Função Restrita
              </h3>
              <p className="text-gray-600 mb-6">
                Esta função é apenas para usuários cadastrados. Faça login para continuar.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={closeLoginPopup}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={goToLogin}
                  className="px-4 py-2 text-white font-semibold rounded-md transition-colors"
                  style={{ backgroundColor: "#9e000e" }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = "#7c000b";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = "#9e000e";
                  }}
                >
                  Fazer Login
                </button>
              </div>
            </div>
          </div>
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
  const totalMinutos = horas * 60 + minutos + Math.round(segundos / 60);
  return totalMinutos;
}
