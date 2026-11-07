-- Tira a função de verificação de acesso da API pública (as políticas continuam usando-a).
create schema if not exists crm_private;
revoke all on schema crm_private from public, anon;
grant usage on schema crm_private to authenticated;
alter function public.crm_is_member() set schema crm_private;
