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
]

// Откуда каждая карточка "падает", ПО ПОЗИЦИИ (как STACK_TRANSFORM). Первая
// попытка сдвигала карточку вбок с сильным поворотом — Виктор: "не сбоку
// падают, эффект не подходит", описал по-другому: сама карточка должна
// быть БОЛЬШОЙ и УМЕНЬШАТЬСЯ, будто падает на стол — X и rotate те же, что
// в финальной STACK_TRANSFORM той же позиции (без сдвига в сторону), выше
// по Y (ещё "в воздухе") и заметно крупнее масштабом, сжимается в размер и
// опускается в финальную позицию.
const STACK_DROP_FROM = [
  "translate(0px, -40px) rotate(0deg) scale(1.5)",
  "translate(30px, -26px) rotate(-7deg) scale(1.45)",
  "translate(-28px, -14px) rotate(8deg) scale(1.4)",
  "translate(4px, -64px) rotate(-3deg) scale(1.36)",
  "translate(-20px, -58px) rotate(5deg) scale(1.32)",
  "translate(34px, -48px) rotate(-9deg) scale(1.28)",
  "translate(-10px, -6px) rotate(4deg) scale(1.24)",
]

// Задержка между "падениями" фото при появлении — должна быть заметной
// (Виктор: "эффект от падения я так и не увидел" — раньше было 280мс).
// Ускорена уже четырежды (1080→920→650→450), Виктор снова попросил
// быстрее — 450→300.
const DROP_STAGGER_MS = 300
// Пауза перед появлением ПЕРВОГО фото — Виктор: "открытие фото делаем чуть
// быстрее, особенно первой" (300 -> 150 -> 80 -> 50).
const DROP_INITIAL_DELAY_MS = 50

/**
 * Стопка фото "как будто уронили друг на друга" — при появлении фото падают
 * по очереди (снизу стопки наверх) с заметной паузой между каждым, а по тапу
 * вся стопка подпрыгивает и перемешивается по кругу: нижнее фото выходит на
 * передний план, остальные опускаются на одну позицию.
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
        // Порядок появления — от самого нижнего слоя к самому верхнему,
        // имитирует реальную стопку: сначала легла нижняя карточка, потом
        // на неё следующая.
        const byDepth = photos.map((_, i) => i).sort((a, b) => positions[b] - positions[a])
        byDepth.forEach((photoIndex, order) => {
          setTimeout(
            () => {
              setEntered((prev) => {
                const next = [...prev]
                next[photoIndex] = true
                return next
              })
            },
            DROP_INITIAL_DELAY_MS + order * DROP_STAGGER_MS,
          )
        })
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
  // автопереключение убрали совсем (после "тыкни" уже понятно, что можно
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
            // 580 -> 610мс (Виктор: "скорость хорошая, можно чуть замедлить
            // процентов на 5") — только сама посадка карточки, не lifted
            // (shuffle по тапу) и не DROP_STAGGER_MS/DROP_INITIAL_DELAY_MS
            // (те про паузу МЕЖДУ карточками, не про длительность самого
            // перехода).
            transitionDuration: lifted ? "180ms" : "610ms",
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
          className="cta-invite-pulse pointer-events-none absolute right-3 bottom-3 z-30 rounded-full bg-primary px-5 py-2.5 text-base font-bold text-primary-foreground shadow-lg sm:px-6 sm:py-3 sm:text-lg"
        >
          тыкни
        </div>
      )}
    </button>
  )
}
