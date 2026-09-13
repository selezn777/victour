-- Виктор в Telegram (2026-09-13): во 2-м дне тура "Далат — 2 дня":
-- 1) разделить "Пагода Линь Ан и водопад Слон" на 2 отдельные точки со
--    своими статьями (как ранее разбили мост+Будда в 1-м дне) — фото не
--    перезаливались, остались в старой папке lin-an-vodopad-slona-dalat/,
--    просто перераспределены (сверил визуально: 2,3,4 — пагода Линь Ан
--    (белая статуя, аэрофото пагоды, золотой смеющийся Будда), 1,5,6 —
--    водопад Слон (сам водопад, туристы на смотровой, общий план));
-- 2) добавить первым пунктом дня "Завтрак в отеле" с новым фото (шведский
--    стол), без статьи;
-- 3) добавить последним пунктом дня "Возвращение" — по конвенции Фанранга.

update tours set itinerary = '[
  {"day": 1, "title": {"ru": "Завтрак у племени", "en": null}, "description": {"ru": "Утренний старт в горной деревне народности раглай — простой быт коренных жителей и завтрак с видом на реку перед долгой дорогой в Далат.", "en": null}, "photos": ["https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/dalat/zavtrak-u-plemeni-dalat/1.png", "https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/dalat/zavtrak-u-plemeni-dalat/2.png", "https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/dalat/zavtrak-u-plemeni-dalat/3.png"]},
  {"day": 1, "title": {"en": null, "ru": "Старый железнодорожный вокзал Далата"}, "photos": ["https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/dalat/vokzal-dalat/1.png", "https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/dalat/vokzal-dalat/2.png", "https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/dalat/vokzal-dalat/3.png"], "description": {"en": null, "ru": ""}, "article_slug": "vokzal-dalat"},
  {"day": 1, "title": {"en": null, "ru": "Водопад Датанла"}, "photos": ["https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/dalat/vodopad-datanla/1.png", "https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/dalat/vodopad-datanla/2.png", "https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/dalat/vodopad-datanla/6.png"], "description": {"en": null, "ru": "Горки по желанию и оплачиваются отдельно."}, "article_slug": "vodopad-datanla"},
  {"day": 1, "title": {"en": null, "ru": "Глиняная деревня"}, "photos": ["https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/dalat/glinyanaya-derevnya-dalat/1.png", "https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/dalat/glinyanaya-derevnya-dalat/2.jpg", "https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/dalat/glinyanaya-derevnya-dalat/3.jpg"], "description": {"en": null, "ru": ""}},
  {"day": 1, "title": {"en": null, "ru": "Канатная дорога"}, "photos": ["https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/dalat/kanatnaya-doroga-dalat/1.jpg", "https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/dalat/kanatnaya-doroga-dalat/2.png", "https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/dalat/kanatnaya-doroga-dalat/3.png"], "description": {"en": null, "ru": ""}, "article_slug": "kanatnaya-doroga-dalat"},
  {"day": 1, "title": {"en": null, "ru": "Стеклянный мост"}, "photos": ["https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/dalat/steklyanniy-most-budda-dalat/1.png", "https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/dalat/steklyanniy-most-budda-dalat/2.png", "https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/dalat/steklyanniy-most-budda-dalat/3.png"], "description": {"en": null, "ru": ""}, "article_slug": "steklyanniy-most-dalat"},
  {"day": 1, "title": {"en": null, "ru": "Золотой Будда"}, "photos": ["https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/dalat/steklyanniy-most-budda-dalat/4.png", "https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/dalat/steklyanniy-most-budda-dalat/5.png", "https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/dalat/steklyanniy-most-budda-dalat/6.png"], "description": {"en": null, "ru": ""}, "article_slug": "zolotoy-budda-dalat"},
  {"day": 1, "title": {"en": null, "ru": "Crazy House"}, "photos": ["https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/dalat/crazy-house-dalat/1.png", "https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/dalat/crazy-house-dalat/2.png", "https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/dalat/crazy-house-dalat/3.png"], "description": {"en": null, "ru": ""}, "article_slug": "crazy-house-dalat"},
  {"day": 1, "title": {"en": null, "ru": "Заселение в отель"}, "description": {"en": null, "ru": ""}},
  {"day": 1, "title": {"en": null, "ru": "Вечер под ключ"}, "photos": ["https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/dalat/delight-park-dalat/1.jpg", "https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/dalat/delight-park-dalat/2.jpg", "https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/dalat/delight-park-dalat/3.jpg"], "description": {"en": null, "ru": "Парк с лазерным шоу и заранее забронированный ресторан."}, "article_slug": "delight-park-dalat"},
  {"day": 2, "title": {"en": null, "ru": "Завтрак в отеле"}, "photos": ["https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/dalat/zavtrak-v-otele-dalat/1.jpg"], "description": {"en": null, "ru": "Шведский стол в отеле перед выездом на маршрут второго дня."}},
  {"day": 2, "title": {"en": null, "ru": "Пагода Линь Ан"}, "photos": ["https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/dalat/lin-an-vodopad-slona-dalat/2.png", "https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/dalat/lin-an-vodopad-slona-dalat/3.png", "https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/dalat/lin-an-vodopad-slona-dalat/4.png"], "description": {"en": null, "ru": ""}, "article_slug": "lin-an-dalat"},
  {"day": 2, "title": {"en": null, "ru": "Водопад Слон"}, "photos": ["https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/dalat/lin-an-vodopad-slona-dalat/1.png", "https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/dalat/lin-an-vodopad-slona-dalat/5.png", "https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/dalat/lin-an-vodopad-slona-dalat/6.png"], "description": {"en": null, "ru": ""}, "article_slug": "vodopad-slona-dalat"},
  {"day": 2, "title": {"en": null, "ru": "Шёлковая фабрика"}, "description": {"en": null, "ru": ""}},
  {"day": 2, "title": {"en": null, "ru": "Samten Hills"}, "photos": ["https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/dalat/samten-hills-dalat/1.png", "https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/dalat/samten-hills-dalat/2.jpg", "https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/dalat/samten-hills-dalat/3.png"], "description": {"en": null, "ru": "Крупнейшее в мире молитвенное колесо, признанное Guinness World Records в 2022 году; панорамы и гималайская архитектура."}, "article_slug": "samten-hills-dalat"},
  {"day": 2, "title": {"en": null, "ru": "Вьетнамская ферма и кофейные плантации"}, "description": {"en": null, "ru": "Капибары, альпаки, слоны, страусы и кофе копи-лувак."}},
  {"day": 2, "title": {"en": null, "ru": "Площадь Артишока и озеро Суан Хыонг"}, "description": {"en": null, "ru": ""}},
  {"day": 2, "title": {"ru": "Возвращение", "en": null}, "description": {"ru": "Едем обратно в Нячанг.", "en": null}}
]'::jsonb
where slug = 'dalat-2-dnya';

