create or replace view ultima_situacao_por_municipio as
select distinct on (s.municipio_id) s.*, m.nome
from situacao_municipios s
join municipios m on m.id = s.municipio_id
order by s.municipio_id, s.created_at desc;
