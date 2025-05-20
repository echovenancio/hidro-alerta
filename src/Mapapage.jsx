import React, { useState, useEffect } from "react";
import supabase from "./utils/supabase";
import Header2 from "./components/Header2";
import MapaBaixadaSantista from "./components/Mapa";
import Alertcard from "./components/Alertcard";
import ModalRelato from "./components/Popup";

export default function MapaPage() {
    const [cidadeSelecionada, setCidadeSelecionada] = useState(null);
    const [situacoes, setSituacoes] = useState([]);

    async function getSituacoes() {
        const { data: situacoes, error } = await supabase
            .from("ultima_situacao_por_municipio")
            .select("*")
        if (error) {
            console.error("Erro ao buscar dados:", error);
        }
        if (situacoes) {
            setSituacoes(situacoes);
        }
    }

    supabase.channel('custom-all-channel')
        .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'situacao_municipios' },
            (_) => {
                getSituacoes();
            }
        )
        .subscribe()

    supabase.channel('custom-insert-channel')
        .on(
            'postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'user_notificacao' },
            async (payload) => {

                console.log('Change received!', payload)

                let { data: user_notificacao, error } = await supabase
                    .from('user_notificacao')
                    .select(`
                        id,
                        relatos(
                            municipios(nome)
                            )
                    `)
                    .eq('id', payload.new.id)

                if (error) {
                    console.error("Erro ao buscar dados:", error);
                }

                console.log(user_notificacao);

                setCidadeSelecionada(user_notificacao[0].relatos.municipios.nome);
            }
        )
        .subscribe()

    useEffect(() => {
        getSituacoes();
        console.log(situacoes);
    }, [])

    useEffect(() => {
        console.log(situacoes);
    }, [situacoes]);

    const handleCidadeClick = (cidade) => {
        setCidadeSelecionada(cidade);
    };

    const handleConfirmarRelato = () => {
        console.log(`Problema relatado em ${cidadeSelecionada}`);
        setCidadeSelecionada(null);
    };

    const situacaoCores = {
        1: "vermelho",
        2: "amarelo",
        3: "verde", 
    };

    const situacaoMensagens = {
        1: "Sistema de distribuição de água interrompido.",
        2: "Confirmando problemas no sistema de distribuição de água.",
        3: "Sistema de distribuição de água normalizado.",
    };

    return (
        <div>
            <Header2 />
            <div className="flex p-6 gap-6">
                <div className="relative w-80 max-h-[80vh]">
                    <div className="flex flex-col gap-4 overflow-y-auto max-h-[80vh] pr-2">
                        {[...new Map(
                            situacoes
                                .filter(s => s.notificacao_id != null)
                                .map(s => [s.notificacao_id, s])
                        ).values()].map((situacao) => (
                            <div key={situacao.id_situacao} className="flex flex-col gap-4">
                                <Alertcard
                                    cidade={situacao.nome}
                                    mensagem={situacaoMensagens[situacao.id_situacao]}
                                    cor={situacaoCores[situacao.id_situacao]}
                                />
                            </div>
                        ))}
                    </div>

                    <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-white to-transparent" />
                </div>

                <div className="flex-1">
                    <MapaBaixadaSantista onCidadeClick={handleCidadeClick} situacoes={situacoes} />
                </div>
            </div>


            {cidadeSelecionada && (
                <ModalRelato
                    cidade={cidadeSelecionada}
                    onConfirm={handleConfirmarRelato}
                    onClose={() => setCidadeSelecionada(null)}
                />
            )}
        </div>
    );
}
