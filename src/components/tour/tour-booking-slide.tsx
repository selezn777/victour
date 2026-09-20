"use client"

import { useMemo, useRef, useState, type TouchEvent as ReactTouchEvent } from "react"
import { sendGAEvent } from "@next/third-parties/google"
import { CheckIcon, MinusIcon, PlusIcon } from "lucide-react"
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
//
// Кнопка "Добавить в заявку" уезжала за экран после выбора даты (блок
// "Гид на эту дату" добавляет высоты) — четыре попытки почини́ть это через
// скролл/сжатие всего блока не дали стабильного результата на реальных
// телефонах (то, что помещалось в моих тестах, не помещалось у Виктора —
// разная высота вьюпорта/масштаб шрифта). Вместо очередной попытки
// подогнать высоту — структурное решение: кнопка теперь в своём
// отдельном, никогда не сжимаемом футере (shrink-0) ВНЕ прокручиваемой
// области. Она физически не может уехать за экран, что бы ни показывалось
// выше. Прокручиваемая часть (календарь/гид/гости/цена) — обычный
// overflow-y-auto с touch-перехватом (тот же приём, что в
// tour-faq-slide.tsx), чтобы редко, но при необходимости можно было
// докрутить и её пальцем на телефоне.
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

  const scrollRef = useRef<HTMLDivElement>(null)
  const startYRef = useRef(0)

  function onTouchStart(e: ReactTouchEvent) {
    startYRef.current = e.touches[0].clientY
  }
  function onTouchMove(e: ReactTouchEvent) {
    const el = scrollRef.current
    if (!el) return
    const draggingDown = e.touches[0].clientY - startYRef.current > 0
    const atTop = el.scrollTop <= 0
    const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 1
    const releaseToSwiper = (atTop && draggingDown) || (atBottom && !draggingDown)
    if (!releaseToSwiper) {
      e.stopPropagation()
    }
  }

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

  // Индекс текущей ступени в списке тарифов — для +/- степпера гостей
  // ниже (шагаем по реальным тарифным ступеням тура, не произвольным
  // +1/-1, см. комментарий у степпера).
  const guestTierIndex = tour.pricingTiers.findIndex((t) => t.guestCount === guestCount)

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
    <div className="mx-auto flex h-full w-full max-w-md flex-col overflow-hidden px-4 pt-4 pb-4 sm:px-11 sm:pt-7">
      <div
        ref={scrollRef}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        className="no-scrollbar min-h-0 flex-1 overflow-y-auto"
      >
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
                  onClick={() => {
                    setGuideId(g.id)
                    setAddedToPackage(false)
                  }}
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

        {/* Гости — было: ряд чипов-кружков по числу гостей. Виктор много
            раз недоволен и чипами, и до того +/-. Финал: степпер на всю
            ширину экрана — крупная цифра по центру, +/- по краям (не
            крошечные кнопки сбоку от узкого чипа). Шаг идёт по реальным
            тарифным ступеням тура (обычно 2..9 подряд), а не произвольным
            +1/-1 — на случай, если когда-нибудь ступени не подряд. */}
        <div className="mt-3">
          <span className="px-1 text-sm font-medium text-muted-foreground">Количество человек</span>
          <div className="mt-1.5 flex items-center gap-3">
            <button
              type="button"
              aria-label="Меньше гостей"
              disabled={guestTierIndex <= 0}
              onClick={() => {
                onGuestCountChange((count) => {
                  const i = tour.pricingTiers.findIndex((t) => t.guestCount === count)
                  return tour.pricingTiers[Math.max(0, i - 1)]?.guestCount ?? count
                })
                setAddedToPackage(false)
              }}
              className="flex size-12 shrink-0 items-center justify-center rounded-full bg-muted text-foreground transition-colors hover:bg-muted/70 disabled:pointer-events-none disabled:opacity-30"
            >
              <MinusIcon className="size-5" />
            </button>
            <span className="flex-1 text-center text-3xl font-semibold tabular-nums">
              {guestCount}
            </span>
            <button
              type="button"
              aria-label="Больше гостей"
              disabled={guestTierIndex >= tour.pricingTiers.length - 1}
              onClick={() => {
                onGuestCountChange((count) => {
                  const i = tour.pricingTiers.findIndex((t) => t.guestCount === count)
                  return tour.pricingTiers[Math.min(tour.pricingTiers.length - 1, i + 1)]?.guestCount ?? count
                })
                setAddedToPackage(false)
              }}
              className="flex size-12 shrink-0 items-center justify-center rounded-full bg-muted text-foreground transition-colors hover:bg-muted/70 disabled:pointer-events-none disabled:opacity-30"
            >
              <PlusIcon className="size-5" />
            </button>
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
      </div>

      {/* Футер вне прокручиваемой области — shrink-0 гарантирует, что
          кнопка всегда в кадре, независимо от высоты контента выше. */}
      <div className="shrink-0 pt-3">
        {/* После успешного добавления кнопка сама показывает, что нажимать
            второй раз не нужно (галочка + приглушённый secondary вместо
            яркого primary) — раньше под кнопкой ещё был текст-подтверждение
            "Добавлено в заявку: ...", Виктор попросил убрать текст и сделать
            понятным через саму кнопку. */}
        <Button
          type="button"
          size="lg"
          variant={addedToPackage ? "secondary" : "default"}
          className="w-full"
          disabled={!guide || !selectedDate}
          onClick={handleSubmit}
        >
          {addedToPackage ? (
            <span className="flex items-center gap-2">
              <CheckIcon className="size-5" />
              Добавлено в заявку
            </span>
          ) : (
            "Добавить в заявку"
          )}
        </Button>

        {error && (
          <p className="mt-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
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
