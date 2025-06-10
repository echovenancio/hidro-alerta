import { useState } from "react";

export default function CalendarHeatmap({ year, month, highlightedDays, relatosLocalidade }) {
    const [activeTab, setActiveTab] = useState("calendar");

    const firstDay = new Date(year, month - 1, 1);
    const daysInMonth = new Date(year, month, 0).getDate();
    const startWeekday = firstDay.getDay();
    const totalCells = Math.ceil((startWeekday + daysInMonth) / 7) * 7;

    return (
        <div className="w-fit p-4 bg-white rounded-xl shadow-lg border border-gray-200">
            {/* tab headers */}
            <div className="flex border-b mb-4 w-full">
                {["calendar", "relatos"].map(tab => (
                    <button
                        key={tab}
                        className={`px-4 py-2 font-medium ${activeTab === tab ? "border-b-2 border-red-500 text-red-500" : "text-gray-500"}`}
                        onClick={() => setActiveTab(tab)}
                    >
                        {tab === "calendar" ? "Calendário" : "Relatos"}
                    </button>
                ))}
            </div>

            {/* tab content container */}
            <div className="w-[336px]"> {/* 7 cols * 48px per cell = 336px */}
                {activeTab === "calendar" ? (
                    <div className="grid grid-cols-7 gap-1">
                        {Array.from({ length: totalCells }).map((_, i) => {
                            const day = i - startWeekday + 1;
                            const isValid = day > 0 && day <= daysInMonth;
                            const isHighlighted = highlightedDays.includes(day);
                            const base = 'w-10 h-10 flex items-center justify-center text-sm font-medium rounded-md';

                            return (
                                <div
                                    key={i}
                                    className={`${base} ${isValid
                                            ? isHighlighted
                                                ? 'bg-red-500 text-white'
                                                : 'bg-gray-100 text-gray-800'
                                            : ''
                                        }`}
                                >
                                    {isValid ? day : ''}
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <table className="w-full text-sm text-left text-gray-700 border border-gray-200 rounded-md overflow-hidden">
                        <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
                            <tr>
                                <th scope="col" className="px-4 py-2">Localidade</th>
                                <th scope="col" className="px-4 py-2 text-right">Relatos</th>
                            </tr>
                        </thead>
                        <tbody>
                            {relatosLocalidade
                                .filter((relato) => relato.total_relatos > 0)
                                .map((relato, idx) => (
                                    <tr key={idx} className="border-t">
                                        <td className="px-4 py-2">{relato.localidade}</td>
                                        <td className="px-4 py-2 text-right">{relato.total_relatos}</td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

