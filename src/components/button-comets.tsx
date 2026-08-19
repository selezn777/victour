"use client"

import { useId } from "react"

// Финальный CTA ("Выбрать тур") — 5 одинаковых тонких стрелок ведут к
// кнопке ТОЛЬКО сверху и с боков (3 сверху, по одной с каждой стороны) —
// снизу стрелок нет (Виктор: "стрелочки только сверху... кнопка была
// ниже" — снизу стрелка визуально не может "вести от отзывов", отзывы
// всегда выше). Хвостик длинный и хорошо читается (Виктор: "где хвостик
// для хвостика" — раньше он был слишком коротким/незаметным). Все 5 —
// одного размера и с одинаковым мягким свечением, без вразнобой разных
// расстояний/масштабов (Виктор: "маленькая на большом расстоянии, другая
// по-другому — какой-то общий экшн надо").
const ARROWS = [
  { angle: 270, delay: 0.5 }, // слева
  { angle: 325, delay: 0.25 }, // сверху-слева
  { angle: 0, delay: 0 }, // сверху по центру
  { angle: 35, delay: 0.25 }, // сверху-справа
  { angle: 90, delay: 0.5 }, // справа
]

// rx/ry — расстояние от центра кнопки до центра стрелки; width — базовая
// ширина SVG (высота — из её пропорции). Кнопке под них добавлен больший
// отступ сверху (см. TourCtaButton/FeaturedReviews), чтобы длинный хвост
// не наезжал на карточки отзывов.
const PRESETS = {
  lg: { rx: 128, ry: 92, width: 23 },
  sm: { rx: 90, ry: 64, width: 17 },
}

export function ButtonComets({ size = "sm" }: { size?: "sm" | "lg" }) {
  const idPrefix = useId()
  const { rx, ry, width } = PRESETS[size]
  const height = (width * 44) / 24

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 text-primary">
      {ARROWS.map((a, i) => {
        const rad = (a.angle * Math.PI) / 180
        const dx = rx * Math.sin(rad)
        const dy = -ry * Math.cos(rad)
        return (
          <div
            key={i}
            className="absolute top-1/2 left-1/2"
            style={{
              transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) rotate(${a.angle}deg)`,
            }}
          >
            <svg
              viewBox="0 0 24 44"
              className="comet-arrow"
              style={{
                width,
                height,
                filter: "drop-shadow(0 0 3px currentColor)",
                // eslint-disable-next-line @typescript-eslint/no-explicit-any -- CSS custom property
                ["--comet-opacity" as any]: 0.85,
                animationDelay: `${a.delay}s`,
              }}
            >
              <defs>
                <linearGradient id={`${idPrefix}-tail-${i}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="currentColor" stopOpacity="0" />
                  <stop offset="55%" stopColor="currentColor" stopOpacity="0.55" />
                  <stop offset="100%" stopColor="currentColor" stopOpacity="1" />
                </linearGradient>
              </defs>
              {/* Хвост — заливка (не тонкая линия), сужается к дальнему концу и
                  растворяется там же: это и делает стрелку кометой, а не
                  галочкой (Виктор, много раз: "где хвостик у кометы"). Голова
                  осталась тонким контуром — сплошного треугольника не хотели. */}
              <polygon points="11,0 13,0 18,29 6,29" fill={`url(#${idPrefix}-tail-${i})`} />
              <path
                d="M5 25 L12 33 L19 25"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
          </div>
        )
      })}
    </div>
  )
}
