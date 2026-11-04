"use client"

import { useCallback, useSyncExternalStore } from "react"
import { RESORTS, type ResortId } from "@/lib/resorts"

// Выбранный гостем курорт — в localStorage, общий для шапки, главной и
// каталога. null = ещё не выбирал (каталог тогда сначала спрашивает курорт).
const STORAGE_KEY = "victour:resort"
const listeners = new Set<() => void>()

function read(): ResortId | null {
  try {
    const v = window.localStorage.getItem(STORAGE_KEY)
    return RESORTS.some((r) => r.id === v) ? (v as ResortId) : null
  } catch {
    return null
  }
}

function subscribe(cb: () => void) {
  listeners.add(cb)
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) cb()
  }
  window.addEventListener("storage", onStorage)
  return () => {
    listeners.delete(cb)
    window.removeEventListener("storage", onStorage)
  }
}

export function useResort() {
  const resort = useSyncExternalStore(subscribe, read, () => null)
  const setResort = useCallback((id: ResortId) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, id)
    } catch {}
    listeners.forEach((l) => l())
  }, [])
  return [resort, setResort] as const
}
