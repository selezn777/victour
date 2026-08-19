"use client"

import { useId } from "react"

// Финальный CTA ("Выбрать тур" в конце воронки — последний слайд героя и
// блок отзывов внизу главной) — стрелки летят В КНОПКУ со всех сторон по
// кругу, не одной колонкой сверху (Виктор, после первой версии: "как будто
// со всех сторон на него стрелочки показывают"). Каждая — сплошная заливка
// primary, как машинка на слайде 4 (Виктор: "в таких же цветах"), не тонкий
// 2px-контур: голова — сплошной треугольник, хвост — сужающийся клин с
// градиентом (сплошной у головы → прозрачный на конце), а не тонкая линия
// (Виктор: "хвостик из постепенно затемняющихся [полос], который отходит от
// треугольника" — реального разброса воспринимаемой толщины без заливки не
// получить). Позиционирование — вокруг центра кнопки: контейнер повёрнут на
// angle, затем сдвинут по локальной Y на radius — это и даёт точку "снаружи
// по кругу под этим углом", а сама стрелка внутри рисуется в "домашней"
// ориентации (остриём к центру, как будто угол 0), так что общий поворот
// контейнера довершает дело без отдельной пересчитки геометрии.
const COMETS = [
  { angle: 0, radius: 62, width: 30, opacity: 0.95, delay: 0 },
  { angle: 51, radius: 68, width: 26, opacity: 0.8, delay: 0.16 },
  { angle: 103, radius: 74, width: 32, opacity: 1, delay: 0.32 },
  { angle: 154, radius: 66, width: 24, opacity: 0.75, delay: 0.48 },
  { angle: 206, radius: 66, width: 24, opacity: 0.75, delay: 0.64 },
  { angle: 257, radius: 74, width: 32, opacity: 1, delay: 0.8 },
  { angle: 309, radius: 68, width: 26, opacity: 0.8, delay: 0.96 },
]

export function ButtonComets() {
  const idPrefix = useId()

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 text-primary">
      {COMETS.map((c, i) => (
        <div
          key={i}
          className="absolute top-1/2 left-1/2"
          style={{ transform: `translate(-50%, -50%) rotate(${c.angle}deg) translateY(-${c.radius}px)` }}
        >
          <svg
            viewBox="0 0 24 40"
            className="comet-arrow"
            style={{
              width: c.width,
              height: (c.width * 40) / 24,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any -- CSS custom property
              ["--comet-opacity" as any]: c.opacity,
              animationDelay: `${c.delay}s`,
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
      ))}
    </div>
  )
}
