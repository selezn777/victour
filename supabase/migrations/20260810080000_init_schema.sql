-- ВикТур — Фаза 1: базовая схема (туры, цены, гиды, календарь, брони, доплаты, настройки)

create extension if not exists "pgcrypto";

-- Туры (5 собственных программ)
create table tours (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title jsonb not null,              -- {"ru": "...", "en": null}
  short_description jsonb not null,
  duration_label jsonb not null,
  duration_days smallint not null default 1,
  is_dalat_two_day boolean not null default false,
  itinerary jsonb not null default '[]'::jsonb,   -- [{"day": 1, "title": {...}, "description": {...}}, ...]
  includes jsonb not null default '[]'::jsonb,    -- [{"ru": "...", "en": null}, ...]
  excludes jsonb not null default '[]'::jsonb,
  hero_image_url text,
  sort_order smallint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Цены по числу гостей (2–8), отдельно взрослый/ребёнок где применимо
create table pricing_tiers (
  id uuid primary key default gen_random_uuid(),
  tour_id uuid not null references tours(id) on delete cascade,
  guest_count smallint not null check (guest_count between 2 and 8),
  price_adult_usd numeric(10,2) not null,
  price_child_usd numeric(10,2),
  unique (tour_id, guest_count)
);

-- Гиды (на старте один — Виктор)
create table guides (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  bio jsonb,
  phone text,
  whatsapp text,
  telegram text,
  instagram text,
  is_active boolean not null default true,
  sort_order smallint not null default 0,
  created_at timestamptz not null default now()
);

-- Доступность гида по датам (хранятся только отклонения от "свободно": занято/отпуск)
create table guide_availability (
  id uuid primary key default gen_random_uuid(),
  guide_id uuid not null references guides(id) on delete cascade,
  date date not null,
  status text not null check (status in ('booked', 'vacation')),
  note text,
  unique (guide_id, date)
);

-- Доплаты (дальний трансфер Камрань/Amiana и т.п.)
create table surcharges (
  code text primary key,
  name jsonb not null,
  amount_vnd numeric(12,0) not null,
  unit text not null default 'per_group_roundtrip',
  is_active boolean not null default true
);

-- Настройки без деплоя (курс VND, наценка на RUB)
create table settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

-- Заявки гостей
create table bookings (
  id uuid primary key default gen_random_uuid(),
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'alt_proposed', 'cancelled', 'completed')),
  guest_name text not null,
  contact_channel text not null check (contact_channel in ('whatsapp', 'telegram', 'max', 'vk')),
  contact_value text not null,
  hotel text not null,
  adults_total smallint not null default 0,
  children_total smallint not null default 0,
  notes text,
  currency text not null default 'USD' check (currency in ('USD', 'VND', 'RUB')),
  subtotal_usd numeric(10,2) not null default 0,
  discount_pct smallint not null default 0,
  surcharge_usd numeric(10,2) not null default 0,
  total_usd numeric(10,2) not null default 0,
  prepayment_usd numeric(10,2) not null default 0,
  exchange_rate_snapshot jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Позиции внутри заявки (тур + дата + гости — для пакетов)
create table booking_items (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references bookings(id) on delete cascade,
  tour_id uuid not null references tours(id),
  guide_id uuid references guides(id),
  date date not null,
  date_end date,
  adults smallint not null check (adults >= 1),
  children smallint not null default 0,
  price_snapshot_usd numeric(10,2) not null
);

create index booking_items_booking_id_idx on booking_items(booking_id);
create index booking_items_tour_id_idx on booking_items(tour_id);
create index guide_availability_guide_date_idx on guide_availability(guide_id, date);
create index pricing_tiers_tour_id_idx on pricing_tiers(tour_id);

-- RLS: каталог читается публично, брони можно только создавать (не читать/менять) анонимно
alter table tours enable row level security;
alter table pricing_tiers enable row level security;
alter table guides enable row level security;
alter table guide_availability enable row level security;
alter table surcharges enable row level security;
alter table settings enable row level security;
alter table bookings enable row level security;
alter table booking_items enable row level security;

create policy "public read tours" on tours for select using (true);
create policy "public read pricing_tiers" on pricing_tiers for select using (true);
create policy "public read guides" on guides for select using (true);
create policy "public read guide_availability" on guide_availability for select using (true);
create policy "public read surcharges" on surcharges for select using (true);
create policy "public read settings" on settings for select using (true);

create policy "public insert bookings" on bookings for insert with check (true);
create policy "public insert booking_items" on booking_items for insert with check (true);
