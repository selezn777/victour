alter table tours add column if not exists gallery_urls text[] not null default '{}';

update tours
set gallery_urls = array[
  'https://our41hywrmbsqagk.public.blob.vercel-storage.com/tours/mayak-dai-lan/gallery-1-bay-view-R5K1oTzHH6k2powSrlFjUtpEhlAJ0s.jpg',
  'https://our41hywrmbsqagk.public.blob.vercel-storage.com/tours/mayak-dai-lan/gallery-2-0FWzyc7AaHZJfflkozhDvSyKItZnCR.jpg',
  'https://our41hywrmbsqagk.public.blob.vercel-storage.com/tours/mayak-dai-lan/gallery-3-ATZWG8XxO5AX38PDTeokqznAm2ZOnT.jpg',
  'https://our41hywrmbsqagk.public.blob.vercel-storage.com/tours/mayak-dai-lan/gallery-4-ZYjnfqjLHGwsC7NUoqaGkK3QAe3eQ9.jpg',
  'https://our41hywrmbsqagk.public.blob.vercel-storage.com/tours/mayak-dai-lan/gallery-5-JFzXwvSqHZAEDqpJCB6qlFVTNyItce.jpg'
]
where slug = 'mayak-dai-lan';
