"use client"

import { useEffect, useLayoutEffect, useRef, useState } from "react"
import { ChevronRightIcon } from "lucide-react"
import type { ItineraryItem } from "@/lib/site-data"
import { splitHighlights } from "@/lib/itinerary-highlights"
import { LocationDetailSheet } from "@/components/tour/location-detail-sheet"
import { useVanOnRoad, VanShape } from "@/components/van-on-road"

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
    // pb-[calc(...+var(--tour-bottom-bar-h))] — резервирует место под
    // ВИДИМУЮ на этом слайде нижнюю плашку САМ слайд, а не общая высота
    // деки (та теперь константа на всех слайдах — см. tour-page-client.tsx,
    // use-bottom-bar-height-var.ts): Swiper никогда не пересчитывает
    // размеры при переключении, а видимое "дёрганье" при смене слайдов
    // (три фикса подряд не добили это через тайминг пересчёта) исключено
    // структурно.
    <div className="flex h-full w-full flex-col overflow-hidden px-4 pt-6 pb-[calc(1.5rem+var(--tour-bottom-bar-h))] sm:px-11 sm:pt-9">
      <h2 className="text-center font-heading text-2xl leading-[1.15] font-semibold sm:text-4xl">
        Маршрут{dayLabel && <span className="text-primary"> — {dayLabel}</span>}
      </h2>

      {/* Виктор: внутренний скролл списка с перехватом жеста "выглядит
          дёшево" — убрал полностью (никакого overflow/touch-хендлинга
          здесь). Вместо этого — компактная вёрстка пунктов (см. DayList),
          рассчитанная на то, чтобы весь маршрут помещался на экране без
          скролла; навигация между слайдами — только штатным свайпом
          деки, как везде. */}
      <div className="mt-5 min-h-0 w-full flex-1 sm:mx-auto sm:max-w-2xl sm:px-4">
        <DayList itinerary={itinerary} day={day} />
      </div>
    </div>
  )
}

// Ширина колонки с дорогой и размах изгибов серпантина (px).
const ROAD_COL_W = 48
const ROAD_SWING = 17

