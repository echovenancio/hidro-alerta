select cron.unschedule('invalidate_old_notifications');

select cron.schedule(
  'invalidate_old_notifications',
  '0 * * * *',
$$
  update notificacoes
  set estado = 'invalido'
  where estado = 'em_confirmacao'
    and created_at < now() - interval '4 hours';
$$
);
