import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "./utils/supabase";

export default function BaixadaQuestion() {
    const navigate = useNavigate();

    const [isFromBaixada, setIsFromBaixada] = useState(false);
    const [selectedCity, setSelectedCity] = useState("");
    const [error, setError] = useState("");

    const cities = [
        "Santos",
        "São Vicente",
        "Guarujá",
        "Praia Grande",
        "Cubatão",
        "Mongaguá",
        "Itanhaém",
        "Peruíbe",
        "Bertioga",
    ];

    const handleMoradiaUpdate = async (e) => {
        setError(null);
        if (!isFromBaixada) {
            return navigate("/mapa");
        }
        if (!selectedCity) {
            setError("Por favor, selecione uma cidade.");
            return;
        }
        const { data: { user } } = await supabase.auth.getUser()
        const { data: { session } } = await supabase.auth.getSession()
        console.log("id", user.id);
        console.log("new moradia", e.target.value);
        const jwt = session.access_token;
        console.log("jwt", session.access_token);
        const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/change_moradia`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${jwt}`,
            },
            body: JSON.stringify({
                user_id: user.id,
                new_moradia: e.target.value,
            }),
        })

        console.log(resp);
        return navigate("/mapa");
    }

    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <div className="flex flex-col gap-4 w-80">
                <label className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={isFromBaixada}
                        onChange={(e) => setIsFromBaixada(e.target.checked)}
                    />
                    Você é morador da baixada santista?
                </label>

                {error && <p className="text-red-500">{error}</p>}

                {isFromBaixada && (
                    <select
                        value={selectedCity}
                        onChange={(e) => setSelectedCity(e.target.value)}
                        className="border p-2 rounded"
                    >
                        <option value="">Selecione sua cidade</option>
                        {cities.map((city) => (
                            <option key={city} value={city}>
                                {city}
                            </option>
                        ))}
                    </select>
                )}

                <button className="bg-black text-white py-2 rounded"
                    onClick={(e) => {
                        e.preventDefault();
                        handleMoradiaUpdate({ target: { value: selectedCity || "Não informado" } });
                    }}
                >Salvar</button>
            </div>
        </div>
    );
}
