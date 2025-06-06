create or replace function public.get_confirmed_notificacoes_by_municipio_and_month(
  p_municipio_id uuid,
  p_month int,
  p_year int
)
returns table (
  id uuid,
  titulo text,
  created_at timestamptz,
  foi_confirmado boolean
) as $$
begin
  return query
  select n.id, n.titulo, n.created_at, un.foi_confirmado
  from notificacoes n
  join user_notificacao un on un.notificacao_id = n.id
  join relatos r on r.id = n.primeiro_relato
  where r.municipio_id = p_municipio_id
    and un.foi_confirmado = true
    and extract(month from n.created_at) = p_month
    and extract(year from n.created_at) = p_year;
end;
$$ security definer language plpgsql stable;

create or replace function public.get_vermelho_days_by_municipio_and_month(
  p_municipio_id uuid,
  p_month int,
  p_year int
)
returns table (
  dia int
) as $$
begin
  return query
  select distinct extract(day from created_at)::int as dia
  from situacao_municipios
  where municipio_id = p_municipio_id
    and id_situacao = 1
    and extract(month from created_at) = p_month
    and extract(year from created_at) = p_year
  order by dia;
end;
$$ security definer language plpgsql stable;
