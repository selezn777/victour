// Готовые уменьшенные копии фото в Vercel Blob (2026-11-08).
// Зачем: victour.vercel.app из Вьетнама отвечает через hkg1 с TTFB 0.3-1.5 с на КАЖДЫЙ
// файл (и /_next/image, и статика), а домен Blob - через sin1 за ~0.2 с. Поэтому фото
// отдаём прямо из Blob, заранее пережатые в webp нескольких ширин.
//
// Запуск (из корня проекта): node --env-file=.env.local scripts/image-variants.mjs
// Что делает: для каждого фото из Blob (tours/, articles/, guides/, reviews/, park/) и из
// public/images/ кладёт opt/<путь>.<версия>-w{320,640,1080,1600}.webp (уже готовые пропускает) и
// пишет список в src/lib/image-variants.json. Фото без копий компонент <Image> из
// "@/components/img" отдаёт обычным путём через /_next/image, так что новые загрузки
// не ломаются, просто грузятся медленнее до следующего запуска скрипта (и редеплоя).
import { list, put } from "@vercel/blob"
import sharp from "sharp"
import fs from "node:fs"
import path from "node:path"
import crypto from "node:crypto"

sharp.concurrency(1)
const WIDTHS = [320, 640, 1080, 1600]
const QUALITY = 72
const PREFIXES = ["tours/", "articles/", "guides/", "reviews/", "park/"]
const IMG = /\.(webp|jpe?g|png)$/i
const OUT = "src/lib/image-variants.json"

async function listAll(prefix) {
  let cursor, all = []
  do {
    const r = await list({ cursor, limit: 1000, prefix })
    all.push(...r.blobs)
    cursor = r.cursor
  } while (cursor)
  return all
}

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name)
    return e.isDirectory() ? walk(p) : [p]
  })
}

const stripExt = (k) => k.replace(/\.[^./]+$/, "")
const hash = (x) => crypto.createHash("sha1").update(x).digest("hex").slice(0, 8)

const existing = new Set((await listAll("opt/")).map((b) => b.pathname))
const all = await listAll()
let base = null
const sources = []
for (const b of all) {
  if (!IMG.test(b.pathname) || !PREFIXES.some((p) => b.pathname.startsWith(p))) continue
  base ??= new URL(b.url).origin + "/opt/"
  // Файлы в Blob не перезаписываются (новые фото под новыми именами), но на всякий случай
  // версия = время загрузки: перезалитый файл получит новые копии.
  sources.push({ key: b.pathname, ver: hash(String(b.uploadedAt)), load: async () => Buffer.from(await (await fetch(b.url)).arrayBuffer()) })
}
for (const f of walk("public/images")) {
  if (!IMG.test(f)) continue
  const key = "public/" + path.relative("public", f).split(path.sep).join("/")
  // В public/ файлы иногда заменяют под тем же именем, версия = хэш содержимого.
  sources.push({ key, ver: hash(fs.readFileSync(f)), load: async () => fs.readFileSync(f) })
}
if (!base) throw new Error("no blob images found")

const done = {}
let made = 0
for (const [i, s] of sources.entries()) {
  const targets = WIDTHS.map((w) => ({ w, name: `opt/${stripExt(s.key)}.${s.ver}-w${w}.webp` }))
  const missing = targets.filter((t) => !existing.has(t.name))
  try {
    if (missing.length) {
      const buf = await s.load()
      for (const t of missing) {
        const out = await sharp(buf).rotate().resize({ width: t.w, withoutEnlargement: true }).webp({ quality: QUALITY }).toBuffer()
        await put(t.name, out, { access: "public", addRandomSuffix: false, contentType: "image/webp", cacheControlMaxAge: 31536000 })
        made++
      }
    }
    done[s.key] = s.ver
  } catch (e) {
    console.error("FAIL", s.key, e.message)
  }
  if (i % 10 === 0) console.log(`${i + 1}/${sources.length} made=${made}`)
}

fs.writeFileSync(OUT, JSON.stringify({ base, widths: WIDTHS, keys: Object.fromEntries(Object.entries(done).sort()) }) + "\n")
console.log("done", Object.keys(done).length, "sources,", made, "new files ->", OUT)
