create or replace function fn_set_vermelho_on_notificado()
returns trigger security definer language plpgsql as $$
declare
  muni_id uuid;
  situacao_id int;
begin
  if new.estado = 'notificado' and (old.estado is distinct from new.estado) then
    -- get municipio_id from primeiro_relato
    select municipio_id into muni_id
    from relatos
    where id = new.primeiro_relato;

    -- get situacao_id for 'vermelho'
    select id into situacao_id from situacao where descricao = 'vermelho';

    -- insert into situacao_municipio
    insert into situacao_municipios (municipio_id, created_at, id_situacao)
    values (muni_id, now(), situacao_id);

  end if;
  return new;
end;
$$;

create trigger trg_set_vermelho_on_notificado
after update on notificacoes
for each row
execute function fn_set_vermelho_on_notificado();

