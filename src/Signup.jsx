import React from "react";
import Header from "./components/Header";
import supabase from "./utils/supabase";
import { useNavigate } from "react-router-dom";

export default function Signup() {

    const navigate = useNavigate();

    const [email, setEmail] = React.useState("");
    const [name, setName] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [error, setError] = React.useState("");

    async function signup() {
        setError(null);

        const res = await supabase.auth.signUp({
            email: email,
            password: password,
        })

        if (res.error) {
            setError(res.error.message);
            console.error("Erro ao cadastrar:", res.error.message);
        }

        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        })

        if (error) {
            setError(error.message);
            console.error("Erro ao fazer login:", error.message);
            return;
        }

        navigate("/post-signup");
    }

    return (
        <div>
            <Header />
            <div className="flex flex-col items-center justify-center h-screen">
                <h2 className="text-3xl font-bold mb-4">Signup</h2>
                <form className="flex flex-col gap-4 w-80">
                    <input
                        type="email"
                        placeholder="*Email"
                        className="border p-2 rounded"
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <input
                        type="name"
                        placeholder="*Nome"
                        className="border p-2 rounded"
                        onChange={(e) => setName(e.target.value)}
                    />
                    <input
                        type="password"
                        placeholder="*Senha"
                        className="border p-2 rounded"
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <h6>* Campos obrigatórios</h6>
                    <button className="bg-black text-white py-2 rounded"
                        onClick={(e) => {
                            e.preventDefault();
                            signup();
                        }}>Cadastrar</button>
                    {error && <p className="text-red-500">{error}</p>}
                </form>
            </div>
        </div>
    );
}
