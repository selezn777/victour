-- Групповые выезды (Виктор 2026-11-14): «бот, в которого я буду скидывать расписание,
-- и будет видно, что у нас по группам... можно будет дозаписаться в какую-нибудь группу».
-- Расписание пишет Telegram-бот (/api/group-bot, service role), сайт /groups читает
-- открытые будущие выезды анонимно. Индивидуальные туры (tours) не трогаем.

create table group_departures (
  id uuid primary key default gen_random_uuid(),
  -- короткий номер для команд бота: /seats 12 3, /del 12
  num serial unique,
  date date not null,
  time text check (time is null or time ~ '^\d{2}:\d{2}$'),
  -- как написал Виктор («Юг 2.0»); slug - если нашли тур/программу с таким названием
  tour_title text not null,
  tour_slug text,
  guide_name text,
  seats_total int not null check (seats_total between 1 and 99),
  seats_booked int not null default 0 check (seats_booked >= 0),
  price_usd numeric(10, 2),
  -- open: идёт набор (если мест нет - «группа собрана»); cancelled: отменён, на сайте не показываем
  status text not null default 'open' check (status in ('open', 'cancelled')),
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Повторно присланное расписание обновляет выезд, а не дублирует его (бот ищет по этому ключу)
create unique index group_departures_slot on group_departures (date, lower(tour_title), coalesce(time, ''));
create index group_departures_date on group_departures (date);

alter table group_departures enable row level security;

create policy "public read open group_departures" on group_departures
  for select using (status = 'open' and date >= (now() at time zone 'Asia/Ho_Chi_Minh')::date);
create policy "admin all group_departures" on group_departures
  for all using (is_admin()) with check (is_admin());

-- Заявки «записаться в группу» с сайта. Пишет только сервер (/api/group-signup, service role).
-- Места в выезде автоматически не занимаем: Виктор подтверждает и правит места через бота.
create table group_signups (
  id uuid primary key default gen_random_uuid(),
  departure_id uuid references group_departures (id) on delete set null,
  -- снимок выезда на момент заявки (если выезд потом удалят)
  departure_label text not null,
  people int not null check (people between 1 and 20),
  name text not null,
  contact_channel text not null,
  contact text not null,
  comment text,
  status text not null default 'new' check (status in ('new', 'confirmed', 'cancelled')),
  created_at timestamptz not null default now()
);

create index group_signups_departure on group_signups (departure_id);

alter table group_signups enable row level security;

create policy "admin select group_signups" on group_signups for select using (is_admin());
create policy "admin update group_signups" on group_signups for update using (is_admin()) with check (is_admin());
create policy "admin delete group_signups" on group_signups for delete using (is_admin());
