import Link from "next/link"
import type { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import { formatUsd } from "@/lib/format"
import { usdToRub } from "@/lib/pricing"
import { SignOutButton } from "@/components/sign-out-button"
import { AdminNav } from "@/components/admin/admin-nav"
import { BookingActions } from "@/components/admin/booking-actions"
import { PaymentRequisites } from "@/components/admin/payment-requisites"
import { LeadsList } from "@/components/admin/leads-list"
import { ReviewsAdminList } from "@/components/admin/reviews-admin-list"
import { FaqAdminList, type AdminFaqItem } from "@/components/admin/faq-admin-list"
import { getAllReviews } from "@/lib/reviews-data"

export const metadata: Metadata = {
  title: "Заявки — админка ВикТур",
}

const STATUS_LABELS: Record<string, string> = {
  pending: "На рассмотрении",
  confirmed: "Подтверждено",
  alt_proposed: "Предложена другая дата",
  cancelled: "Отклонено",
  completed: "Завершено",
}

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  unpaid: "Предоплата не получена",
  confirmed: "Предоплата получена",
}

/** Подсказка для Виктора: если отменить заявку сейчас, удерживается ли предоплата (<24ч до тура). */
function refundHint(earliestDate: string | null): string | null {
  if (!earliestDate) return null
  const hoursUntil = (new Date(`${earliestDate}T00:00:00`).getTime() - Date.now()) / 3_600_000
  if (hoursUntil < 0) return null
  return hoursUntil < 24
    ? "Если отменить сейчас: предоплата удерживается (<24ч до тура)"
    : "Если отменить сейчас: предоплата возвращается полностью"
}

const CONTACT_LABELS: Record<string, string> = {
  whatsapp: "WhatsApp",
  telegram: "Telegram",
  max: "MAX",
  vk: "ВКонтакте",
}

function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("ru-RU", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export default async function AdminBookingsPage() {
  const supabase = await createClient()

  const [{ data: bookings, error }, { data: settingsRows }, { data: leads }, { data: faqItems }, reviews] =
    await Promise.all([
      supabase
        .from("bookings")
        .select(
          "id, status, payment_status, guest_name, contact_channel, contact_value, hotel, notes, total_usd, prepayment_usd, created_at, booking_items(date, date_end, adults, children, tours(title), guides(name))",
        )
        .order("created_at", { ascending: false }),
      supabase.from("settings").select("key, value"),
      supabase
        .from("leads")
        .select("id, contact_channel, contact_value, tour_interest, created_at")
        .eq("contacted", false)
        .order("created_at", { ascending: false }),
      supabase
        .from("faq_items")
        .select("id, question, answer, created_at, tours(title)")
        .order("created_at", { ascending: false }),
      getAllReviews(),
    ])

  const faqItemsForAdmin: AdminFaqItem[] = (faqItems ?? []).map((item) => ({
    id: item.id,
    question: item.question,
    answer: item.answer,
    tour_title: (item.tours as unknown as { title: { ru: string } } | null)?.title.ru ?? null,
    created_at: item.created_at,
  }))

  const settingsByKey = new Map(
    (settingsRows ?? []).map((s) => [s.key, s.value as Record<string, unknown>]),
  )
  const depositUsd = (settingsByKey.get("deposit_usd")?.amount as number) ?? 80
  const usdRubRate = (settingsByKey.get("usd_rub_rate")?.rate as number) ?? 82
  const rubMarkupPct = (settingsByKey.get("rub_markup_pct")?.pct as number) ?? 8
  const depositRub = usdToRub(depositUsd, usdRubRate, rubMarkupPct)

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
        <div>
          <h1 className="font-heading text-2xl font-semibold sm:text-3xl">Заявки</h1>
          <p className="mt-1 text-sm text-muted-foreground">Панель Виктора</p>
        </div>
        <SignOutButton />
      </div>

      <div className="mt-5">
        <AdminNav />
      </div>

      <div className="mt-6">
        <PaymentRequisites amountRub={depositRub} />
        <LeadsList leads={leads ?? []} />
        <FaqAdminList items={faqItemsForAdmin} />
        <ReviewsAdminList reviews={reviews} />
      </div>

      {error && <p className="text-sm text-destructive">{error.message}</p>}

      {!error && (!bookings || bookings.length === 0) && (
        <p className="mt-6 text-sm text-muted-foreground">Заявок пока нет.</p>
      )}

      <div className="mt-6 flex flex-col gap-4">
        {bookings?.map((booking) => {
          const earliestDate = booking.booking_items
            .map((i) => i.date)
            .sort()[0] as string | undefined
          const hint =
            booking.status === "pending" || booking.status === "confirmed"
              ? refundHint(earliestDate ?? null)
              : null

          return (
          <div key={booking.id} className="rounded-xl border border-border p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">{booking.guest_name}</span>
                <span className="text-xs text-muted-foreground">
                  {formatDateTime(booking.created_at)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                    booking.payment_status === "confirmed"
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {PAYMENT_STATUS_LABELS[booking.payment_status] ?? booking.payment_status}
                </span>
                <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
                  {STATUS_LABELS[booking.status] ?? booking.status}
                </span>
              </div>
            </div>

            <p className="mt-2 text-sm text-muted-foreground">
              {CONTACT_LABELS[booking.contact_channel] ?? booking.contact_channel}:{" "}
              {booking.contact_value} · Отель: {booking.hotel}
            </p>

            <ul className="mt-3 flex flex-col gap-1 text-sm">
              {booking.booking_items.map((item, i) => (
                <li key={i}>
                  {(item.tours as unknown as { title: { ru: string } } | null)?.title.ru ?? "Тур"}{" "}
                  — {formatDate(item.date)}
                  {item.date_end ? ` — ${formatDate(item.date_end)}` : ""} · {item.adults} взр.
                  {item.children > 0 ? ` + ${item.children} дет.` : ""}
                  {(item.guides as unknown as { name: string } | null)?.name
                    ? ` · гид ${(item.guides as unknown as { name: string }).name}`
                    : ""}
                </li>
              ))}
            </ul>

            {booking.notes && (
              <p className="mt-2 text-sm text-muted-foreground italic">«{booking.notes}»</p>
            )}

            <p className="mt-2 text-sm">
              Итого {formatUsd(booking.total_usd)} ·{" "}
              {booking.payment_status === "confirmed"
                ? `предоплата ${formatUsd(booking.prepayment_usd)} получена`
                : `к предоплате ${formatUsd(booking.prepayment_usd)}`}
            </p>

            {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}

            <div className="mt-3">
              <BookingActions
                bookingId={booking.id}
                status={booking.status}
                paymentStatus={booking.payment_status}
              />
            </div>
          </div>
          )
        })}
      </div>
    </main>
  )
}
