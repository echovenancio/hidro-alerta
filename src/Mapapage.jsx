import React, { useState, useEffect } from "react";
import supabase from "./utils/supabase";
import Header2 from "./components/Header2";
import MapaBaixadaSantista from "./components/Mapa";
import Alertcard from "./components/Alertcard";
import ModalRelato from "./components/Popup";

export default function MapaPage() {
    const [cidadeSelecionada, setCidadeSelecionada] = useState(null);
    const [situacoes, setSituacoes] = useState([]);
    const [popupData, setPopupData] = useState(null);
    const [notificacoes, setNotificacoes] = useState([]);

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

    async function confirmarRelato(user_notificacao_id, confirmation) {
        const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/confirm_report`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            },
            body: JSON.stringify({
                user_notificacao_id,
                confirmation
            }),
        })
        console.log("resp", resp);
    }

    async function getAllNotificacoes() {
        const { data: notificacoes, error } = await supabase
            .from("user_notificacao")
            .select(`*`)
            .order("created_at", { ascending: false });

        console.log("notificacoes", notificacoes);

        if (error) {
            console.log("Erro ao buscar dados:", error);
            return;
        }

        const lastNotificacoes = notificacoes.filter(n => n.foi_confirmado == null)[notificacoes.length - 1];
        console.log("lastNotificacoes", lastNotificacoes);

        if (!lastNotificacoes) {
            console.log("No new notifications");
            return;
        }

        const { data: data, error: errorRpc } = await supabase
            .rpc('get_municipio_nome_by_notificacao_id', { p_notificacao_id: lastNotificacoes.notificacao_id });

        if (errorRpc) {
            console.error("error fetching data:", error);
            return;
        }

        console.log("data fetched:", data);

        setPopupData({
            id: data[0].id,
            cidade: data[0].nome,
            selfReport: false,
            onClose: async () => {
                console.log(`Problema relatado em ${data.nome}`);
                await confirmarRelato(lastNotificacoes.id, false);
                setPopupData(null);
            },
            onConfirm: async () => {
                console.log(`Problema relatado em ${data.nome}`);
                await confirmarRelato(lastNotificacoes.id, true);
                setPopupData(null);
            }
        });


        if (notificacoes) {
            setNotificacoes(notificacoes);
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

    useEffect(() => {
        const sub = supabase.channel('custom-insert-channel')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'user_notificacao' },
                async (payload) => {
                    console.log('change received!', payload);

                    const { data: data, error: error } = await supabase
                        .rpc('get_municipio_nome_by_notificacao_id', { p_notificacao_id: payload.new.notificacao_id });

                    if (error) {
                        console.error("error fetching data:", error);
                        return;
                    }

                    console.log("data fetched:", data);

                    let not = data[0];

                    console.log("not", not)

                    setPopupData({
                        id: not.id,
                        cidade: not.nome,
                        selfReport: false,
                        onClose: async () => {
                            console.log(`Problema relatado em ${not.nome}`);
                            await confirmarRelato(payload.new.id, false);
                            setPopupData(null);
                        },
                        onConfirm: async () => {
                            console.log(`Problema relatado em ${not.nome}`);
                            await confirmarRelato(payload.new.id, true);
                            setPopupData(null);
                        }
                    });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(sub);
        };
    }, []);


    useEffect(() => {
        getSituacoes();
        getAllNotificacoes();
        console.log(situacoes);
    }, [])

    useEffect(() => {
        console.log(situacoes);
        console.log(notificacoes);
    }, [situacoes, notificacoes]);

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
                    <MapaBaixadaSantista onCidadeClick={handleCidadeClick} situacoes={situacoes} popupData={popupData} />
                </div>
            </div>

        </div>
    );
}
