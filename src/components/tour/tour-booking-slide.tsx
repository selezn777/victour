"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { sendGAEvent } from "@next/third-parties/google"
import { Button } from "@/components/ui/button"
import { BookingCalendar } from "@/components/tour/booking-calendar"
import { formatUsd } from "@/lib/format"
import { datesUsedByOtherItems, usePackage } from "@/hooks/use-package"
import type { TourDetail, TourGuide } from "@/lib/site-data"
import { cn } from "@/lib/utils"

function isoDatePlusOne(iso: string): string {
  const d = new Date(`${iso}T00:00:00`)
  d.setDate(d.getDate() + 1)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

// Слайд брони в колоде тура. Гости и календарь — рядом друг с другом, в
// одном месте (Виктор забраковал прошлый вариант, где степпер гостей жил
// отдельно в нижней плашке: "неудобно выбрать количество людей и даты" —
// вернул их в один узел). Заголовок и кнопка сознательно не "Забронировать"
// (звучит как финальное действие) — Виктор попросил формулировку помягче,
// чтобы не отпугивать тех, кому перед покупкой нужен живой разговор с
// менеджером. Отступы затянуты плотнее, чем на других слайдах — Виктор
// увидел, что весь блок (гид+календарь+гости+кнопка) не помещался на
// экране телефона.
export function TourBookingSlide({
  tour,
  guides,
  guestCount,
  onGuestCountChange,
  onSubmitted,
}: {
  tour: TourDetail
  guides: TourGuide[]
  guestCount: number
  onGuestCountChange: (updater: (count: number) => number) => void
  /** Вызывается после успешного добавления в заявку — родитель может,
   * например, показать плашку/переключить слайд. */
  onSubmitted?: () => void
}) {
  const { items, addItem } = usePackage()
  const [guideId, setGuideId] = useState(guides[0]?.id ?? null)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [addedToPackage, setAddedToPackage] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const guide = guides.find((g) => g.id === guideId) ?? null
  const bookedDates = useMemo(() => {
    const dates = new Set(guide?.bookedDates ?? [])
    for (const d of datesUsedByOtherItems(items, tour.slug)) dates.add(d)
    return dates
  }, [guide, items, tour.slug])

  const minGuests = tour.pricingTiers[0]?.guestCount ?? 2
  const maxGuests = tour.pricingTiers[tour.pricingTiers.length - 1]?.guestCount ?? 9
  const priceAdultUsd =
    tour.pricingTiers.find((t) => t.guestCount === guestCount)?.priceAdultUsd ?? 0
  const groupTotalUsd = priceAdultUsd * guestCount

  function handleSelectDate(date: string) {
    setSelectedDate(date)
    setAddedToPackage(false)
    setError(null)
  }

  function handleSubmit() {
    if (!guide || !selectedDate) return
    const result = addItem({
      tourId: tour.id,
      tourSlug: tour.slug,
      tourTitle: tour.title,
      guideId: guide.id,
      guideName: guide.name,
      date: selectedDate,
      dateEnd: tour.durationDays === 2 ? isoDatePlusOne(selectedDate) : null,
      adults: guestCount,
      priceAdultUsd,
    })
    if (!result.ok) {
      setError(result.error)
      return
    }
    setError(null)
    setAddedToPackage(true)
    onSubmitted?.()
    sendGAEvent("event", "add_to_package", {
      tour_slug: tour.slug,
      tour_title: tour.title,
      value: groupTotalUsd,
      currency: "USD",
    })
  }

  return (
    <div className="flex h-full w-full flex-col items-center justify-[safe_center] overflow-y-auto px-4 pt-4 pb-4 sm:px-11 sm:pt-7">
      <div className="w-full max-w-md">
        <h2 className="text-center font-heading text-xl leading-[1.15] font-semibold sm:text-3xl">
          Дата и бронь
        </h2>

        {guides.length > 1 ? (
          <div className="mt-3">
            <div className="flex flex-wrap justify-center gap-2">
              {guides.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  aria-pressed={g.id === guideId}
                  onClick={() => {
                    setGuideId(g.id)
                    setSelectedDate(null)
                    setAddedToPackage(false)
                    setError(null)
                  }}
                  className={cn(
                    "rounded-full border px-3 py-1 text-sm transition-colors",
                    g.id === guideId
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:bg-muted",
                  )}
                >
                  {g.name}
                </button>
              ))}
            </div>
          </div>
        ) : (
          guide && (
            <p className="mt-1.5 text-center text-sm text-muted-foreground">Личный гид — {guide.name}</p>
          )
        )}

        {/* Гости и цена — рядом друг с другом, не отдельным элементом
            где-то ещё, чтобы менять число гостей и сразу видеть итог, не
            отрываясь от календаря ниже. */}
        <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-border px-4 py-2.5">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">Гостей</span>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                disabled={guestCount <= minGuests}
                onClick={() => onGuestCountChange((c) => Math.max(minGuests, c - 1))}
                aria-label="Меньше гостей"
              >
                −
              </Button>
              <span className="w-5 text-center text-sm font-medium">{guestCount}</span>
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                disabled={guestCount >= maxGuests}
                onClick={() => onGuestCountChange((c) => Math.min(maxGuests, c + 1))}
                aria-label="Больше гостей"
              >
                +
              </Button>
            </div>
          </div>
          <div className="text-right">
            <div className="font-heading text-base font-semibold text-primary">
              {formatUsd(groupTotalUsd)}
            </div>
            <div className="text-[11px] text-muted-foreground">{formatUsd(priceAdultUsd)} за человека</div>
          </div>
        </div>

        <div className="mt-3">
          <BookingCalendar
            bookedDates={bookedDates}
            durationDays={tour.durationDays}
            selectedDate={selectedDate}
            onSelectDate={handleSelectDate}
            large
          />
        </div>

        <Button
          type="button"
          size="lg"
          className="mt-3 w-full"
          disabled={!guide || !selectedDate}
          onClick={handleSubmit}
        >
          Добавить в заявку
        </Button>

        {error && (
          <p className="mt-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}

        {addedToPackage && !error && (
          <p className="mt-2 rounded-lg bg-primary/10 px-3 py-2 text-sm text-primary">
            Добавлено в заявку: {tour.title}, {guestCount} гостей, дата с {selectedDate}.{" "}
            <Link href="/request" className="font-medium underline underline-offset-2">
              Перейти к заявке
            </Link>
          </p>
        )}
      </div>
    </div>
  )
}