function DayList({ itinerary, day }: { itinerary: ItineraryItem[]; day: number }) {
  // Виктор: у каждой локации маршрута — кликабельная кнопка "фото", по
  // которой открывается доп. страница с фото этой локации и описанием
  // (LocationDetailSheet), с кнопкой назад. Кнопка показывается только у
  // локаций, для которых реально есть фото — недоделанная кнопка "в
  // никуда" хуже, чем её отсутствие; остальные локации получат кнопку,
  // когда для них добавят фото (см. лог задачи).
  // openIndex - индекс в stops: все места тура с фото (все дни подряд),
  // чтобы в попапе листать маршрут целиком, не закрывая его.
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const dayItems = itinerary.filter((i) => i.day === day)
  const stops = itinerary.filter((i) => i.photos.length > 0)

  // Виктор: у коротких маршрутов список сбивался в кучу вверху, а снизу
  // пустовало до самой плашки с ценой — нужно, чтобы пункты равномерно
  // распределялись по всей высоте слайда. Раньше это считалось в JS
  // (измерение natural/available высоты через ResizeObserver) — тройная
  // гонка с другими эффектами (высота хедера/нижней плашки, шрифты,
  // bfcache/restore при возврате "назад") так и не была добита надёжно
  // до конца ни одним из точечных фиксов. Убрано целиком: чистый
  // flexbox — `<ol>` растянут на всю высоту родителя (h-full) и сам
  // распределяет пункты через justify-between, `gap` держит минимальный
  // отступ, если пунктов много и им не хватает места. Это пересчитывается
  // браузером на каждом рендере/ресайзе сам по себе — никакой JS-гонки
  // с другими эффектами в принципе не может быть.

  // Виктор: системная кнопка "назад" уводила со страницы тура вместо
  // закрытия шита с фото локации. Пока шит открыт — держим лишнюю запись
  // в истории, чтобы "назад" её съедал и просто закрывал шит.
  // Дорога: от верха через центр каждой точки к низу, между соседними
  // точками - S-изгиб то влево, то вправо (серпантин), как дорога на
  // главной. Центры меряются у уже разложенных flexbox'ом <li>.
  const wrapRef = useRef<HTMLDivElement>(null)
  const roadRef = useRef<SVGPathElement>(null)
  const vanRef = useRef<SVGGElement>(null)
  const [road, setRoad] = useState<{ d: string; h: number }>({ d: "", h: 0 })
  useLayoutEffect(() => {
    const wrap = wrapRef.current
    if (!wrap) return
    const build = () => {
      const h = wrap.clientHeight
      const top = wrap.getBoundingClientRect().top
      const ys = [...wrap.querySelectorAll<HTMLElement>("[data-stop]")].map((li) => {
        const r = li.getBoundingClientRect()
        return r.top - top + r.height / 2
      })
      if (!h || ys.length === 0) return
      const c = (ROAD_COL_W - 8) / 2
      const pts = [0, ...ys, h]
      let d = `M${c},0`
      for (let i = 1; i < pts.length; i++) {
        const y0 = pts[i - 1]
        const y1 = pts[i]
        const k = (y1 - y0) / 3
        const x = c + (i % 2 ? ROAD_SWING : -ROAD_SWING)
        d += ` C${x},${(y0 + k).toFixed(1)} ${x},${(y1 - k).toFixed(1)} ${c},${y1.toFixed(1)}`
      }
      setRoad((prev) => (prev.d === d && prev.h === h ? prev : { d, h }))
    }
    build()
    const ro = new ResizeObserver(build)
    ro.observe(wrap)
    return () => ro.disconnect()
  }, [dayItems.length])
  useVanOnRoad(roadRef, vanRef, { durationMs: 7000 + dayItems.length * 1500, scale: 2, pathKey: road.d })

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
      {/* Виктор 2026-11-06: "между разными локациями... как кнопки сделать
          и разделение, чтобы было видно, как линиями, тык-тык-тык" —
          каждая точка теперь карточка-кнопка (тап по всей карточке
          открывает фото и описание), а номера соединены вертикальной
          линией маршрута, чтобы было видно, где кончается одна точка и
          начинается другая. Распределение по высоте — тот же flexbox
          (justify-between), без JS. */}
      {/* Виктор 2026-11-09: кнопки "более квадратные" (rounded-md вместо
          rounded-xl/full), "сильно пошире, чтобы легко тыкать и читать
          описание" - каждая карточка растягивается (grow) на свободную
          высоту слайда: при 3 точках в дне это почти по трети экрана, и
          описание показывается в несколько строк. Линия маршрута -
          извилистая дорога с тем же микроавтобусом, что на главной
          (van-on-road.tsx). Раскладка по-прежнему чистый flexbox; JS только
          меряет центры уже разложенных пунктов, чтобы провести через них
          декоративную дорогу (на раскладку это не влияет, гонок нет). */}
      <div ref={wrapRef} className="relative flex h-full gap-1.5 pb-2">
        <svg
          aria-hidden
          width={ROAD_COL_W}
          height={road.h || undefined}
          viewBox={`0 0 ${ROAD_COL_W} ${road.h || 1}`}
          className="pointer-events-none absolute top-0 left-0 z-0 h-full text-primary"
        >
          {road.d && (
            <>
              <path ref={roadRef} d={road.d} fill="none" stroke="currentColor" strokeOpacity="0.22" strokeWidth="10" strokeLinecap="round" />
              <path d={road.d} fill="none" stroke="currentColor" strokeOpacity="0.6" strokeWidth="1.2" strokeDasharray="5 4" />
              <g ref={vanRef}>
                <VanShape />
              </g>
            </>
          )}
        </svg>
        <ol className="relative z-10 flex min-w-0 flex-1 flex-col gap-1.5 sm:gap-2">
          {dayItems.map((item, index) => {
            const clickable = item.photos.length > 0
            // Три плотности по числу точек дня: до 5 - крупные карточки с
            // описанием в несколько строк (на низких экранах строк меньше);
            // 6-7 - компактные, описание в одну строку; больше 7 (Далат, 10
            // точек) - без описания (оно есть в попапе), иначе не влезает
            // под плашку цены.
            const n = dayItems.length
            const dense = n > 7
            const roomy = n <= 5
            const clamp =
              n <= 3
                ? "line-clamp-4 [@media(max-height:700px)]:line-clamp-2"
                : "line-clamp-3 [@media(max-height:700px)]:line-clamp-1"
            return (
              <li key={item.title} data-stop className="relative flex grow items-stretch gap-2 text-left">
                <span className="z-10 flex shrink-0 items-center justify-center" style={{ width: ROAD_COL_W - 8 }}>
                  <span className="flex size-6 items-center justify-center rounded-md bg-primary text-xs font-semibold text-primary-foreground ring-4 ring-background">
                    {index + 1}
                  </span>
                </span>
                <button
                  type="button"
                  disabled={!clickable}
                  onClick={() => setOpenIndex(stops.indexOf(item))}
                  className={`flex min-w-0 flex-1 items-center gap-3 rounded-md border border-border bg-card px-3 text-left ${dense ? "py-1" : roomy ? "py-2.5" : "py-1.5"} transition-colors enabled:hover:border-primary/60 enabled:active:bg-primary/10`}
                >
                  <span className="min-w-0 flex-1">
                    <span className={`block leading-snug font-semibold ${roomy ? "text-sm sm:text-base" : "text-[13px] sm:text-sm"}`}>
                      <HighlightedText text={item.title} />
                    </span>
                    {item.description && !dense && (
                      <span className={roomy ? `mt-1 ${clamp} text-xs leading-snug text-muted-foreground sm:text-sm` : "mt-0.5 line-clamp-1 text-[11px] leading-snug text-muted-foreground sm:text-xs"}>
                        <HighlightedText text={item.description} />
                      </span>
                    )}
                  </span>
                  {clickable && (
                    <span className={`flex shrink-0 items-center gap-0.5 rounded-md bg-primary text-xs font-semibold text-primary-foreground ${dense ? "px-1.5 py-1" : "px-2.5 py-1.5"}`}>
                      {/* в плотном режиме - только стрелка, чтобы название влезало в строку */}
                      {!dense && "Подробнее"}
                      <ChevronRightIcon className="size-3.5" />
                    </span>
                  )}
                </button>
              </li>
            )
          })}
        </ol>
      </div>

      {openIndex != null && stops[openIndex] && (
        <LocationDetailSheet
          stops={stops}
          index={openIndex}
          onIndexChange={setOpenIndex}
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
