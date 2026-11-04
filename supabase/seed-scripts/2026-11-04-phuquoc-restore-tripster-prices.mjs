// Виктор 2026-11-04: туры Фукуока на сайте не могут быть дешевле Трипстера
// (условие о лучшей цене, иначе блокировка) - возвращаем цены до снижения на 20%.
import fs from 'fs'; import { createClient } from '@supabase/supabase-js';
const env=Object.fromEntries(fs.readFileSync('.env.local','utf8').split(/\r?\n/).filter(l=>l.includes('=')).map(l=>{const i=l.indexOf('=');return [l.slice(0,i),l.slice(i+1).replace(/^"|"$/g,'')]}));
const s=createClient(env.NEXT_PUBLIC_SUPABASE_URL,env.SUPABASE_SERVICE_ROLE_KEY);
const PRICES={'phuquoc-vecher-safari':{2:225,3:150,4:115},'phuquoc-nastoyashchiy':{2:175,3:120,4:90}};
for(const [slug,map] of Object.entries(PRICES)){
  const {data:t,error}=await s.from('tours').select('id').eq('slug',slug).single(); if(error) throw error;
  for(const [g,p] of Object.entries(map)){
    const {error:e}=await s.from('pricing_tiers').update({price_adult_usd:p}).eq('tour_id',t.id).eq('guest_count',Number(g)); if(e) throw e;
  }
  const {data:chk}=await s.from('pricing_tiers').select('guest_count,price_adult_usd').eq('tour_id',t.id).order('guest_count');
  console.log(slug, chk.map(c=>`${c.guest_count}:${c.price_adult_usd}`).join(' '));
}
