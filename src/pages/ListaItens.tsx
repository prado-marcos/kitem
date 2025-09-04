import { useState, useEffect } from 'react';
import { CircularProgress, Button, TextField, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Snackbar, Alert } from '@mui/material';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import { Plus, Minus, Trash2, Edit, List } from 'lucide-react';
import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';
import { selectStyles } from '../components/SelectStyles';
import { UNIDADES_MEDIDA_OPTIONS } from '../constants/units';

interface Item {
  id: number;
  nome: string;
  id_receita: number;
  quantidade: number;
  unidade_medida: string;
  receita?: string;
  usuario: number;
  preco?: number;
  id_ingrediente: number;
  id_lista: number;
}

interface Ingrediente {
  id: number;
  nome: string;
}

interface ItemFormData {
  nome: string;
  quantidade: number | string;
  unidade_medida: string;
}

export default function ListaItens() {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [ingredientes, setIngredientes] = useState<Ingrediente[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingIngredientes, setLoadingIngredientes] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [formData, setFormData] = useState<ItemFormData>({
    nome: '',
    quantidade: '',
    unidade_medida: 'UN'
  });

  // Snackbar states
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error" | "warning">("success");
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [isEditingItem, setIsEditingItem] = useState(false);
  const [showClearConfirmDialog, setShowClearConfirmDialog] = useState(false);
  const [isClearingList, setIsClearingList] = useState(false);

  // Usando constantes compartilhadas para unidades de medida

  // Estrutura da lista de itens:
  // - Cada usuário possui apenas UMA lista de itens (tabela: lista-itens)
  // - Os itens são armazenados na tabela lista-itens-ingredientes
  // - A função buscarOuCriarListaUsuario garante que cada usuário tenha sua lista

  useEffect(() => {
    if (isAuthenticated) {
      carregarItens();
      carregarIngredientes();
    }
  }, [isAuthenticated]);

  // Função auxiliar para buscar ou criar a lista de itens do usuário
  async function buscarOuCriarListaUsuario(userId: string) {
    try {
      // Buscar lista existente do usuário
      const listasResponse = await api.get('/listas-itens/');
      const userLista = listasResponse.data.find((lista: any) => lista.id_usuario === parseInt(userId));
      
      if (userLista) {
        return userLista;
      } else {
        // Criar nova lista de itens para o usuário
        const novaListaResponse = await api.post('/listas-itens/', {
          id_usuario: parseInt(userId)
        });
        return novaListaResponse.data;
      }
    } catch (error) {
      console.error('Erro ao buscar/criar lista de itens:', error);
      throw error;
    }
  }

  // Função auxiliar para buscar o nome do ingrediente pelo endpoint individual
  async function buscarNomeIngrediente(idIngrediente: number): Promise<string> {
    try {
      const response = await api.get(`/ingredientes/${idIngrediente}/`);
      return response.data.nome || 'Ingrediente não encontrado';
    } catch (error) {
      console.error(`Erro ao buscar ingrediente ${idIngrediente}:`, error);
      return 'Ingrediente não encontrado';
    }
  }

  async function carregarItens() {
    try {
      setLoading(true);
      const userId = localStorage.getItem("userId");
      if (userId) {
        // Primeiro, garantir que o usuário tenha uma lista
        const listaUsuario = await buscarOuCriarListaUsuario(userId);
        
        // Buscar itens da lista específica do usuário
        const response = await api.get(`/lista-itens-ingredientes/`);
        const userItems = response.data.filter((item: any) => 
          item.id_lista === listaUsuario.id
        );
        
        // Buscar o nome de cada ingrediente individualmente
        const itemsComNomes = await Promise.all(
          userItems.map(async (item: any) => {
            let nomeIngrediente = 'Ingrediente não encontrado';
            
            // Se id_ingrediente for um número, buscar pelo endpoint individual
            if (item.id_ingrediente && typeof item.id_ingrediente === 'number') {
              nomeIngrediente = await buscarNomeIngrediente(item.id_ingrediente);
            }
            // Se houver nome direto no item
            else if (item.nome) {
              nomeIngrediente = item.nome;
            }
            
            return {
              id: item.id,
              nome: nomeIngrediente,
              id_receita: item.id_receita,
              quantidade: item.quantidade,
              unidade_medida: item.unidade_medida,
              usuario: parseInt(userId),
              preco: item.preco,
              id_ingrediente: item.id_ingrediente,
              id_lista: item.id_lista
            };
          })
        );
        setItems(itemsComNomes);
      }
    } catch (error) {
      console.error('Erro ao carregar itens:', error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  async function carregarIngredientes() {
    try {
      setLoadingIngredientes(true);
      const response = await api.get('/ingredientes/');
      setIngredientes(response.data);
    } catch (error) {
      console.error('Erro ao carregar ingredientes:', error);
      setIngredientes([]);
    } finally {
      setLoadingIngredientes(false);
    }
  }

  async function adicionarItem() {
    try {
      setIsAddingItem(true);
      const userId = localStorage.getItem("userId");
      if (!userId) return;

      // Validar quantidade
      if (formData.quantidade === '' || formData.quantidade === 0 || formData.quantidade === '0') {
        setSnackbarMessage("A quantidade deve ser maior que zero!");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
        return;
      }

      // Buscar ou criar a lista de itens do usuário
      const listaItens = await buscarOuCriarListaUsuario(userId);

      // Buscar ou criar o ingrediente
      let ingrediente;
      try {
        const ingredientesResponse = await api.get('/ingredientes/');
        const ingredienteExistente = ingredientesResponse.data.find((ing: any) => 
          ing.nome.toLowerCase() === formData.nome.toLowerCase()
        );
        
        if (ingredienteExistente) {
          ingrediente = ingredienteExistente;
        } else {
          const novoIngredienteResponse = await api.post('/ingredientes/', {
            nome: formData.nome
          });
          ingrediente = novoIngredienteResponse.data;
        }
      } catch (error) {
        console.error('Erro ao buscar/criar ingrediente:', error);
        return;
      }

      // Verificar se o item já existe na lista
      const itemExistente = items.find(item => 
        item.id_ingrediente === ingrediente.id
      );

      if (itemExistente) {
        setSnackbarMessage("Este item já está na sua lista!");
        setSnackbarSeverity("warning");
        setSnackbarOpen(true);
        return;
      }

      // Adicionar item à lista na tabela lista-itens-ingredientes
      try {
        await api.post('/lista-itens-ingredientes/', {
          id_ingrediente: ingrediente.id,
          id_lista: listaItens.id,
          quantidade: formData.quantidade,
          unidade_medida: formData.unidade_medida
        });

        // Recarregar itens e ingredientes
        await carregarItens();
        await carregarIngredientes();
        
        // Limpar formulário
        setFormData({
          nome: '',
          quantidade: '',
          unidade_medida: 'UN'
        });
        setShowAddDialog(false);

        // Sucesso: abre Snackbar
        setSnackbarMessage("Item adicionado com sucesso!");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
      } catch (apiError: any) {
        // Tratar erro específico de item duplicado
        if (apiError.response?.data?.non_field_errors && 
            apiError.response.data.non_field_errors.some((error: string) => 
              error.includes("must make a unique set")
            )) {
          setSnackbarMessage("Este item já está na sua lista!");
          setSnackbarSeverity("warning");
          setSnackbarOpen(true);
        } else {
          throw apiError; // Re-lançar outros erros para tratamento genérico
        }
      }
      
    } catch (error) {
      console.error('Erro ao adicionar item:', error);
      setSnackbarMessage("Erro ao adicionar item à lista");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setIsAddingItem(false);
    }
  }

  async function editarItem() {
    try {
      setIsEditingItem(true);

      if (!editingItem) {
        return;
      }

      // Validar quantidade
      if (editingItem.quantidade === 0 || editingItem.quantidade < 0.1) {
        setSnackbarMessage("A quantidade deve ser maior que zero!");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
        return;
      }
      const listaUsuario = await buscarOuCriarListaUsuario(editingItem.usuario.toString());

      await api.put(`/lista-itens-ingredientes/${editingItem.id}/`, {
        quantidade: editingItem.quantidade,
        unidade_medida: editingItem.unidade_medida,
        id_ingrediente: editingItem.id_ingrediente,
        id_lista: listaUsuario.id
      });

      await carregarItens();
      setEditingItem(null);
      
    } catch (error) {
      console.error('Erro ao editar item:', error);
      setSnackbarMessage("Erro ao editar item");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setIsEditingItem(false);
    }
  }

  async function excluirItem(id: number) {
    try {
      await api.delete(`/lista-itens-ingredientes/${id}/`);
      
      // Remove o item diretamente do estado local
      setItems(prevItems => prevItems.filter(item => item.id !== id));
      
      // Mostra mensagem de sucesso
      setSnackbarMessage("Item removido com sucesso!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Erro ao excluir item:', error);
      setSnackbarMessage("Erro ao excluir item");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  }

  function abrirDialogoEdicao(item: Item) {
    setEditingItem({ ...item });
  }

  function fecharDialogoEdicao() {
    setEditingItem(null);
  }

  function handleCloseSnackbar() {
    setSnackbarOpen(false);
  }

  function abrirDialogoAdicao() {
    // Limpar formulário ao abrir o modal
    setFormData({
      nome: '',
      quantidade: '',
      unidade_medida: 'UN'
    });
    setShowAddDialog(true);
  }

  function atualizarQuantidade(item: Item, incremento: boolean) {
    if (editingItem && editingItem.id === item.id) {
      const novaQuantidade = incremento ? item.quantidade + 0.1 : Math.max(0, item.quantidade - 0.1);
      setEditingItem({ ...editingItem, quantidade: parseFloat(novaQuantidade.toFixed(1)) });
    }
  }

  async function esvaziarLista() {
    try {
      setIsClearingList(true);
      const userId = localStorage.getItem("userId");
      if (!userId) return;

      // Buscar a lista do usuário
      const listaUsuario = await buscarOuCriarListaUsuario(userId);
      
      // Buscar todos os itens da lista do usuário
      const response = await api.get('/lista-itens-ingredientes/');
      const userItems = response.data.filter((item: any) => 
        item.id_lista === listaUsuario.id
      );

      // Deletar todos os itens da lista
      for (const item of userItems) {
        await api.delete(`/lista-itens-ingredientes/${item.id}/`);
      }

      // Atualizar a lista local
      setItems([]);
      
      // Fechar dialog de confirmação
      setShowClearConfirmDialog(false);
      
      // Mostrar mensagem de sucesso
      setSnackbarMessage("Lista de itens esvaziada com sucesso!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      
    } catch (error) {
      console.error('Erro ao esvaziar lista:', error);
      setSnackbarMessage("Erro ao esvaziar lista de itens");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setIsClearingList(false);
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Acesso Negado
        </h1>
        <p className="text-gray-600">
          Você precisa estar logado para acessar esta página.
        </p>
      </div>
    );
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
          Carregando lista de itens...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col my-12 mx-80 gap-5">
      <div className="flex flex-row justify-between items-center">
        <div className="flex items-center gap-3">
          <List className="h-8 w-8" style={{ color: "#9e000e" }} />
          <h1 className="text-4xl font-bold mb-2" style={{ color: "#9e000e" }}>
            Lista de Itens
          </h1>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outlined"
            startIcon={<Trash2 />}
            onClick={() => setShowClearConfirmDialog(true)}
            disabled={items.length === 0}
            sx={{
              color: "#9e000e",
              borderColor: "#9e000e",
              "&:hover": { 
                backgroundColor: "#fef2f2",
                borderColor: "#7c000b"
              },
              "&:disabled": {
                color: "#9ca3af",
                borderColor: "#e5e7eb"
              },
              borderRadius: "8px",
              px: 3,
              py: 1.5
            }}
          >
            Esvaziar Lista
          </Button>
          <Button
            variant="contained"
            startIcon={<Plus />}
            onClick={abrirDialogoAdicao}
            sx={{
              backgroundColor: "#9e000e",
              "&:hover": { backgroundColor: "#7c000b" },
              borderRadius: "8px",
              px: 3,
              py: 1.5
            }}
          >
            Adicionar Item
          </Button>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <List className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 text-lg">
            Sua lista de itens está vazia. Adicione ingredientes de receitas ou itens manuais para começar!
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Item
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantidade
                  </th>
                  
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {item.nome}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {item.quantidade} {item.unidade_medida}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <IconButton
                          size="small"
                          onClick={() => abrirDialogoEdicao(item)}
                          sx={{ color: "#9e000e" }}
                        >
                          <Edit className="h-4 w-4" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => excluirItem(item.id)}
                          sx={{ color: "#dc2626" }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </IconButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Dialog para adicionar item */}
      <Dialog open={showAddDialog} onClose={() => setShowAddDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle style={{ color: "#9e000e" }}>
          Adicionar Item à Lista
        </DialogTitle>
        <DialogContent>
          <div className="space-y-4 pt-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome do Item
              </label>
              <CreatableSelect
                options={ingredientes
                  .filter((ing, index, self) => 
                    index === self.findIndex(i => i.nome.toLowerCase() === ing.nome.toLowerCase())
                  )
                  .map(ing => ({ value: ing.nome, label: ing.nome }))}
                value={formData.nome ? { value: formData.nome, label: formData.nome } : null}
                onChange={(option) => setFormData({ ...formData, nome: option?.value || '' })}
                placeholder="Digite ou selecione um ingrediente..."
                isSearchable
                isClearable
                isDisabled={isAddingItem}
                noOptionsMessage={() => "Nenhum ingrediente encontrado"}
                loadingMessage={() => "Carregando..."}
                isLoading={loadingIngredientes}
                menuPortalTarget={document.body}
                styles={selectStyles}
                formatCreateLabel={(inputValue: string) => `Criar "${inputValue}"`}
                onCreateOption={(inputValue: string) => {
                  setFormData({ ...formData, nome: inputValue });
                }}
                createOptionPosition="first"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantidade
                </label>
                <TextField
                  type="number"
                  value={formData.quantidade}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value);
                    if (e.target.value === '') {
                      setFormData({ ...formData, quantidade: '' });
                    } else if (!isNaN(value) && value >= 0) {
                      setFormData({ ...formData, quantidade: value });
                    }
                  }}
                  fullWidth
                  size="small"
                  disabled={isAddingItem}
                  inputProps={{ step: "0.1", min: "0" }}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unidade de Medida
                </label>
                <Select
                  options={UNIDADES_MEDIDA_OPTIONS}
                  value={{ value: formData.unidade_medida, label: formData.unidade_medida }}
                  onChange={(option) => setFormData({ ...formData, unidade_medida: option?.value || 'UN' })}
                  placeholder="Selecione..."
                  isSearchable
                  isDisabled={isAddingItem}
                  menuPortalTarget={document.body}
                  styles={selectStyles}
                />
              </div>
            </div>
          </div>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2, gap: 2 }}>
          <Button 
            onClick={() => setShowAddDialog(false)}
            disabled={isAddingItem}
            variant="outlined"
            sx={{
              color: "#6b7280",
              borderColor: "#d1d5db",
              "&:hover": { 
                backgroundColor: isAddingItem ? "#f9fafb" : "#f9fafb",
                borderColor: isAddingItem ? "#d1d5db" : "#9ca3af"
              },
              "&:disabled": {
                color: "#9ca3af",
                borderColor: "#e5e7eb"
              },
              textTransform: "none",
              fontSize: "16px",
              fontWeight: "500",
              px: 4,
              py: 1.5,
              borderRadius: "8px",
              minWidth: "120px",
              opacity: isAddingItem ? 0.6 : 1
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={adicionarItem}
            disabled={!formData.nome.trim() || isAddingItem || formData.quantidade === '' || formData.quantidade === 0 || formData.quantidade === '0'}
            variant="contained"
            startIcon={isAddingItem ? <CircularProgress size={16} color="inherit" /> : null}
            sx={{
              backgroundColor: "#9e000e",
              "&:hover": { 
                backgroundColor: isAddingItem ? "#9e000e" : "#7c000b",
                boxShadow: isAddingItem ? "0 2px 8px 0 rgba(158, 0, 14, 0.2)" : "0 4px 14px 0 rgba(158, 0, 14, 0.3)"
              },
              "&:disabled": {
                backgroundColor: "#d1d5db",
                color: "#9ca3af"
              },
              color: "white",
              textTransform: "none",
              fontSize: "16px",
              fontWeight: "600",
              px: 4,
              py: 1.5,
              borderRadius: "8px",
              minWidth: "120px",
              boxShadow: "0 2px 8px 0 rgba(158, 0, 14, 0.2)",
              transition: "all 0.2s ease-in-out",
              opacity: isAddingItem ? 0.8 : 1
            }}
          >
            {isAddingItem ? "Adicionando..." : "Adicionar"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog para editar item */}
      <Dialog open={!!editingItem} onClose={fecharDialogoEdicao} maxWidth="sm" fullWidth>
        <DialogTitle style={{ color: "#9e000e" }}>
          Editar Item
        </DialogTitle>
        <DialogContent>
          <div className="space-y-4 pt-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome do Item
              </label>
              <TextField
                value={editingItem?.nome || ''}
                disabled
                fullWidth
                size="small"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantidade
                </label>
                <div className="flex items-center gap-2">
                  <IconButton
                    size="small"
                    onClick={() => editingItem && atualizarQuantidade(editingItem, false)}
                    sx={{ color: "#9e000e" }}
                  >
                    <Minus className="h-4 w-4" />
                  </IconButton>
                  
                  <TextField
                    type="number"
                    value={editingItem?.quantidade || 0}
                    onChange={(e) => {
                      if (editingItem) {
                        const value = parseFloat(e.target.value);
                        if (e.target.value === '') {
                          setEditingItem({ ...editingItem, quantidade: 0 });
                        } else if (!isNaN(value) && value >= 0) {
                          setEditingItem({ ...editingItem, quantidade: value });
                        }
                      }
                    }}
                    size="small"
                    sx={{ width: '80px' }}
                    inputProps={{ step: "0.1", min: "0" }}
                  />
                  
                  <IconButton
                    size="small"
                    onClick={() => editingItem && atualizarQuantidade(editingItem, true)}
                    sx={{ color: "#9e000e" }}
                  >
                    <Plus className="h-4 w-4" />
                  </IconButton>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unidade de Medida
                </label>
                <Select
                  options={UNIDADES_MEDIDA_OPTIONS}
                  value={{ value: editingItem?.unidade_medida || 'UN', label: editingItem?.unidade_medida || 'UN' }}
                  onChange={(option) => editingItem && setEditingItem({ 
                    ...editingItem, 
                    unidade_medida: option?.value || 'UN' 
                  })}
                  placeholder="Selecione..."
                  isSearchable
                  menuPortalTarget={document.body}
                  styles={selectStyles}
                />
              </div>
            </div>
          </div>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2, gap: 2 }}>
                     <Button 
             onClick={fecharDialogoEdicao}
             disabled={isEditingItem}
             variant="outlined"
             sx={{
               color: "#6b7280",
               borderColor: "#d1d5db",
               "&:hover": { 
                 backgroundColor: isEditingItem ? "#f9fafb" : "#f9fafb",
                 borderColor: isEditingItem ? "#d1d5db" : "#9ca3af"
               },
               "&:disabled": {
                 color: "#9ca3af",
                 borderColor: "#e5e7eb"
               },
               textTransform: "none",
               fontSize: "16px",
               fontWeight: "500",
               px: 4,
               py: 1.5,
               borderRadius: "8px",
               minWidth: "120px",
               opacity: isEditingItem ? 0.6 : 1
             }}
           >
             Cancelar
           </Button>
                     <Button
             onClick={editarItem}
             disabled={isEditingItem || !editingItem || editingItem.quantidade === 0 || editingItem.quantidade < 0.1}
             variant="contained"
             startIcon={isEditingItem ? <CircularProgress size={16} color="inherit" /> : null}
             sx={{
               backgroundColor: "#9e000e",
               "&:hover": { 
                 backgroundColor: isEditingItem ? "#9e000e" : "#7c000b",
                 boxShadow: isEditingItem ? "0 2px 8px 0 rgba(158, 0, 14, 0.2)" : "0 4px 14px 0 rgba(158, 0, 14, 0.3)"
               },
               "&:disabled": {
                 backgroundColor: "#d1d5db",
                 color: "#9ca3af"
               },
               color: "white",
               textTransform: "none",
               fontSize: "16px",
               fontWeight: "600",
               px: 4,
               py: 1.5,
               borderRadius: "8px",
               minWidth: "120px",
               boxShadow: "0 2px 8px 0 rgba(158, 0, 14, 0.2)",
               transition: "all 0.2s ease-in-out",
               opacity: isEditingItem ? 0.8 : 1
             }}
           >
             {isEditingItem ? "Salvando..." : "Salvar"}
           </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de confirmação para esvaziar lista */}
      <Dialog open={showClearConfirmDialog} onClose={() => setShowClearConfirmDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle style={{ color: "#9e000e", textAlign: "center" }}>
          Esvaziar a Lista de Itens?
        </DialogTitle>
        <DialogContent>
          <div className="pt-2 text-center">
            <p className="text-gray-700">
              Tem certeza que deseja esvaziar toda a lista de itens? Esta ação não pode ser desfeita.
            </p>
            <p className="text-sm text-gray-500 mt-2">
              {items.length} item(s) será(ão) removido(s) e a lista será esvaziada.
            </p>
          </div>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2, gap: 2 }}>
          <Button 
            onClick={() => setShowClearConfirmDialog(false)}
            disabled={isClearingList}
            variant="outlined"
            sx={{
              color: "#6b7280",
              borderColor: "#d1d5db",
              "&:hover": { 
                backgroundColor: isClearingList ? "#f9fafb" : "#f9fafb",
                borderColor: isClearingList ? "#d1d5db" : "#9ca3af"
              },
              "&:disabled": {
                color: "#9ca3af",
                borderColor: "#e5e7eb"
              },
              textTransform: "none",
              fontSize: "16px",
              fontWeight: "500",
              px: 4,
              py: 1.5,
              borderRadius: "8px",
              minWidth: "120px",
              opacity: isClearingList ? 0.6 : 1
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={esvaziarLista}
            disabled={isClearingList}
            variant="contained"
            startIcon={isClearingList ? <CircularProgress size={16} color="inherit" /> : null}
            sx={{
              backgroundColor: "#9e000e",
              "&:hover": { 
                backgroundColor: isClearingList ? "#9e000e" : "#7c000b",
                boxShadow: isClearingList ? "0 2px 8px 0 rgba(158, 0, 14, 0.2)" : "0 4px 14px 0 rgba(158, 0, 14, 0.3)"
              },
              "&:disabled": {
                backgroundColor: "#d1d5db",
                color: "#9ca3af"
              },
              color: "white",
              textTransform: "none",
              fontSize: "16px",
              fontWeight: "600",
              px: 4,
              py: 1.5,
              borderRadius: "8px",
              minWidth: "120px",
              boxShadow: "0 2px 8px 0 rgba(158, 0, 14, 0.2)",
              transition: "all 0.2s ease-in-out",
              opacity: isClearingList ? 0.8 : 1
            }}
          >
            {isClearingList ? "Esvaziando..." : "Esvaziar Lista"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar para notificações */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
}




