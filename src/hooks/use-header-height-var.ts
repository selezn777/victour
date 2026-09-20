"use client"

import { useLayoutEffect, type RefObject } from "react"

// Полноэкранные SlideDeck на разных страницах (главная, каталог /tours,
// страница тура) вычитают высоту хедера из 100dvh, чтобы деке хватало
// РОВНО высоты экрана без хедера (см. h-[calc(100dvh-var(--site-header-h,...))]
// в slide-deck.tsx/tour-catalog.tsx). Раньше они вычитали hardcoded rem,
// подобранный вручную и разошедшийся с реальной высотой конкретного хедера
// (на сайте их два — SiteHeader и TourHeader, разной высоты) — низ
// последнего слайда (например, кнопка "Выбрать тур") уезжал за экран
// (Виктор: "верстка не адаптивная... то не влазит кнопка"). ResizeObserver
// держит --site-header-h в синхроне с РЕАЛЬНОЙ высотой ТЕКУЩЕГО хедера на
// любом брейкпоинте и после любой будущей правки самого хедера — без
// ручной подгонки чисел где-то ещё. Общий var (не отдельный на хедер) —
// на странице в любой момент виден только один из хедеров.
// useLayoutEffect, не useEffect: см. подробное объяснение в
// use-bottom-bar-height-var.ts — та же гонка между этим эффектом и
// измерением доступной высоты внутри слайдов (например маршрута).
export function useHeaderHeightVar(ref: RefObject<HTMLElement | null>) {
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const update = () => {
      document.documentElement.style.setProperty("--site-header-h", `${el.getBoundingClientRect().height}px`)
    }
    update()
    const observer = new ResizeObserver(update)
    observer.observe(el)
    return () => observer.disconnect()
  }, [ref])
}
