-- Виктор попросил ограничить прайс-таблицу до 9 гостей (тот же автобус, что и до этого).
-- Для больших групп (10+) считаем индивидуально — нужен другой автобус.
-- Цены на 9-го гостя — плавное продолжение тренда предыдущих тиров, можно скорректировать
-- в любой момент через supabase или попросив другую цифру.
alter table pricing_tiers drop constraint pricing_tiers_guest_count_check;
alter table pricing_tiers add constraint pricing_tiers_guest_count_check check (guest_count between 2 and 9);

insert into pricing_tiers (tour_id, guest_count, price_adult_usd, price_child_usd)
select id, 9, v.price_adult, v.price_child
from tours, (values
  ('nyachang-avtorskiy', 52, null),
  ('mayak-dai-lan', 65, null),
  ('severnye-ostrova', 65, 55),
  ('hon-tam', 65, null),
  ('dalat-2-dnya', 195, null)
) as v(slug, price_adult, price_child)
where tours.slug = v.slug;
