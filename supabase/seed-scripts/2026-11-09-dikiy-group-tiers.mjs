// «Дикий Фукуок»: вместо $80 с человека - тарифная сетка как у «Настоящего Фукуока»
// (Виктор 2026-11-09: «примерно также ... округляй до красивых цифр», «по 300$ за двоих»).
// Группы 10-13 достраивает src/lib/group-tiers.ts.
// Запуск: node --env-file=.env.local supabase/seed-scripts/2026-11-09-dikiy-group-tiers.mjs
import { createClient } from "@supabase/supabase-js"

const TIERS = [[2, 150], [3, 105], [4, 80], [5, 65], [6, 55], [7, 50], [8, 45], [9, 40]] // $300 за двоих, кривая как у «Настоящего»
const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

const { data: tour, error: te } = await s.from("tours").select("id").eq("slug", "phuquoc-dikiy").single()
if (te) throw te
for (const [g, p] of TIERS) {
  const { error } = await s.from("pricing_tiers").update({ price_adult_usd: p }).eq("tour_id", tour.id).eq("guest_count", g)
  if (error) throw error
}
const { data } = await s.from("pricing_tiers").select("guest_count,price_adult_usd").eq("tour_id", tour.id).order("guest_count")
console.log(data.map((r) => `${r.guest_count}: $${r.price_adult_usd}`).join(", "))
