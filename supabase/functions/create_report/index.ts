// Cleaner and leaner version of the Supabase Edge function
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import {
    supabase,
    sendNotification,
    getMinConfirmacoes
} from '../_shared/utils.ts'

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

        const twelveHoursAgo = new Date(Date.now() - 12 * 3600 * 1000).toISOString();

        console.log("aqui1")

        const { data: recentRelatos, error: recentRelatoError } = await supabase
            .from("relatos")
            .select("id")
            .eq("user_id", user_id)
            .eq("municipio_id", municipio.id)
            .gt("created_at", twelveHoursAgo);

        console.log("aqui2")

        if (recentRelatoError) throw new Error("failed to check for recent relatos");

        if (recentRelatos.length > 0) {
            throw new Error("user already submitted a relato in the last 12 hours");
        }

        const { data: inserted, error: insertError } = await supabase.from("relatos").insert({
            user_id: user_id,
            municipio_id: municipio.id
        }).select();

        console.log("aqui3")

        if (insertError || !inserted) {
            console.error("Failed to insert relato");
            return new Response(`{ "message": "Falha ao criar relato" } `, {
                status: 500
            });
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
            .eq('municipio_id', municipio.id)
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
                      primeiro_relato,
                      relato:relatos (
                        municipio_id
                      )
                    `)
                .eq('id', lastSituacao.notificacao_id)
                .single();

            if (errorNotif) throw errorNotif;

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
            console.log("municipio_id", municipio.id);
            const { count } = await supabase.from("user_municipios").select("*", {
                count: "exact",
                head: true
            }).eq("municipio_id", municipio.id).eq("e_moradia", true);

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
                return new Response(`{ "message": "Falha ao criar relato" } `, {
                    status: 500
                });
            }
            await supabase.from("user_notificacao").insert({
                foi_confirmado: true,
                user_id: user_id,
                notificacao_id: notifInsert[0].id
            });
            await sendNotification(notifInsert[0], pool);
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
