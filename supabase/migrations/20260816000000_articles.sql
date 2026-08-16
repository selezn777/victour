-- Блог/гайды для SEO (Камрань, Винперл и т.д.) — статьи с текстом и фото-вставками,
-- в конце статьи ссылка на бронирование связанного тура.

create table articles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  destination text not null,
  excerpt text,
  cover_image_url text,
  body text not null,
  related_tour_id uuid references tours(id) on delete set null,
  is_published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index articles_destination_idx on articles(destination);
create index articles_published_idx on articles(is_published, published_at desc);

alter table articles enable row level security;

create policy "public select published articles" on articles for select using (is_published);
create policy "admin select articles" on articles for select using (is_admin());
create policy "admin insert articles" on articles for insert with check (is_admin());
create policy "admin update articles" on articles for update using (is_admin()) with check (is_admin());
create policy "admin delete articles" on articles for delete using (is_admin());
