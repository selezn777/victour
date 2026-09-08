"use client"

import { useEffect, useRef, useState } from "react"
import { ChevronRightIcon } from "lucide-react"
import type { ItineraryItem } from "@/lib/site-data"
import { splitHighlights } from "@/lib/itinerary-highlights"
import { LocationDetailSheet } from "@/components/tour/location-detail-sheet"
import { Button } from "@/components/ui/button"

// Триггерные слова (капибары, дракон, золотая башня и т.д.) — ярким акцентным
// цветом прямо в тексте (Виктор: "тригерные туристические слова где ярким
// выделить"), список см. lib/itinerary-highlights.
function HighlightedText({ text }: { text: string }) {
  return (
    <>
      {splitHighlights(text).map((part, i) =>
        part.highlighted ? (
          <span key={i} className="font-semibold text-primary">
            {part.text}
          </span>
        ) : (
          <span key={i}>{part.text}</span>
        ),
      )}
    </>
  )
}

// Слайд "Маршрут" в колоде тура — один день на слайд. Раньше двухдневные
// туры (Далат) делили ОДИН слайд пополам по вертикали (день 1 слева, день
// 2 справа, grid-cols-2) — на телефоне половина ширины экрана оказалась
// слишком узкой: длинные пункты ("Старый железнодорожный вокзал Далата")
// обрезались (Виктор со скриншотом: "не влез маршрут"). Решение Виктора —
// не ужимать колонки, а сделать день 1 и день 2 отдельными слайдами
// колоды, каждый на всю ширину (см. tour-page-client.tsx, который теперь
// рендерит по одному TourItinerarySlide на день).
export function TourItinerarySlide({
  itinerary,
  day,
  dayLabel,
}: {
  itinerary: ItineraryItem[]
  day: number
  /** Заголовок вида "День 1" — показывается только у многодневных туров,
   * где маршрут разбит на несколько слайдов. */
  dayLabel?: string
}) {
  return (
    // pb-24 (не pb-5) — Виктор: "Маршрут чуть-чуть не влазит, его баннер с
    // ценой снизу перекрывает". Слайд сам не знает про fixed TourBottomBar
    // снизу страницы (её высота не вычтена из h-full деки), так что нижний
    // пункт списка при прокрутке до конца всё равно упирался в перекрытую
    // барой зону. Тот же запас, что уже есть на слайде FAQ (см.
    // tour-faq-slide.tsx) — сюда взят по аналогии, а не подобран заново.
    <div className="flex h-full w-full flex-col overflow-hidden px-4 pt-6 pb-24 sm:px-11 sm:pt-9">
      <h2 className="text-center font-heading text-2xl leading-[1.15] font-semibold sm:text-4xl">
        Маршрут{dayLabel && <span className="text-primary"> — {dayLabel}</span>}
      </h2>

      {/* Виктор: внутренний скролл списка с перехватом жеста "выглядит
          дёшево" — убрал полностью (никакого overflow/touch-хендлинга
          здесь). Вместо этого — компактная вёрстка пунктов (см. DayList),
          рассчитанная на то, чтобы весь маршрут помещался на экране без
          скролла; навигация между слайдами — только штатным свайпом
          деки, как везде. */}
      <div className="mt-5 min-h-0 flex-1 sm:mx-auto sm:max-w-xl sm:px-4">
        <DayList itinerary={itinerary} day={day} />
      </div>
    </div>
  )
}

