// node --env-file=.env.local scripts/_rmphotos.mjs <slug> <file1.webp> [file2...]
// Убирает фото из gallery_urls и itinerary[].photos, бэкап в D:/reel_backup
import { createClient } from "@supabase/supabase-js"
import { writeFileSync } from "node:fs"
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
const [slug, ...names] = process.argv.slice(2)
const { data: t, error } = await db.from("tours").select("*").eq("slug", slug).single()
if (error) throw error
writeFileSync(`D:/reel_backup/before-rm-${slug}-${Date.now()}.json`, JSON.stringify(t))
const bad = (u) => typeof u === "string" && names.some((n) => u.endsWith("/" + n))
const photoUrl = (p) => (typeof p === "string" ? p : p?.url ?? p?.src)
const gallery = (t.gallery_urls ?? []).filter((u) => !bad(u))
let itRemoved = 0
const itinerary = (t.itinerary ?? []).map((pt) => {
  if (!Array.isArray(pt.photos)) return pt
  const photos = pt.photos.filter((p) => !bad(photoUrl(p)))
  itRemoved += pt.photos.length - photos.length
  return { ...pt, photos }
})
const patch = { gallery_urls: gallery, itinerary }
if (bad(t.hero_image_url)) patch.hero_image_url = gallery[0]
const { error: e2 } = await db.from("tours").update(patch).eq("slug", slug)
if (e2) throw e2
console.log(`gallery ${t.gallery_urls.length} -> ${gallery.length}, itinerary removed ${itRemoved}, hero ${patch.hero_image_url ? "changed" : "kept"}`)
const other = JSON.stringify({ ...t, gallery_urls: null, itinerary: null, hero_image_url: null })
names.forEach((n) => other.includes(n) && console.log("still referenced elsewhere in row:", n))
