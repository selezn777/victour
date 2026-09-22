"use client"

import Image from "next/image"
import { useEffect, useRef, useState } from "react"

// Три позиции в стопке: 0 — сверху (лицом), 1 — средняя, 2 — самая нижняя.
// Каждое фото хранит СВОЮ текущую позицию (не индекс в массиве) — так CSS
// плавно анимирует переход между позициями у одного и того же DOM-узла,
// вместо перемонтирования при смене порядка. Раскидано по бокам заметнее
// (не аккуратной стопкой один в один) — так видно все три кадра сразу.
const STACK_TRANSFORM = [
  "translate(0px, 0px) rotate(0deg) scale(1)",
  "translate(30px, 14px) rotate(-7deg) scale(0.95)",
  "translate(-28px, 26px) rotate(8deg) scale(0.9)",
  "translate(4px, -24px) rotate(-3deg) scale(0.86)",
  "translate(-20px, -18px) rotate(5deg) scale(0.82)",
  "translate(34px, -8px) rotate(-9deg) scale(0.78)",
  "translate(-10px, 34px) rotate(4deg) scale(0.74)",
  "translate(18px, 20px) rotate(-5deg) scale(0.7)",
]

// Откуда падает вся стопка. История: сначала пробовали по одной карточке
// (по позиции, с paузами/стопками/быстрым каскадом — Виктор каждый раз
// видел ОТДЕЛЬНЫЕ падения и просил либо ещё быстрее, либо совсем убрать
// разделение). Финал — Виктор: "выпадение всей колоды делаем сразу всю и
// за один раз, за одно падение, что она как стопка фоток, брошенная на
// стол, и чуть из-под неё все фотки чуть начинают с разных сторон
// вылазить". Т.е. ОДНА синхронная анимация без всякого stagger: все
// карточки стартуют почти в одной точке (плотная стопка, ещё "в воздухе",
// крупным масштабом — минимальный разброс x/rotate по позициям, только
// чтобы стопка не выглядела идеально ровной пачкой) и одновременно летят
// каждая в СВОЮ финальную позицию STACK_TRANSFORM — путь из общей точки в
// разные стороны сам по себе читается как "фотки вылезают из-под стопки",
// без отдельного второго этапа.
const STACK_DROP_FROM = [
  "translate(0px, -46px) rotate(0deg) scale(1.5)",
  "translate(2px, -44px) rotate(-1deg) scale(1.5)",
  "translate(-2px, -48px) rotate(1deg) scale(1.5)",
  "translate(1px, -42px) rotate(-1deg) scale(1.5)",
  "translate(-1px, -46px) rotate(1deg) scale(1.5)",
  "translate(2px, -44px) rotate(-1deg) scale(1.5)",
  "translate(-2px, -48px) rotate(1deg) scale(1.5)",
  "translate(1px, -42px) rotate(-1deg) scale(1.5)",
]

// Пауза перед падением стопки — Виктор: "открытие фото делаем чуть
// быстрее, особенно первой" (300 -> 150 -> 80 -> 50, тогда ещё относилось
// к первой карточке отдельно; теперь стопка падает целиком, но пауза
// перед стартом осталась той же).
const DROP_INITIAL_DELAY_MS = 50
// Длительность падения+разлёта всей стопки одним движением (610мс на
// карточку при стаггере → 260мс при быстром каскаде → 420мс на всю
// стопку сразу). Виктор на живом сайте: "открываю и за миллисекунду
// выпадает... надо спокойно, медленно, в темпе перелистывания" — 420мс
// на глаз читалось как мгновенное моргание. Заметно длиннее.
const DROP_ENTER_DURATION_MS = 750

