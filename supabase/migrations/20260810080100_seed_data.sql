-- ВикТур — Фаза 1: seed утверждённых данных из docs/VicTour_tours-and-prices.md

-- 1. Авторский Нячанг
insert into tours (slug, title, short_description, duration_label, duration_days, is_dalat_two_day, itinerary, includes, excludes, sort_order) values (
  'nyachang-avtorskiy',
  '{"ru": "Авторский Нячанг", "en": null}',
  '{"ru": "Нячанг без спешки: город, которого не видно из окна отеля.", "en": null}',
  '{"ru": "~8 часов", "en": null}',
  1, false,
  '[
    {"day": 1, "title": {"ru": "Капибары и вьетнамский кофе", "en": null}, "description": {"ru": "Знакомство с капибарами и кофе через традиционный фильтр фин.", "en": null}},
    {"day": 1, "title": {"ru": "Башня Куанг-Минь", "en": null}, "description": {"ru": "Новая золотая 13-ярусная башня в комплексе Чук-Лам Фунг-Тхюи-Шон; вид на Нячанг, бухту, острова и побережье.", "en": null}},
    {"day": 1, "title": {"ru": "Пагода Лонгшон", "en": null}, "description": {"ru": "Белый Будда и буддийская история города; подъезжаем к верхней части комплекса на автомобиле.", "en": null}},
    {"day": 1, "title": {"ru": "Кафедральный собор Христа-Царя", "en": null}, "description": {"ru": "Каменный неоготический собор французской эпохи, витражи и колокольня.", "en": null}},
    {"day": 1, "title": {"ru": "Башни По Нагар", "en": null}, "description": {"ru": "Наследие древнего Чамского королевства VII–XIII веков.", "en": null}},
    {"day": 1, "title": {"ru": "Хон Чонг", "en": null}, "description": {"ru": "Гранитная формация, легенда о «лапе дракона», море и культурный павильон.", "en": null}},
    {"day": 1, "title": {"ru": "Музей Александра Йерсена", "en": null}, "description": {"ru": "История учёного и Института Пастера в Нячанге.", "en": null}},
    {"day": 1, "title": {"ru": "Обед в кафе с вертолётом", "en": null}, "description": {"ru": "Гости выбирают блюда под себя; заказ оплачивается по факту.", "en": null}}
  ]'::jsonb,
  '[
    {"ru": "Автомобиль с водителем и личный русскоязычный гид", "en": null},
    {"ru": "Все заявленные входные билеты", "en": null},
    {"ru": "Кафе с капибарами и вьетнамский кофе", "en": null},
    {"ru": "Вода в дороге", "en": null},
    {"ru": "Гибкий маршрут: можно закончить раньше или задержаться у самых интересных точек", "en": null}
  ]'::jsonb,
  '[{"ru": "Обед в кафе с вертолётом — каждый выбирает блюда по меню и оплачивает сам", "en": null}]'::jsonb,
  1
);

-- 2. Маяк Дай Лань и бухта Вунг Ро
insert into tours (slug, title, short_description, duration_label, duration_days, is_dalat_two_day, itinerary, includes, excludes, sort_order) values (
  'mayak-dai-lan',
  '{"ru": "Маяк Дай Лань и бухта Вунг Ро", "en": null}',
  '{"ru": "Дикий берег за пределами Нячанга.", "en": null}',
  '{"ru": "Полный день", "en": null}',
  1, false,
  '[
    {"day": 1, "title": {"ru": "Tiệm Cafe Đồng Lúa", "en": null}, "description": {"ru": "Завтрак с видом на рисовые поля.", "en": null}},
    {"day": 1, "title": {"ru": "Католический собор Ванзя", "en": null}, "description": {"ru": "Атмосферная провинциальная остановка и другая сторона Центрального Вьетнама.", "en": null}},
    {"day": 1, "title": {"ru": "Вид на остров Хон Нуа", "en": null}, "description": {"ru": "Открытое море, остров и горный берег.", "en": null}},
    {"day": 1, "title": {"ru": "Маяк Дай Лань", "en": null}, "description": {"ru": "Главная точка маршрута: бухты, горы и масштаб побережья.", "en": null}},
    {"day": 1, "title": {"ru": "Дикий пляж Бай Мон", "en": null}, "description": {"ru": "Тихая бухта без пляжного конвейера.", "en": null}},
    {"day": 1, "title": {"ru": "Обед в Hương Biển Vũng Rô", "en": null}, "description": {"ru": "Рыбацкая бухта, лодки, горы и свежая еда у моря.", "en": null}},
    {"day": 1, "title": {"ru": "Буддийский храм", "en": null}, "description": {"ru": "Спокойная финальная точка на обратной дороге.", "en": null}}
  ]'::jsonb,
  '[
    {"ru": "Автомобиль с водителем и личный русскоязычный гид", "en": null},
    {"ru": "Завтрак у рисовых полей", "en": null},
    {"ru": "Вход на маяк Дай Лань", "en": null},
    {"ru": "Обед в бухте Вунг Ро", "en": null},
    {"ru": "Вода в дороге и все заявленные остановки", "en": null}
  ]'::jsonb,
  '[]'::jsonb,
  2
);

