"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { BookingCalendar } from "@/components/tour/booking-calendar"
import { formatRubFromUsd, formatUsd, formatVndFromUsd } from "@/lib/format"
import type { SiteSettings, TourDetail, TourGuide } from "@/lib/site-data"
import { cn } from "@/lib/utils"

export function TourBookingPanel({
  tour,
  guides,
  settings,
  selectedGuestCount,
  onGuestCountChange,
}: {
  tour: TourDetail
  guides: TourGuide[]
  settings: SiteSettings
  selectedGuestCount: number
  onGuestCountChange: (updater: (count: number) => number) => void
}) {
  const [guideId, setGuideId] = useState(guides[0]?.id ?? null)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [confirmed, setConfirmed] = useState(false)

  const guide = guides.find((g) => g.id === guideId) ?? null
  const bookedDates = useMemo(() => new Set(guide?.bookedDates ?? []), [guide])

  const priceAdultUsd =
    tour.pricingTiers.find((t) => t.guestCount === selectedGuestCount)?.priceAdultUsd ?? 0
  const groupTotalUsd = priceAdultUsd * selectedGuestCount

  function handleSelectDate(date: string) {
    setSelectedDate(date)
    setConfirmed(false)
  }

  function handleSubmit() {
    if (!guide || !selectedDate) return
    setConfirmed(true)
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
      <h2 className="font-heading text-xl font-semibold sm:text-2xl">Забронировать</h2>

      {guides.length > 1 && (
        <div className="mt-4">
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
                  setConfirmed(false)
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
        <p className="mt-2 text-sm text-muted-foreground">Личный гид — {guide.name}</p>
      )}

      <div className="mt-5">
        <span className="text-sm font-medium">Гостей</span>
        <div className="mt-2 flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            disabled={selectedGuestCount <= 2}
            onClick={() => onGuestCountChange((c) => Math.max(2, c - 1))}
            aria-label="Меньше гостей"
          >
            −
          </Button>
          <span className="w-6 text-center text-sm font-medium">{selectedGuestCount}</span>
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            disabled={selectedGuestCount >= 8}
            onClick={() => onGuestCountChange((c) => Math.min(8, c + 1))}
            aria-label="Больше гостей"
          >
            +
          </Button>
        </div>
      </div>

      <div className="mt-5">
        <span className="text-sm font-medium">Дата</span>
        <div className="mt-2">
          <BookingCalendar
            bookedDates={bookedDates}
            durationDays={tour.durationDays}
            selectedDate={selectedDate}
            onSelectDate={handleSelectDate}
          />
        </div>
      </div>

      <div className="mt-5 flex items-baseline justify-between border-t border-border pt-4">
        <span className="text-sm text-muted-foreground">Итого за группу</span>
        <div className="text-right">
          <div className="font-heading text-xl font-semibold text-primary">
            {formatUsd(groupTotalUsd)}
          </div>
          <div className="text-xs text-muted-foreground">
            {formatVndFromUsd(groupTotalUsd, settings.usdVndRate)} ·{" "}
            {formatRubFromUsd(groupTotalUsd, settings.usdRubRate, settings.rubMarkupPct)}
          </div>
        </div>
      </div>

      <Button
        type="button"
        size="lg"
        className="mt-4 w-full"
        disabled={!guide || !selectedDate}
        onClick={handleSubmit}
      >
        Добавить в заявку
      </Button>

      {confirmed && selectedDate && guide && (
        <p className="mt-3 rounded-lg bg-primary/10 px-3 py-2 text-sm text-primary">
          Выбор сохранён: {tour.title}, {selectedGuestCount} гостей, гид {guide.name}, дата с{" "}
          {selectedDate}. Оформление и оплата заявки — на следующем шаге.
        </p>
      )}
    </section>
  )
}
