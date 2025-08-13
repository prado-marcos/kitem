import { Link } from "react-router-dom";
import { ChefHat, CircleUserRound } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../hooks/useAuth";

export default function Nav() {
  return (
    <nav className="w-full bg-red-800 text-white px-4 py-3 flex justify-between items-center shadow-md">
      <Logo />
      <Profile />
    </nav>
  );
}

function Profile() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { isAuthenticated, logout } = useAuth();

  // Fecha o dropdown quando a autenticação muda
  useEffect(() => {
    setIsDropdownOpen(false);
  }, [isAuthenticated]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="pointer-button"
        type="button"
        title="Perfil"
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
      >
        <CircleUserRound className="h-10 w-10" />
      </button>

      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
          {!isAuthenticated ? (
            <>
              <Link
                to="/cadastro"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => setIsDropdownOpen(false)}
              >
                Cadastro
              </Link>
              <Link
                to="/login"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => setIsDropdownOpen(false)}
              >
                Login
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/editar-cadastro"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => setIsDropdownOpen(false)}
              >
                Editar Cadastro
              </Link>
              <Link
                to="/gerenciamento-receitas"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => setIsDropdownOpen(false)}
              >
                Gerenciamento de Receitas
              </Link>
              <Link
                to="/cadastro-receita"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => setIsDropdownOpen(false)}
              >
                Adicionar Nova Receita
              </Link>
              <Link
                to="/lista-itens"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => setIsDropdownOpen(false)}
              >
                Lista de Itens
              </Link>
              <button
                onClick={handleLogout}
                className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Sair
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function Logo() {
  return (
    <Link
      to="/"
      className="flex flex-row items-center flex justify-between gap-1"
    >
      <ChefHat className="h-15 w-15" />
      <span className="text-5xl font-[Rockwell] font-bold">Kitem</span>
    </Link>
  );
}
