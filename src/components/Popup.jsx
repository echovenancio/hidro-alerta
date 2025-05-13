import React from "react";

export default function Popup({ cidade, onConfirm, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-md shadow-lg p-6 w-[90%] max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Relatar Problema</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-black">
            &#x2715;
          </button>
        </div>
        <p className="mb-4 text-center">
          Você detectou problemas no sistema de distribuição de água no município de{" "}
          <span className="text-blue-600 font-semibold underline">{cidade}</span>?
        </p>
        <div className="flex justify-center">
          <button
            onClick={onConfirm}
            className="bg-blue-700 text-white px-6 py-2 rounded hover:bg-blue-800"
          >
            SIM
          </button>
        </div>
      </div>
    </div>
  );
}