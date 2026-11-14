import type { Metadata, Viewport } from "next"
import Image from "@/components/img"
import Link from "next/link"
import { SiteMenu } from "@/components/site-menu"
import { FT_PRICE_USD, FT_ZONES } from "@/lib/fasttrack"
import entrance from "../../../public/fasttrack/terminal-entrance.jpg"
import { lora, manrope } from "../park/fonts"
import { PARK_WHATSAPP } from "../park/park-config"
import { SERIF } from "../park/ui"
import { WhatsAppIcon } from "../park/whatsapp-icon"
import { FasttrackWizard } from "./fasttrack-wizard"

// Фаст-трек в аэропорту Фукуока (Виктор 2026-11-14): «чуть-чуть инфы и сразу форма».
// Короткое описание, кнопка «Приступить к заполнению», дальше пошаговый мастер.
// Заявка с паспортами и ваучером уходит Виктору в админ-бот и пишется в CRM.

export const metadata: Metadata = {
  metadataBase: new URL("https://victour.online"),
  title: "Фаст-трек в аэропорту Фукуока + трансфер до отеля | ВикТур",
  description:
    "Паспортный контроль без очереди в аэропорту Фукуока, $32 с человека. Трансфер до отеля по себестоимости с заездом в нормальный обменник. Заявка за пару минут, паспорта можно прикрепить сразу.",
}

export const viewport: Viewport = { themeColor: "#16406b" }

const THEME = {
  "--c-primary": "#16406b",
  "--c-primary-2": "#1f5d96",
  "--c-bg": "#e8eef5",
  "--c-bg-2": "#d3deeb",
  "--c-ink": "#14243a",
  "--c-accent": "#e8892b",
  "--c-on-primary": "#ffd9a3",
  "--c-muted": "#55657a",
  "--c-tint": "#fdf2e4",
  "--c-tint-ink": "#8a4d14",
  "--c-border": "#c3d0df",
} as React.CSSProperties

const INCLUDED = [
  { emoji: "🙋", text: "Встречаем у выхода из самолёта с табличкой" },
  { emoji: "🛂", text: "Паспортный контроль по отдельному коридору, без очереди" },
  { emoji: "🧳", text: "Получаете багаж и выходите, машина уже ждёт" },
]

const H2 = "text-[13px] font-bold tracking-[0.1em] text-(--c-primary-2) uppercase"

