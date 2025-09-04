export default function Footer() {
    return (
      <footer className="footer sm:footer-horizontal bg-orange-300 text-white p-10">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-sm">
            © {new Date().getFullYear()} Kitem. Todos os direitos reservados.
          </div>
          <div className="flex space-x-6">
            <a href="#" className="hover:underline">
              Contato
            </a>
            <a href="#" className="hover:underline">
              Termos de Uso
            </a>
            <a href="#" className="hover:underline">
              Políticas de Privacidade
            </a>
          </div>
        </div>
      </footer>
    );
  };