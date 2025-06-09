import { Monitor } from "lucide-react";

export default function AlertaCard({ cidade, status, mensagem, cor }) {
  const cores = {
    vermelho: "bg-red-600",
    amarelo: "bg-yellow-300",
    verde: "bg-green-500"
  };

  return (
    <div className={`flex w-72 rounded-xl shadow mb-4`}>
      <div className={`w-4 rounded-l-xl ${cores[cor]}`} />
      <div className="flex-1 p-3 bg-white">
        <div className="flex items-center justify-between mb-1">
          <h2 className="font-bold">{cidade}</h2>
          <Monitor size={16} />
        </div>
        <p className="text-sm">{mensagem}</p>
      </div>
    </div>
  );
}
