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

    return (
        <div>
            <Header2 />
            <div className="flex p-6 gap-6">
                <div className="flex flex-col gap-4 w-80">
                    {situacoes.map((situacao) => {
                        if (situacao.notificacao_id != null) {
                            return (
                                <div key={situacao.id_situacao} className="flex flex-col gap-4">
                                    <Alertcard
                                        cidade={situacao.nome}
                                        mensagem="Sistema de distribuição de água interrompido."
                                        cor={situacao.id_situacao === 1 ? "vermelho" : "amarelo"}
                                    />
                                </div>
                            );
                        }
                    })}
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