-- Старая склеенная статья заменяется двумя новыми.
delete from articles where slug = 'lin-an-vodopad-slona-dalat';

insert into articles (slug, title, destination, excerpt, cover_image_url, body, related_tour_id, is_published, published_at)
select v.slug, v.title, v.destination, v.excerpt, v.cover_image_url, v.body,
  (select id from tours where slug = v.tour_slug), true, now()
from (values

  ('lin-an-dalat', 'Пагода Линь Ан в Далате: гигантская статуя и золотой Будда', 'dalat',
   'Буддийский комплекс на холме рядом с водопадом Слон — огромная белая статуя бодхисаттвы и золотая фигура смеющегося Будды в окружении зелени.',
   'https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/dalat/lin-an-vodopad-slona-dalat/2.png', 'dalat-2-dnya',
$b$Пагода Линь Ан стоит на холме прямо над водопадом Слон — та же территория, соседняя остановка маршрута. Главная достопримечательность — гигантская белая статуя бодхисаттвы, возвышающаяся над крышами храма и открывающая панораму на город и горы вокруг.

[фото: https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/dalat/lin-an-vodopad-slona-dalat/3.png | Аэрофото пагоды: белая статуя над красными крышами храма среди цветущих кустарников]

В глубине комплекса — золотая статуя смеющегося Будды Майтрейи с традиционным нимбом из металлических спиц за спиной, в окружении множества мелких белых фигур и цветов.

[фото: https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/dalat/lin-an-vodopad-slona-dalat/4.png | Золотая статуя смеющегося Будды в окружении статуй и зелени]$b$),

  ('vodopad-slona-dalat', 'Водопад Слон в Далате: мощный поток и смотровая площадка', 'dalat',
   'Один из самых полноводных водопадов провинции Лам Донг — широкий поток с радугой в брызгах и смотровая площадка прямо у подножия.',
   'https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/dalat/lin-an-vodopad-slona-dalat/1.png', 'dalat-2-dnya',
$b$Водопад Слон — мощный широкий поток, падающий с высоты прямо в лес: брызги поднимаются облаком, а в солнечную погоду в них часто видна радуга. Рядом с пагодой Линь Ан, соседняя остановка того же комплекса.

[фото: https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/dalat/lin-an-vodopad-slona-dalat/5.png | Туристы на смотровой площадке у водопада]

Смотровая площадка расположена прямо у подножия — отсюда лучше всего видно, как вода срывается со скалы, а на заднем плане, на соседнем холме, видна белая статуя пагоды.

[фото: https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/dalat/lin-an-vodopad-slona-dalat/6.png | Водопад и статуя пагоды на общем плане]$b$)

) as v(slug, title, destination, excerpt, cover_image_url, tour_slug, body);