/**
 * Стопка фото "как будто бросили на стол" — при появлении вся стопка падает
 * и разлетается по своим местам одним синхронным движением (см.
 * STACK_DROP_FROM), а по тапу вся стопка подпрыгивает и перемешивается по
 * кругу: нижнее фото выходит на передний план, остальные опускаются на
 * одну позицию.
 *
 * Слайды в SlideDeck монтируются все сразу (Swiper не лениво их рендерит) —
 * первая версия запускала анимацию падения по монтированию компонента, то
 * есть сразу при загрузке страницы, пока показывался ПЕРВЫЙ слайд. К тому
 * моменту, как гость долистывал до этого слайда, падение уже давно
 * закончилось — Виктор его просто не видел. IntersectionObserver запускает
 * анимацию только когда слайд реально появляется в зоне видимости.
 */
export function PhotoStack({ photos, alt }: { photos: string[]; alt: string }) {
  const rootRef = useRef<HTMLButtonElement>(null)
  const startedRef = useRef(false)
  const [positions, setPositions] = useState(() => photos.map((_, i) => i))
  const [entered, setEntered] = useState(() => photos.map(() => false))
  const [lifted, setLifted] = useState(false)

  useEffect(() => {
    const el = rootRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || startedRef.current) return
        startedRef.current = true
        // Вся стопка падает и разлетается ОДНИМ синхронным движением — см.
        // комментарий у STACK_DROP_FROM.
        setTimeout(() => {
          setEntered(photos.map(() => true))
        }, DROP_INITIAL_DELAY_MS)
      },
      { threshold: 0.5 },
    )
    observer.observe(el)
    return () => observer.disconnect()
    // Разовый запуск при первом появлении в зоне видимости.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function shuffle() {
    if (lifted) return
    setLifted(true)
    setTimeout(() => {
      setPositions((prev) => prev.map((pos) => (pos + 1) % photos.length))
      setLifted(false)
    }, 180)
  }

  // Тихая статичная текстовая подсказка (не мигает и не торопит) — Виктор:
  // автопереключение убрали совсем (после "нажми" уже понятно, что можно
  // тапнуть самому), подсказка теперь единственный намёк. Пропадает после
  // первого собственного тапа.
  const [tapped, setTapped] = useState(false)

  return (
    <button
      ref={rootRef}
      type="button"
      onClick={() => {
        shuffle()
        setTapped(true)
      }}
      aria-label="Показать следующее фото"
      className="relative block h-full w-full"
    >
      {photos.map((src, i) => (
        <div
          key={src}
          className="absolute inset-0 overflow-hidden shadow-xl"
          style={{
            zIndex: photos.length - positions[i],
            opacity: entered[i] ? 1 : 0,
            transitionProperty: "transform, opacity",
            // DROP_ENTER_DURATION_MS — длительность самого падения/разлёта,
            // не lifted (та отдельная, для shuffle по тапу).
            transitionDuration: lifted ? "180ms" : `${DROP_ENTER_DURATION_MS}ms`,
            transitionTimingFunction: lifted ? "ease-out" : "cubic-bezier(0.34, 1.56, 0.64, 1)",
            transform: entered[i]
              ? `${STACK_TRANSFORM[positions[i]]}${lifted ? " translateY(-26px) scale(1.02)" : ""}`
              : STACK_DROP_FROM[positions[i]],
          }}
        >
          <Image src={src} alt={alt} fill className="object-cover" sizes="100vw" />
        </div>
      ))}
      {!tapped && entered.every(Boolean) && (
        // Виктор: "делаем поярче" (px-2.5/text-xs) не хватило — "почти не
        // видно, надо побольше и ещё побольше" — заметно крупнее плашка и
        // текст, плюс тот же мягкий пульс, что уже прижился на кнопке
        // "Выбрать тур" (cta-invite-pulse) — приглашает тапнуть, а не
        // просто маячит статично. Пропадает после первого тапа (см. tapped).
        <div
          aria-hidden
          className="cta-invite-pulse pointer-events-none absolute top-[88%] left-1/2 z-30 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary px-5 py-2.5 text-base font-bold text-primary-foreground shadow-lg sm:px-6 sm:py-3 sm:text-lg"
        >
          нажми
        </div>
      )}
    </button>
  )
}
