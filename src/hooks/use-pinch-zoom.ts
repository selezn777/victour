"use client"

import { useCallback, useRef, useState, type TouchEvent as ReactTouchEvent } from "react"

// Виктор: в попапе с фото (и почти везде, где есть фото) — зум щипком
// двух пальцев, при отпускании зум сбрасывается сам. У сайта нет
// нативного pinch-zoom (viewport запрещает масштабирование страницы —
// сайт во весь экран, как приложение), поэтому щипок реализован вручную
// через touch-события и CSS transform: scale на самой фотке, а не на
// странице целиком.
export function usePinchZoom() {
  const startDistanceRef = useRef(0)
  const [scale, setScale] = useState(1)
  const [origin, setOrigin] = useState("50% 50%")
  const [animateReset, setAnimateReset] = useState(false)

  function distance(touches: ReactTouchEvent["touches"]) {
    const a = touches[0]
    const b = touches[1]
    return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY)
  }

  const onTouchStart = useCallback((e: ReactTouchEvent) => {
    if (e.touches.length !== 2) return
    setAnimateReset(false)
    startDistanceRef.current = distance(e.touches)
    const rect = e.currentTarget.getBoundingClientRect()
    const cx = (e.touches[0].clientX + e.touches[1].clientX) / 2 - rect.left
    const cy = (e.touches[0].clientY + e.touches[1].clientY) / 2 - rect.top
    setOrigin(`${(cx / rect.width) * 100}% ${(cy / rect.height) * 100}%`)
  }, [])

  const onTouchMove = useCallback((e: ReactTouchEvent) => {
    if (e.touches.length !== 2 || startDistanceRef.current === 0) return
    const ratio = distance(e.touches) / startDistanceRef.current
    setScale(Math.min(3, Math.max(1, ratio)))
  }, [])

  const onTouchEnd = useCallback((e: ReactTouchEvent) => {
    if (e.touches.length >= 2) return
    startDistanceRef.current = 0
    setAnimateReset(true)
    setScale(1)
  }, [])

  return {
    handlers: { onTouchStart, onTouchMove, onTouchEnd },
    style: {
      transform: `scale(${scale})`,
      transformOrigin: origin,
      transition: animateReset ? "transform 200ms ease-out" : undefined,
      // touch-action: none — не preventDefault() (React вешает свои
      // touchstart/touchmove листенеры как passive, preventDefault из
      // JSX-пропа тихо не сработает). touch-action на самом элементе
      // отключает нативные жесты браузера (зум/скролл страницы) на нём
      // ещё до JS — Swiper это не ломает, у него свой драг через
      // transform, не через нативный скролл.
      touchAction: "none" as const,
    },
  }
}
