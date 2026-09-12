-- Виктор в Telegram (2026-09-12): 3-е фото у "Обед в Hương Biển Vũng Rô"
-- (рыба на льду) выглядело неправдоподобно, к тому же на присланной ранее
-- версии был чужой водяной знак "shihuka_sveta" — прислал своё живое фото
-- (лобстеры в тазах с водой) взамен, попросил старое удалить полностью.
update tours
set itinerary = jsonb_set(
  itinerary,
  '{5,photos,2}',
  '"https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/mayak-dai-lan/obed-vung-ro/3-lobsters.jpg"'::jsonb
)
where slug = 'mayak-dai-lan'
  and itinerary->5->'title'->>'ru' = 'Обед в Hương Biển Vũng Rô';

update articles
set body = replace(
  replace(
    body,
    'https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/mayak-dai-lan/obed-vung-ro/3.png',
    'https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/mayak-dai-lan/obed-vung-ro/3-lobsters.jpg'
  ),
  'Свежие морепродукты — рыба, крабы, лобстеры на льду',
  'Живые лобстеры в тазах с водой — гости сами выбирают, что пойдёт на стол'
)
where slug = 'obed-vung-ro';
