import { createClient } from "@supabase/supabase-js"
import { DESTINATIONS, findDistrict, type ParkBooking } from "@/app/park/park-config"
import { buildReceipt } from "@/lib/park-total"

// Сохранение заявок на билеты/трансфер в таблицу park_bookings — для утреннего
// отчёта Виктору и админки. Ошибки только логируем: заявка уже ушла в Telegram,
// туриста из-за базы не роняем.

function service() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  return url && key ? createClient(url, key, { auth: { persistSession: false } }) : null
}

/** Примерная сумма за билеты и доп. услуги в донгах (по ценам из park-config). */
export function estimateTicketsVnd(b: ParkBooking): number {
  return buildReceipt(b).ticketsVnd
}

export async function saveParkBooking(b: ParkBooking, confirmToken: string | null, shortId: string | null) {
  const db = service()
  if (!db) return
  const dest = DESTINATIONS[b.destination]
  const district = findDistrict(b.destination, b.district)
  const { error } = await db.from("park_bookings").insert({
    confirm_token: confirmToken,
    short_id: shortId,
    destination: b.destination,
    date: b.date,
    package_id: b.packageId,
    package_title: dest.packages.find((p) => p.id === b.packageId)?.title ?? null,
    departure_time: b.departureTime,
    guests: b.guests,
    guests_total: Object.values(b.guests).reduce((a, n) => a + n, 0),
    extras: b.extras,
    hotel: b.hotel,
    district: district?.label ?? null,
    transfer_usd: district?.priceUsd ?? null,
    tickets_vnd: estimateTicketsVnd(b) || null,
    name: b.name,
    contact_channel: b.contactChannel,
    contact: b.contact,
    comment: b.comment || null,
  })
  if (error) console.error("park-booking-store: insert failed:", error.message, JSON.stringify(b))
}

export async function markParkBookingConfirmed(confirmToken: string) {
  const db = service()
  if (!db) return
  const { error } = await db
    .from("park_bookings")
    .update({ stage: "client_confirmed", updated_at: new Date().toISOString() })
    .eq("confirm_token", confirmToken)
    .eq("stage", "new")
  if (error) console.error("park-booking-store: confirm update failed:", error.message)
}
