import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import {
    supabase,
    sendNotification,
    withCorsHeaders
} from '../_shared/utils.ts'

Deno.serve(async (req) => {
    try {

        if (req.method === "OPTIONS") {
            return withCorsHeaders("", 204);
        }

        const { user_notificacao_id, confirmation } = await req.json();

        if (!user_notificacao_id || !confirmation) {
            return withCorsHeaders(`{"message": "missing confirmation or user_notificacao_id"}`, 400);
        }

        // 1. get user_notificacao
        const { data: userNotif, error: userNotifError } = await supabase
            .from("user_notificacao")
            .select("id, foi_confirmado, foi_resolvido, notificacao_id, user_id")
            .eq("id", user_notificacao_id)
            .single();

        if (userNotifError || !userNotif) {
            return withCorsHeaders(`{"message": "user_notificacao not found"}`, 404);
        }

        if (userNotif.foi_confirmado) {
            return withCorsHeaders(`{"message":"already confirmed"}`, 409);
        }

        if (userNotif.foi_resolvido) {
            return withCorsHeaders(`{"message":"already marked as resolved"}`, 409);
        }

        // 2. update foi_confirmado
        const { error: updateUserNotifError } = await supabase
            .from("user_notificacao")
            .update({ foi_confirmado: confirmation })
            .eq("id", user_notificacao_id);

        if (updateUserNotifError) {
            console.log(updateUserNotifError);
            return withCorsHeaders(`{"message":"failed to update user_notificacao"}`, 500);
        }

        if (!confirmation) {
            return withCorsHeaders(`{"message":"confirmation cancelled"}`, 200);
        }

        // 3. fetch notificacao
        const { data: notif, error: notifFetchError } = await supabase
            .from("notificacoes")
            .select("id, estado, n_confirmados, confirmacoes_necessarias, primeiro_relato")
            .eq("id", userNotif.notificacao_id)
            .single();

        if (notifFetchError || !notif) {
            return withCorsHeaders(`{"message":"notificacao not found"}`, 404);
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
            return withCorsHeaders(`{"message":"failed to update notificacao"}`, 500);
        }

        // 6. if estado changed to pendente, send broadcast
        if (notif.estado !== newEstado && newEstado === "pendente") {
            let newNotif = { ...notif, estado: newEstado };
            console.log("Sending notification to users");
            await sendNotification(newNotif);
        }

        return withCorsHeaders(`{"message":"confirmation updated successfully"}`, 200);
    } catch (err) {
        console.error(err);
        return withCorsHeaders(`{"message":"internal server error"}`, 500);
    }
});
