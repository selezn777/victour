"use client"

import { useId } from "react"

// Финальный CTA ("Выбрать тур") — рукописные стрелки-кометы ведут к кнопке
// сверху и с боков, как на референсах Виктора (маркер/кисть: изогнутый
// сужающийся штрих + маленький чёткий треугольник-остриё, не прямая линия
// и не сплошной толстый треугольник). Форма строится один раз при загрузке
// модуля из кубической кривой (см. buildTaperedTail) — сэмплируем кривую,
// в каждой точке откладываем половину ширины по нормали влево/вправо,
// получаем замкнутый контур переменной толщины: тонкий на дальнем конце,
// толще к острию.
type Pt = [number, number]

function cubicPoint(p0: Pt, p1: Pt, p2: Pt, p3: Pt, t: number): Pt {
  const mt = 1 - t
  return [
    mt ** 3 * p0[0] + 3 * mt ** 2 * t * p1[0] + 3 * mt * t ** 2 * p2[0] + t ** 3 * p3[0],
    mt ** 3 * p0[1] + 3 * mt ** 2 * t * p1[1] + 3 * mt * t ** 2 * p2[1] + t ** 3 * p3[1],
  ]
}

function cubicTangent(p0: Pt, p1: Pt, p2: Pt, p3: Pt, t: number): Pt {
  const mt = 1 - t
  return [
    3 * mt ** 2 * (p1[0] - p0[0]) + 6 * mt * t * (p2[0] - p1[0]) + 3 * t ** 2 * (p3[0] - p2[0]),
    3 * mt ** 2 * (p1[1] - p0[1]) + 6 * mt * t * (p2[1] - p1[1]) + 3 * t ** 2 * (p3[1] - p2[1]),
  ]
}

// Кривая-"хребет" хвоста: старт вверху, лёгкий изгиб влево, а последний
// отрезок (p2→p3) СТРОГО вертикальный (p2.x === p3.x) — это гарантирует,
// что остриё в конце смотрит точно "вниз", т.е. на кнопку, при любом
// повороте всей стрелки (см. rotate(angle) ниже), независимо от изгиба.
const TAIL_CURVE: [Pt, Pt, Pt, Pt] = [
  [18, 2],
  [0, 24],
  [13, 44],
  [13, 64],
]
const TAIL_MAX_WIDTH = 12
const HEAD_LEN = 15

function buildTaperedTail(samples = 22): string {
  const [p0, p1, p2, p3] = TAIL_CURVE
  const left: Pt[] = []
  const right: Pt[] = []
  for (let i = 0; i <= samples; i++) {
    const t = i / samples
    const [x, y] = cubicPoint(p0, p1, p2, p3, t)
    const [tx, ty] = cubicTangent(p0, p1, p2, p3, t)
    const len = Math.hypot(tx, ty) || 1
    const nx = -ty / len
    const ny = tx / len
    const w = (0.6 + (TAIL_MAX_WIDTH - 0.6) * t ** 1.4) / 2
    left.push([x + nx * w, y + ny * w])
    right.push([x - nx * w, y - ny * w])
  }
  const pts = [...left, ...right.reverse()]
  return `M${pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" L")} Z`
}

const TAIL_PATH = buildTaperedTail()
const [, , , TAIL_END] = TAIL_CURVE
const HEAD_HALF = TAIL_MAX_WIDTH / 2 + 3
const HEAD_TIP_Y = TAIL_END[1] + HEAD_LEN
const HEAD_PATH = `M${TAIL_END[0] - HEAD_HALF},${TAIL_END[1]} L${TAIL_END[0] + HEAD_HALF},${TAIL_END[1]} L${TAIL_END[0]},${HEAD_TIP_Y} Z`

const ARROWS = [
  { angle: 270, delay: 0.5 }, // слева
  { angle: 325, delay: 0.25 }, // сверху-слева
  { angle: 0, delay: 0 }, // сверху по центру
  { angle: 35, delay: 0.25 }, // сверху-справа
  { angle: 90, delay: 0.5 }, // справа
]

// rx/ry — расстояние от центра кнопки до центра стрелки; width — базовая
// ширина SVG (высота — из её пропорции, viewBox 32×84).
const PRESETS = {
  lg: { rx: 112, ry: 100, width: 24 },
  sm: { rx: 78, ry: 70, width: 18 },
}

export function ButtonComets({ size = "sm" }: { size?: "sm" | "lg" }) {
  const idPrefix = useId()
  const { rx, ry, width } = PRESETS[size]
  const height = (width * 84) / 32

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
              viewBox="0 0 32 84"
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
                  <stop offset="60%" stopColor="currentColor" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="currentColor" stopOpacity="1" />
                </linearGradient>
              </defs>
              <path d={TAIL_PATH} fill={`url(#${idPrefix}-tail-${i})`} />
              <path d={HEAD_PATH} fill="currentColor" />
            </svg>
          </div>
        )
      })}
    </div>
  )
}
