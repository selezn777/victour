// Тур Фукуока «Морские звёзды и рыба на сваях» (Виктор 2026-11-11): без Винперла и Гранд Ворлда,
// для тех, кто их уже посетил сам. Фото - из отзывов Google Maps по каждой точке.
// Запуск из корня проекта: node supabase/seed-scripts/phuquoc-utro.mjs [--active]
// Без --active тур создаётся скрытым (ждём время и цену от Виктора).
import fs from 'fs'; import { createClient } from '@supabase/supabase-js'; import { put } from '@vercel/blob';
const env=Object.fromEntries(fs.readFileSync('.env.local','utf8').split(/\r?\n/).filter(l=>l.includes('=')).map(l=>{const i=l.indexOf('=');return [l.slice(0,i),l.slice(i+1).replace(/^"|"$/g,'')]}));
const s=createClient(env.NEXT_PUBLIC_SUPABASE_URL,env.SUPABASE_SERVICE_ROLE_KEY);
const SLUG='phuquoc-utro';
const DURATION=process.env.DURATION||'9:00-16:00';
const TIERS=JSON.parse(process.env.TIERS||'[[2,150],[3,105],[4,80],[5,65],[6,55],[7,50],[8,45],[9,40]]'); // как у других туров Фукуока: от $300 за двоих (Виктор 11.11)
const dir=process.env.USERPROFILE+'/Pictures/phu-quoc-tours/05-utro/site2/';
const U={};
for(const f of fs.readdirSync(dir).filter(f=>f.endsWith('.webp'))){
  const r=await put(`tours/${SLUG}/v2-${f}`,fs.readFileSync(dir+f),{access:'public',token:env.BLOB_READ_WRITE_TOKEN,contentType:'image/webp',addRandomSuffix:false,allowOverwrite:true});
  U[f.slice(0,2)]=r.url;
}
const P=(...ids)=>ids.map(i=>U[i]);
const ru=(x)=>({en:null,ru:x});
const item=(title,description,photos)=>({day:1,title:ru(title),description:ru(description),photos,article_slug:null});
const tour={
 slug:SLUG,
 title:ru('Морские звёзды и рыба на сваях'),
 short_description:ru('Храм героя, мёд прямо с сот, круглые лодки, перец с куста, свежая рыба в ресторане на сваях и вечер на пляже с морскими звёздами. Спокойный Фукуок без парков и толп, для тех, кто Винперл и Гранд Ворлд уже видел.'),
 duration_label:ru(DURATION),
 duration_days:1, is_dalat_two_day:false, is_active:process.argv.includes('--active'), sort_order:13,
 hero_image_url:U['24'], gallery_urls:P('24','08','04','19','27','10','13','22','25','05','12','29'), ticket_options:[],
 itinerary:[
  item('Храм героя Нгуен Чунг Чыка','Выезжаем в 9 утра. Первая остановка - храм национального героя, который в XIX веке воевал с французами и последние годы скрывался на Фукуоке. Красивые ворота, тихий двор с прудом, местные приходят сюда с подношениями.',P('01','02','03')),
  item('Мёд прямо с сот','Пчелиная ферма в саду: пчеловод достаёт рамку с сотами и рассказывает, как живёт улей. Пробуем мёд с сот, медовую комбучу и холодный чай с мёдом.',P('04','05','06','07')),
  item('Круглые лодки','Садимся во вьетнамские лодки-корзины и плывём по тихой реке среди мангров и водяных пальм. Лодочник крутит лодку на месте, все смеются, а фото выходят лучшие за поездку.',P('08','09','10','11','12','30')),
  item('Перечная ферма','Перец с Фукуока знают во всём мире. Гуляем между рядами перечных лиан, срываем зелёные гроздья с куста и пробуем разные сорта. Кто хочет, увозит пару баночек домой.',P('13','14','15','16','17','35')),
  item('Обед в ресторане на сваях','Ресторан Сон Хай Куан стоит над морем, к нему ведёт деревянный мостик. Рыбу выбираете сами, её достают из садка прямо под домом и запекают в фольге. Есть крабы, морские ежи и гребешки. Обед можно забронировать заранее за $10 с человека или заказать на месте самим.',P('18','19','20','21','22','23','31','32')),
  item('Пляж морских звёзд','После обеда идём на соседний пляж Рач Вем и отдыхаем до трёх. На мелководье лежат десятки красных морских звёзд, их видно прямо с берега, можно купаться рядом с ними. Фотографируем в воде, но из воды не достаём: на воздухе звёзды погибают. Около 16:00 вы в отеле.',P('24','25','26','27','28','29','33','34')),
 ],
 includes:[ru('Комфортный автомобиль с кондиционером'),ru('Русскоязычный гид'),ru('Круглые лодки'),ru('Дегустация мёда и перца'),ru('Вода')],
 excludes:[ru('Обед: $10 с человека заранее или на месте сами'),ru('Покупки')],
};
const {data:ex}=await s.from('tours').select('id').eq('slug',SLUG).maybeSingle();
let id;
if(ex){ const {error}=await s.from('tours').update(tour).eq('id',ex.id); if(error) throw error; id=ex.id; await s.from('pricing_tiers').delete().eq('tour_id',id);}
else { const {data,error}=await s.from('tours').insert(tour).select('id').single(); if(error) throw error; id=data.id; }
const {error:pe}=await s.from('pricing_tiers').insert(TIERS.map(([g,p])=>({tour_id:id,guest_count:g,price_adult_usd:p,price_child_usd:null})));
if(pe) throw pe;
console.log('tour id',id,'active',tour.is_active);
