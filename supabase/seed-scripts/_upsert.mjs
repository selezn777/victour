// Общий upsert тура Фукуока: не затирает уже залитые фото, пересоздаёт сетку цен.
import { createClient } from '@supabase/supabase-js';
export async function upsertTour(tour, TIERS) {
  const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
  const { data: ex } = await s.from('tours').select('id,hero_image_url,gallery_urls,itinerary').eq('slug', tour.slug).maybeSingle();
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
  console.log(tour.slug, 'tour id', id);
}
export const ru = (x) => ({ en: null, ru: x });
export const item = (title, description) => ({ day: 1, title: ru(title), description: ru(description), photos: [], article_slug: null });
