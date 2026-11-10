-- Заявки на билеты/трансфер (/park, /phuquoc) теперь сохраняются в базу, а не только уходят в Telegram
-- (Виктор 2026-11-09: утренний отчёт «кто, откуда, куда едет, сколько денег, на какой стадии»).
create table park_bookings (
  id uuid primary key default gen_random_uuid(),
  confirm_token text unique,
  short_id text,
  destination text not null,
  date date not null,
  package_id text not null,
  package_title text,
  departure_time text,
  guests jsonb not null default '{}'::jsonb,
  guests_total int not null default 0,
  extras jsonb not null default '{}'::jsonb,
  hotel text not null,
  district text,
  transfer_usd numeric(10, 2),
  tickets_vnd bigint,
  name text not null,
  contact_channel text not null,
  contact text not null,
  comment text,
  -- new: пришла заявка; client_confirmed: турист нажал «Подтверждаю выезд»;
  -- passed: Виктор передал водителю/выкупил билеты; done: съездили; cancelled: отказались
  stage text not null default 'new' check (stage in ('new', 'client_confirmed', 'passed', 'done', 'cancelled')),
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index park_bookings_date on park_bookings (date);

alter table park_bookings enable row level security;

create policy "admin select park_bookings" on park_bookings for select using (is_admin());
create policy "admin update park_bookings" on park_bookings for update using (is_admin()) with check (is_admin());
create policy "admin delete park_bookings" on park_bookings for delete using (is_admin());
-- insert только с сервера (service role), из /api/park-booking
