"use client"

import { useEffect, type RefObject } from "react"

// Тот же приём, что и у --site-header-h (см. use-header-height-var.ts):
// TourBottomBar — fixed поверх колоды, из потока не вычитается сама, из-за
// чего последние строчки высоких слайдов (например "Что взять с собой" на
// турах с длинным списком) уезжали под неё (Виктор со скриншотом: "кнопка
// внизу перекрывает последние строчки"). ResizeObserver держит реальную
// высоту плашки в --tour-bottom-bar-h, а SlideDeck на странице тура
// вычитает её из своей высоты вместе с хедером — деке физически не хватает
// места залезть под плашку.
export function useBottomBarHeightVar(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const update = () => {
      document.documentElement.style.setProperty("--tour-bottom-bar-h", `${el.getBoundingClientRect().height}px`)
    }
    update()
    const observer = new ResizeObserver(update)
    observer.observe(el)
    return () => observer.disconnect()
  }, [ref])
}
