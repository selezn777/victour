import Image, { type StaticImageData } from "next/image"
import type { DestinationId } from "./park-config"

// Палитры направлений. Компоненты красятся только через эти переменные
// (bg-(--c-primary) и т.д.), поэтому при переключении Парк ↔ Хон Там
// меняется вся страница, включая форму, карту и экран успеха.
export const THEMES: Record<DestinationId, Record<string, string>> = {
  park: {
    "--c-primary": "#1f5a4a",
    "--c-primary-2": "#2e7a63",
    "--c-bg": "#f4ead8",
    "--c-bg-2": "#e9d9bb",
    "--c-ink": "#1d2b27",
    "--c-accent": "#c8913a",
    "--c-on-primary": "#ffe1a8",
    "--c-muted": "#5b6b64",
    "--c-tint": "#fbf3e3",
    "--c-tint-ink": "#7a5418",
    "--c-border": "#d9ccb3",
    "--c-hero-fade": "rgb(15 40 34 / 0.55)",
    "--c-shadow-primary": "0 14px 36px rgb(31 90 74 / 0.28)",
  },
  hontam: {
    "--c-primary": "#0d4f6b",
    "--c-primary-2": "#137b8f",
    "--c-bg": "#e6f2f1",
    "--c-bg-2": "#cce4e3",
    "--c-ink": "#10303b",
    "--c-accent": "#e0962f",
    "--c-on-primary": "#ffe1a8",
    "--c-muted": "#4d6a72",
    "--c-tint": "#fdf3e2",
    "--c-tint-ink": "#8a5410",
    "--c-border": "#b9d3d3",
    "--c-hero-fade": "rgb(8 40 56 / 0.55)",
    "--c-shadow-primary": "0 14px 36px rgb(13 79 107 / 0.3)",
  },
}

export const CARD = "rounded-[20px] bg-white shadow-[0_8px_24px_rgb(60_60_40/0.11)]"
export const SERIF = "font-(family-name:--font-park-serif)"

export function Pill({ children, accent }: { children: React.ReactNode; accent?: boolean }) {
  return (
    <span
      className={`rounded-full px-3.5 py-1.5 text-[11px] font-bold tracking-[0.18em] ${
        accent ? "bg-(--c-accent) text-white" : "bg-white/92 text-(--c-primary)"
      }`}
    >
      {children}
    </span>
  )
}

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-3 ml-1 text-xs font-bold tracking-[0.18em] text-(--c-primary-2) uppercase">
      {children}
    </h2>
  )
}

export function Hero({
  image,
  alt,
  pills,
  objectPosition,
  ctaHref = "#booking",
  children,
}: {
  image: StaticImageData
  ctaHref?: string
  alt: string
  pills: [string, string]
  objectPosition: string
  children: React.ReactNode
}) {
  return (
    <header className="relative h-[460px] overflow-hidden sm:h-[500px]">
      <Image
        src={image}
        alt={alt}
        fill
        priority
        placeholder="blur"
        sizes="(max-width: 560px) 100vw, 560px"
        className="object-cover"
        style={{ objectPosition }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgb(0_0_0/0.15)_0%,rgb(0_0_0/0.05)_35%,var(--c-hero-fade)_72%,var(--c-bg)_100%)]" />
      <div className="absolute inset-x-4 top-4 flex items-center justify-between gap-2">
        <Pill>{pills[0]}</Pill>
        <Pill accent>{pills[1]}</Pill>
      </div>
      <div className="absolute inset-x-4 bottom-20 text-white">
        {children}
        <a
          href={ctaHref}
          className="mt-4 inline-flex h-12 items-center rounded-full bg-(--c-accent) px-6 text-[15px] font-bold text-white shadow-[0_8px_20px_rgb(0_0_0/0.25)] active:scale-[0.98]"
        >
          Забронировать трансфер
        </a>
      </div>
    </header>
  )
}

export function HeroTitle({ children }: { children: React.ReactNode }) {
  return (
    <h1
      className={`${SERIF} text-[40px] leading-[1.04] font-bold [text-shadow:0_4px_24px_rgb(0_0_0/0.35)] sm:text-[46px]`}
    >
      {children}
    </h1>
  )
}

export function BookingConditions() {
  return (
    <section>
      <SectionTitle>Условия бронирования</SectionTitle>
      <div className="flex flex-col gap-3 rounded-[20px] bg-(--c-bg-2) px-4 py-3.5 text-[14px] leading-snug">
        <div className="flex gap-2.5">
          <span className="text-[20px] leading-none">🛡️</span>
          <span>
            <b className="text-(--c-primary)">Бронирование и отмена — бесплатно.</b> Напишите с
            вечера, что планируете поехать.
          </span>
        </div>
        <div className="flex gap-2.5">
          <span className="text-[20px] leading-none">⏱️</span>
          <span>
            Подтверждение брони — <b className="text-(--c-primary)">всего за 1 час до выезда.</b>
          </span>
        </div>
      </div>
    </section>
  )
}

// Карточка тарифа: метка всегда на 2 строки, цена и цена дети/60+ — на одной
// линии у соседних карточек, доп. плашки прижаты вниз (карточки в ряду равной высоты).
export function TicketCard({
  label,
  price,
  secondary,
  children,
}: {
  label: string
  price: string
  secondary?: string
  children?: React.ReactNode
}) {
  return (
    <div className={`${CARD} flex h-full flex-col rounded-[22px] p-3.5`}>
      <div className="min-h-[2.4em] text-[11px] leading-[1.2] font-bold tracking-[0.1em] text-balance text-(--c-primary-2) uppercase">
        {label}
      </div>
      <div
        className={`${SERIF} mt-1 text-[28px] leading-none font-bold whitespace-nowrap text-(--c-primary)`}
      >
        {price}
      </div>
      <div className="mt-1.5 text-[11.5px] leading-tight whitespace-nowrap text-(--c-muted)">
        {secondary ? (
          <>
            дети и 60+ — <b className="text-(--c-ink)">{secondary}</b>
          </>
        ) : (
          "\u00a0"
        )}
      </div>
      {children && (
        <div className="mt-3 flex flex-col gap-2 text-[12px] leading-snug">
          {children}
        </div>
      )}
    </div>
  )
}
