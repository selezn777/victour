"use client"

import { useSyncExternalStore } from "react"
import { BookingSection } from "./booking-section"
import { DESTINATIONS, DESTINATION_ORDER, PARK_WHATSAPP, type DestinationId } from "./park-config"
import { THEMES } from "./ui"
import { WhatsAppIcon } from "./whatsapp-icon"

// Выбранное направление живёт в ?t=hontam — ссылку на Хон Там можно
// отправить туристу напрямую. Без параметра — парк.
const EVENT = "victour:park-destination"

function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb)
  window.addEventListener("popstate", cb)
  return () => {
    window.removeEventListener(EVENT, cb)
    window.removeEventListener("popstate", cb)
  }
}

const readDestination = (): DestinationId =>
  new URLSearchParams(window.location.search).get("t") === "hontam" ? "hontam" : "park"

function setDestination(id: DestinationId) {
  const url = new URL(window.location.href)
  if (id === "park") url.searchParams.delete("t")
  else url.searchParams.set("t", id)
  url.hash = ""
  window.history.replaceState(null, "", url)
  window.dispatchEvent(new Event(EVENT))
  window.scrollTo({ top: 0 })
}

export function Landing({
  content,
}: {
  content: Record<DestinationId, React.ReactNode>
}) {
  const destination = useSyncExternalStore(subscribe, readDestination, () => "park" as const)

  return (
    <div
      style={THEMES[destination] as React.CSSProperties}
      className="flex-1 bg-(--c-bg) font-(family-name:--font-park-sans) text-(--c-ink) transition-colors duration-500"
    >
      <nav
        aria-label="Направление"
        className="sticky top-0 z-30 bg-(--c-bg)/90 px-4 pt-[calc(env(safe-area-inset-top)+8px)] pb-2 backdrop-blur transition-colors duration-500"
      >
        <div className="mx-auto grid max-w-[528px] grid-cols-2 gap-1 rounded-full bg-(--c-bg-2) p-1">
          {DESTINATION_ORDER.map((id) => {
            const active = id === destination
            return (
              <button
                key={id}
                type="button"
                onClick={() => !active && setDestination(id)}
                aria-pressed={active}
                className={`h-10 rounded-full text-[14px] font-bold transition-colors ${
                  active ? "bg-(--c-primary) text-white shadow-sm" : "text-(--c-primary)"
                }`}
              >
                {DESTINATIONS[id].tabLabel}
              </button>
            )
          })}
        </div>
      </nav>

      <main className="mx-auto max-w-[560px] pb-10">
        {content[destination]}

        <div className="mt-7 space-y-7 px-4">
          <BookingSection destination={destination} />

          <a
            href={PARK_WHATSAPP.href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3.5 rounded-[24px] border-[3px] border-[#25d366] bg-white px-4 py-3.5 shadow-[0_8px_24px_rgb(60_60_40/0.14)] active:scale-[0.99]"
          >
            <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[#25d366]">
              <WhatsAppIcon className="size-7 fill-white" />
            </span>
            <span>
              <small className="block text-[12px] tracking-wider text-(--c-muted)">
                WHATSAPP · {PARK_WHATSAPP.name.toUpperCase()}
              </small>
              <b className="block font-(family-name:--font-park-serif) text-[24px] leading-tight text-(--c-primary)">
                {PARK_WHATSAPP.display}
              </b>
            </span>
          </a>
        </div>
      </main>
    </div>
  )
}
