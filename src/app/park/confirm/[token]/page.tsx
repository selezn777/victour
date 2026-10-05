import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { formatUsd } from "@/lib/format"
import { getHomepageData, type CatalogTour } from "@/lib/site-data"
import { confirmSummaryRu, readConfirmToken } from "@/lib/park-confirm"
import { lora, manrope } from "../../fonts"
import { PARK_WHATSAPP } from "../../park-config"
import { THEMES } from "../../ui"
import { WhatsAppIcon } from "../../whatsapp-icon"
import { ConfirmButton } from "./confirm-button"

export const metadata: Metadata = {
  title: "Подтверждение выезда | ВикТур",
  robots: { index: false, follow: false },
}

export default async function ConfirmPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const data = readConfirmToken(decodeURIComponent(token))
  // Каталог для блока «другие туры» после подтверждения — без него страница
  // подтверждения должна работать как раньше.
  const tours = data ? await getHomepageData().then((d) => d.tours).catch(() => []) : []

  return (
    <div
      style={THEMES[data?.dest ?? "park"] as React.CSSProperties}
      className={`${lora.variable} ${manrope.variable} flex-1 bg-(--c-bg) font-(family-name:--font-park-sans) text-(--c-ink)`}
    >
      <main className="mx-auto flex min-h-dvh max-w-[480px] flex-col justify-center gap-4 px-4 py-8">
        {data ? (
          <>
            <div className="rounded-[28px] bg-(--c-primary) p-5 text-white shadow-(--c-shadow-primary)">
              <p className="text-[12px] font-bold tracking-[0.18em] text-(--c-on-primary)">
                ВИКТУР · ПОДТВЕРЖДЕНИЕ ВЫЕЗДА
              </p>
              <h1 className="mt-2 font-(family-name:--font-park-serif) text-[28px] leading-tight font-bold">
                {data.name}, вы едете?
              </h1>
              <p className="mt-2 text-[15px] leading-snug opacity-95">{confirmSummaryRu(data)}</p>
              {data.pickup && (
                <div className="mt-3 rounded-2xl bg-white/12 px-4 py-3 text-[15px]">
                  🚐 Выезд от отеля в <b className="text-(--c-on-primary)">{data.pickup}</b> (±10 мин)
                  {data.boat && (
                    <>
                      <br />
                      🚤 Катер в <b className="text-(--c-on-primary)">{data.boat}</b>
                    </>
                  )}
                  {data.cableCar && (
                    <>
                      <br />
                      🚡 На канатку в <b className="text-(--c-on-primary)">{data.cableCar}</b>
                    </>
                  )}
                </div>
              )}
              <p className="mt-3 text-[14px] opacity-90">🏨 {data.hotel}</p>
            </div>

            <ConfirmButton
              token={decodeURIComponent(token)}
              afterDone={tours.length > 0 && <OtherTours tours={tours.slice(0, 4)} />}
            />

            <a
              href={PARK_WHATSAPP.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-14 items-center justify-center gap-2 rounded-full border-2 border-[#25d366] bg-white px-4 text-[15px] font-bold whitespace-nowrap text-(--c-ink)"
            >
              <WhatsAppIcon className="size-6 fill-[#25d366]" />
              Планы изменились? WhatsApp
            </a>
          </>
        ) : (
          <div className="rounded-[24px] bg-white p-5 text-center">
            <p className="text-[16px] font-bold">Ссылка не работает</p>
            <p className="mt-2 text-[14px] text-(--c-muted)">
              Напишите нам в WhatsApp {PARK_WHATSAPP.display} — подтвердим выезд вручную.
            </p>
            <Link href="/park" className="mt-4 inline-block font-bold text-(--c-primary) underline">
              На страницу бронирования
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}

function OtherTours({ tours }: { tours: CatalogTour[] }) {
  return (
    <section className="rounded-[24px] bg-white p-4 shadow-[0_8px_24px_rgb(60_60_40/0.11)]">
      <p className="px-1 font-(family-name:--font-park-serif) text-[19px] font-bold text-(--c-primary)">
        Другие наши туры
      </p>
      <ul className="mt-3 flex flex-col gap-2">
        {tours.map((t) => (
          <li key={t.id}>
            <Link
              href={`/tours/${t.slug}`}
              className="flex items-center gap-3 rounded-2xl bg-(--c-bg) p-2 pr-3 active:scale-[0.99]"
            >
              <div className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-black/10">
                {t.heroImageUrl && (
                  <Image src={t.heroImageUrl} alt={t.title} fill sizes="64px" className="object-cover" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[15px] leading-tight font-bold">{t.title}</p>
                <p className="mt-0.5 text-[13px] text-(--c-muted)">
                  {t.durationLabel}
                  {t.priceFromUsd > 0 && <> · от {formatUsd(t.priceFromUsd)}</>}
                </p>
              </div>
              <span className="text-[20px] text-(--c-primary)">›</span>
            </Link>
          </li>
        ))}
      </ul>
      <Link href="/tours" className="mt-3 block text-center text-[15px] font-bold text-(--c-primary) underline">
        Все туры
      </Link>
    </section>
  )
}
