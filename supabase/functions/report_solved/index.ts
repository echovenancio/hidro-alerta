import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import {
    supabase,
    sendNotification,
    withCorsHeaders
} from '../_shared/utils.ts'

Deno.serve(async (req) => {
    try {

        if (req.method === "OPTIONS") {
            return withCorsHeaders(null, 204);
        }

        const { user_notificacao_id } = await req.json();

        // verify the user_notificacao exists and belongs to the user
        const { data: entry, error: fetchError } = await supabase
            .from("user_notificacao")
            .select("*")
            .eq("id", user_notificacao_id)
            .single();

        if (fetchError || !entry) {
            console.log("user_notificacao not found");
            return withCorsHeaders(`{"message": "notificação não encontrada"}`, 404);
        }

        console.log("entry", entry);

        if (entry.foi_resolvido) {
            return withCorsHeaders(`{"message": "já está marcada como resolvido"}`, 409);
        }

        // if the entry was created in the last 2 hours return because it is too soon
        const createdAt = new Date(entry.created_at);
        const now = new Date();

        const diff = now.getTime() - createdAt.getTime();
        const diffInHours = diff / (1000 * 60 * 60);

        if (diffInHours < 2) {
            return withCorsHeaders(`{"message": "muito cedo para marcar como resolvido"}`, 409);
        }

        const { error: updateError } = await supabase
            .from("user_notificacao")
            .update({ foi_resolvido: true })
            .eq("id", user_notificacao_id);

        if (updateError) {
            throw new Error("falha ao atualizar notificação");
        }

        console.log("noticação", entry);

        const { data: municipio, error: municipioError } = await supabase
            .from("notificacoes")
            .select(`id, relato:relatos(id, localidade:localidades(id, id_municipio))`)
            .eq("id", entry.notificacao_id)
            .single();

        if (municipioError || !municipio) {
            console.log(municipioError);
            return withCorsHeaders(`{"message": "notificação não encontrada"}`, 404);
        }

        console.log("municipio", municipio);

        const { data: situacaoId, error: situacaoError } = await supabase
            .from("situacao")
            .select("id")
            .eq("descricao", "verde")
            .single();

        if (situacaoError || !situacaoId) {
            console.error(situacaoError);
            return withCorsHeaders(`{"message": "situacao não encontrada"}`, 404);
        }

        console.log("situacao", situacaoId);

        const municipioId = municipio.relato.localidade.id_municipio;

        console.log("municipioId", municipioId);

        const { data: lastSituacao, error: lastSituacaoError } = await supabase
            .from("situacao_municipios")
            .select("id_situacao")
            .eq("municipio_id", municipioId)
            .order("created_at", { ascending: false })
            .limit(1);

        if (lastSituacaoError) {
            console.error(lastSituacaoError);
            return withCorsHeaders(`{"message": "falha ao buscar última situação do município"}`, 500);
        }

        console.log("lastSituacao", lastSituacao);

        if (lastSituacao[0]?.id_situacao === situacaoId.id) {
            return withCorsHeaders(`{"message": "já está marcada como resolvido"}`, 409);
        }

        const { data: situacaoMunicipio, error } = await supabase
            .from('situacao_municipios')
            .insert([
                { municipio_id: municipioId, id_situacao: situacaoId.id, notificacao_id: entry.notificacao_id },
            ])
            .select()
            .single();

        if (error) {
            console.error(error);
            return withCorsHeaders(`{"message": "falha ao inserir situação do município"}`, 500);
        }

        return withCorsHeaders(`{"message": "marcada como resolvida com sucesso", "situacao_id": ${situacaoMunicipio.id_situacao}}`, 200);
    } catch (err) {
        console.error(err);
        return withCorsHeaders(`{"message": "erro interno", "detail": "${String(err)}"}`, 500);
    }
});
