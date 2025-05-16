alter table user_notificacao
alter column foi_resolvido set default false,
alter column foi_resolvido set not null;