function Intro() {
  return (
    <div className="pb-6">
      <div className="relative h-[190px] overflow-hidden sm:h-[230px] sm:rounded-b-lg">
        <Image
          src={entrance}
          alt="Вход в аэропорт Фукуока"
          fill
          priority
          placeholder="blur"
          sizes="(max-width: 600px) 100vw, 600px"
          className="object-cover object-[center_60%]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgb(10_30_55/0.05)_20%,rgb(10_30_55/0.8)_100%)]" />
        <div className="absolute inset-x-4 bottom-4 text-white">
          <span className="text-[12px] font-bold tracking-[0.16em] text-(--c-on-primary)">АЭРОПОРТ ФУКУОКА · PQC</span>
          <h1 className={`${SERIF} mt-1 text-[30px] leading-[1.05] font-bold sm:text-[36px]`}>Фаст-трек без очереди</h1>
        </div>
      </div>

      <div className="space-y-3.5 px-4 pt-4">
        <section className="flex items-center justify-between gap-4 rounded-[8px] bg-(--c-primary) px-4 py-3.5 text-white">
          <p className="text-[15px] leading-snug opacity-95">
            Пока все стоят в очереди после перелёта, <b className="text-(--c-on-primary)">вы уже едете в отель</b>
          </p>
          <div className="shrink-0 text-right">
            <b className={`${SERIF} block text-[34px] leading-none`}>${FT_PRICE_USD}</b>
            <span className="text-[13px] opacity-85">с человека</span>
          </div>
        </section>

        <section className="rounded-[8px] border border-(--c-border) bg-white px-4 py-3">
          <h2 className={H2}>Что входит</h2>
          <ul className="mt-2 space-y-2">
            {INCLUDED.map((x) => (
              <li key={x.text} className="flex gap-2.5 text-[15px] leading-snug">
                <span className="w-6 shrink-0 text-center">{x.emoji}</span>
                {x.text}
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-[8px] border border-[#f0c99a] bg-(--c-tint) px-4 py-3 text-(--c-tint-ink)">
          <b className="block text-[16px]">💱 По дороге заезжаем в нормальный обменник</b>
          <p className="mt-1 text-[14.5px] leading-snug">
            Наш трансфер всегда останавливается у проверенного обменника. Спокойно меняете деньги по хорошему курсу, а не в
            аэропорту.
          </p>
        </section>

        <section className="rounded-[8px] border border-(--c-border) bg-white px-4 py-3">
          <h2 className={H2}>Машина до отеля по себестоимости</h2>
          <ul className="mt-2 divide-y divide-(--c-border)">
            {FT_ZONES.map((z) => (
              <li key={z.id} className="flex items-baseline justify-between gap-3 py-2 first:pt-0 last:pb-0">
                <span className="min-w-0">
                  <b className="block text-[15px]">{z.label}</b>
                  <span className="text-[13px] leading-snug text-(--c-muted)">{z.note}</span>
                </span>
                <b className="shrink-0 text-[18px] text-(--c-primary) tabular-nums">${z.carUsd}</b>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-[13px] text-(--c-muted)">Цена за машину, не за человека.</p>
        </section>

        <section className="rounded-[8px] border border-(--c-border) bg-white px-4 py-3 text-[15px] leading-snug">
          <h2 className={H2}>Оплата</h2>
          <p className="mt-1.5">
            Небольшая предоплата на российскую карту, чтобы на месте осталась ровная сумма одной купюрой: из $120 предоплата{" "}
            <b>$20</b>, а $100 наличными при встрече. Нет российской карты? Можно оплатить всё на месте, но отказаться после
            оформления всё равно нельзя: данные заранее передаются на пограничный контроль.
          </p>
        </section>

        <p className="px-1 text-[14px] leading-snug text-(--c-muted)">
          Заявка займёт пару минут: рейс, отель и фото паспортов. Паспорта можно прислать и позже.
        </p>

        <a
          href={PARK_WHATSAPP.href}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 py-1 text-[14px] font-semibold text-(--c-primary)"
        >
          <WhatsAppIcon className="size-4 fill-[#25d366]" /> Вопросы? WhatsApp {PARK_WHATSAPP.display}
        </a>

        <p className="px-1 text-[11px] leading-snug text-(--c-muted)">
          Фото: вход в терминал, Michael Gerard Burns, public domain, Wikimedia Commons.
        </p>
      </div>
    </div>
  )
}

export default function FasttrackPage() {
  return (
    <div
      style={THEME}
      className={`${lora.variable} ${manrope.variable} flex flex-1 flex-col bg-(--c-bg) font-(family-name:--font-park-sans) text-(--c-ink)`}
    >
      <header className="fixed inset-x-0 top-0 z-30 bg-(--c-primary) pt-[env(safe-area-inset-top)] shadow-[0_4px_16px_rgb(0_0_0/0.15)]">
        <div className="mx-auto grid h-13 max-w-[600px] grid-cols-[1fr_auto_1fr] items-center px-3">
          <span />
          <Link href="/" className="font-heading text-[22px] font-medium text-white">
            ВикТур
          </Link>
          <div className="justify-self-end">
            <SiteMenu triggerClassName="text-white hover:bg-white/15 hover:text-white" accent="#16406b" />
          </div>
        </div>
      </header>

      <main className="mx-auto flex min-h-dvh w-full max-w-[600px] flex-col pt-[calc(3.25rem+env(safe-area-inset-top))]">
        <FasttrackWizard intro={<Intro />} />
      </main>
    </div>
  )
}
