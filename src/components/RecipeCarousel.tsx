import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
// @ts-expect-error importe funciona normalmente
import "swiper/css";
// @ts-expect-error importe funciona normalmente
import "swiper/css/navigation";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import api from "../services/api";
import { Pencil, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";

interface RecipeCarouselProps {
  title: string;
  subTitle: string;
  recipes: RecipeProps[];
  managementMode?: boolean; // <- novo
}

interface RecipeProps {
  id: number;
  title: string;
  imageUrl: string;
  time: string;
  rating: number;
  difficulty: string;
}

export default function RecipeCarousel({
  title,
  subTitle,
  recipes = [],
  managementMode = false, // padrão = false
}: RecipeCarouselProps) {
  const navigate = useNavigate();
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const handleEdit = (id: number) => {
    navigate(`/edita-receita/${id}/`);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/receitas/${deleteId}/`);
      window.location.reload(); // pode ser trocado por atualização de estado
    } catch (error) {
      console.error("Erro ao excluir receita:", error);
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div className="w-full flex flex-col items-center py-10">
      <h2 className="text-4xl font-bold mb-2">{title}</h2>
      <p className="text-gray-600 mb-6">{subTitle}</p>

      <div className="w-full max-w-6xl">
        <Swiper
          modules={[Navigation]}
          navigation
          spaceBetween={20}
          slidesPerView={3}
          breakpoints={{
            0: { slidesPerView: 1 },
            640: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
          className="pb-8"
        >
          {recipes.map((recipe) => (
            <SwiperSlide key={recipe.id}>
              <div className="bg-white shadow rounded overflow-hidden relative">
                <Link to={`/receita/${recipe.id}`} key={recipe.id}>
                  <img
                    src={recipe.imageUrl}
                    alt={recipe.title}
                    className="w-full h-64 object-cover"
                  />
                </Link>
                <div className="p-4">
                  <h3 className="text-lg font-semibold">{recipe.title}</h3>
                  <p className="mt-2 ">
                    {recipe.time} min | Dificuldade: {recipe.difficulty}
                  </p>
                </div>

                {/* Botões só aparecem se managementMode for true */}
                {managementMode && (
                  <div className="absolute top-2 right-2 flex gap-2">
                    <button
                      className="p-2 bg-blue-500 text-white rounded-full shadow hover:bg-blue-600"
                      onClick={() => handleEdit(recipe.id)}
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      className="p-2 bg-red-500 text-white rounded-full shadow hover:bg-red-600"
                      onClick={() => setDeleteId(recipe.id)}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                )}
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Modal de confirmação */}
      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
        <DialogTitle>Confirmar exclusão</DialogTitle>
        <DialogContent>
          Tem certeza que deseja excluir esta receita?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)} color="inherit">
            Cancelar
          </Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}