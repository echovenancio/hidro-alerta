alter table relatos
    drop column municipio_id;

alter table relatos
    add column id_localidade uuid references localidades(id) on delete set null;
