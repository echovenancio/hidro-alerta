import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "./utils/supabase";

export default function BaixadaQuestion() {

    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <div className="flex flex-col gap-4 w-80">
                <h2 
                    className="text-lg font-semibold text-center"
                >
                    Email de confirmação enviado!
                </h2>
            </div>
        </div>
    );
}
