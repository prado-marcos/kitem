import { useNavigate } from "react-router-dom";

function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <img
        src="https://cdni.iconscout.com/illustration/premium/thumb/erro-404-nao-encontrado-10498517-8488187.png"
        alt="Página não encontrada"
        className="w-64 h-64 object-contain"
      />
      <h1 className="mt-4 text-3xl font-bold text-gray-800">
        404 - Página não encontrada
      </h1>
      <p className="mt-2 text-lg text-gray-600">
        Desculpe, a página que você está procurando não existe ou foi movida.
      </p>
      <button
        onClick={() => navigate("/")}
        className="mt-6 px-6 py-2 text-white font-semibold rounded-md shadow-md transition-transform transform hover:scale-105"
        style={{
          backgroundColor: "#9e000e", // Cor principal
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)", // Sombra
        }}
        onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#7c000b")} // Hover mais escuro
        onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#9e000e")} // Voltar ao normal
      >
        Voltar
      </button>
    </div>
  );
}

export default NotFound;