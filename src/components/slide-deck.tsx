"use client"

import { useEffect, useRef, useState } from "react"
import type { ReactNode } from "react"

/**
 * Полноэкранные слайды внутри обычного скролла страницы: контейнер растянут
 * на N экранов высоты, внутри — sticky-вьюпорт с кроссфейдом между слайдами
 * по прогрессу скролла. Это надёжнее CSS scroll-snap (mandatory ломался на
 * мобильных браузерах) и не перехватывает wheel/touch — скролл остаётся
 * полностью нативным, просто в каждый момент виден ровно один слайд.
 */
export function SlideDeck({ slides }: { slides: ReactNode[] }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let ticking = false

    function update() {
      ticking = false
      if (!container) return
      const rect = container.getBoundingClientRect()
      const vh = window.innerHeight
      const progress = -rect.top / vh
      const next = Math.min(Math.max(Math.round(progress), 0), slides.length - 1)
      setIndex((prev) => (prev === next ? prev : next))
    }

    function onScroll() {
      if (ticking) return
      ticking = true
      requestAnimationFrame(update)
    }

    update()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll)
    return () => {
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
    }
  }, [slides.length])

  return (
    <div ref={containerRef} style={{ height: `${slides.length * 100}svh` }} className="relative">
      <div className="sticky top-0 h-[100svh] w-full overflow-hidden">
        {slides.map((slide, i) => (
          <div
            key={i}
            className="absolute inset-0 transition-opacity duration-500 ease-out"
            style={{ opacity: i === index ? 1 : 0, pointerEvents: i === index ? "auto" : "none" }}
            aria-hidden={i !== index}
          >
            {slide}
          </div>
        ))}
      </div>
    </div>
  )
}
