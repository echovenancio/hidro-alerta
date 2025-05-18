import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.42.4'

export const supabase = createClient(
    Deno.env.get('SUPABASE_URL'),
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
)

// shuffle helper
export function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
            ;[arr[i], arr[j]] = [arr[j], arr[i]]
    }
    return arr
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

export async function getTargetUsers(municipioId, percent = 1.0) {
    const { data, error } = await supabase
        .from('user_municipios')
        .select('user_id')
        .eq('municipio_id', municipioId)
        .eq('e_moradia', true)

    if (error != null) {
        console.log(error)
        throw new Error('Failed to fetch users')
    }

    const limit = Math.ceil(data.length * percent)
    return shuffle(data).slice(0, limit).map((u) => u.user_id)
}

export async function sendNotification(notification) {
    if (['notificado', 'em_confirmacao'].includes(notification.estado)) return

    const municipioId = await getMunicipioId(notification.primeiro_relato)
    const percent = notification.estado === 'pendente_confirmacao' ? 0.5 : 1.0
    const users = await getTargetUsers(municipioId, percent)
    await insertUserNotificacoes(users, notification.id)

    const nextEstado =
        notification.estado === 'pendente' ? 'notificado' : 'em_confirmacao'

    const { error } = await supabase
        .from('notificacoes')
        .update({ estado: nextEstado })
        .eq('id', notification.id)

    if (error) {
        console.log(error)
        throw new Error('Failed to update notification')
    }
}

