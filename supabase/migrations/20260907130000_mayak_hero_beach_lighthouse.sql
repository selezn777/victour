-- Виктор в Telegram (2026-09-07): первое фото-обложка "Маяка" (аэровид,
-- лежащая портретом карточка) при обрезке object-cover срезала сам маяк
-- сбоку — он был у правого края квадратного кадра. Новое фото — пляж со
-- следами на песке, маяк ближе к центру кадра, при обрезке уцелеет.

update tours set hero_image_url = '/images/tours/mayak-dai-lan-beach-lighthouse.jpg'
where slug = 'mayak-dai-lan';
