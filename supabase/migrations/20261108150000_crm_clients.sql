-- Мини-CRM для Виктора (2026-11-08): «многие планируют на будущее... я уже запутался кто
-- входящий кто думает кто хочет кто напишет по приезду». Клиенты из Instagram/WhatsApp,
-- которых Виктор вносит руками с телефона. Отдельно от leads (там автозахват с сайта).
create table crm_clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  channel text not null default 'instagram' check (channel in ('instagram', 'whatsapp', 'telegram', 'other')),
  contact text,
  status text not null default 'new' check (status in ('new', 'thinking', 'on_arrival', 'booked', 'lost')),
  date_from date,
  date_to date,
  people int,
  tour text,
  price_usd numeric(10, 2),
  note text,
  remind_on date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index crm_clients_status_remind on crm_clients (status, remind_on);

alter table crm_clients enable row level security;

create policy "admin select crm_clients" on crm_clients for select using (is_admin());
create policy "admin insert crm_clients" on crm_clients for insert with check (is_admin());
create policy "admin update crm_clients" on crm_clients for update using (is_admin()) with check (is_admin());
create policy "admin delete crm_clients" on crm_clients for delete using (is_admin());
