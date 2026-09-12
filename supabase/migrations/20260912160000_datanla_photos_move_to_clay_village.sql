-- Виктор в Telegram (2026-09-12): 2 фото у "Водопад Датанла" на самом деле
-- сняты в "Глиняной деревне" (статуи обезьян и ящера/черепах) — перенёс
-- (файлы в Blob скопированы под articles/dalat/glinyanaya-derevnya-dalat/,
-- старые пути удалены).
update tours
set itinerary = jsonb_set(
  jsonb_set(
    itinerary,
    '{1,photos}',
    '["https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/dalat/vodopad-datanla/1.png", "https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/dalat/vodopad-datanla/2.png", "https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/dalat/vodopad-datanla/5.png", "https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/dalat/vodopad-datanla/6.png"]'::jsonb
  ),
  '{2,photos}',
  '["https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/dalat/glinyanaya-derevnya-dalat/1.png", "https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/dalat/glinyanaya-derevnya-dalat/2.jpg", "https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/dalat/glinyanaya-derevnya-dalat/3.jpg"]'::jsonb
)
where slug = 'dalat-2-dnya'
  and itinerary->1->'title'->>'ru' = 'Водопад Датанла'
  and itinerary->2->'title'->>'ru' = 'Глиняная деревня';
