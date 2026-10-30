"use client"

import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useRef, useState } from "react"

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
 * сразу будут вот так в конечном виде"). При переключении стопка
 * подпрыгивает и перемешивается по кругу — это единственная анимация.
 *
 * Переключение тремя способами (Виктор: "убрать палец, поставить как обычно
 * стрелочки, переключение и стрелочками, и свайпом, и тыком"): стрелки по
 * бокам, горизонтальный свайп (влево — дальше, вправо — назад) и тап по фото
 * (дальше). Вертикальный жест не трогаем — им листается сама дека.
 */
// Длительность переключения — Виктор: "процентов на 10 быстрее" (было 180мс).
const SHUFFLE_MS = 160
const SWIPE_THRESHOLD = 40

export function PhotoStack({ photos, alt }: { photos: string[]; alt: string }) {
  const [positions, setPositions] = useState(() => photos.map((_, i) => i))
  const [lifted, setLifted] = useState(false)
  const start = useRef<{ x: number; y: number } | null>(null)
  // Свайп заканчивается тем же pointerup, после которого браузер шлёт click —
  // без этого флага свайп назад тут же откатывался бы тапом вперёд.
  const swiped = useRef(false)

  // step 1 — дальше: нижнее фото выходит на передний план, остальные
  // опускаются на позицию; step -1 — назад: верхнее уходит в самый низ.
  function shuffle(step: 1 | -1) {
    if (lifted) return
    setLifted(true)
    setTimeout(() => {
      setPositions((prev) => prev.map((pos) => (pos + step + photos.length) % photos.length))
      setLifted(false)
    }, SHUFFLE_MS)
  }

  const arrowClass =
    "absolute top-1/2 z-30 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm transition-colors hover:bg-black/65"

  return (
    <div
      role="group"
      aria-roledescription="карусель"
      aria-label={alt}
      className="relative block h-full w-full cursor-pointer touch-pan-y select-none"
      onPointerDown={(e) => {
        start.current = { x: e.clientX, y: e.clientY }
        swiped.current = false
      }}
      onPointerUp={(e) => {
        const s = start.current
        start.current = null
        if (!s) return
        const dx = e.clientX - s.x
        const dy = e.clientY - s.y
        if (Math.abs(dx) > SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy)) {
          swiped.current = true
          shuffle(dx < 0 ? 1 : -1)
        }
      }}
      onClick={() => {
        if (swiped.current) {
          swiped.current = false
          return
        }
        shuffle(1)
      }}
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
          <Image src={src} alt={alt} fill draggable={false} className="object-cover" sizes="100vw" />
        </div>
      ))}
      <button
        type="button"
        aria-label="Предыдущее фото"
        className={`${arrowClass} left-2`}
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation()
          shuffle(-1)
        }}
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button
        type="button"
        aria-label="Следующее фото"
        className={`${arrowClass} right-2`}
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation()
          shuffle(1)
        }}
      >
        <ChevronRight className="h-6 w-6" />
      </button>
    </div>
  )
}
