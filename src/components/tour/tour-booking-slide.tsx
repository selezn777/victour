"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { sendGAEvent } from "@next/third-parties/google"
import { Button } from "@/components/ui/button"
import { BookingCalendar } from "@/components/tour/booking-calendar"
import { GuideProfileSheet } from "@/components/tour/guide-profile-sheet"
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

function isGuideFreeOnDate(guide: TourGuide, date: string, durationDays: number): boolean {
  if (guide.bookedDates.includes(date)) return false
  if (durationDays === 2 && guide.bookedDates.includes(isoDatePlusOne(date))) return false
  return true
}

// Слайд брони в колоде тура. Порядок узлов теперь ДАТА -> ГИД -> ГОСТИ
// (Виктор: "неудобно, что гид Виктор сразу — надо сначала дать выбрать
// дату и после выбора даты дать выбрать тургида, который свободен на эту
// дату"). Раньше гид выбирался первым (или был жёстко зафиксирован), а
// календарь блокировал только даты, занятые у ТЕКУЩЕГО выбранного гида —
// теперь календарь блокирует дату, только если заняты ВСЕ гиды (см.
// commonBookedDates), а конкретный гид выбирается уже после даты, из тех,
// кто на неё свободен.
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
  const [guideId, setGuideId] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [addedToPackage, setAddedToPackage] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [profileGuide, setProfileGuide] = useState<{ id: string; name: string } | null>(null)
  const [profileSheetOpen, setProfileSheetOpen] = useState(false)

  const commonBookedDates = useMemo(() => {
    const otherItemDates = datesUsedByOtherItems(items, tour.slug)
    if (guides.length === 0) return otherItemDates
    const dates = new Set<string>()
    for (const d of guides[0].bookedDates) {
      if (guides.every((g) => g.bookedDates.includes(d))) dates.add(d)
    }
    for (const d of otherItemDates) dates.add(d)
    return dates
  }, [guides, items, tour.slug])

  const availableGuides = useMemo(() => {
    if (!selectedDate) return []
    return guides.filter((g) => isGuideFreeOnDate(g, selectedDate, tour.durationDays))
  }, [guides, selectedDate, tour.durationDays])

  const guide = guides.find((g) => g.id === guideId) ?? null

  const priceAdultUsd =
    tour.pricingTiers.find((t) => t.guestCount === guestCount)?.priceAdultUsd ?? 0
  const groupTotalUsd = priceAdultUsd * guestCount

  function handleSelectDate(date: string) {
    setSelectedDate(date)
    setAddedToPackage(false)
    setError(null)
    // Пересчитываем свободных гидов сразу для НОВОЙ даты (не через
    // availableGuides/useMemo — на момент этого вызова selectedDate в
    // состоянии ещё старый), чтобы снять/выставить guideId синхронно с
    // выбором даты, без отдельного useEffect.
    const freeOnDate = guides.filter((g) => isGuideFreeOnDate(g, date, tour.durationDays))
    setGuideId((prev) => {
      if (prev && freeOnDate.some((g) => g.id === prev)) return prev
      return freeOnDate.length === 1 ? freeOnDate[0].id : null
    })
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

        <div className="mt-3">
          <BookingCalendar
            bookedDates={commonBookedDates}
            durationDays={tour.durationDays}
            selectedDate={selectedDate}
            onSelectDate={handleSelectDate}
            large
          />
        </div>

        {/* Гид — только после выбора даты, и только те, кто на неё
            свободен (Виктор: "не комфортно, что гид сразу"). Карточка гида
            намеренно НЕ похожа на рамку календаря/степпера — заливка
            primary/5, а не border, чтобы секции визуально не сливались. */}
        {selectedDate && (
          <div className="mt-3 space-y-2">
            <span className="text-sm font-medium text-muted-foreground">Гид на эту дату</span>
            {availableGuides.map((g) => (
              <div
                key={g.id}
                className={cn(
                  "flex items-center justify-between gap-3 rounded-xl bg-primary/5 px-4 py-2.5 transition-colors",
                  g.id === guideId && "ring-1 ring-primary",
                )}
              >
                <button
                  type="button"
                  aria-pressed={g.id === guideId}
                  onClick={() => setGuideId(g.id)}
                  className="min-w-0 flex-1 text-left text-sm font-medium"
                >
                  {g.name}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setProfileGuide({ id: g.id, name: g.name })
                    setProfileSheetOpen(true)
                  }}
                  className="shrink-0 text-xs text-primary underline underline-offset-2"
                >
                  Подробнее
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Гости — чипы по числу гостей, а не +/- степпер (Виктор дважды:
            сначала "неудобно переключать", потом, уже после стиля пилюли,
            "всё ещё неудобно, придумай другой" — сам механизм
            "потыкать много раз +/-", чтобы дойти от 2 до 9, оставался
            утомительным независимо от формы кнопок). Один тап сразу
            выставляет нужное число — чипов ровно столько, сколько
            тарифных ступеней у тура (обычно 2..9), без построения диапазона
            вручную. Горизонтальный скролл на случай, если тарифов много и
            не влезают в ширину экрана. */}
        <div className="mt-3">
          <span className="px-1 text-sm font-medium text-muted-foreground">Гостей</span>
          <div className="mt-1.5 flex gap-2 overflow-x-auto pb-1">
            {tour.pricingTiers.map((tier) => (
              <button
                key={tier.guestCount}
                type="button"
                aria-pressed={tier.guestCount === guestCount}
                onClick={() => onGuestCountChange(() => tier.guestCount)}
                className={cn(
                  "flex size-11 shrink-0 items-center justify-center rounded-full text-base font-semibold transition-colors",
                  tier.guestCount === guestCount
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground hover:bg-muted/70",
                )}
              >
                {tier.guestCount}
              </button>
            ))}
          </div>
        </div>

        {/* Цена: за человека — крупно и в акцентном цвете (это то, что
            гость сравнивает между турами), итог за группу — мельче и
            приглушённо (Виктор: "общая сумма должна быть меньше, чем сумма
            за человека" — раньше было наоборот, итог был крупным зелёным). */}
        <div className="mt-3 flex items-baseline justify-between px-1">
          <div>
            <span className="font-heading text-2xl font-semibold text-primary">
              {formatUsd(priceAdultUsd)}
            </span>
            <span className="ml-1 text-sm text-muted-foreground">за человека</span>
          </div>
          <div className="text-xs text-muted-foreground">Итого за {guestCount}: {formatUsd(groupTotalUsd)}</div>
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

      {profileGuide && (
        <GuideProfileSheet
          key={profileGuide.id}
          guideId={profileGuide.id}
          guideName={profileGuide.name}
          open={profileSheetOpen}
          onOpenChange={setProfileSheetOpen}
        />
      )}
    </div>
  )
}
