// Виктор 14.11: «с дрона снимаю не я» - убираем обещание съёмки с дрона из Юга 2.0
import { createClient } from "@supabase/supabase-js"
import { writeFileSync } from "node:fs"
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
const { data: t } = await db.from("tours").select("*").eq("slug", "phuquoc-yug2").single()
writeFileSync(`D:/reel_backup/before-drone-yug2-${Date.now()}.json`, JSON.stringify(t))
const R = [
  ["Мост Поцелуев на закате с фото с дрона и ужин-шоу", "Мост Поцелуев на закате и ужин-шоу"],
  ["помогаю поймать лучший кадр и снимаю вас с дрона.", "помогаю поймать лучший кадр. На мосту работают фотографы с дронами, съёмку с воздуха можно заказать у них на месте."],
  ["Мост Поцелуев и фото с дрона на закате", "Мост Поцелуев на закате"],
]
const fix = (v) => {
  if (typeof v === "string") return R.reduce((s, [a, b]) => s.split(a).join(b), v)
  if (Array.isArray(v)) return v.map(fix)
  if (v && typeof v === "object") return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, fix(x)]))
  return v
}
const patch = { short_description: fix(t.short_description), itinerary: fix(t.itinerary), includes: fix(t.includes) }
const { error } = await db.from("tours").update(patch).eq("slug", "phuquoc-yug2")
if (error) throw error
console.log("ok", JSON.stringify(patch).includes("дрона") ? "still has дрона" : "no дрона left")
