-- unschedule any existing job
select cron.unschedule('invalidate_old_notifications');

-- schedule a new job to run hourly
select cron.schedule(
  'invalidate_old_notifications',
  '0 * * * *',
$$
  with outdated_notificacoes as (
    update notificacoes
    set estado = 'invalido'
    where estado = 'em_confirmacao'
      and created_at < now() - interval '4 hours'
    returning id, primeiro_relato
  ),
  relatos_com_municipio as (
    select n.id as notificacao_id, r.municipio_id
    from outdated_notificacoes n
    join relatos r on r.id = n.primeiro_relato
  )
  insert into situacao_municipios (notificacao_id, municipio_id, id_situacao, created_at)
  select notificacao_id, municipio_id, 3, now()
  from relatos_com_municipio;
$$
);

