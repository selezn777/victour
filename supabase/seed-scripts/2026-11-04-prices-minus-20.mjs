// ВНИМАНИЕ: уже применён 2026-11-04. Повторный запуск с --apply снизит цены ещё на 20%.
// Виктор 2026-11-04: «все цены надо чуть подешевле, процентов на 20 снизь цены на всё».
// Снижает price_adult_usd/price_child_usd активных туров на 20%, округление до 5$.
// Старые цены печатаются в консоль (история - в описании коммита).
import fs from 'fs'; import { createClient } from '@supabase/supabase-js';
const env=Object.fromEntries(fs.readFileSync('.env.local','utf8').split(/\r?\n/).filter(l=>l.includes('=')).map(l=>{const i=l.indexOf('=');return [l.slice(0,i),l.slice(i+1).replace(/^"|"$/g,'')]}));
const s=createClient(env.NEXT_PUBLIC_SUPABASE_URL,env.SUPABASE_SERVICE_ROLE_KEY);
const r5=(x)=>x==null?null:Math.max(5,Math.round(x*0.8/5)*5);
const {data:tours,error}=await s.from('tours').select('id,slug,pricing_tiers(id,guest_count,price_adult_usd,price_child_usd)').eq('is_active',true).order('sort_order');
if(error) throw error;
for(const t of tours){
  const tiers=[...t.pricing_tiers].sort((a,b)=>a.guest_count-b.guest_count);
  const line=[];
  for(const p of tiers){
    const na=r5(p.price_adult_usd), nc=r5(p.price_child_usd);
    if(process.argv[2]==='--apply'){const {error:e}=await s.from('pricing_tiers').update({price_adult_usd:na,price_child_usd:nc}).eq('id',p.id); if(e) throw e;}
    line.push(`${p.guest_count}:${p.price_adult_usd}->${na}`);
  }
  console.log(t.slug, line.join(' '));
}
