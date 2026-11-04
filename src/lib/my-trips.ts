"use client"

import { useSyncExternalStore } from "react"

// «Мои поездки» без регистрации (Виктор 2026-11-04: «купили и пропало всё...
// делаем максимальный сервис»). После брони браузер запоминает номер заявки
// (uuid) или подписанный токен билета в парк — по ним /trips показывает, что
// забронировано. Uuid и HMAC-токен не угадать, поэтому чужое не увидеть.

export type SavedTrip = { kind: "booking"; id: string } | { kind: "park"; token: string }

const KEY = "victour:trips"
const EVENT = "victour:trips-changed"
const EMPTY: SavedTrip[] = []

let cacheRaw: string | null = null
let cacheList: SavedTrip[] = EMPTY

function read(): SavedTrip[] {
  let raw: string | null = null
  try {
    raw = localStorage.getItem(KEY)
  } catch {
    return EMPTY
  }
  if (raw === cacheRaw) return cacheList
  cacheRaw = raw
  try {
    const parsed = JSON.parse(raw ?? "[]")
    cacheList = Array.isArray(parsed) ? parsed : EMPTY
  } catch {
    cacheList = EMPTY
  }
  return cacheList
}

export function saveTrip(trip: SavedTrip) {
  const list = read().filter((t) =>
    trip.kind === "booking" ? !(t.kind === "booking" && t.id === trip.id) : !(t.kind === "park" && t.token === trip.token),
  )
  try {
    localStorage.setItem(KEY, JSON.stringify([trip, ...list].slice(0, 30)))
    window.dispatchEvent(new Event(EVENT))
  } catch {
    // приватный режим — поездка всё равно есть у Виктора, просто не запомнится в браузере
  }
}

function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb)
  window.addEventListener("storage", cb)
  return () => {
    window.removeEventListener(EVENT, cb)
    window.removeEventListener("storage", cb)
  }
}

/** null — ещё не прочитали (SSR/первый кадр), [] — поездок нет. */
export function useSavedTrips(): SavedTrip[] | null {
  return useSyncExternalStore<SavedTrip[] | null>(subscribe, read, () => null)
}
