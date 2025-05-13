import mapa from "../assets/mapa.svg"; 
import logo from "../assets/logo.svg"; 
import { Link } from "react-router-dom";

export default function Hero() {
  return (
    <div className="text-center mt-8">
      <div className="flex justify-center">
        <h1 className=" text-black text-4xl font-bold px-4 py-2 flex items-center gap-2 rounded">
        <img src={logo} alt="Logo" className="mx-auto border" /> Baixada
        </h1>
      </div>
      <p className="mt-4 text-gray-700">
        Monitore e relate o estado do sistema de distribuição de água nos municípios
        da baixada santista.
      </p>
      <div className="mt-8">
        <img src={mapa} alt="Mapa da baixada santista" className="mx-auto border w-1/3" />
      </div>
      <Link to="/mapa">
      <button className="mt-6 bg-black text-white px-6 py-2 rounded text-lg font-semibold">
        VER MAPA DE ALERTAS
      </button>
      </Link>
    </div>
  );
}
