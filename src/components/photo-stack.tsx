"use client"

import Image from "next/image"
import { useState } from "react"

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

/**
 * Стопка фото "как будто бросили на стол" — сразу в конечном виде, БЕЗ
 * анимации появления (была: падение всей стопкой/по карточкам/стопками —
 * Виктор после нескольких раундов подбора тайминга решил, что падение в
 * принципе не нужно: "уберём вообще падение, пусть при переключении
 * сразу будут вот так в конечном виде"). По тапу стопка подпрыгивает и
 * перемешивается по кругу: нижнее фото выходит на передний план, остальные
 * опускаются на одну позицию — это единственная анимация, что осталась.
 */
// Длительность переключения по тапу — Виктор: "процентов на 10 быстрее"
// (было 180мс).
const SHUFFLE_MS = 160

export function PhotoStack({ photos, alt }: { photos: string[]; alt: string }) {
  const [positions, setPositions] = useState(() => photos.map((_, i) => i))
  const [lifted, setLifted] = useState(false)

  function shuffle() {
    if (lifted) return
    setLifted(true)
    setTimeout(() => {
      setPositions((prev) => prev.map((pos) => (pos + 1) % photos.length))
      setLifted(false)
    }, SHUFFLE_MS)
  }

  // Тихая статичная текстовая подсказка (не мигает и не торопит) — Виктор:
  // автопереключение убрали совсем (после "нажми" уже понятно, что можно
  // тапнуть самому), подсказка теперь единственный намёк. Пропадает после
  // первого собственного тапа.
  const [tapped, setTapped] = useState(false)

  return (
    <button
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
            transitionProperty: "transform",
            transitionDuration: `${SHUFFLE_MS}ms`,
            transitionTimingFunction: "ease-out",
            transform: `${STACK_TRANSFORM[positions[i]]}${lifted ? " translateY(-26px) scale(1.02)" : ""}`,
          }}
        >
          <Image src={src} alt={alt} fill className="object-cover" sizes="100vw" />
        </div>
      ))}
      {!tapped && (
        // Пока не нажали: фото сильно затемнено, по центру — белый
        // залитый палец (без обводки), который мягко моргает и «нажимает».
        // Всё пропадает после первого тапа (см. tapped).
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center bg-black/75"
        >
          {/* Иконка hand-pointer (solid) — Font Awesome Free 6.5.2, CC BY 4.0 */}
          <svg
            viewBox="0 0 448 512"
            fill="currentColor"
            className="tap-hint-pulse h-32 w-32 text-white drop-shadow-lg sm:h-40 sm:w-40"
          >
            <path d="M128 40c0-22.1 17.9-40 40-40s40 17.9 40 40V188.2c8.5-7.6 19.7-12.2 32-12.2c20.6 0 38.2 13 45 31.2c8.8-9.3 21.2-15.2 35-15.2c25.3 0 46 19.5 47.9 44.3c8.5-7.7 19.8-12.3 32.1-12.3c26.5 0 48 21.5 48 48v48 16 48c0 70.7-57.3 128-128 128l-16 0H240l-.1 0h-5.2c-5 0-9.9-.3-14.7-1c-55.3-5.6-106.2-34-140-79L8 336c-13.3-17.7-9.7-42.7 8-56s42.7-9.7 56 8l56 74.7V40zM240 304c0-8.8-7.2-16-16-16s-16 7.2-16 16v96c0 8.8 7.2 16 16 16s16-7.2 16-16V304zm48-16c-8.8 0-16 7.2-16 16v96c0 8.8 7.2 16 16 16s16-7.2 16-16V304c0-8.8-7.2-16-16-16zm80 16c0-8.8-7.2-16-16-16s-16 7.2-16 16v96c0 8.8 7.2 16 16 16s16-7.2 16-16V304z" />
          </svg>
        </div>
      )}
    </button>
  )
}
