-- Личный кабинет гида: публичный профиль с фото, специализациями и галереей.
alter table guides add column photo_url text;
alter table guides add column specialties text[] not null default '{}';
alter table guides add column gallery_urls text[] not null default '{}';

create policy "admin update guides" on guides for update using (is_admin()) with check (is_admin());
