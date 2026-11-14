// node _r3add.mjs <slug> <itinIdx> <prefix> <files...>: добавляет фото (новые ключи <prefix>-NN, без перезаписи старых)
// в itinerary[idx].photos и вперемешку в начало галереи (позиции 2,4,6...), обложку gallery[0] не трогает.
import { createClient } from "@supabase/supabase-js"
import sharp from "sharp"; import fs from "fs"; import crypto from "crypto"
sharp.concurrency(1)
const [slug, idxS, prefix, ...files] = process.argv.slice(2); const idx = +idxS
const U = process.env.NEXT_PUBLIC_SUPABASE_URL
const db = createClient(U, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })
const st = db.storage.from("media"), BASE = `${U}/storage/v1/object/public/media/`
const man = JSON.parse(fs.readFileSync("src/lib/image-variants.json", "utf8"))
const o = { contentType: "image/webp", upsert: false, cacheControl: "31536000" }
const up = async (p, b) => { for (let i = 0; i < 5; i++) { const { error } = await st.upload(p, b, o); if (!error) return; if (i == 4) throw error; await new Promise(r => setTimeout(r, 2000)) } }
const { data: tour } = await db.from("tours").select("id,itinerary,gallery_urls").eq("slug", slug).single()
fs.writeFileSync(`D:/reel_backup/before-${prefix}-${slug}.json`, JSON.stringify(tour))
const urls = []
for (const [i, f] of files.entries()) {
  const nn = String(i + 1).padStart(2, "0")
  const buf = await sharp(f).rotate().resize(1600, 1600, { fit: "inside", withoutEnlargement: true }).webp({ quality: 84 }).toBuffer()
  const key = `tours/${slug}/${prefix}-${nn}.webp`; await up(key, buf)
  const ver = crypto.createHash("sha1").update(buf).digest("hex").slice(0, 8)
  for (const w of man.widths) await up(`opt/tours/${slug}/${prefix}-${nn}.${ver}-w${w}.webp`, await sharp(buf).resize({ width: w, withoutEnlargement: true }).webp({ quality: 74 }).toBuffer())
  man.keys[key] = ver; urls.push(BASE + key)
}
const itin = structuredClone(tour.itinerary)
itin[idx].photos = [...urls, ...(itin[idx].photos || [])]
const g = [...tour.gallery_urls]
urls.forEach((u, i) => g.splice(Math.min(2 + i * 2, g.length), 0, u))
const { error } = await db.from("tours").update({ itinerary: itin, gallery_urls: g }).eq("id", tour.id); if (error) throw error
man.keys = Object.fromEntries(Object.entries(man.keys).sort())
fs.writeFileSync("src/lib/image-variants.json", JSON.stringify(man) + "\n")
console.log(slug, "added", urls.length, "gallery", g.length)
