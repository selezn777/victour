"use client"

import { useCallback, useSyncExternalStore } from "react"

const STORAGE_KEY = "victour:favorites"
const listeners = new Set<() => void>()
let cache: string[] = []
let initialized = false

function readFromStorage(): string[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as string[]) : []
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

function writeFavorites(next: string[]) {
  cache = next
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  listeners.forEach((listener) => listener())
}

export function useFavorites() {
  const favorites = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  const toggle = useCallback((slug: string) => {
    ensureInitialized()
    const next = cache.includes(slug)
      ? cache.filter((s) => s !== slug)
      : [...cache, slug]
    writeFavorites(next)
  }, [])

  const isFavorite = useCallback(
    (slug: string) => favorites.includes(slug),
    [favorites],
  )

  return { favorites, toggle, isFavorite }
}
