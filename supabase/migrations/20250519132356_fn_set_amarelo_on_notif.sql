create or replace function fn_set_vermelho_on_notificado()
returns trigger security definer language plpgsql as $$
declare
  muni_id uuid;
  situacao_id int;
begin
  -- get municipio_id from primeiro_relato
  select municipio_id into muni_id
  from relatos
  where id = new.primeiro_relato;

  if new.estado = 'notificado' and (old.estado is distinct from new.estado) then
    -- get situacao_id for 'vermelho'
    select id into situacao_id from situacao where descricao = 'vermelho';

    insert into situacao_municipios (municipio_id, created_at, id_situacao, notificacao_id)
    values (muni_id, now(), situacao_id, new.id);

  elsif new.estado = 'em_confirmacao' and (old.estado is distinct from new.estado) then
    -- get situacao_id for 'amarelo'
    select id into situacao_id from situacao where descricao = 'amarelo';

    insert into situacao_municipios (municipio_id, created_at, id_situacao, notificacao_id)
    values (muni_id, now(), situacao_id, new.id);
  end if;

  return new;
end;
$$;
