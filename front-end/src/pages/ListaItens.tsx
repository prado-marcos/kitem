import React, { useState, useEffect } from 'react';
import { CircularProgress, Button, TextField, IconButton, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import { Plus, Minus, Trash2, Edit, List } from 'lucide-react';
import Select from 'react-select';
import { selectStyles } from '../components/SelectStyles';
import { UNIDADES_MEDIDA, UNIDADES_MEDIDA_OPTIONS } from '../constants/units';

interface Item {
  id: number;
  nome: string;
  quantidade: number;
  unidade_medida: string;
  receita?: string;
  usuario: number;
  preco?: number;
}

interface Ingrediente {
  id: number;
  nome: string;
}

interface ItemFormData {
  nome: string;
  quantidade: number;
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
    quantidade: 1,
    unidade_medida: 'un'
  });

  // Usando constantes compartilhadas para unidades de medida

  useEffect(() => {
    if (isAuthenticated) {
      carregarItens();
      carregarIngredientes();
    }
  }, [isAuthenticated]);

  async function carregarItens() {
    try {
      setLoading(true);
      const userId = localStorage.getItem("userId");
      if (userId) {
        const response = await api.get(`/lista_itens_ingredientes/`);
        // Filtrar itens do usuário atual
        const userItems = response.data.filter((item: any) => 
          item.id_lista && item.id_lista.id_usuario === parseInt(userId)
        );
        setItems(userItems.map((item: any) => ({
          id: item.id,
          nome: item.id_ingrediente.nome,
          quantidade: item.quantidade,
          unidade_medida: item.unidade_medida,
          usuario: parseInt(userId),
          preco: item.preco
        })));
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
      const userId = localStorage.getItem("userId");
      if (!userId) return;

      // Verificar se já existe uma lista de itens para o usuário
      let listaItens;
      try {
        const listasResponse = await api.get('/lista_itens/');
        const userLista = listasResponse.data.find((lista: any) => lista.id_usuario === parseInt(userId));
        
        if (userLista) {
          listaItens = userLista;
        } else {
          // Criar nova lista de itens
          const novaListaResponse = await api.post('/lista_itens/', {
            id_usuario: parseInt(userId)
          });
          listaItens = novaListaResponse.data;
        }
      } catch (error) {
        console.error('Erro ao verificar/criar lista de itens:', error);
        return;
      }

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

      // Adicionar item à lista
      await api.post('/lista_itens_ingredientes/', {
        id_ingrediente: ingrediente.id,
        id_lista: listaItens.id,
        quantidade: formData.quantidade,
        unidade_medida: formData.unidade_medida
      });

      // Recarregar itens
      await carregarItens();
      
      // Limpar formulário
      setFormData({
        nome: '',
        quantidade: 1,
        unidade_medida: 'un'
      });
      setShowAddDialog(false);
      
    } catch (error) {
      console.error('Erro ao adicionar item:', error);
      alert('Erro ao adicionar item à lista');
    }
  }

  async function editarItem() {
    try {
      if (!editingItem) return;

      await api.put(`/lista_itens_ingredientes/${editingItem.id}/`, {
        quantidade: editingItem.quantidade,
        unidade_medida: editingItem.unidade_medida
      });

      await carregarItens();
      setEditingItem(null);
      
    } catch (error) {
      console.error('Erro ao editar item:', error);
      alert('Erro ao editar item');
    }
  }

  async function excluirItem(id: number) {
    try {
      await api.delete(`/lista_itens_ingredientes/${id}/`);
      await carregarItens();
    } catch (error) {
      console.error('Erro ao excluir item:', error);
      alert('Erro ao excluir item');
    }
  }

  function abrirDialogoEdicao(item: Item) {
    setEditingItem({ ...item });
  }

  function fecharDialogoEdicao() {
    setEditingItem(null);
  }

  function atualizarQuantidade(item: Item, incremento: boolean) {
    if (editingItem && editingItem.id === item.id) {
      const novaQuantidade = incremento ? item.quantidade + 1 : Math.max(1, item.quantidade - 1);
      setEditingItem({ ...editingItem, quantidade: novaQuantidade });
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
        <Button
          variant="contained"
          startIcon={<Plus />}
          onClick={() => setShowAddDialog(true)}
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
                    Receita
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
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {item.receita || 'Item manual'}
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
              <Select
                options={ingredientes.map(ing => ({ value: ing.nome, label: ing.nome }))}
                onChange={(option) => setFormData({ ...formData, nome: option?.value || '' })}
                placeholder="Digite ou selecione um ingrediente..."
                isSearchable
                isClearable
                noOptionsMessage={() => "Nenhum ingrediente encontrado"}
                loadingMessage={() => "Carregando..."}
                isLoading={loadingIngredientes}
                menuPortalTarget={document.body}
                styles={selectStyles}
                onInputChange={(inputValue) => {
                  if (inputValue && !ingredientes.find(ing => ing.nome.toLowerCase() === inputValue.toLowerCase())) {
                    setFormData({ ...formData, nome: inputValue });
                  }
                }}
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
                  onChange={(e) => setFormData({ ...formData, quantidade: Math.max(1, parseInt(e.target.value) || 1) })}
                  fullWidth
                  size="small"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unidade de Medida
                </label>
                <Select
                  options={UNIDADES_MEDIDA_OPTIONS}
                  value={{ value: formData.unidade_medida, label: formData.unidade_medida }}
                  onChange={(option) => setFormData({ ...formData, unidade_medida: option?.value || 'un' })}
                  placeholder="Selecione..."
                  isSearchable
                  menuPortalTarget={document.body}
                  styles={selectStyles}
                />
              </div>
            </div>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAddDialog(false)}>
            Cancelar
          </Button>
          <Button
            onClick={adicionarItem}
            disabled={!formData.nome.trim()}
            sx={{
              backgroundColor: "#9e000e",
              "&:hover": { backgroundColor: "#7c000b" },
              color: "white"
            }}
          >
            Adicionar
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
                    value={editingItem?.quantidade || 1}
                    onChange={(e) => editingItem && setEditingItem({ 
                      ...editingItem, 
                      quantidade: Math.max(1, parseInt(e.target.value) || 1) 
                    })}
                    size="small"
                    sx={{ width: '80px' }}
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
                  value={{ value: editingItem?.unidade_medida || 'un', label: editingItem?.unidade_medida || 'un' }}
                  onChange={(option) => editingItem && setEditingItem({ 
                    ...editingItem, 
                    unidade_medida: option?.value || 'un' 
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
        <DialogActions>
          <Button onClick={fecharDialogoEdicao}>
            Cancelar
          </Button>
          <Button
            onClick={editarItem}
            sx={{
              backgroundColor: "#9e000e",
              "&:hover": { backgroundColor: "#7c000b" },
              color: "white"
            }}
          >
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
