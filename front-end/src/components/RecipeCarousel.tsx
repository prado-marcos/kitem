import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
// @ts-expect-error importe funciona normalmente
import "swiper/css";
// @ts-expect-error importe funciona normalmente
import "swiper/css/navigation";

interface RecipeCarouselProps {
  title: string;
  subTitle: string;
  recipes: RecipeProps[];
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
}: RecipeCarouselProps) {
  // function RecipeCarousel({ title, subTitle, recipes }: RecipeCarousel) {
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
              <div className="bg-white shadow rounded overflow-hidden">
                <a href={"/receitas/" + recipe.id}>
                  <img
                    src={recipe.imageUrl}
                    alt={recipe.title}
                    className="w-full h-64 object-cover"
                  />
                </a>
                <div className="p-4">
                  <h3 className="text-lg font-semibold">{recipe.title}</h3>
                  {/* <p className="mt-2 font-bold">{recipe.viewCount} estrelas</p> */}
                  <p className="mt-2 ">
                    {recipe.time} min | Dificuldade: {recipe.difficulty}
                  </p>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
}
