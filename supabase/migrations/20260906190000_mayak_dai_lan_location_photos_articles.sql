-- Виктор в Telegram (2026-09-06): фото по локациям тура "Маяк Дай Лань" —
-- по аналогии с 20260906180000 (Нячанг): 1-е фото каждой локации в общий
-- коллаж тура + статья с полным набором фото. "Вид на остров Хон Нуа" —
-- фото по-прежнему не прислано, пропущен. Из присланных 18 фото два не
-- использованы: одно с водяным знаком "#BaoVeHaiDang" (похоже на чужое
-- стоковое фото, не будем использовать на коммерческом сайте) и одно
-- почти дублирующее по ракурсу фото собора.

update tours set itinerary = '[
  {"day": 1, "title": {"ru": "Tiệm Cafe Đồng Lúa", "en": null}, "description": {"ru": "Завтрак с видом на рисовые поля.", "en": null}, "photos": ["https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/mayak-dai-lan/tiem-cafe-dong-lua/1.png", "https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/mayak-dai-lan/tiem-cafe-dong-lua/2.png", "https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/mayak-dai-lan/tiem-cafe-dong-lua/3.png"], "article_slug": "tiem-cafe-dong-lua"},
  {"day": 1, "title": {"ru": "Католический собор Ванзя", "en": null}, "description": {"ru": "Атмосферная провинциальная остановка и другая сторона Центрального Вьетнама.", "en": null}, "photos": ["https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/mayak-dai-lan/sobor-vanzya/1.png", "https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/mayak-dai-lan/sobor-vanzya/2.jpg", "https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/mayak-dai-lan/sobor-vanzya/3.png"], "article_slug": "sobor-vanzya"},
  {"day": 1, "title": {"ru": "Вид на остров Хон Нуа", "en": null}, "description": {"ru": "Открытое море, остров и горный берег.", "en": null}},
  {"day": 1, "title": {"ru": "Маяк Дай Лань", "en": null}, "description": {"ru": "Главная точка маршрута: бухты, горы и масштаб побережья.", "en": null}, "photos": ["https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/mayak-dai-lan/mayak-dai-lan-article/1.png", "https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/mayak-dai-lan/mayak-dai-lan-article/2.png"], "article_slug": "mayak-dai-lan"},
  {"day": 1, "title": {"ru": "Дикий пляж Бай Мон", "en": null}, "description": {"ru": "Тихая бухта без пляжного конвейера.", "en": null}, "photos": ["https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/mayak-dai-lan/plyazh-bay-mon/1.png", "https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/mayak-dai-lan/plyazh-bay-mon/2.jpg"], "article_slug": "plyazh-bay-mon"},
  {"day": 1, "title": {"ru": "Обед в Hương Biển Vũng Rô", "en": null}, "description": {"ru": "Рыбацкая бухта, лодки, горы и свежая еда у моря.", "en": null}, "photos": ["https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/mayak-dai-lan/obed-vung-ro/1.png", "https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/mayak-dai-lan/obed-vung-ro/2.png", "https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/mayak-dai-lan/obed-vung-ro/3.png"], "article_slug": "obed-vung-ro"},
  {"day": 1, "title": {"ru": "Буддийский храм", "en": null}, "description": {"ru": "Спокойная финальная точка на обратной дороге.", "en": null}, "photos": ["https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/mayak-dai-lan/buddiyskiy-khram-dai-lan/1.png", "https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/mayak-dai-lan/buddiyskiy-khram-dai-lan/2.png", "https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/mayak-dai-lan/buddiyskiy-khram-dai-lan/3.png"], "article_slug": "buddiyskiy-khram-dai-lan"}
]'::jsonb
where slug = 'mayak-dai-lan';

update tours set gallery_urls = array[
  'https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/mayak-dai-lan/tiem-cafe-dong-lua/1.png',
  'https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/mayak-dai-lan/sobor-vanzya/1.png',
  'https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/mayak-dai-lan/mayak-dai-lan-article/1.png',
  'https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/mayak-dai-lan/plyazh-bay-mon/1.png',
  'https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/mayak-dai-lan/obed-vung-ro/1.png',
  'https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/mayak-dai-lan/buddiyskiy-khram-dai-lan/1.png'
]
where slug = 'mayak-dai-lan';

insert into articles (slug, title, destination, excerpt, cover_image_url, body, related_tour_id, is_published, published_at)
select
  v.slug, v.title, 'dai-lan', v.excerpt, v.cover_image_url, v.body,
  (select id from tours where slug = 'mayak-dai-lan'),
  true, now()
