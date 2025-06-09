// Cleaner and leaner version of the Supabase Edge function
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import {
    supabase,
    sendNotification,
    getMinConfirmacoes,
    withCorsHeaders
} from '../_shared/utils.ts'

// Main handler for the edge function
Deno.serve(async (req) => {

    if (req.method === "OPTIONS") {
        return withCorsHeaders(null, 204);
    }

    try {
        const { localidade_id, user_id } = await req.json();
        const { data, error } = await supabase.from('users').select("*").eq("id", user_id).single();
        if (error != null) {
            console.error("User not found");
            return withCorsHeaders(`{ "message": "Usuário não foi encontrado" }`, 404);
        }

        const { data: localidade, error: localidadeError } = await supabase.from("localidades").select("id").eq("id", localidade_id).single();

        if (localidadeError || !localidade) {
            console.error("Localidade not found");
            return withCorsHeaders(`{ "message": "Localidade não encontrado" }`, 404);
        }

        const twelveHoursAgo = new Date(Date.now() - 12 * 3600 * 1000).toISOString();

        console.log("aqui1")

        const { data: recentRelatos, error: recentRelatoError } = await supabase
            .from("relatos")
            .select("id")
            .eq("user_id", user_id)
            .eq("id_localidade", localidade.id)
            .gt("created_at", twelveHoursAgo);

        console.log("aqui2")

        if (recentRelatoError) throw new Error("failed to check for recent relatos");

        if (recentRelatos.length > 0) {
            throw new Error("user already submitted a relato in the last 12 hours");
        }

        const { data: inserted, error: insertError } = await supabase.from("relatos").insert({
            user_id: user_id,
            id_localidade: localidade.id
        }).select();

        console.log("relato", inserted);

        if (insertError || !inserted) {
            console.error("Failed to insert relato", insertError);
            return withCorsHeaders(`{ "message": "Falha ao criar relato" }`, 500);
        }

        const newRelato = inserted[0];
        const { data: lastSituacao, error: errorLastSituacao } = await supabase
            .from('situacao_municipios')
            .select(`
                id,
                municipio_id,
                id_situacao,
                notificacao_id,
                created_at
              `)
            .eq('municipio_id', localidade.id_municipio)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        console.log("aqui4")

        if (lastSituacao?.id_situacao === 1) {
            const { data: notificacao, error: errorNotif } = await supabase
                .from('notificacoes')
                .select(`
                      id,
                      estado,
                      created_at,
                      n_confirmados,
                      confirmacoes_necessarias,
                      relato:relatos (
                        localidade_id,
                      )
                    `)
                .eq('id', lastSituacao.notificacao_id)
                .single();

            if (errorNotif) {
                console.error("Failed to fetch notificacao", errorNotif);
                return withCorsHeaders(`{ "message": "Falha ao buscar notificação" }`, 500);
            };

            console.log("notificacao", notificacao);

            notificacao.n_confirmados += 1;
            if (notificacao.estado === "em_confirmacao" && notificacao.n_confirmados >= notificacao.confirmacoes_necessarias) {
                notificacao.estado = "pendente";
            }
            const { data: a, error: e } = await supabase.from("notificacoes").update({
                n_confirmados: notificacao.n_confirmados,
                estado: notificacao.estado
            }).eq("id", notificacao.id);
            console.log(a, e);
            await sendNotification(notificacao);
        } else {
            console.log("municipio_id", localidade.municipio_id);
            const { count } = await supabase.from("user_municipios").select("*", {
                count: "exact",
                head: true
            }).eq("municipio_id", localidade.id_municipio).eq("e_moradia", true);

            console.log("count", count);

            const pool = getMinConfirmacoes(count || 0);
            console.log("pool", pool);
            const confirmacoes_necessarias = pool.min;
            const estado = confirmacoes_necessarias <= 1 ? "pendente" : "pendente_confirmacao";
            const { data: notifInsert, error: notifError } = await supabase.from("notificacoes").insert({
                n_confirmados: 1,
                estado: estado,
                confirmacoes_necessarias,
                primeiro_relato: newRelato.id
            }).select();
            if (notifError != null) {
                console.log(notifError);
                return withCorsHeaders(`{ "message": "Falha ao criar notificação" }`, 500);
            }
            await supabase.from("user_notificacao").insert({
                foi_confirmado: true,
                user_id: user_id,
                notificacao_id: notifInsert[0].id
            });

            console.log("notificação criada", notifInsert[0]);
            const notifWithRelato = { ...notifInsert[0], relato: newRelato };
            console.log("notificação com relato", notifWithRelato);
            await sendNotification(notifWithRelato, pool);
        }
        return withCorsHeaders(`{ "message": "Relato criado com sucesso" }`, 201);
    } catch (err) {
        console.error(err);
        return withCorsHeaders(`{ "message": "${err.message}" }`, 500);
    }
});