-- 3. Северные острова
insert into tours (slug, title, short_description, duration_label, duration_days, is_dalat_two_day, itinerary, includes, excludes, sort_order) values (
  'severnye-ostrova',
  '{"ru": "Северные острова", "en": null}',
  '{"ru": "Два острова: пляж, животные и спокойное море.", "en": null}',
  '{"ru": "08:00–16:30", "en": null}',
  1, false,
  '[
    {"day": 1, "title": {"ru": "Скоростной катер", "en": null}, "description": {"ru": "Старт без долгой дороги на большой общей лодке.", "en": null}},
    {"day": 1, "title": {"ru": "Остров Орхидей", "en": null}, "description": {"ru": "Эко-парк, зелень, фототочки, белый песок, спокойная вода и манго у моря. Слониха, пятнистые олени, страусы и шоу птиц по расписанию.", "en": null}},
    {"day": 1, "title": {"ru": "Остров Обезьян", "en": null}, "description": {"ru": "Прогулка, наблюдение за макаками, фотографии и интерактивное шоу при наличии в расписании.", "en": null}}
  ]'::jsonb,
  '[
    {"ru": "Забор из отеля, автомобиль и личный русскоязычный гид", "en": null},
    {"ru": "VIP-билет на оба острова", "en": null},
    {"ru": "Скоростной катер между островами", "en": null},
    {"ru": "Буфетный обед, вода и пляжная инфраструктура по VIP-пакету", "en": null},
    {"ru": "Все основные входы и островные активности по программе", "en": null}
  ]'::jsonb,
  '[{"ru": "Гидроцикл, парашют над морем, «банан» и другие водные активности — отдельно по желанию", "en": null}]'::jsonb,
  3
);

-- 4. Хон Там
insert into tours (slug, title, short_description, duration_label, duration_days, is_dalat_two_day, itinerary, includes, excludes, sort_order) values (
  'hon-tam',
  '{"ru": "Хон Там — грязевые ванны и private-день на острове", "en": null}',
  '{"ru": "Островной день без лишней логистики.", "en": null}',
  '{"ru": "Полный день", "en": null}',
  1, false,
  '[
    {"day": 1, "title": {"ru": "Трансфер к терминалу", "en": null}, "description": {"ru": "Комфортный лимузин-трансфер от отеля к терминалу.", "en": null}},
    {"day": 1, "title": {"ru": "Катер на остров", "en": null}, "description": {"ru": "Организованный вход без очередей.", "en": null}},
    {"day": 1, "title": {"ru": "Грязевые ванны и пляж", "en": null}, "description": {"ru": "Грязевые ванны, минеральные бассейны, море и пляж.", "en": null}},
    {"day": 1, "title": {"ru": "Буфет", "en": null}, "description": {"ru": "Включён в островной пакет.", "en": null}},
    {"day": 1, "title": {"ru": "Возвращение", "en": null}, "description": {"ru": "Без очередей и самостоятельной логистики.", "en": null}}
  ]'::jsonb,
  '[
    {"ru": "Лимузин-трансфер от отеля к терминалу и обратно", "en": null},
    {"ru": "Островной пакет Хон Там: катер, грязевые ванны, пляжные зоны, бассейны и буфет", "en": null},
    {"ru": "Личный русскоязычный гид Виктор", "en": null},
    {"ru": "Встреча, терминал, посадка, ориентиры на острове и возвращение", "en": null}
  ]'::jsonb,
  '[{"ru": "Водные активности и личные покупки — отдельно по желанию", "en": null}]'::jsonb,
  4
);

