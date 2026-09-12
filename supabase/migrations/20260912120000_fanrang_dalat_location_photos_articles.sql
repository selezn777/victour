-- Виктор в Telegram (2026-09-12): прислал 55 фото по турам "Авторский
-- Фанранг" и "Далат — 2 дня / 1 ночь". Разобрал по локациям (подписи не
-- всегда стояли рядом с фото той же точки — смотрел содержимое каждого,
-- где не был уверен). Правило то же, что и раньше: 1-е фото тройки — в
-- общий коллаж тура и обложка статьи, остальные — в тело статьи.
--
-- Для Фанранга нашлись фото трёх точек, которых не было в itinerary
-- (Аквапарк, Чампские башни, Завтрак в деревне раглаев) — добавил их в
-- маршрут в логичном месте (завтрак — первым, башни — после лабиринта,
-- аквапарк — перед возвращением). Для Далата все точки уже существовали.
-- Фото "Железнодорожный вокзал" — далатский старый вокзал, не фанрангский
-- (визуально сверил архитектуру, положение в присланной последовательности
-- было обманчивым).

-- 1. article-destinations — добавлено вручную в
--    src/lib/article-destinations.ts (fanrang, dalat).

-- 2. Маршрут "Авторский Фанранг" — полная замена (переставил порядок,
--    добавил 3 новые точки, фото + article_slug там, где есть фото).
update tours set itinerary = '[
  {"day": 1, "title": {"ru": "Завтрак в деревне племени раглаев", "en": null}, "description": {"ru": "Утренний старт в горной деревне народности раглай — простой быт коренных жителей южного Вьетнама.", "en": null}, "photos": ["https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/fanrang/zavtrak-raglai-fanrang/1.png"]},
  {"day": 1, "title": {"ru": "Лабиринт дракона", "en": null}, "description": {"ru": "Каменный лабиринт с мозаикой из ракушек и скульптурами драконов — необычная разминка перед историческими точками маршрута.", "en": null}, "photos": ["https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/fanrang/labirint-drakona-fanrang/1.png", "https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/fanrang/labirint-drakona-fanrang/2.png", "https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/fanrang/labirint-drakona-fanrang/3.png"], "article_slug": "labirint-drakona-fanrang"},
  {"day": 1, "title": {"ru": "Чампские башни", "en": null}, "description": {"ru": "Древние кирпичные башни Чамского королевства на холме; иногда — представление в национальных костюмах.", "en": null}, "photos": ["https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/fanrang/champskie-bashni-fanrang/1.png", "https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/fanrang/champskie-bashni-fanrang/2.png", "https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/fanrang/champskie-bashni-fanrang/3.png"], "article_slug": "champskie-bashni-fanrang"},
  {"day": 1, "title": {"ru": "Виноградники Фанранга", "en": null}, "description": {"ru": "", "en": null}},
  {"day": 1, "title": {"ru": "Обед: курица с рисом на 6 вкусов", "en": null}, "description": {"ru": "Главное блюдо Южного Вьетнама — курица с рисом, шесть разных блюд из курицы.", "en": null}},
  {"day": 1, "title": {"ru": "Музей", "en": null}, "description": {"ru": "Краеведческий музей с экспозицией рыболовецкого быта побережья Ниньтхуан.", "en": null}, "photos": ["https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/fanrang/muzey-fanranga/1.jpg", "https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/fanrang/muzey-fanranga/2.jpg"], "article_slug": "muzey-fanranga"},
  {"day": 1, "title": {"ru": "Деревня ремесленников", "en": null}, "description": {"ru": "Деревня чамов — гончарное дело без гончарного круга и ручное ткачество, одни из старейших ремёсел региона.", "en": null}, "photos": ["https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/fanrang/derevnya-remeslennikov-fanrang/1.jpg", "https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/fanrang/derevnya-remeslennikov-fanrang/2.jpg", "https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/fanrang/derevnya-remeslennikov-fanrang/3.png"], "article_slug": "derevnya-remeslennikov-fanrang"},
  {"day": 1, "title": {"ru": "Зоопарк", "en": null}, "description": {"ru": "", "en": null}, "photos": ["https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/fanrang/zoopark-fanrang/1.jpg", "https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/fanrang/zoopark-fanrang/2.png", "https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/fanrang/zoopark-fanrang/3.png", "https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/fanrang/zoopark-fanrang/4.png"], "article_slug": "zoopark-fanrang"},
  {"day": 1, "title": {"ru": "Аквапарк", "en": null}, "description": {"ru": "Аквапарк с горками — отдых у воды после насыщенного дня на солнце.", "en": null}, "photos": ["https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/fanrang/akvapark-fanrang/1.png", "https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/fanrang/akvapark-fanrang/2.png", "https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/fanrang/akvapark-fanrang/3.png"], "article_slug": "akvapark-fanrang"},
  {"day": 1, "title": {"ru": "Возвращение", "en": null}, "description": {"ru": "Едем обратно в Нячанг.", "en": null}}
]'::jsonb
where slug = 'fanrang-avtorskiy';

