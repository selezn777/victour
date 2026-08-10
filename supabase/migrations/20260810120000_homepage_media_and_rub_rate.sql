-- Фаза 2: реальные фото туров (public/images/tours) + базовый курс USD/RUB
-- для usdToRub() (settings.rub_markup_pct уже был, самой ставки не было).
-- Ставка редактируется здесь без деплоя — Фаза 9 подключит либо ручное обновление,
-- либо API курса поверх этого же ключа.

update tours set hero_image_url = '/images/tours/nyachang-avtorskiy.jpg' where slug = 'nyachang-avtorskiy';
update tours set hero_image_url = '/images/tours/mayak-dai-lan.jpg' where slug = 'mayak-dai-lan';
update tours set hero_image_url = '/images/tours/severnye-ostrova.jpg' where slug = 'severnye-ostrova';
update tours set hero_image_url = '/images/tours/hon-tam.jpg' where slug = 'hon-tam';
update tours set hero_image_url = '/images/tours/dalat-2-dnya.jpg' where slug = 'dalat-2-dnya';

insert into settings (key, value) values
  ('usd_rub_rate', '{"rate": 82, "updated_manually": true}'::jsonb)
on conflict (key) do nothing;
