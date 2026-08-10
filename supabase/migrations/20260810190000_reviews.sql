-- Фаза 7: отзывы гостей (фото/аудио), привязка к туру и/или гиду.
-- Публикуются сразу без модерации; удалить может только админ (RLS delete + is_admin()).

create table reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  tour_id uuid references tours(id) on delete set null,
  guide_id uuid references guides(id) on delete set null,
  author_name text not null,
  rating smallint not null check (rating between 1 and 5),
  text text,
  photo_url text,
  audio_url text,
  admin_notified_at timestamptz,
  created_at timestamptz not null default now(),
  constraint reviews_target_required check (tour_id is not null or guide_id is not null),
  constraint reviews_has_content check (text is not null or audio_url is not null)
);

create index reviews_tour_id_idx on reviews(tour_id);
create index reviews_guide_id_idx on reviews(guide_id);
create index reviews_created_at_idx on reviews(created_at desc);

alter table reviews enable row level security;

create policy "public select reviews" on reviews for select using (true);
create policy "anyone insert reviews" on reviews for insert with check (true);
create policy "admin delete reviews" on reviews for delete using (is_admin());
