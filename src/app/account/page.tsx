import Link from "next/link"
import type { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import { getHomepageData } from "@/lib/site-data"
import { formatUsd } from "@/lib/format"
import { whatToBringFor } from "@/lib/what-to-bring"
import { SignOutButton } from "@/components/sign-out-button"
import { SiteHeader } from "@/components/site-header"
import { RecommendedTours } from "@/components/account/recommended-tours"

export const metadata: Metadata = {
  title: "Личный кабинет — ВикТур",
}

const STATUS_LABELS: Record<string, string> = {
  pending: "На рассмотрении",
  confirmed: "Подтверждено",
  alt_proposed: "Предложена другая дата",
  cancelled: "Отменено",
  completed: "Завершено",
}

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  unpaid: "Предоплата: ожидаем реквизиты от менеджера",
  confirmed: "Предоплата: получена",
}

function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })
}

export default async function AccountPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: bookings } = await supabase
    .from("bookings")
    .select(
      "id, status, payment_status, created_at, total_usd, currency, prepayment_usd, booking_items(date, date_end, departure_time, guide_comment, tours(slug, title), guides(name))",
    )
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false })

  const bookedTourSlugs = new Set(
    (bookings ?? []).flatMap((b) =>
      b.booking_items.map((i) => (i.tours as unknown as { slug: string } | null)?.slug),
    ),
  )

  const { tours, settings, guide } = await getHomepageData()
  const recommended = tours.filter((t) => !bookedTourSlugs.has(t.slug)).slice(0, 3)

  return (
    <>
      <SiteHeader settings={settings} guide={guide} />
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
        <div>
          <h1 className="font-heading text-2xl font-semibold sm:text-3xl">Личный кабинет</h1>
          <p className="mt-1 text-sm text-muted-foreground">{user?.email}</p>
        </div>
        <SignOutButton />
      </div>

      <section className="mt-8">
        <h2 className="font-heading text-lg font-semibold sm:text-xl">Мои заявки</h2>

        {!bookings || bookings.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">
            Пока нет заявок.{" "}
            <Link href="/tours" className="underline hover:no-underline">
              Выбрать тур
            </Link>
          </p>
        ) : (
          <div className="mt-4 flex flex-col gap-3">
            {bookings.map((booking) => (
              <div key={booking.id} className="rounded-xl border border-border p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium">
                    {STATUS_LABELS[booking.status] ?? booking.status}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {formatUsd(booking.total_usd)}
                  </span>
                </div>
                {/* Полные детали (гид, время выезда, комментарий гида, что
                    взять с собой) — только после подтверждения предоплаты
                    (Виктор: "нужен только после подтверждения внесения
                    предоплаты"). До этого — только сам факт брони и дата,
                    без деталей поездки, которые ещё могут поменяться. */}
                <ul className="mt-2 flex flex-col gap-2 text-sm text-muted-foreground">
                  {booking.booking_items.map((item, i) => {
                    const tour = item.tours as unknown as { slug: string; title: { ru: string } } | null
                    const guideName = (item.guides as unknown as { name: string } | null)?.name ?? null
                    const confirmed = booking.payment_status === "confirmed"
                    const packingItems = tour ? whatToBringFor(tour.slug) : []
                    return (
                      <li key={i}>
                        <div>
                          {tour?.title.ru ?? "Тур"} — {formatDate(item.date)}
                          {item.date_end ? ` — ${formatDate(item.date_end)}` : ""}
                        </div>
                        {confirmed && (
                          <div className="mt-1 flex flex-col gap-1 rounded-lg bg-muted/50 p-2.5 text-xs">
                            {guideName && <div>Гид: {guideName}</div>}
                            {item.departure_time && <div>Время выезда: {item.departure_time}</div>}
                            {item.guide_comment && (
                              <div>Комментарий гида: «{item.guide_comment}»</div>
                            )}
                            {packingItems.length > 0 && (
                              <div>
                                <div className="font-medium text-foreground">Что взять с собой:</div>
                                <ul className="mt-0.5 list-disc pl-4">
                                  {packingItems.map((p) => (
                                    <li key={p}>{p}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}
                      </li>
                    )
                  })}
                </ul>
                {booking.status !== "cancelled" && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    {PAYMENT_STATUS_LABELS[booking.payment_status] ?? booking.payment_status}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="mt-10">
        <RecommendedTours tours={recommended} />
      </div>
      </main>
    </>
  )
}
