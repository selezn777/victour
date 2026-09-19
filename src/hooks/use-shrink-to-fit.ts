"use client"

import { useEffect, type RefObject } from "react"

// Обратная задача к growGap в tour-itinerary-slide.tsx: там места было
// больше, чем нужно контенту, и добавляли gap. Здесь наоборот — контент
// иногда не помещается в доступную высоту, а скролл и свайп-карусель
// Виктору не подошли ("никто не догадается листать вбок", "уберите идею
// с пролистыванием") — нужно, чтобы всё было видно на одном экране сразу.
//
// CSS zoom, не transform: scale — Виктор: "блок слишком узкий". transform
// не влияет на layout, поэтому уменьшенный блок всё равно занимал свою
// ПОЛНУЮ (нескейленную) ширину в раскладке, но рисовался мельче и по факту
// оставлял пустые поля по бокам при центрировании. zoom меняет сам layout
// (как будто у поддерева свой масштаб пикселя) — при ширине 100% от
// родителя элемент по-прежнему растягивается на всю доступную ширину,
// а меньше становится именно "внутреннее" — текст, отступы, iconки.
//
// Меряем и применяем императивно (как growGap): сбрасываем zoom к 1 перед
// каждым замером натуральной высоты — иначе zoom сам меняет scrollHeight
// (в отличие от transform), и повторный замер на уже уменьшенном контенте
// давал бы неверный (заниженный) коэффициент. ResizeObserver слушает
// ТОЛЬКО контейнер (не сам content) — иначе применённый zoom, меняющий
// собственный размер content, спровоцировал бы обсервер сам на себя (та
// же ловушка, что описана в DayList/growGap про inline rowGap).
export function useShrinkToFit(
  containerRef: RefObject<HTMLElement | null>,
  contentRef: RefObject<HTMLElement | null>,
  deps: unknown[],
) {
  useEffect(() => {
    const container = containerRef.current
    const content = contentRef.current
    if (!container || !content) return

    function recalc() {
      if (!container || !content) return
      content.style.zoom = "1"
      const natural = content.scrollHeight
      const available = container.clientHeight
      content.style.zoom = natural > 0 && available > 0 && natural > available ? String(available / natural) : "1"
    }

    recalc()
    document.fonts?.ready.then(recalc).catch(() => {})
    const ro = new ResizeObserver(recalc)
    ro.observe(container)
    return () => ro.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}
