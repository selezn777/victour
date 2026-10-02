"use client"

import { useEffect, useRef, useState } from "react"
import type { HotelPlace } from "./park-config"

// Выбор отеля через Google Карты (Places API New). Нужен ключ
// NEXT_PUBLIC_GOOGLE_MAPS_API_KEY с включёнными Maps JavaScript API и
// Places API (New); ключ ограничить по HTTP referrer доменом сайта.
// Без ключа кнопка карты не показывается — остаётся обычное поле.
const MAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
const NHA_TRANG = { lat: 12.2388, lng: 109.1967 }

export type HotelValue = { name: string; place: HotelPlace | null }

let mapsLoader: Promise<void> | null = null

function loadGoogleMaps(): Promise<void> {
  if (typeof window === "undefined" || !MAPS_KEY) return Promise.reject(new Error("no key"))
  if (typeof window.google !== "undefined" && "importLibrary" in window.google.maps) return Promise.resolve()
  mapsLoader ??= new Promise<void>((resolve, reject) => {
    const callbackName = "__victourMapsReady"
    ;(window as unknown as Record<string, () => void>)[callbackName] = () => resolve()
    const script = document.createElement("script")
    script.src =
      `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(MAPS_KEY)}` +
      `&v=weekly&language=ru&region=VN&loading=async&callback=${callbackName}`
    script.async = true
    script.onerror = () => {
      mapsLoader = null
      reject(new Error("Google Maps failed to load"))
    }
    document.head.appendChild(script)
  })
  return mapsLoader
}

