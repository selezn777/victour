"use client"

import { useState } from "react"
import { ImageIcon } from "lucide-react"
import type { ItineraryItem } from "@/lib/site-data"
import { splitHighlights } from "@/lib/itinerary-highlights"
import { LocationDetailSheet } from "@/components/tour/location-detail-sheet"

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

      <div className="mt-5 min-h-0 flex-1 overflow-y-auto sm:mx-auto sm:max-w-xl sm:px-4">
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

  return (
    <>
      <ol className="flex flex-col gap-3 pb-4 sm:gap-4">
        {dayItems.map((item, index) => (
          <li key={item.title} className="flex gap-2.5 text-left sm:gap-3">
            {/* Виктор: "цифры надо сделать ярким цветом" — было bg-muted/text-muted-foreground (серое). */}
            <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
              {index + 1}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium sm:text-base">
                  <HighlightedText text={item.title} />
                </p>
                {item.photos.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setOpenIndex(index)}
                    className="mt-0.5 flex shrink-0 items-center gap-1 rounded-full bg-muted px-2 py-1 text-[11px] font-medium text-muted-foreground active:bg-muted/70"
                  >
                    <ImageIcon className="size-3.5" />
                    Фото
                  </button>
                )}
              </div>
              {item.description && (
                <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
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
          open={openIndex != null}
          onOpenChange={(open) => setOpenIndex(open ? openIndex : null)}
        />
      )}
    </>
  )
}
