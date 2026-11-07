-- CRM Kanban do Coach Planner, alimentado pelo WhatsApp.
--
-- Fluxo:
--   WhatsApp -> ponte (crm/bridge) -> crm_ingest_message() -> crm_leads / crm_messages
--   App Kanban -> crm_outbox (status 'pendente') -> ponte envia pelo WhatsApp
--
-- Só os e-mails cadastrados em crm_users enxergam os dados pelo app.
-- A ponte usa a chave service_role, que ignora o RLS.

-- ---------------------------------------------------------------------------
-- Acesso
-- ---------------------------------------------------------------------------

create table public.crm_users (
  email text primary key check (email = lower(email))
);

alter table public.crm_users enable row level security;
-- Sem políticas: ninguém lê ou altera pela API pública. Cadastre pelo SQL Editor.

create function public.crm_is_member()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.crm_users
    where email = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

revoke execute on function public.crm_is_member() from public, anon;
grant execute on function public.crm_is_member() to authenticated;

-- ---------------------------------------------------------------------------
-- Tabelas
-- ---------------------------------------------------------------------------

create table public.crm_leads (
  id uuid primary key default gen_random_uuid(),
  -- Endereço do contato no WhatsApp: '5551999999999@s.whatsapp.net' ou '...@lid'.
  wa_jid text unique,
  -- Identificador anônimo (LID) que o WhatsApp usa em algumas conversas.
  lid text unique,
  phone text,
  name text,
  stage text not null default 'novo'
    check (stage in ('novo', 'conversa', 'proposta', 'pagamento', 'entregar', 'concluido', 'perdido')),
  product text,
  value numeric(10, 2) check (value is null or value >= 0),
  notes text,
  follow_up date,
  ignored boolean not null default false,
  unread_count integer not null default 0 check (unread_count >= 0),
  last_message_at timestamptz,
  last_message_preview text,
  last_message_from_me boolean,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index crm_leads_board_idx on public.crm_leads (ignored, stage, last_message_at desc);

create table public.crm_messages (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.crm_leads (id) on delete cascade,
  wa_message_id text not null,
  from_me boolean not null,
  body text not null,
  sent_at timestamptz not null,
  created_at timestamptz not null default now(),
  unique (lead_id, wa_message_id)
);

create index crm_messages_lead_idx on public.crm_messages (lead_id, sent_at);

create table public.crm_outbox (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.crm_leads (id) on delete cascade,
  body text not null check (char_length(btrim(body)) between 1 and 4096),
  status text not null default 'pendente'
    check (status in ('pendente', 'enviando', 'enviado', 'erro')),
  error text,
  created_by uuid default auth.uid(),
  created_at timestamptz not null default now(),
  sent_at timestamptz
);

create index crm_outbox_pending_idx on public.crm_outbox (created_at) where status = 'pendente';

-- Uma linha só, atualizada pela ponte: conexão, QR Code e sinal de vida.
create table public.crm_bridge_status (
  id integer primary key default 1 check (id = 1),
  state text not null default 'desconectado'
    check (state in ('iniciando', 'qr', 'conectado', 'desconectado', 'sessao_encerrada')),
  qr text,
  phone text,
  updated_at timestamptz not null default now()
);

insert into public.crm_bridge_status (id) values (1);

-- ---------------------------------------------------------------------------
-- updated_at automático
-- ---------------------------------------------------------------------------

create function public.crm_touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger crm_leads_touch
before update on public.crm_leads
for each row execute function public.crm_touch_updated_at();

-- ---------------------------------------------------------------------------
-- Entrada de mensagens (chamada só pela ponte)
-- ---------------------------------------------------------------------------

create function public.crm_ingest_message(
  p_jid text,
  p_lid text,
  p_phone text,
  p_push_name text,
  p_from_me boolean,
  p_wa_message_id text,
  p_body text,
  p_sent_at timestamptz,
  p_create_if_missing boolean default true
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_lead public.crm_leads%rowtype;
  v_inserted integer;
  v_name text := case when p_from_me then null else nullif(btrim(p_push_name), '') end;
begin
  if p_jid is null and p_lid is null then
    return null;
  end if;

  select * into v_lead
  from public.crm_leads
  where (p_jid is not null and wa_jid = p_jid)
     or (p_lid is not null and (lid = p_lid or wa_jid = p_lid))
  order by created_at
  limit 1
  for update;

  if not found then
    if not p_create_if_missing then
      return null;
    end if;

    begin
      insert into public.crm_leads (wa_jid, lid, phone, name)
      values (coalesce(p_jid, p_lid), p_lid, p_phone, v_name)
      returning * into v_lead;
    exception when unique_violation then
      -- Outra mensagem do mesmo contato chegou ao mesmo tempo.
      select * into v_lead
      from public.crm_leads
      where (p_jid is not null and wa_jid = p_jid)
         or (p_lid is not null and (lid = p_lid or wa_jid = p_lid))
      limit 1
      for update;
      if not found then
        raise;
      end if;
    end;
  else
    -- Completa dados que antes eram desconhecidos (ex.: telefone de um contato LID).
    begin
      update public.crm_leads set
        wa_jid = case when p_jid is not null and (wa_jid is null or wa_jid like '%@lid') then p_jid else wa_jid end,
        lid = coalesce(lid, p_lid),
        phone = coalesce(phone, p_phone),
        name = coalesce(name, v_name)
      where id = v_lead.id
      returning * into v_lead;
    exception when unique_violation then
      null; -- já existe outro card com esse endereço; mantém o atual como está.
    end;
  end if;

  if v_lead.ignored then
    return null;
  end if;

  insert into public.crm_messages (lead_id, wa_message_id, from_me, body, sent_at)
  values (v_lead.id, p_wa_message_id, p_from_me, p_body, p_sent_at)
  on conflict (lead_id, wa_message_id) do nothing;

  get diagnostics v_inserted = row_count;

  if v_inserted > 0 then
    update public.crm_leads set
      unread_count = case when p_from_me then 0 else unread_count + 1 end,
      last_message_at = greatest(coalesce(last_message_at, p_sent_at), p_sent_at),
      last_message_preview = case
        when last_message_at is null or p_sent_at >= last_message_at then left(p_body, 280)
        else last_message_preview end,
      last_message_from_me = case
        when last_message_at is null or p_sent_at >= last_message_at then p_from_me
        else last_message_from_me end
    where id = v_lead.id;
  end if;

  return v_lead.id;
end;
$$;

revoke execute on function public.crm_ingest_message(text, text, text, text, boolean, text, text, timestamptz, boolean)
  from public, anon, authenticated;
grant execute on function public.crm_ingest_message(text, text, text, text, boolean, text, text, timestamptz, boolean)
  to service_role;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

alter table public.crm_leads enable row level security;
alter table public.crm_messages enable row level security;
alter table public.crm_outbox enable row level security;
alter table public.crm_bridge_status enable row level security;

create policy "membros leem leads" on public.crm_leads
  for select to authenticated using ((select public.crm_is_member()));
create policy "membros criam leads" on public.crm_leads
  for insert to authenticated with check ((select public.crm_is_member()));
create policy "membros editam leads" on public.crm_leads
  for update to authenticated
  using ((select public.crm_is_member()))
  with check ((select public.crm_is_member()));
create policy "membros apagam leads" on public.crm_leads
  for delete to authenticated using ((select public.crm_is_member()));

create policy "membros leem mensagens" on public.crm_messages
  for select to authenticated using ((select public.crm_is_member()));

create policy "membros leem envios" on public.crm_outbox
  for select to authenticated using ((select public.crm_is_member()));
create policy "membros pedem envios" on public.crm_outbox
  for insert to authenticated
  with check ((select public.crm_is_member()) and status = 'pendente' and error is null and sent_at is null);

create policy "membros veem a ponte" on public.crm_bridge_status
  for select to authenticated using ((select public.crm_is_member()));

-- ---------------------------------------------------------------------------
-- Tempo real para o app
-- ---------------------------------------------------------------------------

alter publication supabase_realtime
  add table public.crm_leads, public.crm_messages, public.crm_outbox, public.crm_bridge_status;
