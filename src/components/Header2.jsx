import { Link } from "react-router-dom";  
import logo from "../assets/logo.svg"; 

export default function Header2() {
  return (
    <header className="flex justify-between items-center p-4">
      <div className="flex items-center gap-2">
        <Link to="/"> 
          <span className="bg-black text-white font-bold px-2 py-1 flex items-center rounded cursor-pointer">
            <img src={logo} alt="Logo" className="w-15 h-10" />
          </span>
        </Link>
      </div>
      <nav className="flex gap-2">
        <Link to="/mapa">
        <button className="bg-black text-white px-3 py-1 rounded">Mapa</button>
        </Link>
        <Link to="/ajustes">
          <button className="bg-black text-white px-3 py-1 rounded">Ajustes</button>
        </Link>
        <Link to="/">
        <button className="bg-red-600 text-white px-3 py-1 rounded">Sair</button>
        </Link>
      </nav>
    </header>
  );
}