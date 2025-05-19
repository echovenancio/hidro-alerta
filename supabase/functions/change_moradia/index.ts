import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import {
    supabase,
    sendNotification
} from '../_shared/utils.ts'


Deno.serve(async (req) => {

    if (req.method === 'OPTIONS') {
        return new Response(null, {
            status: 204,
            headers: {
                'Access-Control-Allow-Origin': '*', // or your origin
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            },
        })
    }


    try {
        const body = await req.json();
        const user_id = body.user_id;
        const new_moradia = body.new_moradia;

        let moradia = new_moradia.toLowerCase();

        console.log("moradia", moradia);
        console.log("user_id", user_id);

        if (!user_id || !moradia) {
            return new Response(`{"message": "missing user_id or moradia"}`, { status: 400 });
        }

        console.log("aqui")

        let moradia_id = "";

        const { data: municipios, errorMunicipios } = await supabase
            .from("municipios")
            .select("id, nome")

        console.log("municipios", municipios);

        if (!municipios.some((m) => m.nome.toLowerCase() === moradia)) {
            return new Response(`{"message": "invalid moradia"}`, { status: 400 });
        } else {
            moradia_id = municipios.find((m) => m.nome.toLowerCase() === moradia)?.id;
        }

        console.log("moradia_id", moradia_id);

        const { data: lastMoradia, error: lastMoradiaError } = await supabase
            .from("user_municipios")
            .select("*")
            .eq("user_id", user_id);

        console.log("lastMoradia", lastMoradia);

        if (lastMoradia.length > 0) {
            const { data: lastMoradiaUpdate, error: lastMoradiaErrorUpdate } = await supabase
                .from("user_municipios")
                .update({ e_moradia: false })
                .eq("user_id", user_id);
            if (lastMoradiaError) {
                console.error(lastMoradiaError);
                return new Response(`{"message":"failed to update last moradia"}`, { status: 500 });
            }
        }

        const { data: newMoradia, error: newMoradiaError } = await supabase
            .from("user_municipios")
            .insert({
                user_id,
                municipio_id: moradia_id,
                e_moradia: true
            })
            .single();

        if (newMoradiaError) {
            console.error(newMoradiaError);
            return new Response(`{"message":"failed to insert new moradia"}`, { status: 500 });
        }

        return new Response(`{"message":"success"}`, { status: 200 });

    } catch (err) {
        console.error(err);
        return new Response(`{"message":"internal server error"}`, { status: 500 });
    }
});
