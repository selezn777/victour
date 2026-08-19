"use client"

import { useId } from "react"

// Финальный CTA ("Выбрать тур" в конце воронки — последний слайд героя и
// блок отзывов внизу главной) — стрелки летят В КНОПКУ со всех сторон по
// кругу, не одной колонкой сверху. Каждая — сплошная заливка primary, как
// машинка на слайде 4, не тонкий контур: голова — сплошной треугольник,
// хвост — сужающийся клин с градиентом (прозрачный на дальнем конце →
// сплошной у головы).
//
// Радиус — ЭЛЛИПС (rx/ry), а не окружность: кнопка сильно шире, чем выше,
// и с одним общим радиусом стрелки сбоку утыкались вглубь кнопки, а сверху
// оставались далеко (Виктор прислал скриншот — головы стрелок торчали
// ПРЯМО ИЗ кнопки). rx/ry подобраны под фактические пропорции кнопки в
// каждом размере (см. PRESETS) так, чтобы голова каждой стрелки останавливалась
// СНАРУЖИ, у самого края, а не внутри.
const ARROWS = [
  { angle: 0, r: 1, w: 1, opacity: 0.95, delay: 0 },
  { angle: 51, r: 1, w: 0.85, opacity: 0.8, delay: 0.16 },
  { angle: 103, r: 1, w: 1, opacity: 1, delay: 0.32 },
  { angle: 154, r: 1, w: 0.8, opacity: 0.75, delay: 0.48 },
  { angle: 206, r: 1, w: 0.8, opacity: 0.75, delay: 0.64 },
  { angle: 257, r: 1, w: 1, opacity: 1, delay: 0.8 },
  { angle: 309, r: 1, w: 0.85, opacity: 0.8, delay: 0.96 },
]

// rx/ry — расстояние от центра кнопки до центра стрелки по горизонтали и
// вертикали; width — базовая ширина SVG стрелки (высота считается из её
// пропорции). Подобраны так, чтобы голова стрелки (нижние ~40% её длины)
// вставала за фактическим краем кнопки этого размера, а не поверх текста.
const PRESETS = {
  // Слайд 5 героя — крупная кнопка (py-5/6, text-lg/xl).
  lg: { rx: 148, ry: 66, width: 24 },
  // Блок отзывов внизу главной — обычная кнопка (buttonVariants()).
  sm: { rx: 104, ry: 46, width: 17 },
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
              viewBox="0 0 24 40"
              className="comet-arrow"
              style={{
                width,
                height: (width * 40) / 24,
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
              <polygon points="11,0 13,0 19,26 5,26" fill={`url(#${idPrefix}-tail-${i})`} />
              <polygon points="3,24 21,24 12,40" fill="currentColor" />
            </svg>
          </div>
        )
      })}
    </div>
  )
}
