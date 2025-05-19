import React from "react";
import { useState } from "react";
import { useEffect } from "react";
import supabase from "./utils/supabase";
import Header2 from "./components/Header2";

export default function Ajustes() {
    const [email, setEmail] = useState("");
    const [nome, setNome] = useState("");

    useEffect(() => {
        const fetchUserData = async () => {
            const { data, error } = await supabase.auth.getUser();
            if (error) {
                console.error("Error fetching user data:", error);
            } else {
                setEmail(data.user.email);
            }
            const {data: customUserData, error: customUserError} = await supabase
                .from('users')
                .select('*')
                .eq('id', data.user.id)
                .single();
            if (customUserError) {
                console.error("Error fetching custom user data:", customUserError);
            }
            setNome(customUserData.nome);
        };

        fetchUserData();
    }, []);

    const handleUpdate = async (e) => {
        e.preventDefault();

        const { data: { user } } = await supabase.auth.getUser()

        if (user.email !== email) {
            const { data, error } = await supabase.auth.updateUser({
                email: email,
            })
            console.log("Email updated:", data);
            if (error) {
                console.error("Error updating user data:", error);
            } else {
                alert("Dados atualizados com sucesso!");
            }
        }

        const { data: customUserData, error: customUserError } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single();

        console.log("Custom user data:", customUserData);
        console.log("nome:", nome);

        if (customUserData.nome == null) {
            const { data: userData, error: userError } = await supabase
                .from('users')
                .update({ nome: nome })
                .eq('id', customUserData.id)
                .select()

            if (userError) {
                console.error("Error updating user data:", userError);
            }

            console.log("User data updated:", userData);
        }
    }

    return (
        <div className="min-h-screen flex flex-col">
            <Header2 />
            <div className="flex justify-center mt-8 px-4">
                <div className="flex flex-col md:flex-row gap-12">
                    <form className="flex flex-col gap-4 w-80">
                        <div>
                            <label className="font-bold mb-2 block">*Nome</label>
                            <input
                                type="text"
                                placeholder="Nome"
                                className="border p-2 rounded w-full"
                                value={nome || ""}
                                onChange={(e) => setNome(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="font-bold mb-2 block">*Email</label>
                            <input
                                type="email"
                                placeholder="email"
                                className="border p-2 rounded w-full"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <button className="bg-blue-600 text-white py-2 rounded font-semibold mt-2"
                            onClick={handleUpdate}>
                            CONFIRMAR
                        </button>

                        <div>
                            <label className="font-bold mb-2 block">*Endereço</label>
                            <select className="border p-2 rounded w-full">
                                <option>BERTIOGA</option>
                                <option>CUBATÃO</option>
                                <option>GUARUJÁ</option>
                                <option>ITANHAÉM</option>
                                <option>MONGAGUÁ</option>
                                <option>PERUÍBE</option>
                                <option>PRAIA GRANDE</option>
                                <option>SANTOS</option>
                                <option>SÃO VICENTE</option>
                            </select>
                        </div>

                        <p className="text-sm mt-2 text-gray-600">*Campos obrigatórios</p>
                    </form>

                    <div className="flex flex-col gap-2">
                        <h3 className="font-bold">Cidades de interesse</h3>
                        <p className="text-sm text-gray-600 mb-2">
                            (você será notificado do estado do sistema de distribuição de cada cidade marcada como de interesse)
                        </p>
                        <form className="flex flex-col gap-2">
                            {["Peruíbe", "Itanhaém", "Mongaguá", "Praia Grande", "São Vicente", "Cubatão", "Santos", "Guarujá", "Bertioga"].map((cidade, index) => (
                                <label key={index} className="flex items-center gap-2">
                                    <input type="checkbox" className="accent-blue-600" />
                                    {cidade}
                                </label>
                            ))}
                        </form>
                    </div>
                </div>
            </div>

            <div className="border-2 border-red-500 border-dashed p-8 m-8">
                <h3 className="font-bold mb-4">APAGAR CONTA</h3>
                <button className="bg-red-600 text-white px-6 py-3 rounded font-bold">
                    DESEJO APAGAR A MINHA CONTA
                </button>
            </div>
        </div>
    );
}
