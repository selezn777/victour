import type { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import { formatUsd } from "@/lib/format"
import { SignOutButton } from "@/components/sign-out-button"
import { BookingActions } from "@/components/admin/booking-actions"

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

  const { data: bookings, error } = await supabase
    .from("bookings")
    .select(
      "id, status, guest_name, contact_channel, contact_value, hotel, notes, total_usd, prepayment_usd, created_at, booking_items(date, date_end, adults, children, tours(title), guides(name))",
    )
    .order("created_at", { ascending: false })

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold sm:text-3xl">Заявки</h1>
          <p className="mt-1 text-sm text-muted-foreground">Панель Виктора</p>
        </div>
        <SignOutButton />
      </div>

      {error && <p className="mt-6 text-sm text-destructive">{error.message}</p>}

      {!error && (!bookings || bookings.length === 0) && (
        <p className="mt-6 text-sm text-muted-foreground">Заявок пока нет.</p>
      )}

      <div className="mt-6 flex flex-col gap-4">
        {bookings?.map((booking) => (
          <div key={booking.id} className="rounded-xl border border-border p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">{booking.guest_name}</span>
                <span className="text-xs text-muted-foreground">
                  {formatDateTime(booking.created_at)}
                </span>
              </div>
              <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
                {STATUS_LABELS[booking.status] ?? booking.status}
              </span>
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
              Итого {formatUsd(booking.total_usd)} · предоплата {formatUsd(booking.prepayment_usd)}
            </p>

            <div className="mt-3">
              <BookingActions bookingId={booking.id} status={booking.status} />
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
