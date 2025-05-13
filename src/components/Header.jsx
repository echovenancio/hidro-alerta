import { Link } from "react-router-dom";
import logo from "../assets/logo.svg"; 

export default function Header() {
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
        <Link to="/login">
          <button className="bg-black text-white px-3 py-1 rounded">Login</button>
        </Link>
        <Link to="/signup">
        <button className="bg-black text-white px-3 py-1 rounded">Signup</button>
        </Link>
      </nav>
    </header>
  );
}