// Тур 3 Фукуока «Дикий Фукуок» (Виктор 2026-11-05/06): маршрут по кругу, фото Виктора.
// Запуск из корня проекта: node supabase/seed-scripts/phuquoc-dikiy.mjs [--active]
// Без --active тур создаётся скрытым (ждём время и цену от Виктора).
import fs from 'fs'; import { createClient } from '@supabase/supabase-js'; import { put } from '@vercel/blob';
const env=Object.fromEntries(fs.readFileSync('.env.local','utf8').split(/\r?\n/).filter(l=>l.includes('=')).map(l=>{const i=l.indexOf('=');return [l.slice(0,i),l.slice(i+1).replace(/^"|"$/g,'')]}));
const s=createClient(env.NEXT_PUBLIC_SUPABASE_URL,env.SUPABASE_SERVICE_ROLE_KEY);
const SLUG='phuquoc-dikiy';
const DURATION=process.env.DURATION||'Целый день';
const TIERS=JSON.parse(process.env.TIERS||'[[2,80],[3,80],[4,80],[5,80],[6,80],[7,80],[8,80],[9,80]]'); // $80 с человека, всё кроме обеда включено
const dir=process.env.USERPROFILE+'/Pictures/phu-quoc-tours/03-dikiy/site/';
const U={};
for(const f of fs.readdirSync(dir).filter(f=>f.endsWith('.webp'))){
  const r=await put(`tours/${SLUG}/v1-${f}`,fs.readFileSync(dir+f),{access:'public',token:env.BLOB_READ_WRITE_TOKEN,contentType:'image/webp',addRandomSuffix:false,allowOverwrite:true});
  U[f.slice(0,2)]=r.url;
}
const P=(...ids)=>ids.map(i=>U[i]);
const ru=(x)=>({en:null,ru:x});
const item=(title,description,photos)=>({day:1,title:ru(title),description:ru(description),photos,article_slug:null});
const tour={
 slug:SLUG,
 title:ru('Дикий Фукуок'),
 short_description:ru('Питон на плечах, лежачий Будда, который исполняет желания, джунгли с водопадом и круглые лодки среди пальм. Самый живой день на Фукуоке.'),
 duration_label:ru(DURATION),
 duration_days:1, is_dalat_two_day:false, is_active:process.argv.includes('--active'), sort_order:12,
 hero_image_url:U['07'], gallery_urls:P('07','10','01','17','08','15','13','19','04','11'), ticket_options:[],
 itinerary:[
  item('Питон на плечах','Начинаем со змеиной фермы Đồng Tâm в джунглях Зыонг То. Королевские кобры до 4 метров, а питона кладём вам на плечи для фото. Еноты, пони, козочки, олени, павлины и обезьяны, многих можно кормить с рук. Дети отсюда не хотят уходить.',P('01','04','03','02')),
  item('Будда, который исполняет желания','Пагода Су Муон на склоне горы: огромный белый лежачий Будда, к нему ведёт лестница с драконами. Местные верят: загадай у него желание, и оно сбудется. Рядом дерево, которому 350 лет, а под ним в пещере сидит Будда, ушедший в нирвану.',P('07','08','09','06')),
  item('Весь остров как на ладони','Оттуда же смотровая: под нами Зыонг Донг, главный город Фукуока, и море до горизонта.',P('05')),
  item('Водопад в джунглях и деревня горных племён','Суой Транх: тропа через джунгли к водопаду. В ноябре и декабре здесь можно искупаться. Рядом деревня народов Центрального нагорья: дома с соломенными крышами высотой с трёхэтажный дом и сцены их жизни в полный рост.',P('17','21','18','20','19')),
  item('Семь видов перца','Перечная ферма: перец с Фукуока знают во всём мире. Срываем зелёный прямо с куста и нюхаем 7 видов, запах такой, что захотите увезти пару пакетов домой.',P('15','16')),
  item('Мёд и ананасы на грядках','Пчелиная ферма у реки Кыа Кан: пробуем мёд прямо с сот, ананасы растут из земли, как цветы, а над головой висят дурианы.',P('13','14','12')),
  item('Круглые лодки и спа для ног','Финал дня: катаемся на вьетнамских лодках-корзинах среди водяных пальм, а потом ванночка для ног с тропическими травами. После этого везём вас в отель.',P('10','11')),
 ],
 includes:[ru('Комфортный автомобиль с кондиционером'),ru('Русскоязычный гид'),ru('Все входные билеты'),ru('Лодки и спа для ног'),ru('Вода')],
 excludes:[ru('Обед (место выбираем вместе по дороге)'),ru('Покупки')],
};
const {data:ex}=await s.from('tours').select('id').eq('slug',SLUG).maybeSingle();
let id;
if(ex){ const {error}=await s.from('tours').update(tour).eq('id',ex.id); if(error) throw error; id=ex.id; await s.from('pricing_tiers').delete().eq('tour_id',id);}
else { const {data,error}=await s.from('tours').insert(tour).select('id').single(); if(error) throw error; id=data.id; }
const {error:pe}=await s.from('pricing_tiers').insert(TIERS.map(([g,p])=>({tour_id:id,guest_count:g,price_adult_usd:p,price_child_usd:null})));
if(pe) throw pe;
console.log('tour id',id,'active',tour.is_active);
