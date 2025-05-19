create view ultima_situacao_por_municipio as
select distinct on (municipio_id) *
from situacao_municipios
order by municipio_id, created_at desc;
