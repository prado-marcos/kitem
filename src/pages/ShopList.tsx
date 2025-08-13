import {
    Box,
    Button,
    IconButton,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TextField,
    Typography,
  } from "@mui/material";
  import { Plus, Trash2 } from "lucide-react";
  import { useState, FormEvent } from "react";
  
  interface ShopItem {
    name: string;
    quantity: string;
    price: string;
  }
  
  interface ShopListProps {
    initialItems?: ShopItem[];
    onSubmit: (items: ShopItem[]) => void;
  }
  
  export default function ShopList({ initialItems = [], onSubmit }: ShopListProps) {
    const [items, setItems] = useState<ShopItem[]>(
      initialItems.length > 0
        ? initialItems
        : [{ name: "", quantity: "1", price: "0" }]
    );
  
    function handleItemChange(index: number, field: keyof ShopItem, value: string) {
      const newItems = [...items];
      newItems[index][field] = value;
      setItems(newItems);
    }
  
    function handleAddItem() {
      setItems((prev) => [...prev, { name: "", quantity: "1", price: "0" }]);
    }
  
    function handleRemoveItem(index: number) {
      setItems((prev) => prev.filter((_, i) => i !== index));
    }
  
    function handleSubmit(e: FormEvent<HTMLFormElement>) {
      e.preventDefault();
  
      // Validação simples: não permitir itens sem nome
      const validItems = items.filter((item) => item.name.trim());
      if (validItems.length === 0) {
        alert("Adicione pelo menos um item com nome válido.");
        return;
      }
  
      onSubmit(validItems);
    }
  
    // const total = items.reduce((acc, item) => {
    //   const qty = parseFloat(item.quantity) || 0;
    //   const price = parseFloat(item.price) || 0;
    //   return acc + qty * price;
    // }, 0);
  
    return (
      <Box className="flex flex-col justify-center items-center my-12 w-full">
        <Typography variant="h4" sx={{ mb: 2 }}>
          Lista de compras
        </Typography>
  
        <form
          onSubmit={handleSubmit}
          className="w-full flex flex-col items-center gap-5"
        >
          <Box className="flex flex-col w-full items-center md:w-[60%]">
            <Paper variant="outlined" sx={{ mb: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Ingrediente</TableCell>
                    <TableCell>Quantidade</TableCell>
                    <TableCell>Preço médio (R$)</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <TextField
                          value={item.name}
                          onChange={(e) =>
                            handleItemChange(index, "name", e.target.value)
                          }
                          placeholder="Ex: Farinha"
                          variant="outlined"
                          size="small"
                          fullWidth
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          type="number"
                          value={item.quantity}
                          onChange={(e) =>
                            handleItemChange(index, "quantity", e.target.value)
                          }
                          variant="outlined"
                          size="small"
                          inputProps={{ min: 0 }}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          type="number"
                          value={item.price}
                          onChange={(e) =>
                            handleItemChange(index, "price", e.target.value)
                          }
                          variant="outlined"
                          size="small"
                          inputProps={{ min: 0, step: "0.01" }}
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton onClick={() => handleRemoveItem(index)}>
                          <Trash2 size={16} />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>
  
            <Button
              variant="outlined"
              startIcon={<Plus />}
              onClick={handleAddItem}
              sx={{ mb: 2 }}
            >
              Adicionar ingrediente
            </Button>
{/*   
            <Typography variant="subtitle1" sx={{ mb: 2 }}>
              Total estimado: <strong>R$ {total.toFixed(2)}</strong>
            </Typography> */}
  
            <Button
              type="submit"
              variant="contained"
              sx={{
                backgroundColor: "#000000",
                "&:hover": { backgroundColor: "#5C5C5C" },
                color: "#ffffff",
                borderRadius: "12px",
                px: 4,
                py: 1.5,
                width: "50%"
              }}
            >
              Salvar lista
            </Button>
          </Box>
        </form>
      </Box>
    );
  }
  