-- 5. Далат — 2 дня / 1 ночь
insert into tours (slug, title, short_description, duration_label, duration_days, is_dalat_two_day, itinerary, includes, excludes, sort_order) values (
  'dalat-2-dnya',
  '{"ru": "Далат — 2 дня / 1 ночь", "en": null}',
  '{"ru": "Два дня в горном Далате — без спешки и самостоятельной логистики.", "en": null}',
  '{"ru": "2 дня / 1 ночь", "en": null}',
  2, true,
  '[
    {"day": 1, "title": {"ru": "Старый железнодорожный вокзал Далата", "en": null}, "description": {"ru": "", "en": null}},
    {"day": 1, "title": {"ru": "Водопад Датанла", "en": null}, "description": {"ru": "Горки по желанию и оплачиваются отдельно.", "en": null}},
    {"day": 1, "title": {"ru": "Глиняная деревня", "en": null}, "description": {"ru": "", "en": null}},
    {"day": 1, "title": {"ru": "Канатная дорога", "en": null}, "description": {"ru": "", "en": null}},
    {"day": 1, "title": {"ru": "Стеклянный мост и Золотой Будда", "en": null}, "description": {"ru": "", "en": null}},
    {"day": 1, "title": {"ru": "Crazy House", "en": null}, "description": {"ru": "", "en": null}},
    {"day": 1, "title": {"ru": "Заселение в отель", "en": null}, "description": {"ru": "", "en": null}},
    {"day": 1, "title": {"ru": "Вечер под ключ", "en": null}, "description": {"ru": "Парк с лазерным шоу и заранее забронированный ресторан.", "en": null}},
    {"day": 2, "title": {"ru": "Пагода Линь Ан и водопад Слон", "en": null}, "description": {"ru": "", "en": null}},
    {"day": 2, "title": {"ru": "Шёлковая фабрика", "en": null}, "description": {"ru": "", "en": null}},
    {"day": 2, "title": {"ru": "Samten Hills", "en": null}, "description": {"ru": "Крупнейшее в мире молитвенное колесо, признанное Guinness World Records в 2022 году; панорамы и гималайская архитектура.", "en": null}},
    {"day": 2, "title": {"ru": "Вьетнамская ферма и кофейные плантации", "en": null}, "description": {"ru": "Капибары, альпаки, слоны, страусы и кофе копи-лувак.", "en": null}},
    {"day": 2, "title": {"ru": "Площадь Артишока и озеро Суан Хыонг", "en": null}, "description": {"ru": "", "en": null}}
  ]'::jsonb,
  '[
    {"ru": "Private-автомобиль с водителем на два дня и личный гид", "en": null},
    {"ru": "Ночь в отеле с завтраком", "en": null},
    {"ru": "Все заявленные входные билеты и основные активности маршрута", "en": null},
    {"ru": "Прогулка в вечернем парке и лазерное шоу", "en": null},
    {"ru": "Организация вечера: водитель отвезёт в парк, ресторан и обратно в отель", "en": null},
    {"ru": "Напиток из артишока", "en": null}
  ]'::jsonb,
  '[
    {"ru": "Обеды и ужин — заранее бронируем рестораны, гости сами выбирают блюда по меню и оплачивают", "en": null},
    {"ru": "Горки на Датанле — отдельно 130 000 / 250 000 VND", "en": null},
    {"ru": "Кофе на ферме — отдельно, копи-лувак 1 900 000 VND / кг", "en": null}
  ]'::jsonb,
  5
);

-- Цены по числу гостей (2–8)
insert into pricing_tiers (tour_id, guest_count, price_adult_usd, price_child_usd)
select id, v.guest_count, v.price_adult, null
from tours, (values
  (2, 130), (3, 105), (4, 75), (5, 70), (6, 60), (7, 60), (8, 55)
) as v(guest_count, price_adult)
where tours.slug = 'nyachang-avtorskiy';

insert into pricing_tiers (tour_id, guest_count, price_adult_usd, price_child_usd)
select id, v.guest_count, v.price_adult, null
from tours, (values
  (2, 170), (3, 140), (4, 100), (5, 90), (6, 80), (7, 75), (8, 70)
) as v(guest_count, price_adult)
where tours.slug = 'mayak-dai-lan';

insert into pricing_tiers (tour_id, guest_count, price_adult_usd, price_child_usd)
select id, v.guest_count, v.price_adult, v.price_child
from tours, (values
  (2, 160, 150), (3, 135, 125), (4, 105, 95), (5, 95, 85), (6, 85, 75), (7, 80, 70), (8, 70, 60)
) as v(guest_count, price_adult, price_child)
where tours.slug = 'severnye-ostrova';

insert into pricing_tiers (tour_id, guest_count, price_adult_usd, price_child_usd)
select id, v.guest_count, v.price_adult, null
from tours, (values
  (2, 155), (3, 125), (4, 100), (5, 90), (6, 80), (7, 75), (8, 70)
) as v(guest_count, price_adult)
where tours.slug = 'hon-tam';

insert into pricing_tiers (tour_id, guest_count, price_adult_usd, price_child_usd)
select id, v.guest_count, v.price_adult, null
from tours, (values
  (2, 475), (3, 385), (4, 295), (5, 270), (6, 245), (7, 225), (8, 210)
) as v(guest_count, price_adult)
where tours.slug = 'dalat-2-dnya';

-- Гид Виктор
insert into guides (name, phone, whatsapp, telegram, instagram, is_active, sort_order) values (
  'Виктор',
  '+84383714638',
  '+84383714638',
  '@viktor_Vietnam',
  'viktor_vietnam',
  true,
  1
);

-- Доплата за дальний трансфер (Камрань/Amiana)
insert into surcharges (code, name, amount_vnd, unit, is_active) values (
  'long_transfer_cam_ranh_amiana',
  '{"ru": "Доплата за дальний трансфер (Камрань/Amiana)", "en": null}',
  500000,
  'per_group_roundtrip',
  true
);

-- Настройки без деплоя: курс и наценка на RUB
insert into settings (key, value) values
  ('usd_vnd_rate', '{"rate": 26000, "updated_manually": true}'::jsonb),
  ('rub_markup_pct', '{"pct": 8}'::jsonb),
  ('package_discounts', '{"2": 5, "3": 10, "4": 15}'::jsonb),
  ('prepayment_rule', '{"pct": 30, "min_usd": 80}'::jsonb),
  ('cancellation_rule', '{"full_refund_hours_before": 24, "late_cancel_hold_usd": 80}'::jsonb);
