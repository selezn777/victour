// node scripts/_commons.mjs <outdir> <query> [n]: первые n фото с Commons по запросу (1600px), список в <outdir>/list.txt
import fs from "fs"
const [out, q, n = "6"] = process.argv.slice(2)
fs.mkdirSync(out, { recursive: true })
const api = `https://commons.wikimedia.org/w/api.php?action=query&format=json&generator=search&gsrnamespace=6&gsrlimit=${n}&gsrsearch=${encodeURIComponent(q + " filetype:bitmap")}&prop=imageinfo&iiprop=url|extmetadata|size&iiurlwidth=1600`
const H = { "User-Agent": "victour-site-photos/1.0 (tour catalog)" }
const j = await (await fetch(api, { headers: H })).json()
const pages = Object.values(j.query?.pages || {}).sort((a, b) => a.index - b.index)
const lines = []
for (const [i, p] of pages.entries()) {
  const ii = p.imageinfo?.[0]; if (!ii) continue
  const f = `${out}/${String(i + 1).padStart(2, "0")}.jpg`
  const r = await fetch(ii.thumburl || ii.url, { headers: H })
  if (!r.ok || !(r.headers.get("content-type") || "").startsWith("image")) { lines.push(`FAIL ${p.title}`); continue }
  fs.writeFileSync(f, Buffer.from(await r.arrayBuffer()))
  const m = ii.extmetadata || {}
  lines.push(`${f.split("/").pop()} ${ii.width}x${ii.height} | ${p.title} | ${(m.Artist?.value || "").replace(/<[^>]+>/g, "").trim()} | ${m.LicenseShortName?.value || ""}`)
  await new Promise((r) => setTimeout(r, 1200))
}
fs.writeFileSync(`${out}/list.txt`, lines.join("\n") + "\n")
console.log(lines.join("\n"))
