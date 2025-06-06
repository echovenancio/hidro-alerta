import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "./components/Header";
import supabase from "./utils/supabase";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setError(error.message);
        } else {
            navigate("/mapa");
        }
    };

    return (
        <div>
            <Header />
            <div className="flex flex-col items-center justify-center h-screen">
                <h2 className="text-3xl font-bold mb-4">Login</h2>
                <form onSubmit={handleLogin} className="flex flex-col gap-4 w-80">
                    <input
                        type="email"
                        placeholder="*Email"
                        className="border p-2 rounded"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <input
                        type="password"
                        placeholder="*Senha"
                        className="border p-2 rounded"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    {error && <p className="text-red-500">{error}</p>}
                    <h6>* Campos obrigatórios</h6>
                    <button className="bg-black text-white py-2 rounded">Entrar</button>
                </form>
            </div>
        </div>
    );
}

