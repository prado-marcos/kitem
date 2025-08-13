import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Recipe from "../pages/Recipe";
import NotFoundPage from "../pages/NotFound";
import Layout from "../pages/Layout";
import RecipeList from "../pages/RecipeList";
import RecipeManagement from "../pages/RecipeManagement";
import PrivateRoute from "./PrivateRoute";
import UpdateRegister from "../pages/UpdateRegister";
import CreateRecipe from "../pages/CreateRecipe";
import ListaItens from "../pages/ListaItens";

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<Register />} />
          <Route path="/receita/:id" element={<Recipe />} />
          <Route path="/receitas" element={<RecipeList />} />
          <Route
            path="/gerenciamento-receitas"
            element={
              <PrivateRoute>
                <RecipeManagement />
              </PrivateRoute>
            }
          />
          <Route
            path="/editar-cadastro"
            element={
              <PrivateRoute>
                <UpdateRegister />
              </PrivateRoute>
            }
          />
          <Route
            path="/cadastro-receita"
            element={
              <PrivateRoute>
                <CreateRecipe />
              </PrivateRoute>
            }
          />
          <Route
            path="/lista-itens"
            element={
              <PrivateRoute>
                <ListaItens />
              </PrivateRoute>
            }
          />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
