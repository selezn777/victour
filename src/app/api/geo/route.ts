import { NextResponse } from "next/server"

// Подсказка курорта по IP — без запроса разрешения на геолокацию. Vercel сам
// кладёт координаты города в заголовки x-vercel-ip-*. Если гость уже во
// Вьетнаме рядом с одним из наших курортов — возвращаем его, иначе null
// (гость дома и выбирает заранее — просто показываем выбор).
const POINTS = [
  { id: "phuquoc", lat: 10.22, lon: 103.96 },
  { id: "nyachang", lat: 12.24, lon: 109.19 },
  { id: "kamran", lat: 11.92, lon: 109.15 },
] as const

const MAX_KM = 80

function km(aLat: number, aLon: number, bLat: number, bLon: number) {
  const r = (d: number) => (d * Math.PI) / 180
  const dLat = r(bLat - aLat)
  const dLon = r(bLon - aLon)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(r(aLat)) * Math.cos(r(bLat)) * Math.sin(dLon / 2) ** 2
  return 2 * 6371 * Math.asin(Math.sqrt(h))
}

export async function GET(request: Request) {
  const lat = Number(request.headers.get("x-vercel-ip-latitude"))
  const lon = Number(request.headers.get("x-vercel-ip-longitude"))
  let resort: string | null = null
  if (Number.isFinite(lat) && Number.isFinite(lon) && (lat !== 0 || lon !== 0)) {
    let best = Infinity
    for (const p of POINTS) {
      const d = km(lat, lon, p.lat, p.lon)
      if (d < best && d <= MAX_KM) {
        best = d
        resort = p.id
      }
    }
  }
  return NextResponse.json({ resort }, { headers: { "Cache-Control": "private, no-store" } })
}
