"use client"

import Link from "next/link"
import { sendGAEvent } from "@next/third-parties/google"
import { XIcon } from "lucide-react"
import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ThemeToggle } from "@/components/theme-toggle"
import { AccountMenu } from "@/components/account-menu"
import { usePackage, type PackageItem } from "@/hooks/use-package"
import { calculatePackageTotal, calculatePrepayment } from "@/lib/pricing"
import { formatRubFromUsd, formatUsd, formatVnd, formatVndFromUsd } from "@/lib/format"
import type { SiteSettings, Surcharge } from "@/lib/site-data"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"

const CONTACT_CHANNELS = [
  { code: "whatsapp", label: "WhatsApp" },
  { code: "telegram", label: "Telegram" },
  { code: "max", label: "MAX" },
  { code: "vk", label: "ВКонтакте" },
] as const

const PREPAYMENT_METHODS = [
  { code: "transfer", label: "Перевод" },
  { code: "card", label: "Карта" },
] as const

function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })
}

function itemGroupTotalUsd(item: PackageItem): number {
  return item.priceAdultUsd * item.adults
}

export function RequestPageClient({
  settings,
  surcharges,
}: {
  settings: SiteSettings
  surcharges: Surcharge[]
}) {
  const { items, removeItem, clear } = usePackage()
  const [selectedSurcharges, setSelectedSurcharges] = useState<Set<string>>(new Set())
  const [hotel, setHotel] = useState("")
  const [guestName, setGuestName] = useState("")
  const [contactChannel, setContactChannel] = useState<string>(CONTACT_CHANNELS[0].code)
  const [contactValue, setContactValue] = useState("")
  const [prepaymentMethod, setPrepaymentMethod] = useState<string>(PREPAYMENT_METHODS[0].code)
  const [notes, setNotes] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submittedBookingId, setSubmittedBookingId] = useState<string | null>(null)

  const itemsSubtotalUsd = useMemo(
    () => items.reduce((sum, item) => sum + itemGroupTotalUsd(item), 0),
    [items],
  )

  const surchargeUsd = useMemo(() => {
    let vnd = 0
    for (const s of surcharges) {
      if (selectedSurcharges.has(s.code)) vnd += s.amountVnd
    }
    return vnd / settings.usdVndRate
  }, [surcharges, selectedSurcharges, settings.usdVndRate])

  const totals = useMemo(
    () =>
      calculatePackageTotal({
        itemsSubtotalUsd,
        tourCount: items.length,
        discounts: settings.packageDiscounts,
        surchargeUsd,
      }),
    [itemsSubtotalUsd, items.length, settings.packageDiscounts, surchargeUsd],
  )

  const prepaymentUsd = calculatePrepayment(totals.totalUsd)

  const canSubmit =
    items.length > 0 &&
    hotel.trim().length > 0 &&
    guestName.trim().length > 0 &&
    contactValue.trim().length > 0 &&
    !submitting

  function toggleSurcharge(code: string) {
    setSelectedSurcharges((prev) => {
      const next = new Set(prev)
      if (next.has(code)) next.delete(code)
      else next.add(code)
      return next
    })
  }

  async function handleSubmit() {
    if (!canSubmit) return
    setSubmitting(true)
    setSubmitError(null)

    const supabase = createClient()
    const maxAdults = Math.max(...items.map((i) => i.adults))

    const { data, error } = await supabase.rpc("create_booking", {
      p_booking: {
        guest_name: guestName.trim(),
        contact_channel: contactChannel,
        contact_value: contactValue.trim(),
        hotel: hotel.trim(),
        adults_total: maxAdults,
        children_total: 0,
        notes: notes.trim() || null,
        currency: "USD",
        subtotal_usd: totals.subtotalUsd,
        discount_pct: totals.discountPct,
        surcharge_usd: totals.surchargeUsd,
        total_usd: totals.totalUsd,
        prepayment_usd: prepaymentUsd,
        exchange_rate_snapshot: {
          usdVndRate: settings.usdVndRate,
          usdRubRate: settings.usdRubRate,
          rubMarkupPct: settings.rubMarkupPct,
          prepaymentMethod,
        },
      },
      p_items: items.map((item) => ({
        tour_id: item.tourId,
        guide_id: item.guideId,
        date: item.date,
        date_end: item.dateEnd,
        adults: item.adults,
        children: 0,
        price_snapshot_usd: itemGroupTotalUsd(item),
      })),
    })

    if (error) {
      setSubmitError("Не получилось отправить заявку. Попробуйте ещё раз или напишите гиду напрямую.")
      setSubmitting(false)
      return
    }

    setSubmittedBookingId(data)
    clear()
    setSubmitting(false)

    sendGAEvent("event", "generate_lead", {
      value: totals.totalUsd,
      currency: "USD",
      tour_count: items.length,
    })

    fetch("/api/notify-booking", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingId: data }),
    }).catch(() => {
      // best-effort — гость всё равно видит подтверждение, Виктор увидит заявку в админке
    })
  }

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="mx-auto flex h-14 max-w-3xl items-center gap-4 px-4 sm:h-16 sm:px-6">
          <Link href="/" className="shrink-0 font-heading text-lg font-semibold tracking-tight sm:text-xl">
            ВикТур
          </Link>
          <Link href="/#catalog" className="text-sm text-muted-foreground hover:text-foreground hover:underline">
            Все туры
          </Link>
          <div className="ml-auto flex items-center gap-1">
            <ThemeToggle />
            <AccountMenu />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        {submittedBookingId ? (
          <section className="rounded-2xl border border-border bg-card p-6 text-center sm:p-10">
            <h1 className="font-heading text-2xl font-semibold sm:text-3xl">Заявка принята</h1>
            <p className="mt-3 text-muted-foreground">
              Проверяем доступность гида на выбранные даты и свяжемся с вами в{" "}
              {CONTACT_CHANNELS.find((c) => c.code === contactChannel)?.label} в ближайшее время.
            </p>
            <Button size="lg" className="mt-6" nativeButton={false} render={<Link href="/" />}>
              На главную
            </Button>
          </section>
        ) : items.length === 0 ? (
          <section className="rounded-2xl border border-border bg-card p-6 text-center sm:p-10">
            <h1 className="font-heading text-2xl font-semibold sm:text-3xl">Заявка пуста</h1>
            <p className="mt-3 text-muted-foreground">
              Добавьте один или несколько туров со страницы тура, чтобы собрать пакет.
            </p>
            <Button size="lg" className="mt-6" nativeButton={false} render={<Link href="/#catalog" />}>
              К турам
            </Button>
          </section>
        ) : (
          <>
            <h1 className="font-heading text-2xl font-semibold sm:text-3xl">Ваша заявка</h1>

            <section className="mt-6 flex flex-col gap-3">
              {items.map((item) => (
                <div
                  key={item.tourSlug}
                  className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-4"
                >
                  <div>
                    <div className="font-medium">{item.tourTitle}</div>
                    <div className="text-sm text-muted-foreground">
                      {formatDate(item.date)} · {item.guideName} · {item.adults} гостей
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-heading font-semibold text-primary">
                      {formatUsd(itemGroupTotalUsd(item))}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Убрать тур из заявки"
                      onClick={() => removeItem(item.tourSlug)}
                    >
                      <XIcon />
                    </Button>
                  </div>
                </div>
              ))}
            </section>

            {surcharges.length > 0 && (
              <section className="mt-6 rounded-xl border border-border bg-card p-4">
                <span className="text-sm font-medium">Доплаты (не входят в пакетную скидку)</span>
                <div className="mt-2 flex flex-col gap-2">
                  {surcharges.map((s) => (
                    <label key={s.code} className="flex items-center justify-between gap-3 text-sm">
                      <span className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedSurcharges.has(s.code)}
                          onChange={() => toggleSurcharge(s.code)}
                          className="size-4 rounded border-input"
                        />
                        {s.name}
                      </span>
                      <span className="text-muted-foreground">{formatVnd(s.amountVnd)}</span>
                    </label>
                  ))}
                </div>
              </section>
            )}

            <section className="mt-6 rounded-xl border border-border bg-card p-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Сумма туров</span>
                <span>{formatUsd(totals.subtotalUsd)}</span>
              </div>
              {totals.discountPct > 0 && (
                <div className="mt-1 flex justify-between text-sm text-primary">
                  <span>Пакетная скидка {totals.discountPct}%</span>
                  <span>−{formatUsd(totals.discountUsd)}</span>
                </div>
              )}
              {totals.surchargeUsd > 0 && (
                <div className="mt-1 flex justify-between text-sm">
                  <span className="text-muted-foreground">Доплаты</span>
                  <span>+{formatUsd(totals.surchargeUsd)}</span>
                </div>
              )}
              <div className="mt-3 flex items-baseline justify-between border-t border-border pt-3">
                <span className="font-medium">Итого</span>
                <div className="text-right">
                  <div className="font-heading text-xl font-semibold text-primary">
                    {formatUsd(totals.totalUsd)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatVndFromUsd(totals.totalUsd, settings.usdVndRate)} ·{" "}
                    {formatRubFromUsd(totals.totalUsd, settings.usdRubRate, settings.rubMarkupPct)}
                  </div>
                </div>
              </div>
              <div className="mt-2 flex justify-between text-sm text-muted-foreground">
                <span>Предоплата (30%, мин. $80)</span>
                <span>{formatUsd(prepaymentUsd)}</span>
              </div>
            </section>

            <section className="mt-6 flex flex-col gap-4 rounded-xl border border-border bg-card p-4">
              <div>
                <label className="text-sm font-medium" htmlFor="hotel">Отель</label>
                <Input id="hotel" className="mt-1.5" value={hotel} onChange={(e) => setHotel(e.target.value)} placeholder="Название отеля" />
              </div>

              <div>
                <label className="text-sm font-medium" htmlFor="guestName">Имя</label>
                <Input id="guestName" className="mt-1.5" value={guestName} onChange={(e) => setGuestName(e.target.value)} placeholder="Как к вам обращаться" />
              </div>

              <div>
                <span className="text-sm font-medium">Канал связи</span>
                <div className="mt-1.5 flex flex-wrap gap-2">
                  {CONTACT_CHANNELS.map((c) => (
                    <button
                      key={c.code}
                      type="button"
                      aria-pressed={contactChannel === c.code}
                      onClick={() => setContactChannel(c.code)}
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-sm transition-colors",
                        contactChannel === c.code
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border hover:bg-muted",
                      )}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
                <Input
                  className="mt-2"
                  value={contactValue}
                  onChange={(e) => setContactValue(e.target.value)}
                  placeholder="Номер телефона или ник"
                />
              </div>

              <div>
                <span className="text-sm font-medium">Способ предоплаты</span>
                <div className="mt-1.5 flex flex-wrap gap-2">
                  {PREPAYMENT_METHODS.map((m) => (
                    <button
                      key={m.code}
                      type="button"
                      aria-pressed={prepaymentMethod === m.code}
                      onClick={() => setPrepaymentMethod(m.code)}
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-sm transition-colors",
                        prepaymentMethod === m.code
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border hover:bg-muted",
                      )}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium" htmlFor="notes">Пожелания</label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Необязательно"
                  className="mt-1.5 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-base outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm dark:bg-input/30"
                />
              </div>
            </section>

            {submitError && (
              <p className="mt-3 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {submitError}
              </p>
            )}

            <Button type="button" size="lg" className="mt-4 w-full" disabled={!canSubmit} onClick={handleSubmit}>
              {submitting ? "Отправляем…" : "Отправить заявку"}
            </Button>
          </>
        )}
      </main>
    </>
  )
}
