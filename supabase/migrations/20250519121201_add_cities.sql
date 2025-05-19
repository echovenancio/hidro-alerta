-- Baixada santista only
insert into municipios (nome)
values
('Santos'),
('São Vicente'),
('Praia Grande'),
('Guarujá'),
('Bertioga'),
('Cubatão'),
('Itanhaém'),
('Mongaguá'),
('Peruíbe');

insert into situacao_municipios (municipio_id, id_situacao)
values
((select id from municipios where nome = 'Santos'), (select id from situacao where descricao = 'verde')),
((select id from municipios where nome = 'São Vicente'), (select id from situacao where descricao = 'verde')),
((select id from municipios where nome = 'Praia Grande'), (select id from situacao where descricao = 'verde')),
((select id from municipios where nome = 'Guarujá'), (select id from situacao where descricao = 'verde')),
((select id from municipios where nome = 'Bertioga'), (select id from situacao where descricao = 'verde')),
((select id from municipios where nome = 'Cubatão'), (select id from situacao where descricao = 'verde')),
((select id from municipios where nome = 'Itanhaém'), (select id from situacao where descricao = 'verde')),
((select id from municipios where nome = 'Mongaguá'), (select id from situacao where descricao = 'verde')),
((select id from municipios where nome = 'Peruíbe'), (select id from situacao where descricao = 'verde'));
