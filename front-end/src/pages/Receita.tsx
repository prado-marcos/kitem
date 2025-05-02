import { useState } from "react";
import { Heart, Share2 } from "lucide-react";

interface IngredienteRecipeInterface {
  quantity: number;
  ingredient: string;
}

interface RecipeInterface {
  title: string;
  ingredientRecipe: IngredienteRecipeInterface[];
  favorite: boolean;
  imageUrl: string;
  description: string;
  difficulty: string;
  time: number;
}

export default function Receita({
  title,
  description,
  favorite,
  ingredientRecipe,
  imageUrl,
  difficulty,
  time,
}: RecipeInterface) {
  const [isFavorite, setFavorite] = useState(favorite);

  function handleFavorite() {
    setFavorite(!isFavorite);
  }

  const ingredientsArr = ingredientRecipe.map((el, index) => (
    <li key={index}>{el.quantity + " " + el.ingredient}</li>
  ));

  return (
    <div className="flex flex-col my-12 mx-80 gap-5">
      <div className="flex flex-row justify-between items-center">
        <h1 className="text-4xl font-bold mb-2">{title}</h1>
        <div className="flex flex-row gap-x-2">
          <Share2 className="h-4 w-4 my-1" />
          <button onClick={handleFavorite}>
            {isFavorite ? (
              <Heart className="fill-black h-4 w-4 my-1" />
            ) : (
              <Heart className="fill-white h-4 w-4 my-1" />
            )}
          </button>
        </div>
      </div>
      <span className="flex justify-center">
        <img
          src={imageUrl}
          alt={title}
          className="max-w-md h-auto object-cover rounded-sm"
        />
      </span>
      <div className="flex flex-row">
        <p className="font-bold">
          Dificuldade: {difficulty} | Tempo de Preparo: {time} min
        </p>
      </div>
      <h3 className="text-lg font-semibold">Ingredientes</h3>
      <ul>{ingredientsArr}</ul>
      <h3 className="text-lg font-semibold">Modo de Preparo</h3>
      <p>{description}</p>
    </div>
  );
}
