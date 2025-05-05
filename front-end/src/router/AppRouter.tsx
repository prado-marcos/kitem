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
            path="/minhas-receitas"
            element={
              <PrivateRoute>
                <RecipeManagement />
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
