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
export function PhotoStack({ photos, alt }: { photos: string[]; alt: string }) {
  const [positions, setPositions] = useState(() => photos.map((_, i) => i))
  const [lifted, setLifted] = useState(false)

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
            transitionDuration: "180ms",
            transitionTimingFunction: "ease-out",
            transform: `${STACK_TRANSFORM[positions[i]]}${lifted ? " translateY(-26px) scale(1.02)" : ""}`,
          }}
        >
          <Image src={src} alt={alt} fill className="object-cover" sizes="100vw" />
        </div>
      ))}
      {!tapped && (
        // Статичная плашка-подсказка, без пульса — Виктор: "кнопка нажми
        // слишком навязчиво моргает, убираем ей моргание". Пропадает после
        // первого тапа (см. tapped).
        <div
          aria-hidden
          className="pointer-events-none absolute top-[88%] left-1/2 z-30 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary px-5 py-2.5 text-base font-bold text-primary-foreground shadow-lg sm:px-6 sm:py-3 sm:text-lg"
        >
          нажми
        </div>
      )}
    </button>
  )
}
