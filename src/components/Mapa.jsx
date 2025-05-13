import { useState } from "react";
import Popup from "./Popup";
import {
  Bertioga,
  Cubatao,
  Guaruja,
  Praiagrande,
  Santos,
  Santos2,
  Saovicente,
  Itanhaem,
  Mongagua,
  Peruibe,
  Saovicente2,
} from "./Cities";

export default function MapaBaixadaSantista() {
  const [popupInfo, setPopupInfo] = useState(null);
  const [showPopupModal, setShowPopupModal] = useState(false);

  const handleCityClick = (cidade, event) => {
    const bounds = event.target.getBoundingClientRect();

    setPopupInfo({
      cidade,
      x: bounds.left - 300,
      y: bounds.top - 40,
    });
  };

  // ⬇️ O return agora está no lugar certo
  return (
    <div className="relative w-full h-auto">
      <svg
        viewBox="0 0 1478 998"
        xmlns="http://www.w3.org/2000/svg"
        className="max-w-2xl mx-auto h-auto"
      >
        <Bertioga onClick={(e) => handleCityClick("Bertioga", e)} />
        <Cubatao onClick={(e) => handleCityClick("Cubatão", e)} />
        <Guaruja onClick={(e) => handleCityClick("Guarujá", e)} />
        <Praiagrande onClick={(e) => handleCityClick("Praia Grande", e)} />
        <Santos onClick={(e) => handleCityClick("Santos", e)} />
        <Santos2 onClick={(e) => handleCityClick("Santos", e)} />
        <Saovicente onClick={(e) => handleCityClick("São Vicente", e)} />
        <Saovicente2 onClick={(e) => handleCityClick("São Vicente", e)} />
        <Itanhaem onClick={(e) => handleCityClick("Itanhaém", e)} />
        <Mongagua onClick={(e) => handleCityClick("Mongaguá", e)} />
        <Peruibe onClick={(e) => handleCityClick("Peruíbe", e)} />
      </svg>

      {popupInfo && (
        <div
          className="absolute bg-white border border-black rounded px-3 py-2 shadow-md z-50"
          style={{
            left: popupInfo.x,
            top: popupInfo.y - 60,
            transform: "translateX(-50%)",
          }}
        >
          <div className="text-sm font-bold flex items-center gap-2">
            {popupInfo.cidade}
            <button
              className="text-blue-500 text-lg hover:scale-110 transition"
              onClick={() => setShowPopupModal(true)}
            >
              ＋
            </button>
          </div>
          <div className="absolute left-1/2 top-full transform -translate-x-1/2 w-3 h-3 bg-white border-l border-b border-black rotate-45" />
        </div>
      )}

      {showPopupModal && popupInfo && (
        <Popup
          cidade={popupInfo.cidade}
          onClose={() => setShowPopupModal(false)}
          onConfirm={() => {
            console.log(`Relato confirmado para ${popupInfo.cidade}`);
            setShowPopupModal(false);
          }}
        />
      )}
    </div>
  );
}
