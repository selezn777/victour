"use client"

import Image from "next/image"
import { MousePointerClickIcon } from "lucide-react"
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

// Задержка между "падениями" фото при появлении — должна быть заметной
// (Виктор: "эффект от падения я так и не увидел" — раньше было 280мс).
// Ускорены на 10% в прошлый раз, ещё на ~15% сейчас (Виктор: "чтобы быстрее
// они все выпадали было видно").
const DROP_STAGGER_MS = 920
const DROP_INITIAL_DELAY_MS = 360

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

  // Автопереключения больше нет (Виктор: "чтоб не переключалось потом, а
  // можно было тыкнуть") — вместо него тихая статичная подсказка-иконка
  // (тот же принцип, что у swipeHint в SlideDeck: не мигает и не торопит,
  // просто даёт понять, что по фото можно нажать), появляется, когда вся
  // стопка легла.
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
            transitionDuration: lifted ? "180ms" : "675ms",
            transitionTimingFunction: lifted ? "ease-out" : "cubic-bezier(0.34, 1.56, 0.64, 1)",
            transform: entered[i]
              ? `${STACK_TRANSFORM[positions[i]]}${lifted ? " translateY(-26px) scale(1.02)" : ""}`
              : "translate(0, -60%) rotate(0deg) scale(0.96)",
          }}
        >
          <Image src={src} alt={alt} fill className="object-cover" sizes="100vw" />
        </div>
      ))}
      {!tapped && entered.every(Boolean) && (
        <div
          aria-hidden
          className="pointer-events-none absolute right-2 bottom-2 z-30 flex size-7 items-center justify-center rounded-full bg-black/40 text-white opacity-70 backdrop-blur-sm"
        >
          <MousePointerClickIcon className="size-4" />
        </div>
      )}
    </button>
  )
}
