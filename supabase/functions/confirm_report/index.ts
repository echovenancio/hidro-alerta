import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import {
    supabase,
    sendNotification
} from '../_shared/utils.ts'

Deno.serve(async (req) => {
    try {
        const { user_notificacao_id } = await req.json();

        if (!user_notificacao_id) {
            return new Response(`{"message": "missing user_id or user_notificacao_id"}`, { status: 400 });
        }

        // 1. get user_notificacao
        const { data: userNotif, error: userNotifError } = await supabase
            .from("user_notificacao")
            .select("id, foi_confirmado, notificacao_id, user_id")
            .eq("id", user_notificacao_id)
            .single();

        if (userNotifError || !userNotif) {
            return new Response(`{"message": "user_notificacao not found"}`, { status: 404 });
        }

        if (userNotif.foi_confirmado) {
            return new Response(`{"message":"already confirmed"}`, { status: 409 });
        }

        // 2. update foi_confirmado
        const { error: updateUserNotifError } = await supabase
            .from("user_notificacao")
            .update({ foi_confirmado: true })
            .eq("id", user_notificacao_id);

        if (updateUserNotifError) {
            console.log(updateUserNotifError);
            return new Response(`{"message":"failed to confirm"}`, { status: 500 });
        }

        // 3. fetch notificacao
        const { data: notif, error: notifFetchError } = await supabase
            .from("notificacoes")
            .select("id, estado, n_confirmados, confirmacoes_necessarias, primeiro_relato")
            .eq("id", userNotif.notificacao_id)
            .single();

        if (notifFetchError || !notif) {
            return new Response(`{"message":"notificacao not found"}`, { status: 404 });
        }

        // 4. increment n_confirmados
        notif.n_confirmados += 1;

        let newEstado = notif.estado;

        if (notif.estado === "em_confirmacao" && notif.n_confirmados >= notif.confirmacoes_necessarias) {
            newEstado = "pendente";
        }

        // 5. update notificacao
        const { error: updateNotifError } = await supabase
            .from("notificacoes")
            .update({
                n_confirmados: notif.n_confirmados,
                estado: newEstado,
            })
            .eq("id", notif.id);

        if (updateNotifError) {
            console.log(updateNotifError);
            return new Response(`{"message":"failed to update notificacao"}`, { status: 500 });
        }

        // 6. if estado changed to pendente, send broadcast
        if (notif.estado !== newEstado && newEstado === "pendente") {
            let newNotif = {...notif, estado: newEstado };
            console.log("Sending notification to users");
            await sendNotification(newNotif);
        }

        return new Response(`{"message":"confirmation complete"}`, { status: 200 });
    } catch (err) {
        console.error(err);
        return new Response(`{"message":"internal server error"}`, { status: 500 });
    }
});
