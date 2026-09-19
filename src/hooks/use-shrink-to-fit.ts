"use client"

import { useEffect, useState, type RefObject } from "react"

// Обратная задача к growGap в tour-itinerary-slide.tsx: там места было
// больше, чем нужно контенту, и добавляли gap. Здесь наоборот — контент
// иногда не помещается в доступную высоту, а скролл и свайп-карусель
// Виктору не подошли ("никто не догадается листать вбок", "уберите идею
// с пролистыванием") — нужно, чтобы всё было видно на одном экране сразу.
// Измеряем натуральную (нескейленную) высоту контента и доступную высоту
// контейнера, и если контент не помещается — считаем коэффициент
// уменьшения и возвращаем его, чтобы применить как CSS transform: scale
// на самом контенте (transform не влияет на layout/scrollHeight, так что
// повторные измерения остаются корректными без сброса, в отличие от
// растягивания rowGap в DayList). document.fonts.ready — та же причина,
// что и в DayList: до загрузки кастомного шрифта текст рисуется системным
// фолбэком с другим line-height, и первый расчёт может быть неточным.
export function useShrinkToFit(
  containerRef: RefObject<HTMLElement | null>,
  contentRef: RefObject<HTMLElement | null>,
  deps: unknown[],
) {
  const [scale, setScale] = useState(1)

  useEffect(() => {
    const container = containerRef.current
    const content = contentRef.current
    if (!container || !content) return

    function recalc() {
      if (!container || !content) return
      const natural = content.scrollHeight
      const available = container.clientHeight
      if (natural > 0 && available > 0 && natural > available) {
        setScale(available / natural)
      } else {
        setScale(1)
      }
    }

    recalc()
    document.fonts?.ready.then(recalc).catch(() => {})
    const ro = new ResizeObserver(recalc)
    ro.observe(container)
    ro.observe(content)
    return () => ro.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return scale
}
