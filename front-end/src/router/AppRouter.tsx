import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import Login from "../pages/Login";
import NotFoundPage from "../pages/NotFound";
import Layout from "../pages/Layout";
// import PrivateRoute from './PrivateRoute';

function AppRouter() {
    return (
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="/login" element={<Login></Login>} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      );

  // return (
  //   <BrowserRouter>
  //     <Routes>
  //       <Route path="/" element={<Layout />}>
  //         <Route index element={<Home />} />
  //         {/* <Route path="/receita" element={<Receita title={objReceita.title} description={objReceita.description} favorite={objReceita.favorite} ingredientRecipe={objReceita.ingredietRecipe} imageUrl={objReceita.imageUrl} />} /> */}
  //         <Route
  //           path="/receita"
  //           element={
  //             <Receita
  //               title={objReceita.title}
  //               description={objReceita.description}
  //               favorite={objReceita.favorite}
  //               ingredientRecipe={objReceita.ingredietRecipe}
  //               imageUrl={objReceita.imageUrl}
  //               time={objReceita.time}
  //               difficulty={objReceita.difficulty}
  //             />
  //           }
  //         />
  //         <Route path="/login" element={<Login></Login>} />
  //         <Route path="/register" element={<Register></Register>} />
  //         <Route path="/update-register" element={<UpdateRegister></UpdateRegister>} />
  //         <Route path="/update-Password" element={<UpdatePassword></UpdatePassword>} />
  //         <Route path="/recipe-management" element={<RecipeManagement></RecipeManagement>} />
  //         <Route path="/recipe-register" element={<RecipeRegister></RecipeRegister>} />
  //         <Route path="/shop-list" element={<ShopList></ShopList>} />
  //         {/* <Route path="blogs" element={<Blogs />} />
  //         <Route path="contact" element={<Contact />} />
  //         <Route path="*" element={<NoPage />} /> */}
  //       </Route>
  //     </Routes>
  //   </BrowserRouter>
  // );
}

// const objReceita = {
//   title: "Bolo de Cenoura",
//   ingredietRecipe: [
//     { quantity: 3, ingredient: "cenouras médias (aprox. 250g)" },
//     { quantity: 3, ingredient: "ovos" },
//     { quantity: 3, ingredient: "xícara de óleo (240ml)" },
//     { quantity: 3, ingredient: "xícaras de açúcar (400g)" },
//     { quantity: 3, ingredient: "e 1/2 xícaras de farinha de trigo (325g)" },
//     { quantity: 3, ingredient: "colher de sopa de fermento em pó (14g)" },
//     { quantity: 3, ingredient: "colheres de sopa de chocolate em pó" },
//     { quantity: 3, ingredient: "colheres de sopa de manteiga" },
//     { quantity: 3, ingredient: "xícara de açúcar" },
//     { quantity: 3, ingredient: "xícara de leite" },
//   ],
//   description: `Modo de Preparo
//   Preaqueça o forno a 180°C e unte uma forma com manteiga e farinha.
//   Bata no liquidificador as cenouras picadas, os ovos e o óleo até obter uma mistura homogênea.
//   Em uma tigela, misture o açúcar e a farinha. Depois, adicione a mistura do liquidificador e mexa bem.
//   Acrescente o fermento e misture delicadamente.
//   Despeje na forma e leve ao forno por 35-45 minutos (faça o teste do palito).
//   Modo de Preparo da Cobertura
//   Em uma panela, derreta a manteiga e adicione o chocolate, o açúcar e o leite.
//   Mexa sempre, em fogo médio, até engrossar levemente.
//   Despeje sobre o bolo ainda quente.`,
//   favorite: true,
//   imageUrl:
//     "https://canaldareceita.com.br/wp-content/uploads/2025/01/BOLO-DE-CENOURA-FOFINHO-DE-LIQUIDIFICADOR.jpg",
//   difficulty: "Fácil",
//   time: 60,
// };

export default AppRouter;
