// Cleaner and leaner version of the Supabase Edge function
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.42.4';

const supabase = createClient(Deno.env.get('SUPABASE_URL'), Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'));
// Helper function to shuffle an array
function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [
            arr[j],
            arr[i]
        ];
    }
    return arr;
}
// Fetch municipio_id from "relatos" table
async function getMunicipioId(relatoId) {
    const { data, error } = await supabase.from("relatos").select("municipio_id").eq("id", relatoId).single();
    if (error) throw new Error("Failed to get municipio");
    return data.municipio_id;
}
// Insert rows into "user_notificacao" table
async function insertUserNotificacoes(userIds, notificacaoId) {
    // get existing entries
    const { data: existing, error: selectError } = await supabase
        .from("user_notificacao")
        .select("user_id")
        .eq("notificacao_id", notificacaoId);

    if (selectError) throw new Error("Failed to check existing user_notificacao");

    const existingIds = new Set(existing.map((r) => r.user_id));
    const newRows = userIds
        .filter((id) => !existingIds.has(id))
        .map((user_id) => ({
            user_id,
            notificacao_id: notificacaoId
        }));

    if (newRows.length === 0) return;

    const { error: insertError } = await supabase
        .from("user_notificacao")
        .insert(newRows);

    if (insertError) throw new Error("Failed to insert user_notificacao");
}

// Fetch target users for a municipio
async function getTargetUsers(municipioId, percent = 1.0) {
    const { data, error } = await supabase.from("user_municipios").select("user_id").eq("municipio_id", municipioId).eq("e_moradia", true);
    if (error != null) {
        console.log(error);
        throw new Error("Failed to fetch users");
    }
    const limit = Math.ceil(data.length * percent);
    return shuffle(data).slice(0, limit).map((u) => u.user_id);
}
// Send notification logic
async function sendNotification(notification) {
    if ([
        "notificado",
        "em_confirmacao"
    ].includes(notification.estado)) return;
    const municipioId = await getMunicipioId(notification.primeiro_relato);
    const percent = notification.estado === "pendente_confirmacao" ? 0.1 : 1.0;
    const users = await getTargetUsers(municipioId, percent);
    await insertUserNotificacoes(users, notification.id);
    if (notification.estado === "pendente") {
        const { error } = await supabase.from("notificacoes").update({
            estado: "notificado"
        }).eq("id", notification.id);
        if (error) {
            console.log(error);
            throw new Error("Failed to update notification");
        }
    } else {
        const { error } = await supabase.from("notificacoes").update({
            estado: "em_confirmacao"
        }).eq("id", notification.id);
        if (error) {
            console.log(error);
            throw new Error("Failed to update notification");
        }
    }
}
// Main handler for the edge function
Deno.serve(async (req) => {
    try {
        const { municipio_id, user_id } = await req.json();
        const { data, error } = await supabase.from('users').select("*").eq("id", user_id).single();
        if (error != null) {
            console.error("User not found");
            return new Response(`{ "message": "Usuario não foi encontrado"} `, {
                status: 404
            });
        }
        const { data: municipio, error: municipioError } = await supabase.from("municipios").select("id").eq("id", municipio_id).single();
        if (municipioError || !municipio) {
            console.error("Municipio not found");
            return new Response(`{ "message": "Municipio não encontrado" } `, {
                status: 404
            });
        }
        const { data: inserted, error: insertError } = await supabase.from("relatos").insert({
            user_id: user_id,
            municipio_id: municipio.id
        }).select();
        if (insertError || !inserted) {
            console.error("Failed to insert relato");
            return new Response(`{ "message": "Falha ao criar relato" } `, {
                status: 500
            });
        }
        const newRelato = inserted[0];
        const cutoff = new Date(Date.now() - 2 * 3600 * 1000).toISOString();
        const { data: existingNotif, errorExistingNotif } = await supabase.from('notificacoes').select(`
    id,
    primeiro_relato,
    n_confirmados,
    estado,
    confirmacoes_necessarias,
    relato:relatos (
      id,
      municipio_id
    )
  `).gt("created_at", cutoff);
        if (errorExistingNotif) {
            console.log(errorExistingNotif);
        } else {
            console.log(existingNotif);
        }
        // filter client-side
        const filteredNotif = existingNotif?.find((notif) => notif.relato?.municipio_id === municipio.id);
        console.log(filteredNotif);
        if (filteredNotif) {
            filteredNotif.n_confirmados += 1;
            if (filteredNotif.estado === "em_confirmacao" && existingNotif.n_confirmados >= filteredNotif.confirmacoes_necessarias) {
                filteredNotif.estado = "pendente";
            }
            const { data: a, error: e } = await supabase.from("notificacoes").update({
                n_confirmados: filteredNotif.n_confirmados,
                estado: filteredNotif.estado
            }).eq("id", filteredNotif.id);
            console.log(a, e);
            await sendNotification(filteredNotif);
        } else {
            const { count } = await supabase.from("user_municipio").select("*", {
                count: "exact",
                head: true
            }).eq("municipio_id", municipio.id).eq("e_moradia", true);
            const confirmacoes_necessarias = Math.ceil((count || 0) * 0.05);
            const estado = confirmacoes_necessarias <= 1 ? "pendente" : "pendente_confirmacao";
            const { data: notifInsert, error: notifError } = await supabase.from("notificacoes").insert({
                n_confirmados: 1,
                estado: estado,
                confirmacoes_necessarias,
                primeiro_relato: newRelato.id
            }).select();
            if (notifError != null) {
                console.log(notifError);
                return new Response(`{ "message": "Falha ao criar relato" } `, {
                    status: 500
                });
            }
            await supabase.from("user_notificacao").insert({
                foi_confirmado: true,
                user_id: user_id,
                notificacao_id: notifInsert[0].id
            });
            await sendNotification(notifInsert[0]);
        }
        return new Response(`{ "message": "Relato criado com sucesso" } `, {
            status: 201
        });
    } catch (err) {
        console.error(err);
        return new Response(`{ "message": "${err}" } `, {
            status: 500
        });
    }
});
