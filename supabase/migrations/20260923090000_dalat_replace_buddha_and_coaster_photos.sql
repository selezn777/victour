-- Виктор прислал новые фото: Будда + барабан (галерея 1/13) и тобогган
-- на Датанле (галерея 8/13, 1-е фото пункта "Водопад Датанла", обложка
-- статьи vodopad-datanla). Уже применено на проде через service role.
update tours set gallery_urls = array_replace(gallery_urls,
  'https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/dalat/gallery-hero/4.jpg', 'https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/dalat/gallery-hero/4-v2-20260923.jpg')
where slug = 'dalat-2-dnya';

update tours set gallery_urls = array_replace(gallery_urls,
  'https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/dalat/gallery-hero/11.jpg', 'https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/dalat/vodopad-datanla/1-v2-20260923.jpg')
where slug = 'dalat-2-dnya';

update tours set itinerary = replace(itinerary::text,
  'https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/dalat/vodopad-datanla/1.png', 'https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/dalat/vodopad-datanla/1-v2-20260923.jpg')::jsonb
where slug = 'dalat-2-dnya';

update articles set cover_image_url = 'https://our41hywrmbsqagk.public.blob.vercel-storage.com/articles/dalat/vodopad-datanla/1-v2-20260923.jpg'
where slug = 'vodopad-datanla';
