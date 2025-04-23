// cleaner, leaner version of the original supabase edge function

import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from 'jsr:@supabase/supabase-js@2'

const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: `Bearer ${Deno.env.get("SERVICE_ROLE_KEY")}` } } }
)

async function getMunicipioId(relatoId: number) {
    const { data, error } = await supabase.from("relatos")
        .select("municipio_id")
        .eq("id", relatoId)
        .single()
    if (error) throw new Error("Failed to get municipio")
    return data.municipio_id
}

async function insertUserNotificacoes(userIds: string[], notificacaoId: number) {
    const rows = userIds.map(user_id => ({ user_id, notificacao_id: notificacaoId }))
    const { error } = await supabase.from("user_notificacao").insert(rows)
    if (error) throw new Error("Failed to insert user_notificacao")
}

async function getTargetUsers(municipioId: number, percent: number = 1.0) {
    const { data, error } = await supabase.from("user_municipio")
        .select("user_id")
        .eq("municipio_id", municipioId)
        .eq("e_moradia", true)
    if (error) throw new Error("Failed to fetch users")
    const limit = Math.ceil(data.length * percent)
    return shuffle(data).slice(0, limit).map(u => u.user_id)
}

function shuffle<T>(arr: T[]): T[] {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
            ;[arr[i], arr[j]] = [arr[j], arr[i]]
    }
    return arr
}

async function sendNotification(n: any) {
    if (n.estado === "notificado" || n.estado === "em_confirmacao") return

    const municipioId = await getMunicipioId(n.primeiro_relato)
    const percent = n.estado === "pendente_confirmacao" ? 0.1 : 1.0
    const users = await getTargetUsers(municipioId, percent)
    await insertUserNotificacoes(users, n.id)
}

Deno.serve(async req => {
    try {
        const { municipio_id } = await req.json()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user || user.role !== "authenticated") return new Response("Forbidden", { status: 403 })

        const { data: municipio } = await supabase.from("municipios")
            .select("id")
            .eq("id", municipio_id)
            .single()
        if (!municipio) return new Response("Municipio not found", { status: 404 })

        const { data: inserted, error: insertErr } = await supabase.from("relatos")
            .insert({ user_id: user.id, municipio_id: municipio.id })
            .select()
        if (insertErr || !inserted) return new Response("Insert fail", { status: 500 })

        const newRelato = inserted[0]
        const cutoff = new Date(Date.now() - 2 * 3600 * 1000).toISOString()
        const { data: notif } = await supabase.from("notificacoes")
            .select("*").eq("relatos.municipio_id", municipio.id)
            .gt("created_at", cutoff)
            .single()

        if (notif) {
            notif.n_confirmados++
            if (notif.estado === "em_confirmacao" && notif.n_confirmados >= notif.confirmacoes_necessarias) {
                notif.estado = "pendente"
            }
            await supabase.from("notificacoes").update({
                n_confirmados: notif.n_confirmados,
                estado: notif.estado
            }).eq("id", notif.id)

            await sendNotification(notif)
        } else {
            const { data: pop } = await supabase.from("user_municipio")
                .eq("municipio_id", municipio.id)
                .eq("e_moradia", true)
                .select("id", { count: 'exact', head: true })
            const count = pop?.length || 0
            const confirmacoes_necessarias = Math.ceil(count * 0.05)
            const estado = confirmacoes_necessarias <= 1 ? "pendente" : "pendente_confirmacao"

            const { data: notifInsert } = await supabase.from("notificacoes").insert({
                municipio_id: municipio.id,
                n_confirmados: 1,
                estado,
                confirmacoes_necessarias,
                primeiro_relato: newRelato.id
            }).select()

            await supabase.from("user_notificacao").insert({
                user_id: user.id,
                notificacao_id: notifInsert[0].id
            })

            await sendNotification(notifInsert[0])
        }

        return new Response("Relato created", { status: 201 })
    } catch (err) {
        console.error(err)
        return new Response("Internal Server Error", { status: 500 })
    }
})
