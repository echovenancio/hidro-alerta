import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import {
    supabase,
    sendNotification
} from '../_shared/utils.ts'

Deno.serve(async (req) => {
    try {
        const { user_notificacao_id } = await req.json();

        // verify the user_notificacao exists and belongs to the user
        const { data: entry, error: fetchError } = await supabase
            .from("user_notificacao")
            .select("*")
            .eq("id", user_notificacao_id)
            .single();

        if (fetchError || !entry) {
            console.log("user_notificacao not found");
            return new Response(
                JSON.stringify({ message: "notificação não encontrada" }),
                { status: 404 }
            );
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
            .select(`relato:relatos(id, municipio_id)`)
            .eq("id", entry.notificacao_id)
            .single();

        if (municipioError || !municipio) {
            console.error(municipioError);
            return new Response(
                JSON.stringify({ message: "notificacao não encontrada" }),
                { status: 404 }
            );
        }

        console.log("municipio", municipio);

        const { data: situacaoId, error: situacaoError } = await supabase
            .from("situacao")
            .select("id")
            .eq("descricao", "verde")
            .single();

        if (situacaoError || !situacaoId) {
            console.error(situacaoError);
            return new Response(
                JSON.stringify({ message: "situacao não encontrada" }),
                { status: 404 }
            );
        }

        console.log("situacao", situacaoId);

        const {data: lastSituacao, error: lastSituacaoError} = await supabase
            .from("situacao_municipios")
            .select("id_situacao")
            .eq("municipio_id", municipio.relato.municipio_id)
            .order("created_at", { ascending: false })
            .limit(1);

        if (lastSituacao[0]?.id_situacao === situacaoId.id) {
            return new Response(
                JSON.stringify({ message: "já está marcada como resolvido" }),
                { status: 409 }
            );
        }

        const { data: situacaoMunicipio, error } = await supabase
            .from('situacao_municipios')
            .insert([
                { municipio_id: municipio.relato.municipio_id, id_situacao: situacaoId.id, notificacao_id: entry.notificacao_id },
            ])
            .select()
            .single();

        if (error) {
            console.error(error);
            return new Response(
                JSON.stringify({ message: "situacao_municipio não encontrada" }),
                { status: 404 }
            );
        }

        return new Response(
            JSON.stringify({ message: "marcada como resolvida com sucesso" }),
            { status: 200 }
        );
    } catch (err) {
        console.error(err);
        return new Response(
            JSON.stringify({ message: "erro interno", detail: String(err) }),
            { status: 500 }
        );
    }
});
