"use client"

import Image from "next/image"
import { useEffect, useState } from "react"

// Три позиции в стопке: 0 — сверху (лицом), 1 — средняя, 2 — самая нижняя.
// Каждое фото хранит СВОЮ текущую позицию (не индекс в массиве) — так CSS
// плавно анимирует переход между позициями у одного и того же DOM-узла,
// вместо перемонтирования при смене порядка.
const STACK_TRANSFORM = [
  "translate(0px, 0px) rotate(0deg) scale(1)",
  "translate(12px, 16px) rotate(-4deg) scale(0.96)",
  "translate(-10px, 30px) rotate(5deg) scale(0.92)",
]

/**
 * Стопка фото "как будто уронили друг на друга" — при появлении фото падают
 * по очереди (снизу стопки наверх), а по тапу вся стопка подпрыгивает и
 * перемешивается по кругу: нижнее фото выходит на передний план, остальные
 * опускаются на одну позицию. Виктор специально попросил именно такую
 * интерактивную стопку вместо статичного фото для этого слайда.
 */
export function PhotoStack({ photos, alt }: { photos: string[]; alt: string }) {
  const [positions, setPositions] = useState(() => photos.map((_, i) => i))
  const [entered, setEntered] = useState(() => photos.map(() => false))
  const [lifted, setLifted] = useState(false)

  useEffect(() => {
    // Порядок появления — от самого нижнего слоя к самому верхнему, имитирует
    // реальную стопку: сначала легла нижняя карточка, потом на неё следующая.
    const byDepth = photos.map((_, i) => i).sort((a, b) => positions[b] - positions[a])
    const timers = byDepth.map((photoIndex, order) =>
      setTimeout(
        () => {
          setEntered((prev) => {
            const next = [...prev]
            next[photoIndex] = true
            return next
          })
        },
        200 + order * 280,
      ),
    )
    return () => timers.forEach(clearTimeout)
    // Разовая анимация появления при монтировании.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function shuffle() {
    if (lifted) return
    setLifted(true)
    setTimeout(() => {
      setPositions((prev) => prev.map((pos) => (pos + 1) % photos.length))
      setLifted(false)
    }, 200)
  }

  return (
    <button
      type="button"
      onClick={shuffle}
      aria-label="Показать следующее фото"
      className="relative block h-full w-full"
    >
      {photos.map((src, i) => (
        <div
          key={src}
          className="absolute inset-0 overflow-hidden rounded-2xl shadow-xl ease-out"
          style={{
            zIndex: photos.length - positions[i],
            opacity: entered[i] ? 1 : 0,
            transitionProperty: "transform, opacity",
            transitionDuration: lifted ? "200ms" : "550ms",
            transform: entered[i]
              ? `${STACK_TRANSFORM[positions[i]]}${lifted ? " translateY(-26px) scale(1.02)" : ""}`
              : "translate(0, -140%) rotate(0deg) scale(0.94)",
          }}
        >
          <Image src={src} alt={alt} fill className="object-cover" sizes="100vw" />
        </div>
      ))}
    </button>
  )
}
