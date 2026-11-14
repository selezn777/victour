// Тур Фукуока «Юг Фукуока 2.0» (Виктор 2026-11-14): канатка со шведским столом, 6 фотозон Сансета на электрокаре,
// Мост Поцелуев с дроном, ужин-шоу Symphony в Sun Bavaria. Капекс $200, всё включено.
// Фото: node --env-file=.env.local scripts/_r2.mjs phuquoc-yug2 <picks.json>
// Запуск: node --env-file=.env.local supabase/seed-scripts/phuquoc-yug2.mjs
import { createClient } from '@supabase/supabase-js';
const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const SLUG = 'phuquoc-yug2';
// За группу: 2 - $460, 3 - $561, 4 - $652, 5 - $750, 6 - $882
const TIERS = [[2, 230], [3, 187], [4, 163], [5, 150], [6, 147]];
const ru = (x) => ({ en: null, ru: x });
const item = (title, description) => ({ day: 1, title: ru(title), description: ru(description), photos: [], article_slug: null });
const tour = {
  slug: SLUG,
  title: ru('Юг Фукуока 2.0: остров, Сансет Таун и ужин-шоу с салютом'),
  short_description: ru('Весь юг острова за один день: канатка над морем, аквапарк и шведский стол на Хонтхоме, шесть главных фотозон Сансет Тауна на электрокаре, Мост Поцелуев на закате с фото с дрона и ужин-шоу Symphony с салютом. Все билеты уже включены.'),
  duration_label: ru('9:00-21:00'),
  duration_days: 1, is_dalat_two_day: false, is_active: true, sort_order: 9,
  hero_image_url: null, gallery_urls: [], ticket_options: [],
  itinerary: [
    item('8 км над морем', 'В 9:00 забираем вас из отеля и едем прямо на юг, по дороге рассказываю историю острова. Канатка на Хонтхом открывается в 9:30, и мы среди первых, без очереди. Билеты уже на руках: сажаю вас в кабинку, и вы летите почти 8 км над заливом и рыбацкими лодками.'),
    item('Целый день на острове', 'На Хонтхоме белый пляж, аквапарк Aquatopia и аттракционы, обед шведский стол уже входит в ваш билет. Купальник и полотенце берите с собой, телефоны удобно оставить в шкафчике. Около 15:30 возвращаетесь канаткой, пока к последним кабинкам не собралась очередь.'),
    item('Шесть легендарных фотозон Сансета', 'Встречаю вас у канатки, и мы объезжаем городок на электрокаре: площадь Солнца с обелисками, триумфальная арка, часовая башня по мотивам Сан-Марко, мраморный фонтан бога Солнца, руины Помпеи и драконья лестница над разноцветными домами. На каждой точке останавливаемся и фотографируемся.'),
    item('Мост Поцелуев на закате', 'Две половины моста над морем почти касаются друг друга. С ноября по январь солнце садится около 17:40: помогаю поймать лучший кадр и снимаю вас с дрона. Билет на мост уже входит в билет канатки.'),
    item('Набережная и ночной рынок', 'Городок зажигает огни: итальянские улочки, набережная и ночной рынок. Прогуливаемся и смотрим, как Сансет оживает к вечеру.'),
    item('Ужин-шоу в Sun Bavaria', 'В 19:00 провожу вас в Sun Bavaria и сажаю за стол. Мини-буфет и безлимитное пиво, а в 19:30 прямо перед вами начинается шоу Symphony: гидроциклы, флайборд и огонь над водой.'),
    item('Салют над заливом', 'Финал шоу - салют над морем, его видно прямо из-за стола. Хотите остаться ещё и на Kiss Show в 21:00 - скажите заранее, это опция.'),
    item('Машина ждёт, в 21:00 вы в отеле', 'После салюта у выхода толпа, такси не дождаться. Наша машина ждёт в условленной точке, уезжаем первыми и около 21:00 вы в отеле.'),
  ],
  includes: [
    ru('Машина и гид на весь день'),
    ru('Канатка на Хонтхом туда и обратно, аквапарк и шведский стол на острове'),
    ru('Электрокар по шести фотозонам Сансет Тауна'),
    ru('Мост Поцелуев и фото с дрона на закате'),
    ru('Ужин-шоу Symphony в Sun Bavaria: мини-буфет и безлимитное пиво'),
    ru('Вода в машине'),
  ],
  excludes: [
    ru('Столик на первой линии в Sun Bavaria (доплата на месте)'),
    ru('Kiss Show в 21:00: 800 000 донгов с человека и +$20 за час'),
    ru('Шкафчик и полотенце в аквапарке'),
  ],
};
const { data: ex } = await s.from('tours').select('id,hero_image_url,gallery_urls,itinerary').eq('slug', SLUG).maybeSingle();
let id;
if (ex) {
  tour.hero_image_url = ex.hero_image_url; tour.gallery_urls = ex.gallery_urls;
  tour.itinerary = tour.itinerary.map((p, i) => ({ ...p, photos: ex.itinerary?.[i]?.photos || [] }));
  const { error } = await s.from('tours').update(tour).eq('id', ex.id); if (error) throw error; id = ex.id;
  await s.from('pricing_tiers').delete().eq('tour_id', id);
} else {
  const { data, error } = await s.from('tours').insert(tour).select('id').single(); if (error) throw error; id = data.id;
}
const { error: pe } = await s.from('pricing_tiers').insert(TIERS.map(([g, p]) => ({ tour_id: id, guest_count: g, price_adult_usd: p, price_child_usd: null })));
if (pe) throw pe;
console.log('tour id', id);
