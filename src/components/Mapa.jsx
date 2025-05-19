import { useState, useEffect } from "react";
import Popup from "./Popup";
import supabase from "../utils/supabase"
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

    const [situacoes, setSituacoes] = useState([]);

    const mapNomeToComponent = {
        "Bertioga": Bertioga,
        "Cubatão": Cubatao,
        "Guarujá": Guaruja,
        "Praia Grande": Praiagrande,
        "Santos": Santos,
        "São Vicente": Saovicente,
        "Itanhaém": Itanhaem,
        "Mongaguá": Mongagua,
        "Peruíbe": Peruibe,
    };

    const mapIdSituacaoToColor = {
        1: "#FF0000", // Vermelho
        2: "#FFFF00", // Amarelo
        3: null, // Default 
    };

    async function getSituacoes() {
        const { data: situacoes, error } = await supabase
            .from("ultima_situacao_por_municipio")
            .select("*")
        if (error) {
            console.error("Erro ao buscar dados:", error);
        }
        if (situacoes) {
            setSituacoes(situacoes);
        }
    }

    useEffect(() => {
        getSituacoes();
        console.log(situacoes);
    }, [])

    useEffect(() => {
        console.log(situacoes);
    }, [situacoes]);

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

    return (
        <div className="relative w-full h-auto">
            <svg
                viewBox="0 0 1478 998"
                xmlns="http://www.w3.org/2000/svg"
                className="max-w-2xl mx-auto h-auto"
            >
                {situacoes.map(situacao => {
                    const Component = mapNomeToComponent[situacao.nome];
                    const color = mapIdSituacaoToColor[situacao.id_situacao];
                    console.log(situacao.nome, situacao.id_situacao, color);
                    return (
                        <Component
                            key={situacao.id}
                            onClick={(e) => handleCityClick(situacao.nome, e)}
                            fillColor={color}
                        />
                    );
                })}

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
