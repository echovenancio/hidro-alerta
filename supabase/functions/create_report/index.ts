// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from 'jsr:@supabase/supabase-js@2'

const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: `Bearer ${jwt}` } } }
)

// Will create a user_notificacao for each user that has a notification
async function sendNotification(notificacao) {
    if (notificacao.estado === "notificado") {
        return
    }

    const { data: muncipio } = await supabase.from("relatos").select("municipio_id").eq("id", notificacao.primeiro_relato).single()

    // Not general alert yet so send to random 10% of users in the city
    if (notificacao.estado === "em_confirmacao") {
        const { data: users, error } = await supabase.from("user_municipio")
            .select("user_id")
            .eq("municipio_id", muncipio.municipio_id)
            .eq("e_moradia", true)
            .order("random()")
            .limit(Math.ceil(notificacao.confirmacoes_necessarias * 0.1))

        if (error) {
            console.error("Error getting users:", error)
            return
        }

        for (const user of users) {
            await supabase.from("user_notificacao").insert({
                user_id: user.user_id,
                notificacao_id: notificacao.id
            })
        }
    } else if (notificacao.estado === "pendente") {
        // General alert, send to all users in the city
        const { data: users, error } = await supabase.from("user_municipio")
            .select("user_id")
            .eq("municipio_id", muncipio.municipio_id)
            .eq("e_moradia", true)

        if (error) {
            console.error("Error getting users:", error)
            return
        }

        for (const user of users) {
            await supabase.from("user_notificacao").insert({
                user_id: user.user_id,
                notificacao_id: notificacao.id
            })
        }
    }
}

Deno.serve(async (req) => {
    const { municipio_id } = await req.json()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return new Response("Unauthorized", { status: 401 })
    }

    if (user.role !== "authenticated") {
        return new Response("Forbidden", { status: 403 })
    }

    let { data: municipio, error } = await supabase.from("municipios").select("*").eq("id", municipio_id).single()

    if (!municipio) {
        return new Response("Municipio not found", { status: 404 })
    }

    let { data: report, error: error1 } = await supabase.from("relatos").insert({
        user_id: user.id,
        municipio_id: municipio.id
    })

    if (error1) {
        return new Response("Error creating report", { status: 500 })
    }

    let { data: reports_in_municipio, error: error2 } = await supabase.from("notificacoes")
        .select("id, created_at, n_confirmados, e_alerta_geral, confirmacoes_necessarias, relatos(municipio_id)")
        .eq("relatos.municipio_id", municipio.id)
        .where("created_at", ">", new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString())
        .single()

    if (error2) {
        return new Response("Error getting notifications", { status: 500 })
    }

    if (reports_in_municipio) {
        reports_in_municipio.n_confirmados += 1
        if (reports_in_municipio.estado == "em_confirmacao") {
            if (reports_in_municipio.n_confirmados >= reports_in_municipio.confirmacoes_necessarias) {
                reports_in_municipio.estado = "pendente"
            }
        }
        const { data: result, error: error3 } = await supabase.from("notificacoes")
            .update({
                n_confirmados: reports_in_municipio.n_confirmados,
                estado: reports_in_municipio.estado
            })
            .eq("id", reports_in_municipio.id)
        if (error3) {
            return new Response("Error updating notification", { status: 500 })
        }
        await sendNotification(reports_in_municipio)
    } else {
        const {data: pop_size, error: error4} = await supabase.from("user_municipio")
            .eq("municipio_id", municipio.id)
            .eq("e_moradia", true)
            .select("count(*)")

        if (error4) {
            return new Response("Error getting population size", { status: 500 })
        }

        const confirmacoes_necessarias = Math.ceil(pop_size[0].count * 0.05)
        let estado = "em_confirmacao"
        if (confirmacoes_necessarias <= 1) {
            estado = "pendente"
        }

        const { data: result, error: error5 } = await supabase.from("notificacoes").insert({
            municipio_id: municipio.id,
            n_confirmados: 1,
            estado: estado,
            confirmacoes_necessarias: confirmacoes_necessarias,
            primeiro_relato: report[0].id,
        })

        if (error5) {
            return new Response("Error creating notification", { status: 500 })
        }

        // create user notification
        const { data: user_notification, error: error6 } = await supabase.from("user_notificacao").insert({
            user_id: user.id,
            notificacao_id: result[0].id
        })

        if (error6) {
            return new Response("Error creating user notification", { status: 500 })
        }

        await sendNotification(result[0])
    }

    return new Response(
        "Relato created",
        { status: 201 },
    )
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/create_report' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
