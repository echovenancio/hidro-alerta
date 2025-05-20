drop function if exists public.get_municipio_nome_by_notificacao_id(uuid);

create function public.get_municipio_nome_by_notificacao_id(p_notificacao_id uuid)
returns table (
  id uuid,
  created_at timestamptz,
  nome varchar,
  municipio_id uuid
) as $$
begin
  return query
  select
    n.id,
    n.created_at,
    m.nome,
    m.id as municipio_id
  from notificacoes n
  join relatos r on r.id = n.primeiro_relato
  join municipios m on m.id = r.municipio_id
  where n.id = p_notificacao_id;
end;
$$ language plpgsql stable security definer;
