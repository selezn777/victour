-- Отзывы на лендинге /park (VinWonders и остров Хон Там).
-- reviews требует tour_id или guide_id — заводим две скрытые (is_active=false)
-- «туры-якоря», к которым привязываются отзывы направлений. В каталог,
-- админку туров и выбор тура в форме отзыва они не попадают (фильтр slug park-%).
-- Применено через service role 2026-10-05.
insert into tours (slug, title, short_description, duration_label, is_active, sort_order)
values
  ('park-vinwonders', '{"ru":"VinWonders — парк + канатка"}', '{"ru":"Билеты в VinWonders и трансфер"}', '{"ru":"1 день"}', false, 900),
  ('park-hontam', '{"ru":"Остров Хон Там — пляж + катер"}', '{"ru":"Остров Хон Там с трансфером"}', '{"ru":"1 день"}', false, 901)
on conflict (slug) do nothing;
