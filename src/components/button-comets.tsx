"use client"

import { useId } from "react"

// Финальный CTA ("Выбрать тур" в конце воронки — последний слайд героя и
// блок отзывов внизу главной) — тонкие стрелки-кометы летят в кнопку со
// всех сторон по кругу. Раньше пробовали сплошную заливку (треугольник +
// клин) — Виктор забраковал: "жирные, отвратительно смотрятся" рядом с
// остальным тонким, аккуратным дизайном страницы. Голова — тонкий контур-
// "домик" (два штриха под углом, без заливки), хвост — тонкая линия с
// градиентом (прозрачная на дальнем конце → видимая у головы), плюс мягкое
// свечение (drop-shadow) вместо жирной заливки — "аккуратная подсветка".
//
// Радиус — ЭЛЛИПС (rx/ry), а не окружность: кнопка сильно шире, чем выше,
// с общим радиусом стрелки сбоку утыкались вглубь кнопки. rx/ry подобраны
// под фактические пропорции кнопки каждого размера (см. PRESETS), чтобы
// голова стрелки останавливалась СНАРУЖИ, у самого края.
const ARROWS = [
  { angle: 0, r: 1, w: 1, opacity: 0.85, delay: 0 },
  { angle: 51, r: 1, w: 0.88, opacity: 0.7, delay: 0.16 },
  { angle: 103, r: 1, w: 1, opacity: 0.9, delay: 0.32 },
  { angle: 154, r: 1, w: 0.82, opacity: 0.65, delay: 0.48 },
  { angle: 206, r: 1, w: 0.82, opacity: 0.65, delay: 0.64 },
  { angle: 257, r: 1, w: 1, opacity: 0.9, delay: 0.8 },
  { angle: 309, r: 1, w: 0.88, opacity: 0.7, delay: 0.96 },
]

// rx/ry — расстояние от центра кнопки до центра стрелки по горизонтали и
// вертикали; width — базовая ширина SVG стрелки (высота считается из её
// пропорции). Подобраны так, чтобы голова стрелки вставала за фактическим
// краем кнопки этого размера, а не поверх текста.
const PRESETS = {
  // Слайд 5 героя — крупная кнопка (py-5/6, text-lg/xl).
  lg: { rx: 140, ry: 62, width: 20 },
  // Блок отзывов внизу главной — обычная кнопка (buttonVariants()).
  sm: { rx: 98, ry: 44, width: 15 },
}

export function ButtonComets({ size = "sm" }: { size?: "sm" | "lg" }) {
  const idPrefix = useId()
  const { rx, ry, width: baseWidth } = PRESETS[size]

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 text-primary">
      {ARROWS.map((a, i) => {
        const rad = (a.angle * Math.PI) / 180
        const dx = rx * a.r * Math.sin(rad)
        const dy = -ry * a.r * Math.cos(rad)
        const width = baseWidth * a.w
        return (
          <div
            key={i}
            className="absolute top-1/2 left-1/2"
            style={{
              transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) rotate(${a.angle}deg)`,
            }}
          >
            <svg
              viewBox="0 0 24 34"
              className="comet-arrow"
              style={{
                width,
                height: (width * 34) / 24,
                filter: "drop-shadow(0 0 3px currentColor)",
                // eslint-disable-next-line @typescript-eslint/no-explicit-any -- CSS custom property
                ["--comet-opacity" as any]: a.opacity,
                animationDelay: `${a.delay}s`,
              }}
            >
              <defs>
                <linearGradient id={`${idPrefix}-tail-${i}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="currentColor" stopOpacity="0" />
                  <stop offset="100%" stopColor="currentColor" stopOpacity="1" />
                </linearGradient>
              </defs>
              <path d="M12 0 L12 19" stroke={`url(#${idPrefix}-tail-${i})`} strokeWidth="1.75" strokeLinecap="round" fill="none" />
              <path
                d="M5 15 L12 23 L19 15"
                stroke="currentColor"
                strokeWidth="1.75"
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
