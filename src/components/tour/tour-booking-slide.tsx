"use client"

import { useMemo, useRef, useState, type TouchEvent as ReactTouchEvent } from "react"
import { useRouter } from "next/navigation"
import { sendGAEvent } from "@next/third-parties/google"
import { MinusIcon, PlusIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { BookingCalendar } from "@/components/tour/booking-calendar"
import { GuideProfileSheet } from "@/components/tour/guide-profile-sheet"
import { formatUsd } from "@/lib/format"
import { datesUsedByOtherItems, usePackage } from "@/hooks/use-package"
import type { TourDetail, TourGuide } from "@/lib/site-data"
import { cn } from "@/lib/utils"

// Виктор: "не совсем очевидно куда нажимать дальше" после "Добавить в
// заявку" — нужна анимация, которая физически показывает, куда смотреть
// (иконка корзины в шапке). Чистый DOM, не React-стейт: кнопка и корзина
// живут в РАЗНЫХ компонентах (TourBookingSlide и TourHeader/CartDrawer),
// а сама анимация одноразовая и не должна переживать ре-рендеры — заводить
// под неё общий стейт/контекст ради одного полёта шарика избыточно.
// Двойной requestAnimationFrame перед поиском корзины — если это ПЕРВЫЙ
// тур в заявке, иконка корзины ДО этого клика не существовала в DOM
// (CartDrawer рендерит null при пустой заявке) и появляется только
// после ре-рендера шапки, которому нужен хотя бы один кадр.
//
// Одна CSS @keyframes-анимация (fly-to-cart, см. globals.css), а не
// ручное переключение ball.style.transition/transform из JS — та версия
// меняла transition И transform в одном синхронном тике без forced
// reflow/rAF между шагами, из-за чего браузер не всегда подхватывал
// новую длительность для второй фазы (перелёт срабатывал рывком без
// плавности — Виктор: "стало быстро и непонятно"). Координаты клика
// передаются через CSS custom properties, а сама последовательность фаз
// (поп → пауза → перелёт → исчезновение) целиком в keyframes.
function flyToCart(buttonEl: HTMLElement) {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const cartEl = document.querySelector<HTMLElement>("[data-cart-trigger]")
      if (!cartEl) return
      const from = buttonEl.getBoundingClientRect()
      const to = cartEl.getBoundingClientRect()
      const dx = to.left + to.width / 2 - (from.left + from.width / 2)
      const dy = to.top + to.height / 2 - (from.top + from.height / 2)
      const ball = document.createElement("div")
      ball.textContent = "+1"
      ball.setAttribute("aria-hidden", "true")
      ball.style.cssText = `
        position: fixed;
        left: ${from.left + from.width / 2 - 19}px;
        top: ${from.top + from.height / 2 - 19}px;
        width: 38px;
        height: 38px;
        border-radius: 9999px;
        background: var(--color-primary);
        color: var(--color-primary-foreground);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 15px;
        font-weight: 700;
        font-family: inherit;
        z-index: 100;
        pointer-events: none;
        --fly-dx: ${dx}px;
        --fly-dy: ${dy}px;
        animation: fly-to-cart 1200ms ease-in-out forwards;
      `
      document.body.appendChild(ball)
      setTimeout(() => ball.remove(), 1250)
    })
  })
}

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
// Кнопка "Добавить в заявку" — обычный элемент в конце прокручиваемого
// контента (Виктор явно попросил вернуть её сюда, не прижимать к низу
// экрана — пробовали fixed-футер/портал, не то, что нужно). Единственное
// реальное исправление, которое осталось от той истории, — touch-перехват
// на скролл-контейнере (тот же приём, что в tour-faq-slide.tsx): голый
// overflow-y-auto внутри вертикального Swiper'а колоды не скроллился на
// телефоне без него.
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
  const router = useRouter()
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

  const otherItemDates = useMemo(() => datesUsedByOtherItems(items, tour.slug), [items, tour.slug])

  // Дата → title тура из этой же заявки, который её занял — Виктор:
  // "подсвечивать какие даты уже выбраны и добавлять описание на какую
  // дату какой тур уже забронирован" (см. booking-calendar.tsx).
  const packageOwnerByDate = useMemo(() => {
    const map = new Map<string, string>()
    for (const item of items) {
      if (item.tourSlug === tour.slug) continue
      if (item.date) map.set(item.date, item.tourTitle)
      if (item.dateEnd) map.set(item.dateEnd, item.tourTitle)
    }
    return map
  }, [items, tour.slug])

  const commonBookedDates = useMemo(() => {
    if (guides.length === 0) return otherItemDates
    const dates = new Set<string>()
    for (const d of guides[0].bookedDates) {
      if (guides.every((g) => g.bookedDates.includes(d))) dates.add(d)
    }
    for (const d of otherItemDates) dates.add(d)
    return dates
  }, [guides, otherItemDates])

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

  function handleSubmit(buttonEl: HTMLElement) {
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
    flyToCart(buttonEl)
    sendGAEvent("event", "add_to_package", {
      tour_slug: tour.slug,
      tour_title: tour.title,
      value: groupTotalUsd,
      currency: "USD",
    })
  }

  return (
    <div className="flex h-full w-full flex-col overflow-hidden px-4 pt-4 pb-4 sm:px-11 sm:pt-7">
      <div
        ref={scrollRef}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        className="no-scrollbar mx-auto min-h-0 w-full max-w-md flex-1 overflow-y-auto"
      >
        <h2 className="text-center font-heading text-xl leading-[1.15] font-semibold sm:text-3xl">
          Дата и бронь
        </h2>

        <div className="mt-3">
          <BookingCalendar
            bookedDates={commonBookedDates}
            packageOwnerByDate={packageOwnerByDate}
            durationDays={tour.durationDays}
            selectedDate={selectedDate}
            onSelectDate={handleSelectDate}
            large
          />
        </div>

        {/* Гид — только после выбора даты, и только те, кто на неё
            свободен (Виктор: "не комфортно, что гид сразу"). Карточка гида
            намеренно НЕ похожа на рамку календаря/степпера — заливка
            primary/5, а не border, чтобы секции визуально не сливались.
            min-w-0 на кнопке с именем — без него длинное имя распирало
            строку за пределы карточки вместо переноса/сжатия (Виктор:
            "не помещается плашка по ширине"). flex-wrap — подстраховка на
            случай крупного системного шрифта на телефоне: кнопка
            "Подробнее" не резиновая (без truncate), при нехватке места
            переносится на вторую строку внутри плашки, а не толкает саму
            плашку за экран.
            Подсветка выбранного гида — border, а не ring (box-shadow):
            Виктор трижды присылал скрин с "пропаданиями по углам" у этой
            плашки, которые не воспроизводились ни на одном устройстве под
            рукой — box-shadow на скруглённом углу способен давать
            edge-case субпиксельные артефакты на некоторых мобильных GPU,
            которых у border в принципе не бывает (обычная заливка формы,
            не отдельный слой поверх). border-2 border-transparent всегда
            в разметке (не только когда выбран) — иначе граница появлялась
            бы ПОСЛЕ рендера и на миг сдвигала бы контент на 2px. */}
        {selectedDate && (
          <div className="mt-3 space-y-2">
            <span className="text-sm font-medium text-muted-foreground">Гид на эту дату</span>
            {availableGuides.map((g) => (
              <div
                key={g.id}
                className={cn(
                  "flex flex-wrap items-center justify-between gap-x-3 gap-y-1 rounded-xl border-2 border-transparent bg-primary/5 px-4 py-2.5 transition-colors",
                  g.id === guideId && "border-primary",
                )}
              >
                <button
                  type="button"
                  aria-pressed={g.id === guideId}
                  onClick={() => {
                    setGuideId(g.id)
                    setAddedToPackage(false)
                  }}
                  className="min-w-0 flex-1 truncate text-left text-sm font-medium"
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

        {/* После успешного добавления — Виктор: "не совсем понятно куда
            надо тыкнуть" (галочка + приглушённый secondary раньше просто
            подтверждали факт добавления, дальше гость терялся). Кнопка
            теперь сама становится следующим шагом: яркий оранжевый цвет
            (отличается и от primary, и от secondary — заметно как призыв
            к действию) и ведёт прямо на /request.
            ОДИН стабильный <button> на оба состояния, а не условный рендер
            двух разных элементов — Виктор: "смена кнопок должна
            происходить с анимацией". Два элемента = remount DOM-узла при
            переключении, поперёк которого CSS-переход физически не может
            сработать (мгновенный "снап" вместо анимации). На одном узле
            меняется только className (цвет — подхватывает уже имеющийся
            у Button transition-all) и текст (crossfade наложенными span).
            Клик ведёт на /request через router.push, а не обычный Link —
            иначе снова были бы два разных типа элемента (button/a). */}
        <Button
          type="button"
          size="lg"
          className={cn(
            "relative mt-3 w-full overflow-hidden",
            addedToPackage && "bg-orange-500 text-white shadow-sm hover:bg-orange-600 hover:shadow-md",
          )}
          disabled={!addedToPackage && (!guide || !selectedDate)}
          onClick={(e) => (addedToPackage ? router.push("/request") : handleSubmit(e.currentTarget))}
        >
          <span className="relative block">
            <span
              className={cn(
                "block transition-opacity duration-300",
                addedToPackage && "opacity-0",
              )}
            >
              Добавить в заявку
            </span>
            <span
              className={cn(
                "absolute inset-0 flex items-center justify-center transition-opacity duration-300",
                !addedToPackage && "opacity-0",
              )}
            >
              Перейти в заявку
            </span>
          </span>
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