function DayList({ itinerary, day }: { itinerary: ItineraryItem[]; day: number }) {
  // Виктор: у каждой локации маршрута — кликабельная кнопка "фото", по
  // которой открывается доп. страница с фото этой локации и описанием
  // (LocationDetailSheet), с кнопкой назад. Кнопка показывается только у
  // локаций, для которых реально есть фото — недоделанная кнопка "в
  // никуда" хуже, чем её отсутствие; остальные локации получат кнопку,
  // когда для них добавят фото (см. лог задачи).
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const dayItems = itinerary.filter((i) => i.day === day)
  const openItem = openIndex != null ? dayItems[openIndex] : null

  // Виктор: у коротких маршрутов (7 пунктов вместо 8) список сбивается в
  // кучу вверху, а снизу пустует до самой плашки с ценой — просил
  // растянуть пункты вниз "до плашки с ценой", через JS (не CSS), чтобы
  // одинаково надёжно работало на любом устройстве/высоте экрана (тот же
  // принцип, что и visualViewport в slide-deck.tsx — не полагаться на
  // статичную раскладку, мерить реальную доступную высоту в рантайме).
  // Меряем натуральную высоту списка (компактный gap) и доступную высоту
  // контейнера — если есть запас, добавляем его как ДОПОЛНИТЕЛЬНЫЙ gap
  // между пунктами (не через justify-content: space-between — тот
  // требует, чтобы <ol> сам имел фиксированную высоту контейнера, что
  // плодит собственные проблемы измерения).
  const listRef = useRef<HTMLOListElement>(null)
  const [growGapPx, setGrowGapPx] = useState<number | null>(null)
  useEffect(() => {
    const ol = listRef.current
    const container = ol?.parentElement
    if (!ol || !container) return

    function recalc() {
      if (!ol || !container) return
      ol.style.rowGap = "" // сброс инлайна — меряем натуральную (компактную) высоту
      const baseGap = parseFloat(getComputedStyle(ol).rowGap) || 0
      const naturalHeight = ol.scrollHeight
      const available = container.clientHeight
      if (dayItems.length > 1 && available > naturalHeight) {
        const extra = (available - naturalHeight) / (dayItems.length - 1)
        setGrowGapPx(baseGap + extra)
      } else {
        setGrowGapPx(null)
      }
    }

    // Виктор: "то нормально растягивается, то нет" — нестабильно от захода
    // к заходу. Причина: первый рендер меряет высоту текста ДО того, как
    // догрузится кастомный шрифт (Unbounded/Inter) — до этого браузер
    // рисует системным фолбэком с другим line-height, и расчёт уезжает.
    // Разница проявляется только когда шрифт ещё не в кэше — отсюда
    // "через раз". document.fonts.ready пересчитывает после реальной
    // загрузки. ResizeObserver слушает КОНТЕЙНЕР (не сам <ol>) — если бы
    // слушали список, инлайновый rowGap, который мы сами же меняем,
    // спровоцировал бы ResizeObserver сам на себя (бесконечный цикл).
    recalc()
    document.fonts?.ready.then(recalc).catch(() => {})
    const ro = new ResizeObserver(recalc)
    ro.observe(container)
    return () => ro.disconnect()
  }, [dayItems.length])

  // Виктор: системная кнопка "назад" уводила со страницы тура вместо
  // закрытия шита с фото локации. Пока шит открыт — держим лишнюю запись
  // в истории, чтобы "назад" её съедал и просто закрывал шит.
  const isOpen = openIndex != null
  useEffect(() => {
    if (!isOpen) return
    function onPopState() {
      setOpenIndex(null)
    }
    window.history.pushState({ locationSheetOpen: true }, "")
    window.addEventListener("popstate", onPopState)
    return () => window.removeEventListener("popstate", onPopState)
  }, [isOpen])

  return (
    <>
      {/* Виктор: список должен весь помещаться на экране без скролла —
          компактнее цифра, плотнее отступы. Кнопка "Фото" была иконкой
          без подписи — "непонятно, что это" — вернул текст "Подробнее" в
          стиле общих кнопок сайта (Button variant=outline), прижата к
          правому краю. */}
      <ol
        ref={listRef}
        className="flex flex-col gap-2 pb-2 sm:gap-2.5"
        style={growGapPx != null ? { rowGap: `${growGapPx}px` } : undefined}
      >
        {dayItems.map((item, index) => (
          <li key={item.title} className="flex gap-2 text-left">
            {/* Виктор: "цифры надо сделать ярким цветом" — было bg-muted/text-muted-foreground (серое). */}
            <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
              {index + 1}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[13px] leading-snug font-medium sm:text-sm">
                  <HighlightedText text={item.title} />
                </p>
                {item.photos.length > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="xs"
                    onClick={() => setOpenIndex(index)}
                    className="shrink-0"
                  >
                    Подробнее
                    <ChevronRightIcon className="size-3" />
                  </Button>
                )}
              </div>
              {item.description && (
                <p className="mt-0.5 line-clamp-1 text-[11px] leading-snug text-muted-foreground sm:text-xs">
                  <HighlightedText text={item.description} />
                </p>
              )}
            </div>
          </li>
        ))}
      </ol>

      {openItem && (
        <LocationDetailSheet
          title={openItem.title}
          description={openItem.description}
          photos={openItem.photos}
          articleSlug={openItem.articleSlug}
          open={isOpen}
          onOpenChange={(open) => {
            if (open) return
            // Закрытие крестиком/свайпом/кнопкой тоже идёт через
            // history.back() — съедает ту же лишнюю запись, что и
            // "назад" (см. useEffect выше), иначе на следующий "назад"
            // пользователю пришлось бы жать дважды.
            if (window.history.state?.locationSheetOpen) {
              window.history.back()
            } else {
              setOpenIndex(null)
            }
          }}
        />
      )}
    </>
  )
}
