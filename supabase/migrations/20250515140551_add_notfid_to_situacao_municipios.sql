alter table situacao_municipios
add column notificacao_id uuid references notificacoes(id) on delete set null;
