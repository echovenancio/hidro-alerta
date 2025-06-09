create table if not exists localidades (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    id_municipio uuid not null,
    nome text not null
);

alter table localidades
    add constraint localidades_pkey primary key (id);

alter table localidades
    add constraint localidades_id_municipio_fkey foreign key (id_municipio) references municipios(id) on delete cascade;

-- 1. santos (official list)
insert into localidades (id_municipio, nome)
select id_municipio, nome from (
  select m.id as id_municipio,
    unnest(array[
      'aparecida','boqueirão','emba­ré','gonzaga','josé menino',
      'pompeia','ponta da praia','campo grande','centro','encruzilhada',
      'jabaquara','macuco','marapé','paquetá','porto alemoa','saboó',
      'vila belmiro','vila mathias'
    ]) as nome
  from municipios m where m.nome = 'Santos'
) s on conflict do nothing;


-- 2. são vicente (cepbrasil list)
insert into localidades (id_municipio, nome)
select id_municipio, nome from (
  select m.id as id_municipio,
    unnest(array[
      'Área Rural de São Vicente','Belvedere Mar Pequeno','Catiapoa','Centro',
      'Cidade Náutica','Conjunto Residencial Humaitá','Esplanada dos Barreiros',
      'Ilha Porchat','Itararé','Japuí','Jardim Bechara','Jardim Guassu',
      'Jardim Independência','Jardim Irmã Dolores','Jardim Nosso Lar',
      'Jardim Rio Branco','Jardim Sorocabanos','Morro dos Barbosas',
      'Parque Bitaru','Parque Continental','Parque das Bandeiras',
      'Parque Prainha','Parque São Vicente','Samarita','Vila Cascatinha',
      'Vila Ema','Vila Iolanda','Vila Matias','Vila Nova São Vicente',
      'Vila São Jorge','Vila Valença','Vila Voturua'
    ]) as nome
  from municipios m where m.nome='São Vicente'
) s on conflict do nothing;

-- 3. praia grande
insert into localidades (id_municipio, nome)
select id_municipio, nome from (
  select m.id as id_municipio,
    unnest(array[
      'anhanguera','antártica','aviação','balneário paqueta',
      'boqueirão','caiçara','canto do forte','centro','esmeralda',
      'glória','guilhermina','ilha das caieiras','maracanã','mirim',
      'nova mirim','ocian','princesa','real','ribeirópolis',
      'samambaia','solemar','tupi'
    ]) as nome
  from municipios m where m.nome='Praia Grande'
) s on conflict do nothing;

-- 4. guarujá (mbi postal list)
insert into localidades (id_municipio, nome)
select id_municipio, nome from (
  select m.id as id_municipio,
    unnest(array[
      'Acapulco','Balneário Cidade Atlântica','Balneário Guarujá',
      'Balneário Mar Casado','Balneário Praia do Perequê',
      'Balneário Praia do Pernambuco','Barra Funda','Cachoeira',
      'Centro','Jardim Alvorada','Jardim Ana Maria','Jardim Astúrias',
      'Jardim Belmar','Jardim Boa Esperança','Jardim Brasil I',
      'Jardim Brasil II','Jardim Centenário','Jardim Cunhambebe',
      'Jardim das Conchas','Jardim dos Pássaros','Jardim Enseada',
      'Jardim Guaiuba','Jardim Helena Maria','Jardim Mar e Céu',
      'Jardim Monteiro da Cruz','Jardim Praiano','Jardim Progresso',
      'Jardim Santa Maria','Jardim Santana','Jardim Santense',
      'Jardim Santo Amaro','Jardim São José','Jardim São Manoel',
      'Jardim São Miguel','Jardim Tejereba','Jardim Três Marias',
      'Jardim Virgínia','Jardim Vitória','Maré Mansa','Morrinhos',
      'Vila Luís Antônio','Vila Zilda'
    ]) as nome
  from municipios m where m.nome='Guarujá'
) s on conflict do nothing;

-- 5. bertioga
insert into localidades (id_municipio, nome)
select id_municipio, nome from (
  select m.id as id_municipio,
    unnest(array[
      'Caiubura','São João','Centro','Jardim Vicente de Carvalho',
      'Albatroz','Maitinga','Rio da Praia','Buriqui Costa Nativa',
      'Jardim Raphael','Indaiá','Vista Linda','Riviera','São Lourenço',
      'Guaratuba','Costa do Sol','Morada da Praia','Boracéia'
    ]) as nome
  from municipios m where m.nome='Bertioga'
) s on conflict do nothing;

-- 6. cubatão (cepbrasil list)
insert into localidades (id_municipio, nome)
select id_municipio, nome from (
  select m.id as id_municipio,
    unnest(array[
      'Área Rural de Cubatão','Centro','Conjunto Afonso Schmidt','Cota 200',
      'Cota 400','Cota 95','Fabril','Jardim Casqueiro','Jardim Costa e Silva',
      'Jardim Nova República','Jardim São Francisco','Padre Manoel da Nóbrega',
      'Parque Fernando Jorge','Parque São Luis','Pica‑Pau','Sítio Cafezal',
      'Vila Caraguata','Vila Costa Muniz','Vila dos Pescadores','Vila Nova',
      'Vila Paulista','Vila Santa Rosa','Vila São Benedito'
    ]) as nome
  from municipios m where m.nome='Cubatão'
) s on conflict do nothing;

-- 7. itanhaém (from pdf list)
insert into localidades (id_municipio, nome)
select id_municipio, nome from (
  select m.id as id_municipio,
    unnest(array[
      'Aguapeú','Área Rural de Itanhaém','Baixio','Balneário São Jorge',
      'Belas Artes','Bopiranga','Campos Eliseos','Centro','Cibratel',
      'Cibratel I','Cibratel II','Cidade Anchieta','Corumba','Gaivota',
      'Guapurá','Guaraú','Praia dos Sonhos','Jardim Pernambuco'
    ]) as nome
  from municipios m where m.nome='Itanhaém'
) s on conflict do nothing;

-- 8. mongaguá (official list)
insert into localidades (id_municipio, nome)
select id_municipio, nome from (
  select m.id as id_municipio,
    unnest(array[
      'Agenor de Campos','Balneário Flórida Mirim','Balneário Itaguaí',
      'Centro','Pedreira','Plataforma','Vera Cruz',
      'Vila Atlântica','Vila Operária','Vila São Paulo','Área Rural'
    ]) as nome
  from municipios m where m.nome='Mongaguá'
) s on conflict do nothing;

-- 9. peruíbe
insert into localidades (id_municipio, nome)
select id_municipio, nome from (
  select m.id as id_municipio,
    unnest(array[
      'Área Rural de Peruíbe','Bairro dos Prados','Balneário Arpoador',
      'Balneário Arpoador 2','Jardim Brasil','Jardim Caraguava',
      'Parque Daville','Parque Peruíbe','Pereque','Prainha',
      'Vila Erminda','Vila Peruíbe','Vila Romar','Veneza'
    ]) as nome
  from municipios m where m.nome='Peruíbe'
) s on conflict do nothing;
