"use client"

import { useCallback, useSyncExternalStore } from "react"

const STORAGE_KEY = "victour:package"
const MAX_ITEMS = 4
const listeners = new Set<() => void>()

// Тур попадает в заявку только полностью настроенным (дата+гид+гости) —
// добавление без даты убрали (Виктор: без даты в корзину нельзя). Поля
// остаются nullable в типе ради обратной совместимости с уже сохранённым
// в localStorage у гостей.
export type PackageItem = {
  tourId: string
  tourSlug: string
  tourTitle: string
  guideId: string | null
  guideName: string | null
  date: string | null
  dateEnd: string | null
  adults: number | null
  priceAdultUsd: number | null
}

export function isConfigured(item: PackageItem): boolean {
  return item.date != null && item.guideId != null && item.adults != null && item.priceAdultUsd != null
}

let cache: PackageItem[] = []
let initialized = false

function readFromStorage(): PackageItem[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as PackageItem[]) : []
  } catch {
    return []
  }
}

function ensureInitialized() {
  if (!initialized && typeof window !== "undefined") {
    cache = readFromStorage()
    initialized = true
  }
}

function subscribe(callback: () => void) {
  listeners.add(callback)
  return () => listeners.delete(callback)
}

function getSnapshot() {
  ensureInitialized()
  return cache
}

function getServerSnapshot() {
  return cache
}

function write(next: PackageItem[]) {
  cache = next
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  listeners.forEach((listener) => listener())
}

/** Все даты, занятые позициями в пакете (с учётом второго дня для Далата), кроме позиции этого тура. */
export function datesUsedByOtherItems(items: PackageItem[], excludeTourSlug: string): Set<string> {
  const dates = new Set<string>()
  for (const item of items) {
    if (item.tourSlug === excludeTourSlug) continue
    if (item.date) dates.add(item.date)
    if (item.dateEnd) dates.add(item.dateEnd)
  }
  return dates
}

export function usePackage() {
  const items = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  // Полное добавление/донастройка (со страницы тура или конфигуратора в
  // заявке) — если позиция с таким туром уже есть (например, добавлена
  // быстрым способом из каталога), обновляет её на месте вместо отказа.
  const addItem = useCallback((item: PackageItem): { ok: true } | { ok: false; error: string } => {
    ensureInitialized()
    const usedDates = datesUsedByOtherItems(cache, item.tourSlug)
    if (item.date && (usedDates.has(item.date) || (item.dateEnd && usedDates.has(item.dateEnd)))) {
      return { ok: false, error: "На эту дату уже выбран другой тур в заявке." }
    }
    const existingIndex = cache.findIndex((i) => i.tourSlug === item.tourSlug)
    if (existingIndex >= 0) {
      const next = [...cache]
      next[existingIndex] = item
      write(next)
      return { ok: true }
    }
    if (cache.length >= MAX_ITEMS) {
      return { ok: false, error: `В пакете можно собрать максимум ${MAX_ITEMS} тура.` }
    }
    write([...cache, item])
    return { ok: true }
  }, [])

  const removeItem = useCallback((tourSlug: string) => {
    ensureInitialized()
    write(cache.filter((i) => i.tourSlug !== tourSlug))
  }, [])

  const clear = useCallback(() => {
    write([])
  }, [])

  return { items, addItem, removeItem, clear }
}
