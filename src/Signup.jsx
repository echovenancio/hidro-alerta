import React from "react";
import Header from "./components/Header";

export default function Signup() {
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
          />
          <input
            type="name"
            placeholder="*Nome"
            className="border p-2 rounded"
          />
          <input
            type="password"
            placeholder="*Senha"
            className="border p-2 rounded"
          />
          <h6>* Campos obrigatórios</h6>
          <button className="bg-black text-white py-2 rounded">Cadastrar</button>
        </form>
      </div>
    </div>
  );
}