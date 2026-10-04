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
        // контурный палец, который мягко моргает и «нажимает».
        // Всё пропадает после первого тапа (см. tapped).
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center bg-black/75"
        >
          {/* Иконка hand-pointer (regular, контурная) — Font Awesome Free 6.5.2, CC BY 4.0 */}
          <svg
            viewBox="0 0 448 512"
            fill="currentColor"
            className="tap-hint-pulse h-32 w-32 text-white drop-shadow-lg sm:h-40 sm:w-40"
          >
            <path d="M160 64c0-8.8 7.2-16 16-16s16 7.2 16 16V200c0 10.3 6.6 19.5 16.4 22.8s20.6-.1 26.8-8.3c3-3.9 7.6-6.4 12.8-6.4c8.8 0 16 7.2 16 16c0 10.3 6.6 19.5 16.4 22.8s20.6-.1 26.8-8.3c3-3.9 7.6-6.4 12.8-6.4c7.8 0 14.3 5.6 15.7 13c1.6 8.2 7.3 15.1 15.1 18s16.7 1.6 23.3-3.6c2.7-2.1 6.1-3.4 9.9-3.4c8.8 0 16 7.2 16 16l0 16V392c0 39.8-32.2 72-72 72H272 212.3h-.9c-37.4 0-72.4-18.7-93.2-49.9L50.7 312.9c-4.9-7.4-2.9-17.3 4.4-22.2s17.3-2.9 22.2 4.4L116 353.2c5.9 8.8 16.8 12.7 26.9 9.7s17-12.4 17-23V320 64zM176 0c-35.3 0-64 28.7-64 64V261.7C91.2 238 55.5 232.8 28.5 250.7C-.9 270.4-8.9 310.1 10.8 339.5L78.3 440.8c29.7 44.5 79.6 71.2 133.1 71.2h.9H272h56c66.3 0 120-53.7 120-120V288l0-16c0-35.3-28.7-64-64-64c-4.5 0-8.8 .5-13 1.3c-11.7-15.4-30.2-25.3-51-25.3c-6.9 0-13.5 1.1-19.7 3.1C288.7 170.7 269.6 160 248 160c-2.7 0-5.4 .2-8 .5V64c0-35.3-28.7-64-64-64zm48 304c0-8.8-7.2-16-16-16s-16 7.2-16 16v96c0 8.8 7.2 16 16 16s16-7.2 16-16V304zm48-16c-8.8 0-16 7.2-16 16v96c0 8.8 7.2 16 16 16s16-7.2 16-16V304c0-8.8-7.2-16-16-16zm80 16c0-8.8-7.2-16-16-16s-16 7.2-16 16v96c0 8.8 7.2 16 16 16s16-7.2 16-16V304z" />
          </svg>
        </div>
      )}
    </button>
  )
}
