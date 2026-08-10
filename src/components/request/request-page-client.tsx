"use client"

import Link from "next/link"
import { sendGAEvent } from "@next/third-parties/google"
import { XIcon } from "lucide-react"
import { useMemo, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PhoneInput } from "@/components/ui/phone-input"
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
  const [contactMode, setContactMode] = useState<"phone" | "handle">("phone")
  const [notes, setNotes] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submittedBookingId, setSubmittedBookingId] = useState<string | null>(null)
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const lastCapturedLead = useRef<string | null>(null)

  // Гость мог оставить контакт и не дозаполнить заявку — сохраняем его, чтобы
  // не терять первый заход и иметь возможность потом самим дожать бронь.
  function captureLead() {
    const value = contactValue.trim()
    if (value.length < 5 || submittedBookingId || lastCapturedLead.current === value) return
    lastCapturedLead.current = value

    const supabase = createClient()
    supabase
      .rpc("save_lead", {
        p_contact_channel: contactChannel,
        p_contact_value: value,
        p_tour_interest: items.map((i) => i.tourTitle).join(", ") || null,
        p_source: "request_page",
      })
      .then(({ data: isNew }) => {
        if (isNew) {
          fetch("/api/notify-lead", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contactValue: value }),
          }).catch(() => {})
        }
      })
  }

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

  const prepaymentUsd = calculatePrepayment(settings.depositUsd)

  const canSubmit =
    items.length > 0 &&
    hotel.trim().length > 0 &&
    guestName.trim().length > 0 &&
    contactValue.trim().length > 0 &&
    !submitting

  const step1Valid = contactValue.trim().length > 0
  const step2Valid = hotel.trim().length > 0 && guestName.trim().length > 0

  function goToStep2() {
    if (!step1Valid) return
    captureLead()
    setStep(2)
  }

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
        <div className="mx-auto flex h-14 max-w-4xl items-center gap-4 px-4 sm:h-16 sm:px-6">
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

      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
        {submittedBookingId ? (
          <section className="rounded-2xl border border-border bg-card p-8 text-center shadow-sm sm:p-12">
            <h1 className="font-heading text-2xl font-semibold sm:text-3xl">Заявка принята</h1>
            <p className="mt-3 text-muted-foreground">
              Проверяем доступность гида на выбранные даты и свяжемся с вами в{" "}
              {CONTACT_CHANNELS.find((c) => c.code === contactChannel)?.label} в ближайшее время —
              пришлём реквизиты для предоплаты{" "}
              {formatRubFromUsd(prepaymentUsd, settings.usdRubRate, settings.rubMarkupPct)}.
              Остальное — наличными при встрече.
            </p>
            <Button size="lg" className="mt-6" nativeButton={false} render={<Link href="/" />}>
              На главную
            </Button>
          </section>
        ) : items.length === 0 ? (
          <section className="rounded-2xl border border-border bg-card p-8 text-center shadow-sm sm:p-12">
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
                  className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-5 shadow-sm"
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
              <section className="mt-6 rounded-xl border border-border bg-card p-5 shadow-sm">
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

            <section className="mt-6 rounded-xl border border-border bg-card p-5 shadow-sm">
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
              <div className="mt-3 flex items-center justify-between rounded-lg bg-primary/10 px-3 py-2.5">
                <span className="text-sm font-medium">Предоплата для брони</span>
                <div className="text-right">
                  <div className="font-heading text-lg font-semibold text-primary">
                    {formatRubFromUsd(prepaymentUsd, settings.usdRubRate, settings.rubMarkupPct)}
                  </div>
                  <div className="text-xs text-muted-foreground">≈ {formatUsd(prepaymentUsd)}</div>
                </div>
              </div>
              <p className="mt-1.5 text-xs text-muted-foreground">
                Никаких крупных предоплат — остальное наличными при встрече.
              </p>
            </section>

            <section className="mt-6 rounded-xl border border-border bg-card p-5 shadow-sm">
              <div className="flex items-center justify-center gap-2">
                {[1, 2, 3].map((s) => (
                  <span
                    key={s}
                    className={cn(
                      "h-1.5 w-8 rounded-full transition-colors",
                      s <= step ? "bg-primary" : "bg-muted",
                    )}
                  />
                ))}
              </div>
              <p className="mt-2 text-center text-xs text-muted-foreground">Шаг {step} из 3</p>

              {step === 1 && (
                <div className="mt-4 flex flex-col gap-4">
                  <div>
                    <span className="text-sm font-medium">Как с вами связаться?</span>
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
                    {contactMode === "phone" ? (
                      <PhoneInput
                        autoFocus
                        className="mt-2"
                        value={contactValue}
                        onChange={setContactValue}
                        onKeyDown={(e) => e.key === "Enter" && goToStep2()}
                      />
                    ) : (
                      <Input
                        autoFocus
                        className="mt-2 h-12 text-base"
                        value={contactValue}
                        onChange={(e) => setContactValue(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && goToStep2()}
                        placeholder="Ник в WhatsApp / Telegram / VK"
                      />
                    )}
                    <div className="mt-1.5 flex items-center justify-between gap-2">
                      <p className="text-xs text-muted-foreground">
                        Спрашиваем первым — если что-то пойдёт не так, сможем сами написать вам.
                      </p>
                      <button
                        type="button"
                        className="shrink-0 text-xs text-primary underline-offset-2 hover:underline"
                        onClick={() => {
                          setContactValue("")
                          setContactMode((m) => (m === "phone" ? "handle" : "phone"))
                        }}
                      >
                        {contactMode === "phone" ? "Указать ник" : "Указать телефон"}
                      </button>
                    </div>
                  </div>
                  <Button type="button" size="lg" className="w-full" disabled={!step1Valid} onClick={goToStep2}>
                    Далее
                  </Button>
                </div>
              )}

              {step === 2 && (
                <div className="mt-4 flex flex-col gap-4">
                  <div>
                    <label className="text-sm font-medium" htmlFor="guestName">Как к вам обращаться?</label>
                    <Input
                      autoFocus
                      id="guestName"
                      className="mt-1.5"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder="Имя"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium" htmlFor="hotel">Где вас забрать?</label>
                    <Input
                      id="hotel"
                      className="mt-1.5"
                      value={hotel}
                      onChange={(e) => setHotel(e.target.value)}
                      placeholder="Название отеля"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button type="button" size="lg" variant="outline" onClick={() => setStep(1)}>
                      Назад
                    </Button>
                    <Button
                      type="button"
                      size="lg"
                      className="flex-1"
                      disabled={!step2Valid}
                      onClick={() => setStep(3)}
                    >
                      Далее
                    </Button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="mt-4 flex flex-col gap-4">
                  <div>
                    <label className="text-sm font-medium" htmlFor="notes">Пожелания</label>
                    <textarea
                      id="notes"
                      autoFocus
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                      placeholder="Необязательно"
                      className="mt-1.5 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-base outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm dark:bg-input/30"
                    />
                  </div>

                  <div className="rounded-lg bg-muted/60 px-3 py-3 text-sm">
                    <p className="font-medium">Что будет дальше</p>
                    <ol className="mt-2 flex flex-col gap-1.5 text-muted-foreground">
                      <li>1. Проверяем даты у гида — обычно в течение часа.</li>
                      <li>
                        2. Пишем вам в{" "}
                        {CONTACT_CHANNELS.find((c) => c.code === contactChannel)?.label} с реквизитами
                        для предоплаты.
                      </li>
                      <li>3. Вы подтверждаете бронь.</li>
                      <li>4. Остальное — наличными при встрече.</li>
                    </ol>
                  </div>

                  {submitError && (
                    <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                      {submitError}
                    </p>
                  )}

                  <div className="flex gap-2">
                    <Button type="button" size="lg" variant="outline" onClick={() => setStep(2)}>
                      Назад
                    </Button>
                    <Button
                      type="button"
                      size="lg"
                      className="flex-1"
                      disabled={!canSubmit}
                      onClick={handleSubmit}
                    >
                      {submitting ? "Отправляем…" : "Отправить заявку"}
                    </Button>
                  </div>
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </>
  )
}
