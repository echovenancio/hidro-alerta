import { useState, useEffect } from "react";
import supabase from "./utils/supabase";
import Header2 from "./components/Header2";
import MapaBaixadaSantista from "./components/Mapa";
import Alertcard from "./components/Alertcard";
import OldNotifBar from "./components/OldNotifBar";

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

const LegendDot = ({ color }) => (
    <span
        style={{
            display: "inline-block",
            width: 16,
            height: 16,
            borderRadius: "50%",
            backgroundColor: color,
            border: "1px solid #333",
        }}
    />
);


export default function MapaPage() {
    const [cidadeSelecionada, setCidadeSelecionada] = useState(null);
    const [situacoes, setSituacoes] = useState([]);
    const [popupData, setPopupData] = useState(null);
    const [notificacoes, setNotificacoes] = useState([]);
    const [loggedIn, setLoggedIn] = useState(false);
    const [showPrevNotifs, setShowPrevNotifs] = useState(false);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setLoggedIn(!!session);
        });

        const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
            setLoggedIn(!!session);
        });

        return () => listener.subscription?.unsubscribe?.();
    }, []);

    useEffect(() => {
        const sub = supabase.channel('custom-all-channel')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'situacao_municipios',
            }, getSituacoes)
            .subscribe();

        return () => supabase.removeChannel(sub);
    }, []);

    useEffect(() => {
        getSituacoes();
        getAllNotificacoes();

        if (!loggedIn) return;

        const sub = supabase.channel('custom-insert-channel')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'user_notificacao',
            }, async ({ new: notif }) => {

                setNotificacoes(prev => [notif, ...prev]);

                console.log("Nova notificação recebida:", notif);

                if (notif.foi_confirmado) return;

                const { data, error } = await supabase.rpc(
                    'get_municipio_nome_by_notificacao_id',
                    { p_notificacao_id: notif.notificacao_id }
                );

                if (error) {
                    console.log("Erro ao buscar dados da notificação:", error);
                    return;
                } 

                console.log("Dados da notificação:", data);

                const cidade = data?.[0];
                if (!cidade) return;

                setPopupData({
                    id: cidade.id,
                    cidade: cidade.nome,
                    selfReport: false,
                    onClose: () => handleConfirm(notif.id, false),
                    onConfirm: () => handleConfirm(notif.id, true),
                });

                console.log("Notificações atualizadas:", notif);
            })
            .subscribe();

        return () => supabase.removeChannel(sub);
    }, [loggedIn]);

    const getSituacoes = async () => {
        const { data, error } = await supabase
            .from("ultima_situacao_por_municipio")
            .select("*");

        if (error) console.error("erro situacoes:", error);
        else setSituacoes(data);
    };

    const getAllNotificacoes = async () => {
        const { data: ret, error } = await supabase
            .from("user_notificacao")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) return console.error("erro notifs:", error);
        setNotificacoes(ret);

        const last = ret.find(n => n.foi_confirmado == null);
        if (!last) return;

        const { data, error: rpcErr } = await supabase.rpc(
            'get_municipio_nome_by_notificacao_id',
            { p_notificacao_id: last.notificacao_id }
        );

        if (rpcErr || !data?.length) return;

        setPopupData({
            id: data[0].id,
            cidade: data[0].nome,
            selfReport: false,
            onClose: () => handleConfirm(last.id, false),
            onConfirm: () => handleConfirm(last.id, true),
        });
    };

    const handleConfirm = async (id, confirmation) => {
        await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/confirm_report`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            },
            body: JSON.stringify({ user_notificacao_id: id, confirmation }),
        });
        setPopupData(null);
        getAllNotificacoes();
    };

    const alertCards = [...new Map(
        situacoes.filter(s => s.notificacao_id != null).map(s => [s.notificacao_id, s])
    ).values()];

    return (
        <div>
            <Header2 />
            <div className="flex p-6 gap-6">
                <div className="relative w-80 max-h-[80vh]">
                    <div className="flex flex-col gap-4 overflow-y-auto max-h-[80vh] pr-2">
                        {alertCards.map((s) => (
                            <Alertcard
                                key={s.id_situacao}
                                cidade={s.nome}
                                mensagem={situacaoMensagens[s.id_situacao]}
                                cor={situacaoCores[s.id_situacao]}
                            />
                        ))}
                    </div>
                    <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-white to-transparent" />
                </div>

                <div className="flex-1">

                    <MapaBaixadaSantista
                        loggedIn={loggedIn}
                        onCidadeClick={setCidadeSelecionada}
                        situacoes={situacoes}
                        popupData={popupData}
                    />

                    <div className="mt-4 flex gap-4 items-center text-sm text-gray-600">
                        <LegendDot color="red" />
                        <span>problema confirmado</span>
                        <LegendDot color="yellow" />
                        <span>estamos confirmando relatos</span>
                        <LegendDot color="green" />
                        <span>tudo certo</span>
                    </div>
                </div>
            </div>

            {loggedIn && (
                <button
                    onClick={() => setShowPrevNotifs(true)}
                    className="fixed bottom-4 right-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full shadow-lg z-30"
                >
                    notificações
                </button>
            )}

            {showPrevNotifs && (
                <OldNotifBar
                    notifs={notificacoes}
                    onClose={() => setShowPrevNotifs(false)}
                />
            )}

        </div>
    );
}
