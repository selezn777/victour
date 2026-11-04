// Прогрев кэша оптимизированных фото на Vercel: запускать из корня проекта после
// деплоя или загрузки новых фото (node scripts/warm-image-cache.mjs).
// Без прогрева первый гость ждёт пережатия каждого фото ~1-2 с.
//
// ВАЖНО: кэш /_next/image живёт 31 день (next.config.ts, minimumCacheTTL).
// Новые фото грузить в Blob только под НОВЫМ именем/папкой: перезапись файла
// под тем же URL (allowOverwrite) месяц будет показывать старую картинку.
import fs from "fs"
import { createClient } from "@supabase/supabase-js"

const BASE = process.argv[2] ?? "https://victour.vercel.app"
const WIDTHS = [640, 828, 1200]

const env = Object.fromEntries(
  fs
    .readFileSync(".env.local", "utf8")
    .split(/\r?\n/)
    .filter((l) => l.includes("="))
    .map((l) => {
      const i = l.indexOf("=")
      return [l.slice(0, i), l.slice(i + 1).replace(/^"|"$/g, "")]
    }),
)
const db = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

const urls = new Set()
const BLOB = /https:\/\/[a-z0-9]+\.public\.blob\.vercel-storage\.com\/[^"'\\\s?]+?\.(?:jpe?g|webp|png)/gi
const collect = (text) => {
  for (const m of text.matchAll(BLOB)) urls.add(m[0])
}

// 1) все фото из базы: туры (обложка, галерея, маршрут), статьи, гиды
for (const table of ["tours", "articles", "guides"]) {
  const { data, error } = await db.from(table).select("*")
  if (error) console.warn(table, error.message)
  else collect(JSON.stringify(data))
}

// 2) локальные фото и всё, что реально стоит на страницах
const pages = ["/", "/tours", "/phuquoc", "/phuquoc?t=pq_honthom", "/park", "/park?t=hontam", "/guides", "/reviews", "/blog"]
for (const p of pages) {
  const html = (await (await fetch(BASE + p)).text()).split("\\u0026").join("&").split("\\/").join("/")
  collect(html)
  for (const m of html.matchAll(/url=([^&"'\s]+)/g)) {
    const u = decodeURIComponent(m[1]).split("&")[0]
    if (u.startsWith("/")) urls.add(u)
  }
}

const jobs = []
for (const u of urls) for (const w of WIDTHS) jobs.push(`${BASE}/_next/image?url=${encodeURIComponent(u)}&w=${w}&q=75`)
console.log(`фото: ${urls.size}, запросов: ${jobs.length}`)

let done = 0
let miss = 0
let bad = 0
const t0 = Date.now()
async function worker() {
  while (jobs.length) {
    const j = jobs.shift()
    try {
      const r = await fetch(j, { headers: { accept: "image/avif,image/webp,*/*" } })
      await r.arrayBuffer()
      if (r.headers.get("x-vercel-cache") === "MISS") miss++
      if (!r.ok) {
        bad++
        console.log(r.status, decodeURIComponent(j).slice(0, 160))
      }
    } catch {
      bad++
    }
    done++
  }
}
await Promise.all(Array.from({ length: 6 }, worker))
console.log({ done, miss, bad, sec: Math.round((Date.now() - t0) / 1000) })
