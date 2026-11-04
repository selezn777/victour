import { createClient as createServiceClient } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/server"
import { readConfirmToken, confirmSummaryRu } from "@/lib/park-confirm"
import { DESTINATIONS } from "@/app/park/park-config"
import { whatToBringFor } from "@/lib/what-to-bring"
import type { Trip } from "@/lib/trip-types"

// «Мои поездки»: по номерам заявок/токенам из браузера (lib/my-trips.ts) и по
// аккаунту, если турист вошёл. Отдаём только то, что нужно самому туристу.

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const BOOKING_SELECT =
  "id, status, payment_status, guest_name, hotel, total_usd, prepayment_usd, created_at, booking_items(date, date_end, adults, children, price_snapshot_usd, departure_time, guide_comment, tours(slug, title), guides(name))"

type BookingRow = {
  id: string
  status: string
  payment_status: string
  guest_name: string
  hotel: string
  total_usd: number
  prepayment_usd: number
  created_at: string
  booking_items: {
    date: string
    date_end: string | null
    adults: number
    children: number
    price_snapshot_usd: number
    departure_time: string | null
    guide_comment: string | null
    tours: { slug: string; title: { ru: string } } | null
    guides: { name: string } | null
  }[]
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { bookings?: unknown; park?: unknown }
  const ids = (Array.isArray(body.bookings) ? body.bookings : [])
    .filter((x): x is string => typeof x === "string" && UUID.test(x))
    .slice(0, 30)
  const tokens = (Array.isArray(body.park) ? body.park : []).filter((x): x is string => typeof x === "string").slice(0, 30)

  const db = createServiceClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false },
  })

  // Вошедший турист видит и заявки со своего аккаунта (с другого телефона)
  let userId: string | null = null
  try {
    const supabase = await createClient()
    userId = (await supabase.auth.getUser()).data.user?.id ?? null
  } catch {
    userId = null
  }

  const rows: BookingRow[] = []
  if (ids.length) {
    const { data } = await db.from("bookings").select(BOOKING_SELECT).in("id", ids)
    rows.push(...((data ?? []) as unknown as BookingRow[]))
  }
  if (userId) {
    const { data } = await db.from("bookings").select(BOOKING_SELECT).eq("user_id", userId)
    for (const r of (data ?? []) as unknown as BookingRow[]) if (!rows.some((x) => x.id === r.id)) rows.push(r)
  }

  const trips: Trip[] = []
  for (const b of rows) {
    const paid = b.payment_status === "confirmed"
    trips.push({
      kind: "booking",
      ref: b.id,
      date: b.booking_items.map((i) => i.date).sort()[0] ?? b.created_at.slice(0, 10),
      status: b.status,
      paid,
      name: b.guest_name,
      hotel: b.hotel,
      totalUsd: Number(b.total_usd),
      prepaymentUsd: Number(b.prepayment_usd),
      items: b.booking_items
        .slice()
        .sort((a, c) => a.date.localeCompare(c.date))
        .map((i) => ({
          title: i.tours?.title.ru ?? "Тур",
          slug: i.tours?.slug ?? null,
          date: i.date,
          dateEnd: i.date_end,
          guests: i.adults + i.children,
          priceUsd: Number(i.price_snapshot_usd),
          // время, гид и комментарий могут поменяться до предоплаты (Виктор),
          // поэтому показываем их только после неё
          pickup: paid ? i.departure_time : null,
          guide: paid ? (i.guides?.name ?? null) : null,
          guideComment: paid ? i.guide_comment : null,
          bring: i.tours ? whatToBringFor(i.tours.slug) : [],
        })),
    })
  }

  for (const token of tokens) {
    const d = readConfirmToken(token)
    if (!d) continue
    const dest = DESTINATIONS[d.dest]
    const pkg = dest.packages.find((p) => p.id === d.pkg)
    trips.push({
      kind: "park",
      ref: token,
      date: d.date,
      status: "pending",
      paid: false,
      name: d.name,
      hotel: d.hotel,
      totalUsd: null,
      prepaymentUsd: null,
      items: [
        {
          title: `${dest.emoji} ${dest.placeRu}${pkg ? ` · ${pkg.title}` : ""}`,
          slug: null,
          date: d.date,
          dateEnd: null,
          guests: d.guests ?? null,
          priceUsd: null,
          priceNote: pkg?.price ?? null,
          pickup: d.pickup,
          boat: d.boat,
          cableCar: d.cableCar ?? null,
          guide: null,
          guideComment: null,
          bring: [],
          summary: confirmSummaryRu(d),
        },
      ],
    })
  }

  trips.sort((a, b) => a.date.localeCompare(b.date))
  return Response.json({ trips }, { headers: { "Cache-Control": "no-store" } })
}
