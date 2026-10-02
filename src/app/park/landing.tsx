"use client"

import Link from "next/link"
import { useEffect, useState, useSyncExternalStore } from "react"
import { SiteMenu } from "@/components/site-menu"
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

  // Прямая ссылка на раздел (/park?t=hontam#seawalking): страница пререндерится
  // с парком, нужный блок появляется только после гидрации — докручиваем сами.
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1))
    if (!id) return
    const t = setTimeout(() => document.getElementById(id)?.scrollIntoView(), 50)
    return () => clearTimeout(t)
  }, [destination])

  // Пока открыта клавиатура, нижняя панель прячется — иначе она всплывает над
  // клавиатурой и закрывает поле. Смотрим на саму клавиатуру (visualViewport
  // заметно ниже окна), а не на фокус: на Android клавиатуру закрывают кнопкой
  // «назад», поле остаётся в фокусе — и панель не возвращалась.
  const [keyboardOpen, setKeyboardOpen] = useState(false)
  useEffect(() => {
    const vv = window.visualViewport
    if (!vv) return
    const update = () => setKeyboardOpen(window.innerHeight - vv.height > 150)
    vv.addEventListener("resize", update)
    return () => vv.removeEventListener("resize", update)
  }, [])

  return (
    <div
      style={THEMES[destination] as React.CSSProperties}
      className="flex-1 bg-(--c-bg) font-(family-name:--font-park-sans) text-(--c-ink) transition-colors duration-500"
    >
      {/* Хедер ВикТур в цвет раздела + бургер-меню основного сайта */}
      <header className="sticky top-0 z-30 bg-(--c-primary) pt-[env(safe-area-inset-top)] transition-colors duration-500">
        <div className="mx-auto grid h-13 max-w-[560px] grid-cols-[1fr_auto_1fr] items-center px-3">
          <span />
          <Link href="/" className="font-heading text-[22px] font-medium text-white">
            ВикТур
          </Link>
          <div className="justify-self-end">
            <SiteMenu triggerClassName="text-white hover:bg-white/15 hover:text-white" />
          </div>
        </div>
      </header>

      {/* Переключатель направлений: экран пополам, без рамок и скруглений */}
      <nav
        aria-label="Направление"
        className={`fixed inset-x-0 bottom-0 z-30 grid grid-cols-2 shadow-[0_-4px_16px_rgb(0_0_0/0.12)] transition-transform duration-300 ${
          keyboardOpen ? "translate-y-full" : ""
        }`}
      >
        {DESTINATION_ORDER.map((id) => {
          const active = id === destination
          return (
            <button
              key={id}
              type="button"
              onClick={() => !active && setDestination(id)}
              aria-pressed={active}
              className={`flex min-h-16 flex-col items-center justify-center px-2 pt-2 pb-[calc(env(safe-area-inset-bottom)+8px)] leading-tight transition-colors ${
                active ? "bg-(--c-primary) text-white" : "bg-white text-(--c-primary) active:bg-(--c-bg-2)"
              }`}
            >
              <span className="text-[15px] font-extrabold whitespace-nowrap">
                {DESTINATIONS[id].tabLabel}
              </span>
              <span
                className={`mt-0.5 text-[12px] font-semibold ${active ? "text-(--c-on-primary)" : "text-(--c-muted)"}`}
              >
                {active ? "✓ " : ""}
                {DESTINATIONS[id].tabNote}
              </span>
            </button>
          )
        })}
      </nav>

      <main className="mx-auto max-w-[560px] pb-28">
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
