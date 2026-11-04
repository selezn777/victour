// Тур 2 Фукуока «Настоящий Фукуок» (утренняя обзорка) из документа-базы туров.
// Запуск из корня проекта: node supabase/seed-scripts/phuquoc-nastoyashchiy.mjs
// Фото пока нет (ждём свои фото Виктора) — hero/gallery пустые.
import fs from 'fs'; import { createClient } from '@supabase/supabase-js';
const env=Object.fromEntries(fs.readFileSync('.env.local','utf8').split(/\r?\n/).filter(l=>l.includes('=')).map(l=>{const i=l.indexOf('=');return [l.slice(0,i),l.slice(i+1).replace(/^"|"$/g,'')]}));
const s=createClient(env.NEXT_PUBLIC_SUPABASE_URL,env.SUPABASE_SERVICE_ROLE_KEY);
const ru=(x)=>({en:null,ru:x});
const item=(title,description)=>({day:1,title:ru(title),description:ru(description),photos:[],article_slug:null});
const tour={
 slug:'phuquoc-nastoyashchiy',
 title:ru('Настоящий Фукуок'),
 short_description:ru('Мёд из джунглей, золотой лотос и фото с заходящими на посадку самолётами. Фукуок, которым гордятся сами вьетнамцы, за одно утро, а к 15:00 вы уже в отеле.'),
 duration_label:ru('8:30-15:00'),
 duration_days:1, is_dalat_two_day:false, is_active:true, sort_order:11,
 hero_image_url:null, gallery_urls:[], ticket_options:[],
 itinerary:[
  item('Мёд из джунглей','Забираем вас из отеля, пока не жарко, и едем на дикую островную пасеку. Пробуем мёд с диких цветов прямо с сот, а рядом ананасовые поля: ананас растёт из земли, как огромный цветок. Дети обычно удивляются здесь больше всех.'),
  item('Самый большой храм острова','Пагода Хо Куок стоит на склоне горы прямо над морем: широкие лестницы, колокола, вид на океан и здание в виде золотого лотоса посреди пруда. Рассказываю о вьетнамском буддизме и о том, чем живут местные семьи.'),
  item('Побег из кокосовой тюрьмы','Кокосовая тюрьма: сцены тех событий в полный рост и подземный ход, по которому бежали заключённые. История войны глазами самих вьетнамцев. Подросткам здесь особенно интересно.'),
  item('Самолёты над головой','Есть место у аэропорта, где лайнеры заходят на посадку совсем низко, прямо над головой. Сверяем расписание посадок, чтобы вы поймали тот самый кадр.'),
  item('Сокровища моря','Самый большой на острове музей морских богатств. Узнаете, как в море рождаются жемчужины, которые потом носят по всему миру.'),
  item('Обед у моря','Обедаем в пляжном клубе с видом на море, кто хочет, купается. После обеда возвращаемся, к 15:00 вы в отеле.'),
 ],
 includes:[ru('Комфортный автомобиль с кондиционером'),ru('Русскоязычный гид'),ru('Все входные билеты'),ru('Вода')],
 excludes:[ru('Обед'),ru('Покупки')],
};
const {data:ex}=await s.from('tours').select('id').eq('slug',tour.slug).maybeSingle();
let id;
if(ex){ const {error}=await s.from('tours').update(tour).eq('id',ex.id); if(error) throw error; id=ex.id; await s.from('pricing_tiers').delete().eq('tour_id',id);}
else { const {data,error}=await s.from('tours').insert(tour).select('id').single(); if(error) throw error; id=data.id; }
// $350 за группу до 4 человек (как на Трипстере), за человека с округлением вверх до 5
const {error:pe}=await s.from('pricing_tiers').insert([[2,175],[3,120],[4,90]].map(([g,p])=>({tour_id:id,guest_count:g,price_adult_usd:p,price_child_usd:null})));
if(pe) throw pe;
console.log('tour id',id);