update tours set gallery_urls = array[
  'https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/fanrang/labirint-drakona-fanrang/1.png',
  'https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/fanrang/champskie-bashni-fanrang/1.png',
  'https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/fanrang/muzey-fanranga/1.jpg',
  'https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/fanrang/derevnya-remeslennikov-fanrang/1.jpg',
  'https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/fanrang/zoopark-fanrang/1.jpg',
  'https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/fanrang/akvapark-fanrang/1.png',
  'https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/fanrang/zavtrak-raglai-fanrang/1.png'
]
where slug = 'fanrang-avtorskiy';

-- 3. Маршрут "Далат — 2 дня / 1 ночь" — полная замена (порядок и тексты
--    описаний не менял, только добавил photos/article_slug).
update tours set itinerary = '[
  {"day": 1, "title": {"ru": "Старый железнодорожный вокзал Далата", "en": null}, "description": {"ru": "", "en": null}, "photos": ["https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/dalat/vokzal-dalat/1.png", "https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/dalat/vokzal-dalat/2.png", "https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/dalat/vokzal-dalat/3.png"], "article_slug": "vokzal-dalat"},
  {"day": 1, "title": {"ru": "Водопад Датанла", "en": null}, "description": {"ru": "Горки по желанию и оплачиваются отдельно.", "en": null}, "photos": ["https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/dalat/vodopad-datanla/1.png", "https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/dalat/vodopad-datanla/2.png", "https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/dalat/vodopad-datanla/3.jpg", "https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/dalat/vodopad-datanla/4.jpg", "https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/dalat/vodopad-datanla/5.png", "https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/dalat/vodopad-datanla/6.png"], "article_slug": "vodopad-datanla"},
  {"day": 1, "title": {"ru": "Глиняная деревня", "en": null}, "description": {"ru": "", "en": null}, "photos": ["https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/dalat/glinyanaya-derevnya-dalat/1.png"]},
  {"day": 1, "title": {"ru": "Канатная дорога", "en": null}, "description": {"ru": "", "en": null}, "photos": ["https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/dalat/kanatnaya-doroga-dalat/1.jpg", "https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/dalat/kanatnaya-doroga-dalat/2.png", "https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/dalat/kanatnaya-doroga-dalat/3.png"], "article_slug": "kanatnaya-doroga-dalat"},
  {"day": 1, "title": {"ru": "Стеклянный мост и Золотой Будда", "en": null}, "description": {"ru": "", "en": null}, "photos": ["https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/dalat/steklyanniy-most-budda-dalat/1.png", "https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/dalat/steklyanniy-most-budda-dalat/2.png", "https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/dalat/steklyanniy-most-budda-dalat/3.png", "https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/dalat/steklyanniy-most-budda-dalat/4.png", "https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/dalat/steklyanniy-most-budda-dalat/5.png", "https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/dalat/steklyanniy-most-budda-dalat/6.png"], "article_slug": "steklyanniy-most-budda-dalat"},
  {"day": 1, "title": {"ru": "Crazy House", "en": null}, "description": {"ru": "", "en": null}, "photos": ["https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/dalat/crazy-house-dalat/1.png", "https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/dalat/crazy-house-dalat/2.png", "https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/dalat/crazy-house-dalat/3.png"], "article_slug": "crazy-house-dalat"},
  {"day": 1, "title": {"ru": "Заселение в отель", "en": null}, "description": {"ru": "", "en": null}},
  {"day": 1, "title": {"ru": "Вечер под ключ", "en": null}, "description": {"ru": "Парк с лазерным шоу и заранее забронированный ресторан.", "en": null}, "photos": ["https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/dalat/delight-park-dalat/1.jpg", "https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/dalat/delight-park-dalat/2.jpg", "https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/dalat/delight-park-dalat/3.jpg"], "article_slug": "delight-park-dalat"},
  {"day": 2, "title": {"ru": "Пагода Линь Ан и водопад Слон", "en": null}, "description": {"ru": "", "en": null}, "photos": ["https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/dalat/lin-an-vodopad-slona-dalat/1.png", "https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/dalat/lin-an-vodopad-slona-dalat/2.png", "https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/dalat/lin-an-vodopad-slona-dalat/3.png", "https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/dalat/lin-an-vodopad-slona-dalat/4.png", "https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/dalat/lin-an-vodopad-slona-dalat/5.png", "https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/dalat/lin-an-vodopad-slona-dalat/6.png"], "article_slug": "lin-an-vodopad-slona-dalat"},
  {"day": 2, "title": {"ru": "Шёлковая фабрика", "en": null}, "description": {"ru": "", "en": null}},
  {"day": 2, "title": {"ru": "Samten Hills", "en": null}, "description": {"ru": "Крупнейшее в мире молитвенное колесо, признанное Guinness World Records в 2022 году; панорамы и гималайская архитектура.", "en": null}, "photos": ["https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/dalat/samten-hills-dalat/1.png", "https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/dalat/samten-hills-dalat/2.jpg", "https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/dalat/samten-hills-dalat/3.png"], "article_slug": "samten-hills-dalat"},
  {"day": 2, "title": {"ru": "Вьетнамская ферма и кофейные плантации", "en": null}, "description": {"ru": "Капибары, альпаки, слоны, страусы и кофе копи-лувак.", "en": null}},
  {"day": 2, "title": {"ru": "Площадь Артишока и озеро Суан Хыонг", "en": null}, "description": {"ru": "", "en": null}}
]'::jsonb
where slug = 'dalat-2-dnya';

