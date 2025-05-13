import React, { useState } from "react";
import Header2 from "./components/Header2";
import MapaBaixadaSantista from "./components/Mapa";
import Alertcard from "./components/Alertcard";
import ModalRelato from "./components/Popup";

export default function MapaPage() {
  const [cidadeSelecionada, setCidadeSelecionada] = useState(null);

  const handleCidadeClick = (cidade) => {
    setCidadeSelecionada(cidade);
  };

  const handleConfirmarRelato = () => {
    console.log(`Problema relatado em ${cidadeSelecionada}`);
    setCidadeSelecionada(null);
  };

  return (
    <div>
      <Header2 />
      <div className="flex p-6 gap-6">
        <div className="flex flex-col gap-4 w-80">
          <Alertcard
            cidade="Santos"
            mensagem="Sistema de distribuição de água interrompido."
            cor="vermelho"
          />
          <Alertcard
            cidade="Itanhaém"
            mensagem="Sistema de distribuição de água interrompido."
            cor="vermelho"
          />
          <Alertcard
            cidade="Praia Grande"
            mensagem="Problemas no sistema de distribuição de água foram relatados."
            cor="amarelo"
          />
        </div>

        <div className="flex-1">
          <MapaBaixadaSantista onCidadeClick={handleCidadeClick} />
        </div>
      </div>

      {cidadeSelecionada && (
        <ModalRelato
          cidade={cidadeSelecionada}
          onConfirm={handleConfirmarRelato}
          onClose={() => setCidadeSelecionada(null)}
        />
      )}
    </div>
  );
}
