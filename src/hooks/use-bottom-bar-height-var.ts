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
// useLayoutEffect, не useEffect: слайд маршрута (TourItinerarySlide) сам
// меряет доступную высоту в СВОЁМ useEffect, чтобы растянуть отступы между
// пунктами на весь экран (см. growGapPx там). Обычный useEffect этого
// компонента иногда срабатывал ПОЗЖЕ — маршрут успевал измерить высоту ДО
// того, как здесь применялась реальная высота плашки (React не гарантирует
// порядок между independent useEffect на разных компонентах), из-за чего
// отступы то растягивались, то схлопывались "через раз", особенно при
// возврате на тур кнопкой "назад" (слайд уже активен с первого кадра, а не
// после того как пользователь долистает до него сам). useLayoutEffect
// гарантированно отрабатывает ДО любого useEffect в дереве (React сначала
// прогоняет ВСЕ layout-эффекты, потом красит кадр, потом ВСЕ обычные) —
// маршрут увидит уже правильную высоту при первом же измерении.
export function useBottomBarHeightVar(ref: RefObject<HTMLElement | null>) {
  useLayoutEffect(() => {
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
