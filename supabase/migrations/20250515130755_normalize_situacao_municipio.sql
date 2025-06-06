CREATE TABLE IF NOT EXISTS situacao (
  id serial primary key,
  descricao varchar not null
);

alter table situacao_municipios
  drop column situacao,
  add column id_situacao int references situacao(id);
