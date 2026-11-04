import fs from 'fs'; import { createClient } from '@supabase/supabase-js'; import { put } from '@vercel/blob';
const env=Object.fromEntries(fs.readFileSync('.env.local','utf8').split(/\r?\n/).filter(l=>l.includes('=')).map(l=>{const i=l.indexOf('=');return [l.slice(0,i),l.slice(i+1).replace(/^"|"$/g,'')]}));
const s=createClient(env.NEXT_PUBLIC_SUPABASE_URL,env.SUPABASE_SERVICE_ROLE_KEY);
const dir=process.env.USERPROFILE+'/Pictures/phu-quoc-tours/01-evening-safari/v2_tripster/site/';
const U={};
for(const f of fs.readdirSync(dir).filter(f=>f.endsWith('.webp'))){
  const r=await put('tours/phuquoc-vecher-safari/v2/'+f,fs.readFileSync(dir+f),{access:'public',token:env.BLOB_READ_WRITE_TOKEN,contentType:'image/webp',addRandomSuffix:false,allowOverwrite:true});
  U[f.slice(0,2)]=r.url; console.log(f,r.url);
}
const {data:t}=await s.from('tours').select('id,itinerary').eq('slug','phuquoc-vecher-safari').single();
const photosByIdx=[[U['01']],[U['02'],U['03']],[U['03']],[U['05'],U['04'],U['06']],[]];
const itinerary=t.itinerary.map((it,i)=>({...it,photos:photosByIdx[i]??[]}));
const {error}=await s.from('tours').update({hero_image_url:U['02'],gallery_urls:[U['02'],U['01'],U['03'],U['04'],U['05'],U['06']],itinerary}).eq('id',t.id);
if(error) throw error; console.log('updated');
