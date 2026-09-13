-- Виктор в Telegram (2026-09-13): "Стеклянный мост и Золотой Будда" — это
-- два разных места, склеенные в одну точку маршрута по ошибке. Разбиваем
-- на 2 отдельные точки со своими статьями. Фото не перезаливались,
-- остались в старой папке steklyanniy-most-budda-dalat/, просто
-- перераспределены: 1-3 — мост, 4-6 — Будда (сверил визуально: 1 и 2 —
-- девушка на мосту, 3 — вид на мост сверху; 4 — сидящая золотая статуя,
-- 5 — та же статуя с медитирующим монахом, 6 — лежащий золотой Будда).

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
  {"day": 2, "title": {"en": null, "ru": "Пагода Линь Ан и водопад Слон"}, "photos": ["https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/dalat/lin-an-vodopad-slona-dalat/1.png", "https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/dalat/lin-an-vodopad-slona-dalat/2.png", "https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/dalat/lin-an-vodopad-slona-dalat/3.png", "https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/dalat/lin-an-vodopad-slona-dalat/4.png", "https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/dalat/lin-an-vodopad-slona-dalat/5.png", "https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/dalat/lin-an-vodopad-slona-dalat/6.png"], "description": {"en": null, "ru": ""}, "article_slug": "lin-an-vodopad-slona-dalat"},
  {"day": 2, "title": {"en": null, "ru": "Шёлковая фабрика"}, "description": {"en": null, "ru": ""}},
  {"day": 2, "title": {"en": null, "ru": "Samten Hills"}, "photos": ["https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/dalat/samten-hills-dalat/1.png", "https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/dalat/samten-hills-dalat/2.jpg", "https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/dalat/samten-hills-dalat/3.png"], "description": {"en": null, "ru": "Крупнейшее в мире молитвенное колесо, признанное Guinness World Records в 2022 году; панорамы и гималайская архитектура."}, "article_slug": "samten-hills-dalat"},
  {"day": 2, "title": {"en": null, "ru": "Вьетнамская ферма и кофейные плантации"}, "description": {"en": null, "ru": "Капибары, альпаки, слоны, страусы и кофе копи-лувак."}},
  {"day": 2, "title": {"en": null, "ru": "Площадь Артишока и озеро Суан Хыонг"}, "description": {"en": null, "ru": ""}}
]'::jsonb
where slug = 'dalat-2-dnya';

update tours set gallery_urls = array[
  'https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/dalat/vokzal-dalat/1.png',
  'https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/dalat/vodopad-datanla/1.png',
  'https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/dalat/glinyanaya-derevnya-dalat/1.png',
  'https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/dalat/kanatnaya-doroga-dalat/1.jpg',
  'https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/dalat/steklyanniy-most-budda-dalat/1.png',
  'https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/dalat/steklyanniy-most-budda-dalat/4.png',
  'https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/dalat/crazy-house-dalat/1.png',
  'https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/dalat/delight-park-dalat/1.jpg',
  'https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/dalat/lin-an-vodopad-slona-dalat/1.png',
  'https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/dalat/samten-hills-dalat/1.png'
]
where slug = 'dalat-2-dnya';

-- Старая склеенная статья заменяется двумя новыми.
delete from articles where slug = 'steklyanniy-most-budda-dalat';

insert into articles (slug, title, destination, excerpt, cover_image_url, body, related_tour_id, is_published, published_at)
select v.slug, v.title, v.destination, v.excerpt, v.cover_image_url, v.body,
  (select id from tours where slug = v.tour_slug), true, now()
from (values

  ('steklyanniy-most-dalat', 'Стеклянный мост Далата: адреналин над зелёной долиной', 'dalat',
   'Подвесной мост со стеклянным настилом на высоте 60-70 метров над лесистым ущельем — короткое, но острое испытание для тех, кто не боится высоты.',
   'https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/dalat/steklyanniy-most-budda-dalat/1.png', 'dalat-2-dnya',
$b$Стеклянный мост переброшен над лесистым ущельем: настил прозрачный, так что под ногами видно верхушки деревьев и цветочные плантации далеко внизу. Для тех, кто не боится высоты — эффектные фотографии, для остальных — короткое, но острое испытание на 60-70 метрах над землёй.

[фото: https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/dalat/steklyanniy-most-budda-dalat/2.png | Девушка в белом платье на стеклянном мосту]

[фото: https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/dalat/steklyanniy-most-budda-dalat/3.png | Вид на мост и зелёную долину с высоты птичьего полёта]$b$),

  ('zolotoy-budda-dalat', 'Золотой Будда в Далате: гигантская статуя по соседству с мостом', 'dalat',
   'В том же комплексе, что и стеклянный мост, — одна из крупнейших во Вьетнаме золотых статуй Будды и отдельный павильон с лежащим золотым Буддой.',
   'https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/dalat/steklyanniy-most-budda-dalat/4.png', 'dalat-2-dnya',
$b$В том же комплексе, что и стеклянный мост, — гигантская золотая статуя смеющегося Будды Майтрейи, одна из крупнейших во Вьетнаме, с традиционным нимбом из металлических спиц за спиной. У её подножия сидят и медитируют вместе с монахами.

[фото: https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/dalat/steklyanniy-most-budda-dalat/5.png | Статуя Будды с медитирующим монахом у подножия]

Рядом, в отдельном павильоне — лежащий золотой Будда в окружении подношений и разноцветных лент, которые оставляют паломники. Контраст с адреналином соседнего моста получается почти мгновенным.

[фото: https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/dalat/steklyanniy-most-budda-dalat/6.png | Лежащая статуя золотого Будды в храме]$b$)

) as v(slug, title, destination, excerpt, cover_image_url, tour_slug, body);
