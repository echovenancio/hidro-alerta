import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.42.4'

export const supabase = createClient(
    Deno.env.get('SUPABASE_URL'),
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
)

export function withCorsHeaders(body: string, status = 200) {
    return new Response(body, {
        status,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
            "Content-Type": "application/json",
        },
    });
}


// shuffle helper
export function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
            ;[arr[i], arr[j]] = [arr[j], arr[i]]
    }
    return arr
}

export type Pool = {
    total: number
    min: number
}

export function getMinConfirmacoes(count: number): Pool {
    if (count <= 1) {
        return { total: 1, min: 1 }
    }
    else if (count <= 10) {
        let total = Math.ceil(count * 0.5)
        let min = Math.ceil(total / 2)
        return { total: total, min }
    }
    else {
        let total = Math.ceil(count * 0.2)
        let min = Math.ceil(total / 2)
        return { total: total, min }
    }
}

export async function getMunicipioId(relatoId) {
    const { data, error } = await supabase
        .from('relatos')
        .select('municipio_id')
        .eq('id', relatoId)
        .single()
    if (error) throw new Error('Failed to get municipio')
    return data.municipio_id
}

export async function insertUserNotificacoes(userIds, notificacaoId) {
    const { data: existing, error: selectError } = await supabase
        .from('user_notificacao')
        .select('user_id')
        .eq('notificacao_id', notificacaoId)

    if (selectError) throw new Error('Failed to check existing user_notificacao')

    const existingIds = new Set(existing.map((r) => r.user_id))
    const newRows = userIds
        .filter((id) => !existingIds.has(id))
        .map((user_id) => ({
            user_id,
            notificacao_id: notificacaoId
        }))

    if (newRows.length === 0) return

    const { error: insertError } = await supabase
        .from('user_notificacao')
        .insert(newRows)

    if (insertError) throw new Error('Failed to insert user_notificacao')
}

export async function getTargetUsers(municipioId, numberOfUsers) {
    const { data, error } = await supabase
        .from('user_municipios')
        .select('user_id')
        .eq('municipio_id', municipioId)
        .eq('e_moradia', true)

    if (error != null) {
        console.log(error)
        throw new Error('Failed to fetch users')
    }

    const limit = Math.min(numberOfUsers, data.length)
    return shuffle(data).slice(0, limit).map((u) => u.user_id)
}

export async function sendNotification(notification, pool: Pool = null) {
    if (['notificado', 'em_confirmacao'].includes(notification.estado)) return

    const municipioId = await getMunicipioId(notification.primeiro_relato)
    const limit = pool == null ? 10000000 : pool.total 
    const users = await getTargetUsers(municipioId, limit)
    await insertUserNotificacoes(users, notification.id)

    const nextEstado =
        notification.estado === 'pendente' ? 'notificado' : 'em_confirmacao'

    console.log(`Sending notification ${notification.id} to ${users.length} users`)
    console.log("nextEstado", nextEstado)

    const { error } = await supabase
        .from('notificacoes')
        .update({ estado: nextEstado })
        .eq('id', notification.id)

    if (error) {
        console.log(error)
        throw new Error('Failed to update notification')
    }
}

