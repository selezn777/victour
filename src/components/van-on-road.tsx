"use client"

import { useEffect, type RefObject } from "react"

// Микроавтобус, который едет по SVG-дороге. Сначала жил только на слайде
// ценностей главной (advantages-section.tsx), Виктор 2026-11-09 попросил
// "этот автобусик сюда тоже перенесём" - в линию маршрута тура
// (tour-itinerary-slide.tsx), поэтому вынесен сюда общим.
//
// SMIL rotate="auto" крутил машинку СТРОГО по касательной - на разворотах
// серпантина касательная временами смотрела влево (dx<0), и разворот на
// ~180° от "носом вправо" временно показывал её вверх колёсами (Виктор:
// "едет вниз головой"). Машинка должна КРЕНИТЬСЯ в повороты, а не просто
// ехать плашмя. Приём из 2D-игр: вместо вращения через "спину" на развороте
// ЗЕРКАЛИМ машинку по горизонтали: поворот всегда считается от |dx| (угол
// строго в [-90°, 90°], физически не может перевернуть), а если реальный dx
// отрицательный - уже повёрнутый силуэт отражаем scale(-1,1). Из-за зеркала
// это не SMIL-анимация, а ручной rAF-луп поверх getPointAtLength.
//
// `pathKey` - строка d дороги (или любой ключ её формы): если дорога
// перестраивается (например, под измеренную высоту списка), длина пути
// пересчитывается.
export function useVanOnRoad(
  roadRef: RefObject<SVGPathElement | null>,
  vanRef: RefObject<SVGGElement | null>,
  { durationMs, scale, pathKey }: { durationMs: number; scale: number; pathKey?: string },
) {
  useEffect(() => {
    const road = roadRef.current
    const van = vanRef.current
    if (!road || !van) return
    const total = road.getTotalLength()
    if (!total) return
    const step = Math.max(0.5, total * 0.006)
    let raf = 0
    let start: number | null = null
    const frame = (ts: number) => {
      if (start === null) start = ts
      const t = ((ts - start) % durationMs) / durationMs
      const len = t * total
      const p0 = road.getPointAtLength(len)
      const p1 = road.getPointAtLength(Math.min(total, len + step))
      const dx = p1.x - p0.x
      const dy = p1.y - p0.y
      const mirrored = dx < 0
      const angle = (Math.atan2(dy, Math.abs(dx) || 0.0001) * 180) / Math.PI
      van.setAttribute(
        "transform",
        `translate(${p0.x} ${p0.y}) scale(${mirrored ? -scale : scale},${scale}) rotate(${angle})`,
      )
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(raf)
  }, [roadRef, vanRef, durationMs, scale, pathKey])
}

// Сама форма машинки в "домашней" ориентации (нос вправо, без поворота и
// зеркала), цвет кузова - currentColor. Колёса крутятся своим
// animateTransform независимо от скорости по дороге (Виктор: "а то странно
// смотреться будет", если едет, а колёса стоят). Кузов почти прямоугольный
// с полосой окон во всю длину борта - "видно, что прям газелька".
export function VanShape() {
  return (
    <>
      {/* Колёса - тёмная заливка (не currentColor), иначе сливаются с
          кузовом того же оттенка и на маленьком масштабе выглядят пятном. */}
      <g transform="translate(-3.8,2.8)">
        <circle r="1.7" fill="#111827" />
        <g>
          <line x1="-1.2" y1="0" x2="1.2" y2="0" stroke="#9ca3af" strokeWidth="0.5" />
          <line x1="0" y1="-1.2" x2="0" y2="1.2" stroke="#9ca3af" strokeWidth="0.5" />
          <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="0.35s" repeatCount="indefinite" />
        </g>
      </g>
      <g transform="translate(3.8,2.8)">
        <circle r="1.7" fill="#111827" />
        <g>
          <line x1="-1.2" y1="0" x2="1.2" y2="0" stroke="#9ca3af" strokeWidth="0.5" />
          <line x1="0" y1="-1.2" x2="0" y2="1.2" stroke="#9ca3af" strokeWidth="0.5" />
          <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="0.35s" repeatCount="indefinite" />
        </g>
      </g>
      <rect x="-6.8" y="-3.2" width="13.6" height="6" rx="1" fill="currentColor" />
      <rect x="-5.6" y="-2.2" width="10.6" height="1.7" rx="0.4" fill="#111827" opacity="0.4" />
      <rect x="3" y="-2.1" width="3.4" height="4.2" rx="0.5" fill="#111827" opacity="0.5" />
    </>
  )
}
