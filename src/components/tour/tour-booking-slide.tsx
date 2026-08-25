"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { sendGAEvent } from "@next/third-parties/google"
import { Button } from "@/components/ui/button"
import { BookingCalendar } from "@/components/tour/booking-calendar"
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

// Слайд брони в колоде тура. Гости/цена сюда НЕ входят — те живут в
// сквозной нижней плашке (TourBottomBar), видной на всех слайдах, и
// управляют тем же лежащим выше состоянием guestCount. Заголовок и кнопка
// сознательно не "Забронировать" (звучит как финальное действие) — Виктор
// попросил формулировку помягче, чтобы не отпугивать тех, кому перед
// покупкой нужен живой разговор с менеджером.
export function TourBookingSlide({
  tour,
  guides,
  selectedGuestCount,
  onSubmitted,
}: {
  tour: TourDetail
  guides: TourGuide[]
  selectedGuestCount: number
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

  const priceAdultUsd =
    tour.pricingTiers.find((t) => t.guestCount === selectedGuestCount)?.priceAdultUsd ?? 0
  const groupTotalUsd = priceAdultUsd * selectedGuestCount

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
      adults: selectedGuestCount,
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
    <div className="flex h-full w-full flex-col items-center justify-[safe_center] overflow-y-auto px-4 pt-6 pb-24 sm:px-11 sm:pt-9">
      <div className="w-full max-w-md">
        <h2 className="text-center font-heading text-2xl leading-[1.15] font-semibold sm:text-4xl">
          Дата и бронь
        </h2>

        {guides.length > 1 && (
          <div className="mt-5">
            <span className="text-sm font-medium">Гид</span>
            <div className="mt-2 flex flex-wrap gap-2">
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
                    "rounded-full border px-3 py-1.5 text-sm transition-colors",
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
        )}
        {guides.length === 1 && guide && (
          <p className="mt-2 text-center text-sm text-muted-foreground">Личный гид — {guide.name}</p>
        )}

        <div className="mt-5">
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
          className="mt-5 w-full"
          disabled={!guide || !selectedDate}
          onClick={handleSubmit}
        >
          Добавить в заявку
        </Button>

        {error && (
          <p className="mt-3 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}

        {addedToPackage && !error && (
          <p className="mt-3 rounded-lg bg-primary/10 px-3 py-2 text-sm text-primary">
            Добавлено в заявку: {tour.title}, {selectedGuestCount} гостей, дата с {selectedDate}.{" "}
            <Link href="/request" className="font-medium underline underline-offset-2">
              Перейти к заявке
            </Link>
          </p>
        )}
      </div>
    </div>
  )
}
