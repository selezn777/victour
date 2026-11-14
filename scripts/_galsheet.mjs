// node --env-file=.env.local scripts/_galsheet.mjs <slug...>: лист превью галерей туров из базы, подписи slug#idx, urls в pool/galsheet.json
import { createClient } from "@supabase/supabase-js"
import sharp from "sharp"; import fs from "fs"
sharp.concurrency(1)
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })
const out = process.env.USERPROFILE + "/Pictures/pq-pool/"
const map = {}; const tiles = []; const W = 260, H = 195, C = 8
for (const slug of process.argv.slice(2)) {
  const { data } = await db.from("tours").select("gallery_urls,itinerary").eq("slug", slug).single()
  const urls = [...new Set([...(data.gallery_urls || []), ...(data.itinerary || []).flatMap((p) => p.photos || [])])]
  for (const [i, u] of urls.entries()) {
    const k = `${slug.replace("phuquoc-", "")}#${i}`
    try {
      const b = Buffer.from(await (await fetch(u)).arrayBuffer())
      const lbl = Buffer.from(`<svg width="${W}" height="22"><rect width="${W}" height="22" fill="black" opacity="0.7"/><text x="4" y="16" font-size="15" font-family="Arial" fill="#ff0">${k}</text></svg>`)
      tiles.push({ input: await sharp(b).resize(W, H, { fit: "cover" }).composite([{ input: lbl, top: 0, left: 0 }]).jpeg().toBuffer() })
      map[k] = u
    } catch {}
  }
}
fs.writeFileSync(out + "galsheet.json", JSON.stringify(map, null, 1))
for (let p = 0; p * 64 < tiles.length; p++) {
  const part = tiles.slice(p * 64, p * 64 + 64).map((t, i) => ({ ...t, left: (i % C) * W, top: Math.floor(i / C) * H }))
  await sharp({ create: { width: C * W, height: Math.ceil(part.length / C) * H, channels: 3, background: "#222" } }).composite(part).jpeg({ quality: 70 }).toFile(`${out}galsheet_${p + 1}.jpg`)
}
console.log(Object.keys(map).length, "tiles,", Math.ceil(tiles.length / 64), "sheets")
