"use client"

import { useCallback, useSyncExternalStore } from "react"

// Машины (Виктор 26.11): три категории для всех направлений. Цена - доплата
// на компанию за каждый тур заявки, входит в сумму заявки. Себестоимость:
// премиум $40, супер премиум $100; на сайте с наценкой $50 / $130.
const photo = (i: number) => `/images/hero/pq-premium-${String(i).padStart(2, "0")}.jpg`
export const STANDARD_CAR_PHOTOS = [1, 2, 3, 4, 5, 6, 7].map(
  (i) => `/images/hero/pq-transfer-v2-${String(i).padStart(2, "0")}.jpg`,
)

export type CarClassId = "standard" | "premium" | "super"
export type CarClass = {
  id: CarClassId
  label: string
  priceUsd: number
  title: string
  body: string
  photos: string[]
}

export const CAR_CLASSES: CarClass[] = [
  {
    id: "standard",
    label: "Стандарт",
    priceUsd: 0,
    title: "Трансфер, после которого не нужно восстанавливаться",
    body: "Ни тесноты, ни духоты, ни нервотрёпки за рулём. Просторный семиместный минивэн, климат-контроль и аккуратный, спокойный водитель.",
    photos: STANDARD_CAR_PHOTOS,
  },
  {
    id: "premium",
    label: "Премиум",
    priceUsd: 50,
    title: "Премиум: Mercedes или Kia Carnival VIP",
    body: "Mercedes C и GLC с кожаным салоном или Kia Carnival VIP с капитанскими креслами - тише, мягче, просторнее.",
    // лучшие в начало, обычные салоны в конец (Виктор 26.11)
    photos: [15, 1, 16, 5, 6, 4, 2, 3, 11, 12].map(photo),
  },
  {
    id: "super",
    label: "Супер премиум",
    priceUsd: 130,
    title: "Супер премиум: VIP-минивэн",
    body: "Кресла-реклайнеры President с подставкой для ног, подсветка, столик и место для всей компании.",
    photos: [13, 14, 8, 10, 7, 9].map(photo),
  },
]

export const carClassById = (id: CarClassId) => CAR_CLASSES.find((c) => c.id === id) ?? CAR_CLASSES[0]
export const carPriceNote = (c: CarClass) =>
  c.priceUsd ? `+$${c.priceUsd} на компанию за тур` : "Входит в стоимость тура"

// Выбор машины общий для главной и заявки: выбрал на главной - видно в чеке.
const STORAGE_KEY = "victour:car"
const listeners = new Set<() => void>()
function read(): CarClassId {
  try {
    const v = window.localStorage.getItem(STORAGE_KEY)
    return CAR_CLASSES.some((c) => c.id === v) ? (v as CarClassId) : "standard"
  } catch {
    return "standard"
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
export function useCarClass() {
  const id = useSyncExternalStore(subscribe, read, () => "standard" as CarClassId)
  const setId = useCallback((v: CarClassId) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, v)
    } catch {}
    listeners.forEach((l) => l())
  }, [])
  return [id, setId] as const
}
