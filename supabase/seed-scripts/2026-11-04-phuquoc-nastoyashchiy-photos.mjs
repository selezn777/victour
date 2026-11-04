// Фото Виктора для «Настоящего Фукуока» (прислал 2026-11-04): Blob + маршрут/галерея/обложка.
import fs from 'fs'; import { createClient } from '@supabase/supabase-js'; import { put } from '@vercel/blob';
const env=Object.fromEntries(fs.readFileSync('.env.local','utf8').split(/\r?\n/).filter(l=>l.includes('=')).map(l=>{const i=l.indexOf('=');return [l.slice(0,i),l.slice(i+1).replace(/^"|"$/g,'')]}));
const s=createClient(env.NEXT_PUBLIC_SUPABASE_URL,env.SUPABASE_SERVICE_ROLE_KEY);
const dir=process.env.USERPROFILE+'/Pictures/phu-quoc-tours/02-nastoyashchiy/from-viktor/site/';
const U={};
for(const f of fs.readdirSync(dir).filter(f=>f.endsWith('.webp'))){
  const r=await put('tours/phuquoc-nastoyashchiy/'+f,fs.readFileSync(dir+f),{access:'public',token:env.BLOB_READ_WRITE_TOKEN,contentType:'image/webp',addRandomSuffix:false,allowOverwrite:true});
  U[f.slice(0,2)]=r.url;
}
const P=(...ids)=>ids.map(i=>U[i]);
const {data:t,error:e1}=await s.from('tours').select('id,itinerary').eq('slug','phuquoc-nastoyashchiy').single(); if(e1) throw e1;
const byIdx=[P('08','02','04'),P('11','10','09','16'),P('15','12','07'),P('13','14'),P('03','06','05'),P('01')];
const itinerary=t.itinerary.map((it,i)=>({...it,photos:byIdx[i]??[]}));
const {error}=await s.from('tours').update({hero_image_url:U['11'],gallery_urls:P('11','08','15','13','03','01','10','14'),itinerary}).eq('id',t.id);
if(error) throw error; console.log('hero',U['11']);
