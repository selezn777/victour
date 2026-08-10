-- Билеты и личные опции по локациям маршрута (используется только у Далата на старте).
alter table tours add column ticket_options jsonb not null default '[]'::jsonb;

update tours set ticket_options = '[
  {"location": {"ru": "Железнодорожный вокзал", "en": null}, "guest_vnd": 60000, "guide_vnd": 60000, "note": {"ru": null, "en": null}},
  {"location": {"ru": "Датанла", "en": null}, "guest_vnd": 80000, "guide_vnd": 0, "note": {"ru": "Горки: 130 000 / 250 000 VND", "en": null}},
  {"location": {"ru": "Глиняная деревня", "en": null}, "guest_vnd": 120000, "guide_vnd": 0, "note": {"ru": null, "en": null}},
  {"location": {"ru": "Канатная дорога", "en": null}, "guest_vnd": 120000, "guide_vnd": 0, "note": {"ru": null, "en": null}},
  {"location": {"ru": "Стеклянный мост", "en": null}, "guest_vnd": 420000, "guide_vnd": 420000, "note": {"ru": "При раннем бронировании возможна цена 350 000 VND", "en": null}},
  {"location": {"ru": "Crazy House", "en": null}, "guest_vnd": 80000, "guide_vnd": 0, "note": {"ru": null, "en": null}},
  {"location": {"ru": "Samten Hills", "en": null}, "guest_vnd": 300000, "guide_vnd": 300000, "note": {"ru": null, "en": null}},
  {"location": {"ru": "Линь Ан + водопад Слон", "en": null}, "guest_vnd": 60000, "guide_vnd": 0, "note": {"ru": null, "en": null}},
  {"location": {"ru": "Золотой Будда", "en": null}, "guest_vnd": 0, "guide_vnd": 0, "note": {"ru": null, "en": null}},
  {"location": {"ru": "Кофе на ферме", "en": null}, "guest_vnd": null, "guide_vnd": null, "note": {"ru": "Чашка 80 000 VND; копи-лувак 1 900 000 VND / кг", "en": null}}
]'::jsonb
where slug = 'dalat-2-dnya';
