CREATE EXTENSION IF NOT EXISTS pg_cron;

SELECT cron.schedule(
  'invalidate_old_notifications',   -- job name
  '0 * * * *',                      -- every hour
  $$
  UPDATE notificacoes
  SET estado = 'invalido'
  WHERE
    estado = 'pendente_confirmacao'
    AND created_at < now() - interval '4 hours';
  $$
);
