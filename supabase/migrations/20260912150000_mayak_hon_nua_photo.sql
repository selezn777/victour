-- Виктор в Telegram (2026-09-12): наконец прислал фото для "Вид на остров
-- Хон Нуа" (mayak-dai-lan) — раньше точка была без фото (см. комментарий в
-- 20260902100000_itinerary_location_photos.sql, честно не подставляли
-- фото наугад). Один снимок — добавляем в itinerary и в общий коллаж
-- (gallery_urls), без отдельной статьи (как и у других точек с 1 фото).
update tours
set itinerary = jsonb_set(
  itinerary,
  '{2,photos}',
  '["https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/mayak-dai-lan/vid-na-ostrov-hon-nua/1.png"]'::jsonb
),
gallery_urls = gallery_urls || array['https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/mayak-dai-lan/vid-na-ostrov-hon-nua/1.png']
where slug = 'mayak-dai-lan'
  and itinerary->2->'title'->>'ru' = 'Вид на остров Хон Нуа';