from (values

  ('tiem-cafe-dong-lua', 'Tiệm Cafe Đồng Lúa: завтрак среди рисовых полей',
   'Кофе и завтрак с видом на рисовые поля Фу Йена — тихое начало дня перед дорогой к маяку.',
   'https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/mayak-dai-lan/tiem-cafe-dong-lua/1.png',
$body1$На выезде из Нячанга по дороге к маяку Дай Лань есть остановка, которая сама по себе часть впечатления, а не просто заправка кофеином. Tiệm Cafe Đồng Lúa («Кафе рисового поля») построено буквально среди действующих рисовых чеков — деревянные веранды и мостки проложены прямо посреди зелени, а сами плантации остаются рабочими весь год, туристы им не мешают.

[фото: https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/mayak-dai-lan/tiem-cafe-dong-lua/1.png | Деревянные качели на фоне рисовых полей на закате]

Здание кафе построено из тёмного состаренного дерева, без единой пластиковой детали — навесы, скамьи и барная стойка сколочены в стиле традиционного вьетнамского фермерского дома. По вечерам вдоль мостков зажигаются гирлянды, а рисовые чеки на закате отражают небо, как зеркало.

[фото: https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/mayak-dai-lan/tiem-cafe-dong-lua/2.png | Веранда кафе из тёмного дерева среди рисовых полей]

Рядом с основным залом — небольшой пруд с лотосами, где летом цветут крупные розовые цветы. Это первая остановка маршрута: здесь группа завтракает и настраивается на день, прежде чем ехать дальше — к морю и маяку.

[фото: https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/mayak-dai-lan/tiem-cafe-dong-lua/3.png | Пруд с цветущими лотосами у кафе]$body1$),

  ('sobor-vanzya', 'Собор Ванзя: неоготика на побережье',
   'Один из самых заметных католических соборов на трассе Центрального Вьетнама — по пути от рисовых полей к морю.',
   'https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/mayak-dai-lan/sobor-vanzya/1.png',
$body2$Собор в Ванзя (Vạn Giã) — один из самых заметных католических храмов на трассе между Нячангом и Фу Йеном. Католическая община появилась здесь ещё в XIX веке благодаря французским миссионерам, а нынешнее здание в стиле европейской неоготики, с двумя высокими симметричными колокольнями, стало архитектурным ориентиром всего побережья.

[фото: https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/mayak-dai-lan/sobor-vanzya/1.png | Фасад собора Ванзя на закате]

Белые стены, окна-розы и остроконечные шпили с крестами делают собор заметным издалека — его видно с трассы за несколько километров. Несмотря на скромный размер городка, здесь крупная местная католическая община, а служба идёт на вьетнамском языке по традиционному обряду.

[фото: https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/mayak-dai-lan/sobor-vanzya/2.jpg | Собор Ванзя, вид с другого ракурса]

Внутри — высокие своды, ряды деревянных скамей и распятие над алтарём в глубине нефа; свет проходит через витражи, создавая приглушённую атмосферу, совсем не похожую на трассу снаружи. Контраст рисовых полей, собора и открытого моря через час пути — часть того, что делает маршрут интересным.

[фото: https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/mayak-dai-lan/sobor-vanzya/3.png | Внутреннее убранство собора: скамьи и распятие в алтарной части]$body2$),

  ('mayak-dai-lan', 'Маяк Дай Лань: между морем и небом',
   'Один из старейших работающих маяков Вьетнама — вертикальная доминанта побережья, до сих пор в строю.',
   'https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/mayak-dai-lan/mayak-dai-lan-article/1.png',
$body3$Маяк Дай Лань на одноимённом мысе — одна из крайних восточных точек материкового Вьетнама и один из старейших маяков страны: первую башню здесь построили в 1890 году французские колониальные власти, чтобы обезопасить торговые суда на опасном участке побережья. Нынешняя белая башня — более поздняя постройка, но маяк работает без остановки больше века и до сих пор в строю, а не музейный экспонат.

[фото: https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/mayak-dai-lan/mayak-dai-lan-article/1.png | Маяк Дай Лань с воздуха, рядом — служебные постройки]

С мыса открывается панорама сразу на две стороны — бухту с рыбацкими лодками с одной стороны и открытое море с другой. Место считается у части вьетнамцев самой восточной точкой материковой суши страны, поэтому сюда специально приезжают встречать один из самых ранних восходов на континентальном Вьетнаме.

[фото: https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/mayak-dai-lan/mayak-dai-lan-article/2.png | Маяк с высоты: скалистый мыс, бухта и пляж рядом]

Маяк остаётся действующим морским объектом — не превращён в аттракцион, вход к подножию свободный, но технические помещения закрыты для посетителей. Именно эта подлинность, а не декорация под туристов, и делает точку особенной.$body3$),

  ('plyazh-bay-mon', 'Дикий пляж Бай Мон: бухта без шезлонгов',
   'Пустой песчаный пляж рядом с маяком Дай Лань — без отельной застройки и толп.',
   'https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/mayak-dai-lan/plyazh-bay-mon/1.png',
$body4$Бай Мон — небольшая бухта прямо у подножия мыса с маяком Дай Лань, в паре минут ходьбы от него. В отличие от курортных пляжей Нячанга, здесь нет ни одного шезлонга, бара или отеля — только полоса светлого песка, чистая вода и скалы по краям бухты.

[фото: https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/mayak-dai-lan/plyazh-bay-mon/1.png | Пляж Бай Мон, следы на песке, маяк на холме вдалеке]

Пляж защищён мысом от волн открытого моря, поэтому вода здесь обычно спокойнее, чем на соседних участках побережья. Это осознанно нетронутая остановка маршрута — без инфраструктуры, просто пауза у моря между маяком и обедом в рыбацкой бухте дальше по программе.

[фото: https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/mayak-dai-lan/plyazh-bay-mon/2.jpg | Волны бухты Бай Мон у скалистого мыса]$body4$),

  ('obed-vung-ro', 'Обед в Hương Biển Vũng Rô: рыбацкая бухта и свежие морепродукты',
   'Плавучие фермы, рыбацкие лодки и обед из утреннего улова — гастрономическая остановка тура у бухты Вунг Ро.',
   'https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/mayak-dai-lan/obed-vung-ro/1.png',
$body5$Бухта Вунг Ро — одна из самых защищённых природных гаваней Центрального Вьетнама, со всех сторон окружённая горами. Здесь исторически базируется рыболовный флот, а в последние десятилетия бухта плотно застроена плавучими фермами: рыбу, лобстеров и моллюсков разводят прямо в открытой воде залива.

[фото: https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/mayak-dai-lan/obed-vung-ro/1.png | Плавучие рыбные фермы и лодки в бухте Вунг Ро]

Ресторан Hương Biển стоит прямо на берегу, и меню строится вокруг того, что поймали или вырастили в этой же воде утром того же дня — рыба, крабы, лобстеры и моллюски подаются практически без дороги от улова до тарелки.

[фото: https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/mayak-dai-lan/obed-vung-ro/2.png | Рыбацкие лодки и плавучие домики фермеров на воде]

Гости выбирают морепродукты по факту — по сезону и улову дня, а не по фиксированному меню. После утра с рисовыми полями, собором и маяком это самая сытная и неспешная часть дня — обед с видом на воду, которую только что видели с высоты мыса.

[фото: https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/mayak-dai-lan/obed-vung-ro/3.png | Свежие морепродукты — рыба, крабы, лобстеры на льду]$body5$),

  ('buddiyskiy-khram-dai-lan', 'Буддийский храм на обратной дороге',
   'Финальная остановка маршрута — тихий действующий буддийский храм провинции Фу Йен.',
   'https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/mayak-dai-lan/buddiyskiy-khram-dai-lan/1.png',
$body6$На обратном пути из бухты Вунг Ро в Нячанг маршрут заезжает в небольшой действующий буддийский храм — без громкого имени и толп туристов, зато с настоящей монашеской жизнью и тишиной, которая особенно чувствуется после насыщенного дня на солнце и в дороге.

[фото: https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/mayak-dai-lan/buddiyskiy-khram-dai-lan/1.png | Вход в храм: ворота с фигурами драконов и львов]

Внутри главного зала — крупная статуя Будды в золотом облачении на фоне росписи с горами и водопадами, а перед алтарём — подношения: фрукты, цветы, благовония. Это действующее место службы местной общины, а не музейная декорация для туристических автобусов.

[фото: https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/mayak-dai-lan/buddiyskiy-khram-dai-lan/2.png | Алтарь с золотой статуей Будды и подношениями]

Ухоженный двор с топиарными деревьями и черепичной пагодой в глубине — хорошее место, чтобы медленно выдохнуть перед дорогой назад в Нячанг и мысленно закрыть длинный день у моря, в горах и на побережье.

[фото: https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/mayak-dai-lan/buddiyskiy-khram-dai-lan/3.png | Двор храма с пагодой и садом]$body6$)

) as v(slug, title, excerpt, cover_image_url, body);