export function HotelPicker({
  value,
  onChange,
  inputClassName,
}: {
  value: HotelValue
  onChange: (v: HotelValue) => void
  inputClassName: string
}) {
  const [mapOpen, setMapOpen] = useState(false)

  return (
    <div>
      {value.place ? (
        <div className="flex items-start gap-3 rounded-2xl border-2 border-(--c-primary) bg-white px-3.5 py-3">
          <span className="text-[22px] leading-none">🏨</span>
          <div className="min-w-0 flex-1">
            <b className="block text-[15px] leading-tight">{value.name}</b>
            {value.place.address && (
              <span className="mt-0.5 block text-[12.5px] leading-snug text-(--c-muted)">
                {value.place.address}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => setMapOpen(true)}
            className="shrink-0 text-[13px] font-bold text-(--c-primary) underline underline-offset-4"
          >
            Изменить
          </button>
        </div>
      ) : (
        <input
          id="park-hotel"
          value={value.name}
          onChange={(e) => onChange({ name: e.target.value, place: null })}
          placeholder="Название отеля"
          autoComplete="off"
          maxLength={200}
          className={inputClassName}
        />
      )}

      {MAPS_KEY && !value.place && (
        <button
          type="button"
          onClick={() => setMapOpen(true)}
          className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-(--c-primary) bg-white/60 text-[15px] font-bold text-(--c-primary) active:scale-[0.99]"
        >
          <span className="text-[18px]">📍</span> Найти отель на Google Картах
        </button>
      )}

      {mapOpen && (
        <HotelMapSheet
          initialQuery={value.place ? "" : value.name}
          onClose={() => setMapOpen(false)}
          onSelect={(v) => {
            onChange(v)
            setMapOpen(false)
          }}
        />
      )}
    </div>
  )
}

type Selected = HotelValue & { place: HotelPlace }

function HotelMapSheet({
  initialQuery,
  onClose,
  onSelect,
}: {
  initialQuery: string
  onClose: () => void
  onSelect: (v: Selected) => void
}) {
  const mapEl = useRef<HTMLDivElement>(null)
  const mapRef = useRef<google.maps.Map | null>(null)
  const markerRef = useRef<google.maps.Marker | null>(null)
  const placesRef = useRef<google.maps.PlacesLibrary | null>(null)
  const tokenRef = useRef<google.maps.places.AutocompleteSessionToken | null>(null)

  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading")
  const [query, setQuery] = useState(initialQuery)
  const [suggestions, setSuggestions] = useState<google.maps.places.PlacePrediction[]>([])
  const [selected, setSelected] = useState<Selected | null>(null)

  // Блокируем прокрутку страницы под картой
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prev
    }
  }, [])

  async function showPlace(place: google.maps.places.Place) {
    await place.fetchFields({ fields: ["id", "displayName", "formattedAddress", "location"] })
    if (!place.location) return
    const location = place.location
    mapRef.current?.panTo(location)
    mapRef.current?.setZoom(16)
    markerRef.current?.setPosition(location)
    markerRef.current?.setVisible(true)
    setSuggestions([])
    tokenRef.current = placesRef.current ? new placesRef.current.AutocompleteSessionToken() : null
    setSelected({
      name: place.displayName ?? "",
      place: {
        placeId: place.id,
        address: place.formattedAddress ?? "",
        lat: location.lat(),
        lng: location.lng(),
      },
    })
  }

  // Загрузка карты
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        await loadGoogleMaps()
        const { Map } = (await google.maps.importLibrary("maps")) as google.maps.MapsLibrary
        const { Marker } = (await google.maps.importLibrary("marker")) as google.maps.MarkerLibrary
        const places = (await google.maps.importLibrary("places")) as google.maps.PlacesLibrary
        if (cancelled || !mapEl.current) return
        placesRef.current = places
        tokenRef.current = new places.AutocompleteSessionToken()
        const map = new Map(mapEl.current, {
          center: NHA_TRANG,
          zoom: 13,
          disableDefaultUI: true,
          zoomControl: true,
          clickableIcons: true,
          gestureHandling: "greedy",
        })
        mapRef.current = map
        markerRef.current = new Marker({ map, visible: false })
        // Тап по значку отеля прямо на карте — тоже выбор
        map.addListener("click", (e: google.maps.MapMouseEvent | google.maps.IconMouseEvent) => {
          if ("placeId" in e && e.placeId) {
            e.stop()
            void showPlace(new places.Place({ id: e.placeId })).catch(() => {})
          }
        })
        setStatus("ready")
      } catch {
        if (!cancelled) setStatus("error")
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  // Подсказки при вводе (с небольшой задержкой)
  useEffect(() => {
    const places = placesRef.current
    const input = query.trim()
    if (status !== "ready" || !places || input.length < 2) return
    let cancelled = false
    const t = setTimeout(async () => {
      try {
        const { suggestions } = await places.AutocompleteSuggestion.fetchAutocompleteSuggestions({
          input,
          sessionToken: tokenRef.current ?? undefined,
          language: "ru",
          region: "vn",
          includedRegionCodes: ["vn"],
          locationBias: { center: NHA_TRANG, radius: 30000 },
        })
        if (!cancelled) {
          setSuggestions(
            suggestions
              .map((s) => s.placePrediction)
              .filter((p): p is google.maps.places.PlacePrediction => p !== null),
          )
        }
      } catch {
        if (!cancelled) setSuggestions([])
      }
    }, 250)
    return () => {
      cancelled = true
      clearTimeout(t)
    }
  }, [query, status])

  return (
    <div
      role="dialog"
      aria-modal
      aria-label="Выбор отеля на карте"
      className="fixed inset-0 z-50 flex flex-col bg-(--c-bg) text-(--c-ink)"
    >
      <div className="relative z-10 flex items-center gap-2 bg-(--c-bg) px-3 pt-[calc(env(safe-area-inset-top)+10px)] pb-2.5 shadow-[0_4px_12px_rgb(0_0_0/0.08)]">
        <button
          type="button"
          onClick={onClose}
          aria-label="Закрыть карту"
          className="flex size-11 shrink-0 items-center justify-center rounded-full bg-white text-[20px] font-bold"
        >
          ✕
        </button>
        <input
          autoFocus
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            if (e.target.value.trim().length < 2) setSuggestions([])
          }}
          placeholder="Введите название отеля"
          className="h-11 min-w-0 flex-1 rounded-full border border-black/10 bg-white px-4 text-[16px] outline-none focus:border-(--c-primary)"
        />
        {suggestions.length > 0 && (
          <ul className="absolute inset-x-3 top-full mt-1 max-h-[50vh] overflow-y-auto rounded-2xl bg-white py-1 shadow-[0_12px_32px_rgb(0_0_0/0.18)]">
            {suggestions.map((s) => (
              <li key={s.placeId}>
                <button
                  type="button"
                  onClick={() => {
                    setQuery(s.mainText?.text ?? s.text.text)
                    void showPlace(s.toPlace()).catch(() => {})
                  }}
                  className="block w-full px-4 py-2.5 text-left active:bg-black/5"
                >
                  <span className="block text-[15px] font-semibold">
                    {s.mainText?.text ?? s.text.text}
                  </span>
                  {s.secondaryText && (
                    <span className="block truncate text-[12.5px] text-(--c-muted)">
                      {s.secondaryText.text}
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="relative flex-1">
        <div ref={mapEl} className="absolute inset-0" />
        {status === "loading" && (
          <div className="absolute inset-0 flex items-center justify-center text-[14px] text-(--c-muted)">
            Загружаем карту…
          </div>
        )}
        {status === "error" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-8 text-center text-[14px]">
            Не получилось загрузить карту. Закройте её и впишите название отеля вручную.
            <button
              type="button"
              onClick={onClose}
              className="h-11 rounded-full bg-(--c-primary) px-5 font-bold text-white"
            >
              Вписать вручную
            </button>
          </div>
        )}
      </div>

      {selected && (
        <div className="bg-white px-4 pt-3.5 pb-[calc(env(safe-area-inset-bottom)+14px)] shadow-[0_-6px_20px_rgb(0_0_0/0.1)]">
          <b className="block text-[16px] leading-tight">{selected.name}</b>
          <span className="mt-0.5 block text-[13px] leading-snug text-(--c-muted)">
            {selected.place.address}
          </span>
          <button
            type="button"
            onClick={() => onSelect(selected)}
            className="mt-3 h-13 w-full rounded-full bg-(--c-accent) text-[16px] font-extrabold text-white"
          >
            ✓ Это мой отель
          </button>
        </div>
      )}
    </div>
  )
}
