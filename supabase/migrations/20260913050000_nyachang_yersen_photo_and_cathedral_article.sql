-- Виктор в Telegram (2026-09-13):
-- 1) "В доме имени Ерсина потерялось третье фото в описании и в подробнее" —
--    в itinerary.photos точки "Музей Александра Йерсена" было только 2 URL,
--    хотя статья muzey-aleksandra-yersena уже ссылается на 3-е фото
--    (инфографика, файл в Blob цел) — попап на слайде маршрута брал фото
--    только из itinerary.photos, поэтому карусель показывала 2 из 3.
--    Добавляем 3.jpg в photos.
-- 2) "Для кафедрального собора нету кнопки Подробнее" — у точки не было ни
--    photos, ни article_slug. Прислал 3 новых фото (аэрофото фасада,
--    интерьер, вид сбоку) — залиты в Blob, добавляем как новую точку с
--    фото и статьёй.

update tours
set itinerary = (
  select jsonb_agg(
    case
      when item->'title'->>'ru' = 'Музей Александра Йерсена'
        then jsonb_set(item, '{photos}', item->'photos' || '["https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/nyachang/muzey-aleksandra-yersena/3.jpg"]'::jsonb)
      when item->'title'->>'ru' = 'Кафедральный собор Христа-Царя'
        then item
          || jsonb_build_object('photos', jsonb_build_array(
               'https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/nyachang/kafedralniy-sobor-nyachang/1.jpg',
               'https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/nyachang/kafedralniy-sobor-nyachang/2.png',
               'https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/nyachang/kafedralniy-sobor-nyachang/3.png'
             ))
          || jsonb_build_object('article_slug', 'kafedralniy-sobor-nyachang')
      else item
    end
  )
  from jsonb_array_elements(itinerary) as item
)
where slug = 'nyachang-avtorskiy';

insert into articles (slug, title, destination, excerpt, cover_image_url, body, related_tour_id, is_published, published_at)
select 'kafedralniy-sobor-nyachang', 'Кафедральный собор Христа-Царя в Нячанге', 'nyachang',
  'Каменный неоготический собор французской колониальной эпохи на холме над городом — витражи, высокая колокольня с часами и совсем не тропическая атмосфера внутри.',
  'https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/nyachang/kafedralniy-sobor-nyachang/1.jpg',
$b$Кафедральный собор Христа-Царя построен в 1930-х годах французскими миссионерами из грубого серого камня — редкий для тропического Нячанга образец европейской неоготики. Собор стоит на небольшом холме в центре города, поэтому заметен издалека, а высокая колокольня с часами и крестом возвышается над окрестными крышами.

[фото: https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/nyachang/kafedralniy-sobor-nyachang/2.png | Готические своды и витражи в интерьере собора]

Внутри — высокие стрельчатые своды, ряды деревянных скамей и разноцветные витражи над алтарём, сквозь которые проходит мягкий свет. Атмосфера внутри совсем не тропическая — скорее европейский собор XIX века, что создаёт заметный контраст с остальным маршрутом по Нячангу.

[фото: https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/nyachang/kafedralniy-sobor-nyachang/3.png | Собор сбоку: колокольня с часами и городская застройка вокруг]$b$,
  (select id from tours where slug = 'nyachang-avtorskiy'), true, now();
