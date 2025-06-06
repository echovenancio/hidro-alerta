import { useState, useEffect } from 'react';
import supabase from '../utils/supabase';

export default function OldNotifBar({ notifs, onClose }) {

    const [oldNotifs, setOldNotifs] = useState([]);

    const handleResolvedNotig = async (id) => {

        if (!id) {
            console.error("Notification ID is required to resolve a notification.");
            return;
        }

        const { data: { user } } = await supabase.auth.getUser()
        const { data: { session } } = await supabase.auth.getSession()
        const jwt = session.access_token;
        const { data, error } = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/report_solved`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${jwt}`,
            },
            body: JSON.stringify({
                user_notificacao_id: id,
            }),
        })

        if (error) {
            console.error("Error resolving notification:", error);
            return;
        }

        setOldNotifs((prevNotifs) => prevNotifs.map((notif) => {
            if (notif.id !== id) return notif;
            else return { ...notif, foi_resolvido: true }
        }));
    }

    useEffect(() => {
        const fetchMunicipios = async () => {
            const results = await Promise.all(
                notifs.map(async (notif) => {
                    const { data, error } = await supabase.rpc(
                        'get_municipio_nome_by_notificacao_id',
                        { p_notificacao_id: notif.notificacao_id }
                    );

                    if (error) {
                        console.error("Error fetching notification data:", error);
                        return { ...notif, cidade: "Desconhecido" };
                    }

                    return { ...notif, cidade: data?.[0]?.nome || "Desconhecido" };
                })
            );

            setOldNotifs(results);
        };

        if (notifs.length) fetchMunicipios();
    }, [notifs]);


    return (
        <>
            <div
                className="fixed inset-0 bg-gray-800 bg-opacity-50 z-40 h-screen w-screen"
                onClick={onClose}
                aria-hidden="true"
            />

            <div className="fixed top-0 right-0 bg-white shadow-lg p-4 z-50 h-screen overflow-y-auto w-80">
                <div
                    className="flex justify-end mb-4 cursor-pointer"
                >
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                        aria-label="Fechar notificações"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div
                    className="flex flex-col gap-4"
                >
                    {oldNotifs.map((notif) => {
                        console.log("notif", notif);
                        const hashId = btoa(notif.id).slice(0, 8);
                        const isUnconfirmed = notif.foi_confirmado === false;
                        const isResolved = notif.foi_resolvido === true;

                        return (
                            <div
                                key={notif.id}
                                className={`relative p-4 rounded-xl flex items-start justify-between bg-white shadow-lg mb-3 border border-gray-200 ${isUnconfirmed ? 'border-l-8 border-red-500' : ''
                                    }`}
                            >
                                {/* resolved banner */}
                                {isResolved && (
                                    <div className="absolute -right-4 top-6 rotate-45 bg-green-500 text-white text-[16px] px-2 py-[1px] font-bold shadow-md">
                                        RESOLVIDO
                                    </div>
                                )}

                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800">{notif.cidade}</h3>
                                    <p className="text-sm text-gray-500 mt-1">id: #{hashId}</p>
                                    <p className="text-xs text-gray-400">
                                        {new Date(notif.created_at).toLocaleString()}
                                    </p>
                                </div>

                                {/* resolve button */}
                                {!isResolved && (
                                    <button
                                        aria-label="Notificação resolvida"
                                        className="ml-4 mt-1 hover:scale-110 transition-transform"
                                        onClick={() => handleResolvedNotig(notif.id)}
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-6 w-6 text-green-500"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                            strokeWidth={2}
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </>
    )
}
