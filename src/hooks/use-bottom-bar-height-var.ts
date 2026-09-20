"use client"

import { useLayoutEffect, type RefObject } from "react"

// Тот же приём, что и у --site-header-h (см. use-header-height-var.ts):
// TourBottomBar — fixed поверх колоды, из потока не вычитается сама, из-за
// чего последние строчки высоких слайдов (например "Что взять с собой" на
// турах с длинным списком) уезжали под неё (Виктор со скриншотом: "кнопка
// внизу перекрывает последние строчки"). ResizeObserver держит реальную
// высоту плашки в --tour-bottom-bar-h, а SlideDeck на странице тура
// вычитает её из своей высоты вместе с хедером — деке физически не хватает
// места залезть под плашку.
//
// useLayoutEffect, не useEffect — отрабатывает ДО любого обычного useEffect
// в дереве, так что другие компоненты, читающие эту CSS-переменную при
// монтировании, всегда видят уже актуальное значение, а не дефолт.
//
// reserve: false — на слайдах, где сама плашка скрыта (фото, бронь —
// см. tour-page-client.tsx), высота под неё всё равно вычиталась из ВСЕЙ
// деки (общая для всех слайдов), хотя перекрывать там нечего — контент
// слайда брони на маленьких экранах не помещался и обрезался снизу,
// заставляя лишний раз скроллить (Виктор: "убери зарезервированный блок,
// сделай весь экран доступным для контента"). Когда reserve=false, ставим
// переменную в 0 — дека получает физически больше места на ИМЕННО этом
// слайде, а на слайдах, где плашка видна, переменная возвращается к
// реальной высоте.
export function useBottomBarHeightVar(ref: RefObject<HTMLElement | null>, reserve: boolean) {
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    if (!reserve) {
      document.documentElement.style.setProperty("--tour-bottom-bar-h", "0px")
      return
    }
    const update = () => {
      document.documentElement.style.setProperty("--tour-bottom-bar-h", `${el.getBoundingClientRect().height}px`)
    }
    update()
    const observer = new ResizeObserver(update)
    observer.observe(el)
    return () => observer.disconnect()
  }, [ref, reserve])
}
