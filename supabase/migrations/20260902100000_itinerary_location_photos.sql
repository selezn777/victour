-- Виктор в Telegram (2026-09-01): на слайде "Маршрут" у каждой локации
-- должна быть кликабельная кнопка, открывающая доп. страницу с фото этой
-- локации (большую часть экрана) и коротким описанием + кнопка назад
-- (см. LocationDetailSheet, tour-itinerary-slide.tsx). Формат пункта
-- itinerary теперь опционально несёт "photos": string[].
--
-- Реальные фото на локацию есть только у "Маяк Дай Лань" — 5 фото в
-- gallery_urls, ни разу ещё не показанных по отдельности. Сопоставил
-- визуально (открыл каждое) с текстом пункта маршрута, а не наугад по
-- порядку — совпадения однозначные (маяк, католический собор Ванзя с
-- двумя башнями, рисовые поля с качелями на закате, буддийская пагода,
-- рыбацкая бухта с плотами). Для "Вид на остров Хон Нуа" и "Дикий пляж
-- Бай Мон" подходящих фото не нашлось — у них "photos" не проставлен,
-- кнопка на слайде для них просто не появится, пока Виктор не пришлёт
-- фото (не подставляю фото наугад — неверная привязка хуже, чем кнопка,
-- которая пока не показывается).
update tours set itinerary = '[
  {"day": 1, "title": {"ru": "Tiệm Cafe Đồng Lúa", "en": null}, "description": {"ru": "Завтрак с видом на рисовые поля.", "en": null}, "photos": ["https://our41hywrmbsqagk.public.blob.vercel-storage.com/tours/mayak-dai-lan/gallery-4-ZYjnfqjLHGwsC7NUoqaGkK3QAe3eQ9.jpg"]},
  {"day": 1, "title": {"ru": "Католический собор Ванзя", "en": null}, "description": {"ru": "Атмосферная провинциальная остановка и другая сторона Центрального Вьетнама.", "en": null}, "photos": ["https://our41hywrmbsqagk.public.blob.vercel-storage.com/tours/mayak-dai-lan/gallery-3-ATZWG8XxO5AX38PDTeokqznAm2ZOnT.jpg"]},
  {"day": 1, "title": {"ru": "Вид на остров Хон Нуа", "en": null}, "description": {"ru": "Открытое море, остров и горный берег.", "en": null}},
  {"day": 1, "title": {"ru": "Маяк Дай Лань", "en": null}, "description": {"ru": "Главная точка маршрута: бухты, горы и масштаб побережья.", "en": null}, "photos": ["https://our41hywrmbsqagk.public.blob.vercel-storage.com/tours/mayak-dai-lan/gallery-2-0FWzyc7AaHZJfflkozhDvSyKItZnCR.jpg"]},
  {"day": 1, "title": {"ru": "Дикий пляж Бай Мон", "en": null}, "description": {"ru": "Тихая бухта без пляжного конвейера.", "en": null}},
  {"day": 1, "title": {"ru": "Обед в Hương Biển Vũng Rô", "en": null}, "description": {"ru": "Рыбацкая бухта, лодки, горы и свежая еда у моря.", "en": null}, "photos": ["https://our41hywrmbsqagk.public.blob.vercel-storage.com/tours/mayak-dai-lan/gallery-1-bay-view-R5K1oTzHH6k2powSrlFjUtpEhlAJ0s.jpg"]},
  {"day": 1, "title": {"ru": "Буддийский храм", "en": null}, "description": {"ru": "Спокойная финальная точка на обратной дороге.", "en": null}, "photos": ["https://our41hywrmbsqagk.public.blob.vercel-storage.com/tours/mayak-dai-lan/gallery-5-JFzXwvSqHZAEDqpJCB6qlFVTNyItce.jpg"]}
]'::jsonb
where slug = 'mayak-dai-lan';
