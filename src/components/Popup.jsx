import React from "react";
import { useState, useEffect } from "react";

export default function Popup({ localidades = null, cidade, onConfirm, onClose, selfReport = true, localidade = null, setLocalidade = null }) {

    useEffect(() => {
        console.log("Popup mounted");
        console.log("Localidades:", localidades);
        console.log("Cidade:", cidade);
        console.log("Self Report:", selfReport);
        console.log("Localidade:", localidade);
    }, []);

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-md shadow-lg p-6 w-[90%] max-w-md">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">Relatar Problema</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                        aria-label="Fechar popup"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {selfReport ? (
                    <>
                        <div className="mb-4">
                            <p className="text-sm text-gray-600">
                                Você está relatando um problema na cidade de <strong>{cidade}</strong>.
                            </p>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2">Selecione a Localidade</label>
                            <select
                                value={localidade}
                                onChange={(e) => setLocalidade(e.target.value)}
                                className="w-full border border-gray-300 rounded-md p-2"
                            >
                                <option value="">Selecione uma localidade</option>
                                {localidades.map((loc) => (
                                    <option key={loc.id} value={loc.id}>
                                        {loc.nome}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </>
                ) : (
                    <div className="mb-4">
                        <p className="text-sm text-gray-600">
                            Você está relatando um problema na localidade selecionada.
                        </p>
                    </div>
                )}

                {(selfReport && (
                    <div className="flex justify-center">
                        <button
                            onClick={onConfirm}
                            disabled={!localidade}
                            className={`bg-blue-700 text-white px-6 py-2 rounded hover:bg-blue-800 ${!localidade ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                            Reportar Problema
                        </button>
                    </div>
                )) || (
                        <div className="flex justify-center gap-4">
                            <button
                                onClick={onConfirm}
                                className="bg-blue-700 text-white px-6 py-2 rounded hover:bg-blue-800"
                            >
                                SIM
                            </button>
                            <button
                                onClick={onClose}
                                className="bg-blue-700 text-white px-6 py-2 rounded hover:bg-blue-800"
                            >
                                NÃO
                            </button>
                        </div>
                    )}

            </div>
        </div>
    );
}
