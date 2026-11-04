import fs from 'fs'; import { createClient } from '@supabase/supabase-js'; import { put } from '@vercel/blob';
const env=Object.fromEntries(fs.readFileSync('.env.local','utf8').split(/\r?\n/).filter(l=>l.includes('=')).map(l=>{const i=l.indexOf('=');return [l.slice(0,i),l.slice(i+1).replace(/^"|"$/g,'')]}));
const s=createClient(env.NEXT_PUBLIC_SUPABASE_URL,env.SUPABASE_SERVICE_ROLE_KEY);
const dir=process.env.USERPROFILE+'/Pictures/phu-quoc-tours/01-evening-safari/';
const files={starKid:'01_p5_starfish_kid_site.webp',starBeach:'02_p4_starfish_beach_site.webp',gondola:'03_p2_gondola_lake_site.webp',sunset:'04_p11_gondola_sunset_aerial_site.webp',hero:'04_p11_gondola_sunset_aerial_vertical_site.webp',canal:'05_p6_canal_night_site.webp',market:'06_p7_night_market_site.webp',giraffe:'07_p12_safari_giraffe_buggy_site.webp',lions:'08_p13_safari_white_lions_site.webp'};
const U={};
for(const [k,f] of Object.entries(files)){
  const r=await put('tours/phuquoc-vecher-safari/'+f.replace(/^\d+_p\d+_|_site/g,''),fs.readFileSync(dir+f),{access:'public',token:env.BLOB_READ_WRITE_TOKEN,contentType:'image/webp',addRandomSuffix:false,allowOverwrite:true});
  U[k]=r.url; console.log(k,r.url);
}
const ru=(x)=>({en:null,ru:x});
const item=(title,description,photos)=>({day:1,title:ru(title),description:ru(description),photos,article_slug:null});
const tour={
 slug:'phuquoc-vecher-safari',
 title:ru('Вечерний Фукуок + ночное сафари'),
 short_description:ru('Весь север Фукуока за один вечер: от звёзд на пляже до ночного сафари в джунглях. Утро свободное: купаетесь, спокойно обедаете, отдыхаете - и только потом, в 15:00, выезжаем.'),
 duration_label:ru('15:00-22:15'),
 duration_days:1, is_dalat_two_day:false, is_active:true, sort_order:10,
 hero_image_url:U.hero,
 gallery_urls:[U.starKid,U.sunset,U.canal,U.giraffe,U.starBeach,U.gondola,U.market,U.lions],
 itinerary:[
  item('Звёзды под ногами','На севере острова есть пляж, где на мелководье лежат сотни красных морских звёзд. Заходите в тёплую прозрачную воду и видите их прямо под ногами. Здесь же купаемся: мелко, спокойно, детям раздолье. Гид покажет, как снять звёзд сквозь прозрачную воду, такие кадры получаются самыми красивыми.',[U.starKid,U.starBeach]),
  item('Венеция без шенгена','Виза не нужна 😉 Разноцветные дома с балконами, каналы, мостики и настоящие гондолы с гондольерами в полосатых футболках. Приезжаем к золотому часу: солнце садится, вода в канале горит оранжевым, и можно проплыть на гондоле мимо фасадов, как по Венеции. А когда темнеет, зажигается подсветка, и город становится сказочным.',[U.sunset,U.gondola]),
  item('Ночной рынок и ужин у канала','Вечером улицы превращаются в ночной рынок: морепродукты на гриле, вьетнамская уличная еда, сувениры, огни. Проходим через рынок, пробуем, что приглянется, и садимся ужинать у канала: пицца и паста с видом на воду или морепродукты, каждый выбирает сам.',[U.canal,U.market]),
  item('Ночное сафари, главное событие вечера','Когда над островом опускается ночь, мы садимся в открытый багги и уезжаем вглубь джунглей. Никаких стёкол между вами и дикой природой. Фары выхватывают только дорогу, а вокруг темнота и звуки. И вдруг из темноты проступает силуэт: жираф в два этажа ростом, носорог, стадо зебр, лев с горящими в свете фар глазами. Ночью звери совсем другие: днём прячутся от жары, а после заката просыпаются, ходят и подходят ближе. Час пролетает как десять минут.',[U.giraffe,U.lions]),
  item('Дорога домой','Около 22:15 привозим вас обратно в отель. Позади звёзды под ногами, Венеция на закате и ночные джунгли. Засыпаете крепко и счастливыми, а с собой увозите одни из самых ярких воспоминаний за всю поездку.',[]),
 ],
 includes:[ru('Трансфер из отеля и обратно на комфортной машине'),ru('Русскоязычный гид на весь маршрут'),ru('Вода в дорогу'),ru('Бронь билета на ночное сафари')],
 excludes:[ru('Билет на сафари - оплата на месте во время тура (взрослый 950 000 ₫, детский 710 000 ₫, дети до 1 м бесплатно)'),ru('Ужин'),ru('Гондола'),ru('Личные расходы')],
 ticket_options:[],
};
const {data:ex}=await s.from('tours').select('id').eq('slug',tour.slug).maybeSingle();
let id;
if(ex){ await s.from('tours').update(tour).eq('id',ex.id); id=ex.id; await s.from('pricing_tiers').delete().eq('tour_id',id);}
else { const {data,error}=await s.from('tours').insert(tour).select('id').single(); if(error) throw error; id=data.id; }
const {error:pe}=await s.from('pricing_tiers').insert([[2,225],[3,150],[4,115]].map(([g,p])=>({tour_id:id,guest_count:g,price_adult_usd:p,price_child_usd:null})));
if(pe) throw pe;
console.log('tour id',id);
