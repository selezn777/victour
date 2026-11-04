// Фото Виктора для «Вечернего Фукуока» (прислал повторно 2026-11-04, приняты Трипстером):
// webp -> Blob (новая папка v3, кэш картинок 31 день) -> маршрут/галерея/обложка.
import fs from 'fs'; import sharp from 'sharp'; import { createClient } from '@supabase/supabase-js'; import { put } from '@vercel/blob';
const env=Object.fromEntries(fs.readFileSync('.env.local','utf8').split(/\r?\n/).filter(l=>l.includes('=')).map(l=>{const i=l.indexOf('=');return [l.slice(0,i),l.slice(i+1).replace(/^"|"$/g,'')]}));
const s=createClient(env.NEXT_PUBLIC_SUPABASE_URL,env.SUPABASE_SERVICE_ROLE_KEY);
const dir=process.env.USERPROFILE+'/Pictures/phu-quoc-tours/01-evening-safari/v3_from_viktor/';
const U={};
for(let n=1;n<=18;n++){const k=String(n).padStart(2,'0');
  const buf=await sharp(dir+k+'.jpg').rotate().resize(1400,1400,{fit:'inside',withoutEnlargement:true}).webp({quality:76}).toBuffer();
  const r=await put(`tours/phuquoc-vecher-safari/v3/${k}.webp`,buf,{access:'public',token:env.BLOB_READ_WRITE_TOKEN,contentType:'image/webp',addRandomSuffix:false,allowOverwrite:true});
  U[k]=r.url;}
const P=(...ids)=>ids.map(i=>U[i]);
const {data:t,error:e1}=await s.from('tours').select('id,itinerary').eq('slug','phuquoc-vecher-safari').single(); if(e1) throw e1;
const byIdx=[P('08','01','02'),P('17','12','04','05','09','10','11','13'),P('15','18','16'),P('06','03','07'),P('14')];
const itinerary=t.itinerary.map((it,i)=>({...it,photos:byIdx[i]??[]}));
const {error}=await s.from('tours').update({hero_image_url:U['06'],gallery_urls:P('06','08','17','04','14','15','03','07','12','02'),itinerary}).eq('id',t.id);
if(error) throw error; console.log('hero',U['06']); console.log('vechr', U['04']);
