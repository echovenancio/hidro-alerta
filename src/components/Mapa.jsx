import { useState, useEffect, useRef } from "react";
import Popup from "./Popup";
import supabase from "../utils/supabase";
import CalendarHeatmap from "./CalendarHeatMap";
import supbase from "../utils/supabase";

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
        3: null,
    };

    const popupRef = useRef(null);
    const [popupInfo, setPopupInfo] = useState(null);
    const [showPopupModal, setShowPopupModal] = useState(false);
    const [calendarCity, setCalendarCity] = useState(null);
    const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, text: "" });

    const showTooltip = (e, text) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setTooltip({
            visible: true,
            x: rect.x + rect.width / 2,
            y: rect.y - 10,
            text,
        });
    };

    const hideTooltip = () => {
        setTooltip({ ...tooltip, visible: false });
    };

    const handleCityClick = (cidade, municipio_id, event) => {
        const mouseEvent = event.nativeEvent;
        setPopupInfo({
            municipio_id,
            cidade,
            x: mouseEvent.pageX,
            y: mouseEvent.pageY,
        });
    };

    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

    useEffect(() => {
        if (!popupInfo || showPopupModal) return;

        function handleClickOutside(event) {
            if (popupRef.current && !popupRef.current.contains(event.target)) {
                setPopupInfo(null);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [popupInfo, showPopupModal]);


    useEffect(() => {
        if (calendarCity) {
            (async () => {
                const { data, error } = await supabase.rpc('get_vermelho_days_by_municipio_and_month', {
                    p_month: selectedMonth,
                    p_municipio_id: popupInfo?.municipio_id,
                    p_year: selectedYear,
                });
                if (error) console.error(error);
                else {
                    setCalendarCity({
                        cidade: popupInfo.cidade,
                        year: selectedYear,
                        month: selectedMonth,
                        highlightedDays: data?.map((d) => d.dia) || [],
                    });
                }
            })();
        }
    }, [selectedMonth, selectedYear]);


    const handleCalendarClick = async () => {
        const now = new Date();
        setSelectedYear(now.getFullYear());
        setSelectedMonth(now.getMonth() + 1);

        const { data, error } = await supabase.rpc('get_vermelho_days_by_municipio_and_month', {
            p_month: selectedMonth,
            p_municipio_id: popupInfo?.municipio_id,
            p_year: selectedYear,
        });

        if (error) console.error(error);

        setCalendarCity({
            cidade: popupInfo.cidade,
            year: selectedYear,
            month: selectedMonth,
            highlightedDays: data?.map((d) => d.dia) || [],
        });

    };


    return (
        <div className="relative w-full h-auto">
            <svg
                viewBox="0 0 1478 998"
                xmlns="http://www.w3.org/2000/svg"
                className="max-w-2xl mx-auto h-auto"
            >
                {situacoes.map((situacao) => {
                    const Component = mapNomeToComponent[situacao.nome];
                    const color = mapIdSituacaoToColor[situacao.id_situacao];
                    return (
                        <Component
                            key={situacao.id}
                            onClick={(e) => handleCityClick(situacao.nome, situacao.municipio_id, e)}
                            fillColor={color}
                            onMouseEnter={(e) => showTooltip(e, situacao.nome)}
                            onMouseLeave={hideTooltip}
                        />
                    );
                })}
            </svg>

            {tooltip.visible && (
                <div
                    style={{
                        position: "fixed",
                        top: tooltip.y,
                        left: tooltip.x,
                        backgroundColor: "rgba(0,0,0,0.7)",
                        color: "white",
                        padding: "4px 8px",
                        borderRadius: 4,
                        pointerEvents: "none",
                        transform: "translate(-50%, -100%)",
                        whiteSpace: "nowrap",
                        zIndex: 9999,
                        userSelect: "none",
                    }}
                >
                    {tooltip.text}
                </div>
            )}

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
                    ref={popupRef}
                    className="absolute bg-white border border-black rounded px-3 py-2 shadow-md z-40"
                    style={{
                        left: popupInfo.x - 410,
                        top: popupInfo.y - 150,
                    }}
                >
                    <div className="text-sm font-bold flex items-center gap-2">
                        {popupInfo.cidade}
                        {loggedIn ? (
                            <>
                                <button
                                    className="text-blue-500 text-lg hover:scale-110 transition"
                                    onClick={() => setShowPopupModal(true)}
                                >
                                    ＋
                                </button>
                                <button
                                    className="text-red-500 text-lg hover:scale-110 transition"
                                    onClick={handleCalendarClick}
                                    title="abrir calendário"
                                >
                                    📅
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    disabled
                                    className="text-gray-500 text-lg transition"
                                >
                                    ＋
                                </button>
                                <button
                                    onClick={handleCalendarClick}
                                    className="text-gray-400 text-lg transition"
                                >
                                    📅
                                </button>
                            </>
                        )}
                    </div>
                    <div className="absolute left-1/2 -bottom-2 transform -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-white" />
                </div>
            )}

            {showPopupModal && popupInfo && loggedIn && (
                <Popup
                    cidade={popupInfo.cidade}
                    onClose={() => {
                        setPopupInfo(null)
                        setShowPopupModal(false);
                    }}
                    onConfirm={async () => {
                        const user = await supabase.auth.getSession();
                        const userId = user.data.session.user.id;
                        const municipio_id = situacoes.find(
                            (s) => s.nome.toLowerCase() === popupInfo.cidade.toLowerCase()
                        ).municipio_id;

                        setShowPopupModal(false);

                        await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create_report`, {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${user.data.session.access_token}`,
                            },
                            body: JSON.stringify({
                                user_id: userId,
                                municipio_id,
                            }),
                        });
                    }}
                />
            )}

            {calendarCity && (
                <div
                    className="fixed inset-0 z-50 bg-black bg-opacity-60 flex justify-center items-center"
                    onClick={() => setCalendarCity(null)}
                >
                    <div
                        className="bg-white p-4 border rounded shadow z-100"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center mb-2">
                            <h2 className="text-lg font-semibold">
                                {calendarCity.cidade} — {calendarCity.month}/{calendarCity.year}
                            </h2>
                            <button
                                className="text-red-500 text-sm hover:underline"
                                onClick={() => setCalendarCity(null)}
                            >
                                fechar
                            </button>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                            <select
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                                className="border px-2 py-1 rounded"
                            >
                                {[...Array(12)].map((_, i) => (
                                    <option key={i + 1} value={i + 1}>
                                        {i + 1}
                                    </option>
                                ))}
                            </select>
                            <select
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(Number(e.target.value))}
                                className="border px-2 py-1 rounded"
                            >
                                {[2025].map((y) => (
                                    <option key={y} value={y}>
                                        {y}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <CalendarHeatmap
                            cidade={calendarCity.cidade}
                            year={calendarCity.year}
                            month={calendarCity.month}
                            highlightedDays={calendarCity.highlightedDays}
                            highlightColor="red"
                        />
                    </div>
                </div>
            )}

        </div>
    );
}

