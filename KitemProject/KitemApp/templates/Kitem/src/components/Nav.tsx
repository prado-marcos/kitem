import { Link } from "react-router-dom";
import { ChefHat, CircleUserRound } from "lucide-react";

export default function Nav() {
  return (
    <nav className="w-full bg-red-800 text-white px-4 py-3 flex justify-between items-center shadow-md">
      <Logo />
      <Profile />
    </nav>
  );
}

function Profile() {
  return (
    <>
      <button className="pointer-button" type="button" title="Perfil">
      <CircleUserRound className="h-10 w-10"/>
      </button>
    </>
  );
}

function Logo() {
  return (
    <Link to="/" className="flex flex-row items-center flex justify-between gap-1">
      <ChefHat className="h-15 w-15"/>
      <span className="text-5xl font-[Rockwell] font-bold">Kitem</span>
    </Link>
  );
}
