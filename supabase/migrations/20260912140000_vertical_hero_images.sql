-- Виктор в Telegram (2026-09-12): на странице выбора тура (/tours) карточка
-- на весь экран телефона (TourCard fill, object-cover в контейнере
-- h-[calc(100dvh-...)]) — квадратные фото при таком объекте сильно
-- обрезаются по высоте. Прислал новые фото в формате 9:16 (телефонный
-- портрет) для трёх туров с плейсхолдерами; Нячанг не трогаем — там уже
-- нормальное фото.
update tours set hero_image_url = '/images/tours/fanrang-avtorskiy-vertical.jpg' where slug = 'fanrang-avtorskiy';
update tours set hero_image_url = '/images/tours/mayak-dai-lan-vertical.jpg' where slug = 'mayak-dai-lan';
update tours set hero_image_url = '/images/tours/dalat-2-dnya-vertical.jpg' where slug = 'dalat-2-dnya';
