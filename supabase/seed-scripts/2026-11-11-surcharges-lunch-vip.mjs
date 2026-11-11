// Виктор 2026-11-11: обед заранее $10 с человека (или платят на месте сами)
// и VIP-минивэн в Нячанге +$50 на компанию - как доплаты в заявке.
// Запуск из корня проекта: node supabase/seed-scripts/2026-11-11-surcharges-lunch-vip.mjs
import fs from 'fs'; import { createClient } from '@supabase/supabase-js';
const env=Object.fromEntries(fs.readFileSync('.env.local','utf8').split(/\r?\n/).filter(l=>l.includes('=')).map(l=>{const i=l.indexOf('=');return [l.slice(0,i),l.slice(i+1).replace(/^"|"$/g,'')]}));
const s=createClient(env.NEXT_PUBLIC_SUPABASE_URL,env.SUPABASE_SERVICE_ROLE_KEY);
const {data:st,error:se}=await s.from('settings').select('value').eq('key','usd_vnd_rate').single();
if(se) throw se;
const rate=st.value.rate;
const rows=[
  {code:'lunch_prebook',name:{ru:'Обед заранее: бронируем комбо-обед по маршруту',en:null},amount_vnd:10*rate,unit:'per_person_per_tour',is_active:true},
  {code:'vip_van_nt',name:{ru:'VIP-минивэн с кожаными креслами (Нячанг)',en:null},amount_vnd:50*rate,unit:'per_group',is_active:true},
];
const {error}=await s.from('surcharges').upsert(rows,{onConflict:'code'});
if(error) throw error;
const {data}=await s.from('surcharges').select('*');
console.log('rate',rate,JSON.stringify(data,null,1));