update tours set gallery_urls = array[
  'https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/dalat/vokzal-dalat/1.png',
  'https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/dalat/vodopad-datanla/1.png',
  'https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/dalat/glinyanaya-derevnya-dalat/1.png',
  'https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/dalat/kanatnaya-doroga-dalat/1.jpg',
  'https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/dalat/steklyanniy-most-budda-dalat/1.png',
  'https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/dalat/crazy-house-dalat/1.png',
  'https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/dalat/delight-park-dalat/1.jpg',
  'https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/dalat/lin-an-vodopad-slona-dalat/1.png',
  'https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/dalat/samten-hills-dalat/1.png'
]
where slug = 'dalat-2-dnya';

-- 4. Статьи блога (СЕО) — is_published сразу true.
insert into articles (slug, title, destination, excerpt, cover_image_url, body, related_tour_id, is_published, published_at)
select v.slug, v.title, v.destination, v.excerpt, v.cover_image_url, v.body,
  (select id from tours where slug = v.tour_slug), true, now()
from (values

  ('labirint-drakona-fanrang', 'Лабиринт дракона: каменная сказка под Фанрангом', 'fanrang',
   'Тоннели из ракушек и кораллов, драконьи головы и башни — самая необычная фотозона по дороге в Фанранг.',
   'https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/fanrang/labirint-drakona-fanrang/1.png', 'fanrang-avtorskiy',
$b$Ещё на подъезде к Фанрангу видно декоративные башни, сложенные будто из окаменевших кораллов и ракушек — это и есть Лабиринт дракона: небольшой тематический парк, где из грубого камня и цемента вылеплены тоннели, гроты и драконьи морды. Здесь нет исторической подоплёки — это современная арт-достопримечательность, но сделанная с размахом: узкие проходы, неровный свет из щелей в потолке и ощущение, что идёшь внутри живого существа.

[фото: https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/fanrang/labirint-drakona-fanrang/1.png | Вход в лабиринт в виде драконьей пасти]

Внутри — узкие каменные коридоры с мозаикой из ракушек, поднимающиеся и петляющие между башнями. Пространство маленькое, но снято и построено с расчётом на фотографии — контрастный свет, фактурные стены, необычные ракурсы.

[фото: https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/fanrang/labirint-drakona-fanrang/2.png | Тоннель внутри лабиринта]

Дальше — сами башни-драконы, увитые тропической зеленью и цветами, с лестницами и смотровыми проёмами наверх. Хорошая точка, чтобы размяться в начале дня, прежде чем маршрут перейдёт к более серьёзным историческим местам.

[фото: https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/fanrang/labirint-drakona-fanrang/3.png | Декоративная башня лабиринта в зелени]$b$),

  ('muzey-fanranga', 'Музей Фанранга: быт рыбацкого побережья', 'fanrang',
   'Небольшой краеведческий музей провинции Ниньтхуан — рыболовные снасти, лодки и история побережья.',
   'https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/fanrang/muzey-fanranga/1.jpg', 'fanrang-avtorskiy',
$b$Провинция Ниньтхуан, центр которой — Фанранг, веками жила рыбной ловлей: сухой климат и небольшие дожди здесь не годятся для риса, зато побережье богато рыбой. Местный музей — современное здание необычной формы, но экспозиция внутри рассказывает именно об этом простом прибрежном быте: плетёные лодки-корзины, сети, снасти и старые фотографии рыбацких посёлков вроде Ниньхай.

[фото: https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/fanrang/muzey-fanranga/1.jpg | Здание музея на закате]

Само здание стоит того, чтобы задержаться снаружи: смелая современная архитектура с двумя треугольными "крыльями" резко контрастирует с историческим содержимым внутри — редкое сочетание для небольшого провинциального города.

[фото: https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/fanrang/muzey-fanranga/2.jpg | Музей с другого ракурса]$b$),

  ('champskie-bashni-fanrang', 'Чампские башни: наследие исчезнувшего королевства', 'fanrang',
   'Кирпичные храмовые башни королевства Чампа на холме над Фанрангом — древнее большинства построек Вьетнама.',
   'https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/fanrang/champskie-bashni-fanrang/1.png', 'fanrang-avtorskiy',
$b$На невысоком холме недалеко от Фанранга стоят три кирпичные башни, которым больше семи веков — это храмовый комплекс королевства Чампа, некогда контролировавшего всё побережье южного и центрального Вьетнама. Кирпич уложен без раствора, а способ, которым чамы этого добивались, до сих пор изучают историки. Комплекс — не музей под открытым небом, а действующее святилище: местные до сих пор приходят сюда молиться.

[фото: https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/fanrang/champskie-bashni-fanrang/2.png | Башни среди цветущей зелени]

По праздникам у подножия башен проходят представления в национальных костюмах чамов — яркие красно-белые наряды, веера и традиционные танцы, которые сохранились почти без изменений с прошлых веков.

[фото: https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/fanrang/champskie-bashni-fanrang/3.png | Кирпичная арка на входе в комплекс башен]

С холма, на котором стоят башни, открывается вид на сухие равнины Ниньтхуана — самый засушливый регион Вьетнама, что хорошо объясняет и цвет кирпича, и характер всей округи.$b$),

  ('derevnya-remeslennikov-fanrang', 'Деревня ремесленников: гончары и ткачихи народа чам', 'fanrang',
   'Гончарное дело без гончарного круга и ручное ткачество — одни из старейших ремёсел Юго-Восточной Азии живы до сих пор.',
   'https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/fanrang/derevnya-remeslennikov-fanrang/1.jpg', 'fanrang-avtorskiy',
$b$Рядом с чамскими башнями сохранились и ремёсла того же народа. В гончарной деревне до сих пор лепят посуду без гончарного круга — мастерица сама ходит вокруг заготовки, а не крутит её на станке; способ, который антропологи считают одним из древнейших в Юго-Восточной Азии. Орнаменты на кувшинах и статуэтках — те же, что и на кирпичных башнях по соседству.

[фото: https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/fanrang/derevnya-remeslennikov-fanrang/2.jpg | Мастерица вырезает орнамент на глиняном сосуде]

Второе ремесло деревни — ткачество на ручном станке: нити красят натуральными красителями, а узор на ткани выкладывается вручную, нить за нитью, без электрических машин. На готовые ткани уходят недели работы.

[фото: https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/fanrang/derevnya-remeslennikov-fanrang/3.png | Ткачиха за традиционным станком]$b$),

  ('zoopark-fanrang', 'Зоопарк Фанранга: от крокодилов до павлинов', 'fanrang',
   'Contact-зоопарк, где можно покормить павлина с руки, подержать козлёнка и увидеть крокодила в естественном на вид пруду.',
   'https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/fanrang/zoopark-fanrang/1.jpg', 'fanrang-avtorskiy',
$b$Зоопарк в Фанранге устроен по принципу контактного парка: животных не прячут за толстым стеклом, а часть вольеров и вовсе открытая. Начинается всё с милых мелочей — например, суслика или капибароподобного грызуна дают подержать прямо на руках и покормить кукурузой.

[фото: https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/fanrang/zoopark-fanrang/2.png | Павлин с распущенным хвостом рядом с посетительницей]

Павлины здесь свободно расхаживают по территории и охотно распускают хвост, если рядом есть еда, а в контактной зоне можно подержать козлёнка — для многих детей это первое живое знакомство с фермерскими животными.

[фото: https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/fanrang/zoopark-fanrang/3.png | Посетительница держит на руках маленького козлёнка]

Финальная точка маршрута по зоопарку — вольер с крокодилами у пруда, стилизованного под дикую реку с зарослями по берегам. Разница между ручными животными в начале и этим хищником в конце — часть впечатления от прогулки.

[фото: https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/fanrang/zoopark-fanrang/4.png | Крокодил у берега пруда]$b$),

  ('akvapark-fanrang', 'Аквапарк Фанранга: горки на десерт', 'fanrang',
   'Финальная остановка насыщенного дня — водные горки и бассейн под жарким солнцем Ниньтхуана.',
   'https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/fanrang/akvapark-fanrang/1.png', 'fanrang-avtorskiy',
$b$Ниньтхуан — самый солнечный и засушливый регион Вьетнама: дождей мало, а солнце почти круглый год. Неудивительно, что здесь появился свой аквапарк — с разноцветными горками разной крутизны, от семейных до закрытых труб для любителей поострее.

[фото: https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/fanrang/akvapark-fanrang/2.png | Многоуровневые водные горки]

После насыщенного утра с башнями, музеем и зоопарком аквапарк — логичная точка, чтобы просто охладиться и отдохнуть перед дорогой назад. Бассейн окружён пальмами, а к вечеру горки подсвечивает закатное солнце.

[фото: https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/fanrang/akvapark-fanrang/3.png | Горки на закате]$b$),

  ('vokzal-dalat', 'Старый вокзал Далата: конечная станция горной дороги', 'dalat',
   'Единственный сохранившийся французский колониальный вокзал во Вьетнаме — и старейшая горная железная дорога Индокитая.',
   'https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/dalat/vokzal-dalat/1.png', 'dalat-2-dnya',
$b$Железнодорожный вокзал Далата построен французами в 1930-х годах и считается одним из красивейших во всём Вьетнаме: три остроконечных крыши в стиле нормандских шале, жёлто-охристые стены и витражи над входом. Раньше отсюда шла зубчатая горная дорога до самого Тхапчама — станции у Фанранга, откуда начинался этот же маршрут.

[фото: https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/dalat/vokzal-dalat/2.png | Вокзал с высоты, видны рельсы и город вокруг]

Сегодня по короткому отрезку пути всё ещё ходит туристический паровозик до соседней пагоды, а сам вокзал по вечерам красиво подсвечивается — форма крыш на фоне заката делает его одной из самых узнаваемых построек Далата.

[фото: https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/dalat/vokzal-dalat/3.png | Вокзал вечером, подсвеченный поезд у платформы]$b$),

  ('vodopad-datanla', 'Датанла: водопад, тобогган и каменный зверинец', 'dalat',
   'Водопад в сосновом лесу, спуск на тобоггане и парк со скульптурами — одна из самых насыщенных остановок в Далате.',
   'https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/dalat/vodopad-datanla/1.png', 'dalat-2-dnya',
$b$Датанла — один из самых популярных водопадов у Далата, но известен он не только самим падением воды. Спуститься к нему можно на алгоритме местных развлечений — тобоггане: одноместных санях на рельсах, которые сам гость разгоняет и тормозит вручную, петляя между соснами.

[фото: https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/dalat/vodopad-datanla/2.png | Семья катится на тобоггане через лес]

У подножия — сам водопад, невысокий, но полноводный, с деревянными мостиками и смотровыми площадками прямо над потоком воды.

[фото: https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/dalat/vodopad-datanla/3.jpg | Водопад Датанла с мостиком]

По пути разбросаны неожиданные декорации — фигуры трёх обезьян "не вижу, не слышу, не скажу", статуя Кинг-Конга у пруда с цветами и каменные драконы с черепахами у воды. Получается не просто водопад, а целый парк с аттракционами и фотозонами на каждом шагу.

[фото: https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/dalat/vodopad-datanla/5.png | Скульптура Кинг-Конга у пруда с цветами]$b$),

  ('kanatnaya-doroga-dalat', 'Канатная дорога Далата: озеро и сосны с высоты', 'dalat',
   'Одна из самых длинных канатных дорог Вьетнама — вид на озеро Туйенлам и монастырь Чуклам среди сосновых лесов.',
   'https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/dalat/kanatnaya-doroga-dalat/1.jpg', 'dalat-2-dnya',
$b$Канатная дорога Далата тянется несколько километров над сосновым лесом — редким для тропического Вьетнама пейзажем, который и делает Далат "городом вечной весны". Кабинки медленно плывут над озером Туйенлам и спускаются у монастыря Чуклам, одного из крупнейших дзен-буддийских монастырей страны.

[фото: https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/dalat/kanatnaya-doroga-dalat/2.png | Кабинки канатной дороги над озером и лесом]

На смотровой площадке у верхней станции стоит монетный бинокль — можно рассмотреть весь город внизу, от черепичных крыш до дальних холмов на горизонте.

[фото: https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/dalat/kanatnaya-doroga-dalat/3.png | Смотровая площадка с видом на город Далат]$b$),

  ('steklyanniy-most-budda-dalat', 'Стеклянный мост и Золотой Будда: адреналин и умиротворение рядом', 'dalat',
   'Подвесной мост со стеклянным настилом над лесом — и статуя смеющегося Будды высотой с трёхэтажный дом по соседству.',
   'https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/dalat/steklyanniy-most-budda-dalat/1.png', 'dalat-2-dnya',
$b$Стеклянный мост переброшен над лесистым ущельем: настил прозрачный, так что под ногами видно верхушки деревьев и цветочные плантации далеко внизу. Для тех, кто не боится высоты — эффектные фотографии, для остальных — короткое, но острое испытание на 60-70 метрах над землёй.

[фото: https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/dalat/steklyanniy-most-budda-dalat/3.png | Вид на мост и зелёную долину с высоты птичьего полёта]

В том же комплексе — гигантская золотая статуя смеющегося Будды Майтрейи, одна из крупнейших во Вьетнаме, с традиционным нимбом из металлических спиц за спиной. У её подножия сидят и медитируют вместе с монахами.

[фото: https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/dalat/steklyanniy-most-budda-dalat/4.png | Золотая статуя смеющегося Будды]

Рядом, в отдельном павильоне — лежащий золотой Будда в окружении подношений и разноцветных лент, которые оставляют паломники. Контраст с адреналином моста получается почти мгновенным.

[фото: https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/dalat/steklyanniy-most-budda-dalat/6.png | Лежащая статуя золотого Будды в храме]$b$),

  ('crazy-house-dalat', 'Crazy House: дом-дерево посреди Далата', 'dalat',
   'Гостиница-скульптура, вдохновлённая Гауди — извилистые лестницы, лианы из бетона и ни одного прямого угла.',
   'https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/dalat/crazy-house-dalat/1.png', 'dalat-2-dnya',
$b$Crazy House — не аттракцион и не музей, а действующий гостевой дом, который вьетнамский архитектор Данг Вьет Нга строит и достраивает с 1990-х годов, вдохновляясь работами Гауди. Здание похоже на переплетение гигантских деревьев: комнаты спрятаны внутри "стволов", а коридоры между ними — это узкие мостики и лестницы без единого прямого угла.

[фото: https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/dalat/crazy-house-dalat/2.png | Вид сверху на извилистые лестницы и корни-переходы Crazy House]

Внутри — комнаты в виде дупла, паутины сталактитов из цемента и мебель, сросшаяся со стенами. Дом продолжает расти: часть площадки до сих пор в стройке, так что при каждом визите можно застать что-то новое.

[фото: https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/dalat/crazy-house-dalat/3.png | Один из интерьеров Crazy House с каменной отделкой]$b$),

  ('delight-park-dalat', 'Delight Park вечером: светящееся поле и огненное шоу', 'dalat',
   'Вечерний парк развлечений Далата — светящиеся инсталляции, огненное шоу и прогулка после ужина в горном городе.',
   'https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/dalat/delight-park-dalat/2.jpg', 'dalat-2-dnya',
$b$Вечер первого дня в Далате заканчивается в Delight Park — парке развлечений, который оживает именно после заката. Поле светящихся "одуванчиков" на фоне ночного города создаёт эффект, будто гуляешь по инопланетному саду.

[фото: https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/dalat/delight-park-dalat/3.jpg | Светящиеся инсталляции в форме одуванчиков вечером]

По вечерам здесь же проходит огненно-световое шоу — выступающие работают с пламенем и светящимися кольцами прямо на аллеях парка. После насыщенного дня — спокойная и красивая точка, чтобы выдохнуть перед ужином в заранее забронированном ресторане.

[фото: https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/dalat/delight-park-dalat/1.jpg | Огненное шоу в парке ночью]$b$),

  ('lin-an-vodopad-slona-dalat', 'Пагода Линь Ан и водопад Слон: белая богиня над лесом', 'dalat',
   'Гигантская статуя Куан Ам, золотой Будда и один из самых полноводных водопадов в окрестностях Далата.',
   'https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/dalat/lin-an-vodopad-slona-dalat/1.png', 'dalat-2-dnya',
$b$Пагода Линь Ан стоит на холме и издалека узнаётся по гигантской белой статуе богини милосердия Куан Ам — она видна из многих точек долины. У подножия комплекса — ещё одна статуя, золотого смеющегося Будды, окружённая садом и десятками маленьких каменных фигур.

[фото: https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/dalat/lin-an-vodopad-slona-dalat/3.png | Золотая статуя Будды у подножия пагоды]

Рядом с пагодой — водопад Слон, один из самых мощных и полноводных в окрестностях Далата: потоки воды падают широкой стеной, а над ущельем часто повисает радуга. Смотровые площадки подходят почти вплотную к падающей воде — здесь всегда влажно от брызг.

[фото: https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/dalat/lin-an-vodopad-slona-dalat/5.png | Водопад Слон с радугой и туристами на смотровой]

С некоторых точек у водопада белая статуя Куан Ам видна прямо над кромкой леса — редкое сочетание буддийской святыни и природной силы в одном кадре.

[фото: https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/dalat/lin-an-vodopad-slona-dalat/6.png | Водопад и белая статуя богини вдалеке]$b$),

  ('samten-hills-dalat', 'Samten Hills: самое большое молитвенное колесо в мире', 'dalat',
   'Гималайская архитектура, золотое молитвенное колесо из Книги рекордов Гиннесса и панорамы горного Далата.',
   'https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/dalat/samten-hills-dalat/1.png', 'dalat-2-dnya',
$b$Samten Hills — буддийский культурный парк в гималайском стиле, совсем не похожий на остальной Далат: золотые ступы, молитвенные флаги и террасные сады на склоне холма. Главный экспонат — молитвенное колесо высотой с четырёхэтажный дом, признанное самым большим в мире и занесённое в Книгу рекордов Гиннесса в 2022 году.

[фото: https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/dalat/samten-hills-dalat/2.jpg | Золотое молитвенное колесо Samten Hills на фоне гор]

Ещё один эффектный объект комплекса — гигантские золотые ладони, держащие миниатюрную статую Будды на троне; на фоне человека масштаб скульптуры особенно заметен. С террас парка открывается панорама на горы и рисовые поля вокруг Далата.

[фото: https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/dalat/samten-hills-dalat/3.png | Золотые ладони со статуей Будды и человек рядом для масштаба]$b$)

) as v(slug, title, destination, excerpt, cover_image_url, tour_slug, body);
