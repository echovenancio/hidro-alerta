import { useState, useEffect } from "react";
import Popup from "./Popup";
import supabase from "../utils/supabase"
import {
    Bertioga,
    Cubatao,
    Guaruja,
    Praiagrande,
    Santos,
    Saovicente,
    Itanhaem,
    Mongagua,
    Peruibe,
} from "./Cities";

export default function MapaBaixadaSantista({ situacoes, popupData, loggedIn }) {

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


    const [popupInfo, setPopupInfo] = useState(null);
    const [showPopupModal, setShowPopupModal] = useState(false);


    const handleCityClick = (cidade, event) => {
        const mouseEvent = event.nativeEvent; // actual MouseEvent
        setPopupInfo({
            cidade,
            x: mouseEvent.pageX,
            y: mouseEvent.pageY,
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

            {popupData && (
                <Popup
                    cidade={popupData.cidade}
                    onClose={popupData.onClose}
                    onConfirm={popupData.onConfirm}
                    selfReport={popupData.selfReport}
                />
            )}

            {popupInfo && (
                <div
                    className="absolute bg-white border border-black rounded px-3 py-2 shadow-md z-50"
                    style={{
                        left: popupInfo.x - 410,
                        top: popupInfo.y - 150,
                    }}
                >
                    <div className="text-sm font-bold flex items-center gap-2">
                        {popupInfo.cidade}
                        {(loggedIn && (
                            <button
                                className="text-blue-500 text-lg hover:scale-110 transition"
                                onClick={() => setShowPopupModal(true)}
                            >
                                ＋
                            </button>
                        )) || (
                            <button
                                disabled
                                className="text-gray-500 text-lg transition"
                            >
                                ＋
                            </button>
                        ) }
                    </div>
                    <div className="absolute left-1/2 -bottom-2 transform -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-white" />
                </div>
            )}

            {showPopupModal && popupInfo && loggedIn && (
                <Popup
                    cidade={popupInfo.cidade}
                    onClose={() => setShowPopupModal(false)}
                    onConfirm={async () => {
                        const user = await supabase.auth.getSession();
                        const userId = user.data.session.user.id;
                        const municipio_id = situacoes.find(s => s.nome.toLowerCase() === popupInfo.cidade.toLowerCase()).municipio_id;
                        setShowPopupModal(false);
                        const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create_report`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${user.data.session.access_token}`,
                            },
                            body: JSON.stringify({
                                user_id: userId,
                                municipio_id: municipio_id,
                            }),
                        });
                    }}
                />
            )}
        </div>
    );
}
