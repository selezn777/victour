import type { Metadata, Viewport } from "next"
import Image from "@/components/img"
import { ProgramPhotos } from "./program-photos"
import Link from "next/link"
import { SiteMenu } from "@/components/site-menu"
import { getUpcomingDepartures, type GroupDeparture } from "@/lib/group-departures"
import { formatDateShort } from "@/lib/group-schedule-parse"
import {
  findGroupProgram,
  GROUP_CATEGORIES,
  GROUP_PHOTO_CREDITS,
  GROUP_PROGRAMS,
  groupPriceLabel,
  type GroupProgram,
} from "@/lib/group-tours"
import { lora, manrope } from "../park/fonts"
import { PARK_WHATSAPP } from "../park/park-config"
import { CARD, Pill, SERIF, SectionTitle, THEMES } from "../park/ui"
import { WhatsAppIcon } from "../park/whatsapp-icon"
import { GuideItem, InfoTile } from "../phuquoc/pq-ui"
import { GroupSchedule, type ScheduleTourLink } from "./group-schedule"

// Групповые выезды (Виктор 2026-11-14). Расписание приходит из админ-бота (/api/group-bot),
// бот после каждого изменения обновляет страницу; revalidate - запасной вариант.
// Индивидуальные туры остаются главными: на них ведёт отдельный блок наверху.

export const metadata: Metadata = {
  metadataBase: new URL("https://victour.online"),
  title: "Групповые экскурсии на Фукуоке: острова, сафари, шоу и поездки по Вьетнаму | ВикТур",
  description:
    "Групповые экскурсии с русскоговорящими гидами: острова и снорклинг, сафари, Сансет Таун, рыбалка, Камбоджа и Вьетнам. Цены, программы, даты выездов и запись онлайн.",
}

export const viewport: Viewport = { themeColor: THEMES.pq_vin["--c-bg"] }

export const revalidate = 60

function tourLink(d: GroupDeparture): ScheduleTourLink {
  const program = findGroupProgram(d.tourSlug)
  if (program) return { href: `#${program.slug}`, title: program.title }
  return d.tourSlug ? { href: `/tours/${d.tourSlug}`, title: d.tourTitle } : null
}

export default async function GroupsPage() {
  const departures = await getUpcomingDepartures()
  const links = Object.fromEntries(departures.map((d) => [d.id, tourLink(d)]))
  const hero = GROUP_PROGRAMS[1]

  return (
    <div
      style={THEMES.pq_vin as React.CSSProperties}
      className={`${lora.variable} ${manrope.variable} flex flex-1 flex-col bg-(--c-bg) font-(family-name:--font-park-sans) text-(--c-ink)`}
    >
      <header className="fixed inset-x-0 top-0 z-30 bg-(--c-primary) pt-[env(safe-area-inset-top)] shadow-[0_4px_16px_rgb(0_0_0/0.15)]">
        <div className="mx-auto grid h-13 max-w-[1080px] grid-cols-[1fr_auto_1fr] items-center px-3">
          <span />
          <Link href="/" className="font-heading text-[22px] font-medium text-white">
            ВикТур
          </Link>
          <div className="justify-self-end">
            <SiteMenu triggerClassName="text-white hover:bg-white/15 hover:text-white" accent={THEMES.pq_vin["--c-primary"]} />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1080px] pt-13 pb-16">
        <section className="relative h-[420px] overflow-hidden sm:h-[460px] lg:mx-4 lg:mt-4 lg:h-[420px] lg:rounded-lg">
          <Image src={hero.heroImageUrl} alt="Групповой выезд на Фукуоке" fill priority sizes="(max-width: 1080px) 100vw, 1080px" className="object-cover object-[center_45%]" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgb(0_0_0/0.18)_0%,rgb(0_0_0/0.05)_35%,var(--c-hero-fade)_75%,var(--c-bg)_100%)] lg:bg-[linear-gradient(180deg,rgb(0_0_0/0.15)_0%,rgb(0_0_0/0.1)_40%,var(--c-hero-fade)_100%)]" />
          <div className="absolute inset-x-4 top-4 flex items-center justify-between gap-2 lg:inset-x-6">
            <Pill>ФУКУОК</Pill>
            <Pill accent>{GROUP_PROGRAMS.length} ПРОГРАММ</Pill>
          </div>
          <div className="absolute inset-x-4 bottom-14 text-white lg:inset-x-8 lg:bottom-8">
            <h1 className={`${SERIF} text-[40px] leading-[1.04] font-bold [text-shadow:0_4px_24px_rgb(0_0_0/0.35)] sm:text-[48px]`}>
              Групповые
              <br />
              <span className="text-(--c-on-primary)">экскурсии</span>
            </h1>
            <p className="mt-2 max-w-[460px] text-[16px] leading-snug font-medium [text-shadow:0_2px_12px_rgb(0_0_0/0.4)]">
              Острова, сафари, шоу и поездки по Вьетнаму с русскоговорящими гидами. Выбирайте дату и записывайтесь на свободные
              места.
            </p>
            <a
              href="#schedule"
              className="mt-4 inline-flex h-12 items-center gap-2 rounded-md bg-(--c-accent) px-6 text-[15px] font-bold text-white shadow-[0_8px_20px_rgb(0_0_0/0.25)]"
            >
              Смотреть даты <span aria-hidden>⬇️</span>
            </a>
          </div>
        </section>

        <div className="relative z-10 -mt-8 grid gap-3 px-4 lg:mt-5 lg:grid-cols-[1.4fr_1fr_1fr]">
          <Link
            href="/tours"
            className="flex items-center gap-3 rounded-lg bg-(--c-primary) p-4 text-white shadow-(--c-shadow-primary) active:scale-[0.99]"
          >
            <span className="text-[26px] leading-none">🚐</span>
            <span className="min-w-0 flex-1 text-[14.5px] leading-snug">
              <b className="block text-[16px] text-(--c-on-primary)">Хотите только своей компанией?</b>
              Индивидуальные туры: своя машина, свой гид, своё время.
            </span>
            <span aria-hidden className="text-[20px]">→</span>
          </Link>
          <InfoTile emoji="💸" title="Дешевле индивидуального" note="платите только за себя" />
          <InfoTile emoji="🏨" title="Забираем от отеля" note="и привозим обратно" />
        </div>

        <nav className="mt-5 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none]">
          {GROUP_CATEGORIES.map((c) => (
            <a
              key={c.id}
              href={`#cat-${c.id}`}
              className="shrink-0 rounded-full border border-(--c-border) bg-white px-4 py-2 text-[13.5px] font-bold text-(--c-primary)"
            >
              {c.title}
            </a>
          ))}
        </nav>

        <div className="mt-9 space-y-10 px-4">
          <section id="schedule" className="scroll-mt-16">
            <SectionTitle>Ближайшие выезды</SectionTitle>
            <GroupSchedule departures={departures} links={links} />
          </section>

          {GROUP_CATEGORIES.map((c) => (
            <section key={c.id} id={`cat-${c.id}`} className="scroll-mt-16">
              <SectionTitle>{c.title}</SectionTitle>
              <p className="-mt-2 mb-3 ml-1 text-[13px] text-(--c-muted)">{c.note}</p>
              <div className="grid items-start gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {GROUP_PROGRAMS.filter((p) => p.category === c.id).map((p) => (
                  <ProgramCard key={p.slug} p={p} dates={departures.filter((d) => d.tourSlug === p.slug).map((d) => d.date)} />
                ))}
              </div>
            </section>
          ))}

          <section className="space-y-2.5 lg:max-w-[720px]">
            <SectionTitle>Частые вопросы</SectionTitle>
            <GuideItem emoji="✍️" title="Как записаться" open>
              <p>
                Выберите дату, нажмите «Записаться» и оставьте контакт. Виктор напишет вам, подтвердит место и скажет, во сколько
                и откуда забираем. Место закрепляется после оплаты.
              </p>
            </GuideItem>
            <GuideItem emoji="💳" title="Оплата и возврат" open>
              <p>
                Групповые туры - только по 100% предоплате: места в катере, автобусе и билеты выкупаются заранее на каждого. При
                неявке или отказе в день выезда деньги не возвращаются. Если группу отменяем мы - вернём всё или перенесём на
                другую дату.
              </p>
            </GuideItem>
            <GuideItem emoji="👥" title="Чем группа отличается от индивидуального тура">
              <p>
                В группе едете вместе с другими туристами по готовой программе, поэтому дешевле. В индивидуальном туре машина и
                гид только ваши, а время и остановки подстраиваем под вас.
              </p>
            </GuideItem>
            <GuideItem emoji="📅" title="А если группа не соберётся">
              <p>Предупредим заранее и предложим другую дату или индивидуальный тур.</p>
            </GuideItem>
            <GuideItem emoji="👶" title="Можно с детьми">
              <p>
                Да. Детская цена у каждой программы своя, обычно для роста 100-140 см. Напишите возраст детей в комментарии,
                подскажем, какой маршрут им будет интереснее.
              </p>
            </GuideItem>
          </section>

          <a
            href={PARK_WHATSAPP.href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3.5 rounded-lg border-[3px] border-[#25d366] bg-white px-4 py-3.5 shadow-[0_8px_24px_rgb(60_60_40/0.14)] active:scale-[0.99] lg:max-w-[520px]"
          >
            <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[#25d366]">
              <WhatsAppIcon className="size-7 fill-white" />
            </span>
            <span>
              <small className="block text-[12px] tracking-wider text-(--c-muted)">WHATSAPP · {PARK_WHATSAPP.name.toUpperCase()}</small>
              <b className={`block ${SERIF} text-[24px] leading-tight text-(--c-primary)`}>{PARK_WHATSAPP.display}</b>
            </span>
          </a>

          <p className="px-1 text-[11px] leading-snug text-(--c-muted)">{GROUP_PHOTO_CREDITS}</p>
        </div>
      </main>
    </div>
  )
}

function List({ items }: { items: string[] }) {
  return (
    <ul className="space-y-1 text-[13.5px] leading-snug">
      {items.map((i) => (
        <li key={i} className="flex gap-2">
          <span aria-hidden className="text-(--c-primary-2)">•</span>
          {i}
        </li>
      ))}
    </ul>
  )
}

// Компактная карточка: фото лентой, название, время и цена сразу, программа и что включено - по тапу
function ProgramCard({ p, dates }: { p: GroupProgram; dates: string[] }) {
  const uniq = [...new Set(dates)].slice(0, 6)
  const ask = `${PARK_WHATSAPP.href}?text=${encodeURIComponent(`Здравствуйте! Хочу в групповой тур «${p.title}». Какие ближайшие даты?`)}`
  return (
    <article id={p.slug} className={`${CARD} scroll-mt-16 overflow-hidden`}>
      <ProgramPhotos photos={[p.heroImageUrl, ...p.photos]} title={p.title} />
      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className={`${SERIF} text-[21px] leading-tight font-bold text-(--c-primary)`}>{p.title}</h3>
            <p className="mt-0.5 text-[13px] font-semibold text-(--c-muted)">🕘 {p.time}</p>
          </div>
          <div className="shrink-0 text-right">
            <b className={`${SERIF} block text-[26px] leading-none text-(--c-primary)`}>{groupPriceLabel(p)}</b>
            {p.priceUsd !== null && <span className="text-[12px] text-(--c-muted)">взрослый</span>}
          </div>
        </div>
        {p.childPrice && <p className="-mt-1 text-[12.5px] text-(--c-muted)">👶 {p.childPrice}</p>}
        <p className="text-[14px] leading-snug">{p.pitch}</p>

        <details className="group rounded-md bg-(--c-bg) open:pb-3">
          <summary className="flex cursor-pointer list-none items-center justify-between px-3 py-2.5 text-[14px] font-bold text-(--c-primary) [&::-webkit-details-marker]:hidden">
            Программа и что включено
            <span className="text-[18px] transition-transform group-open:rotate-90">›</span>
          </summary>
          <div className="space-y-3 px-3">
            <List items={p.program} />
            <div>
              <p className="mb-1 text-[11.5px] font-bold tracking-[0.12em] text-(--c-primary-2) uppercase">Включено</p>
              <List items={p.includes} />
            </div>
            {p.notes?.length ? (
              <div className="space-y-1 text-[12.5px] leading-snug text-(--c-muted)">
                {p.notes.map((n) => (
                  <p key={n}>{n}</p>
                ))}
              </div>
            ) : null}
          </div>
        </details>

        {uniq.length ? (
          <a
            href="#schedule"
            className="flex min-h-12 flex-wrap items-center justify-center gap-x-1.5 rounded-md bg-(--c-accent) px-3 py-2 text-center text-[14px] font-bold text-white"
          >
            Даты: {uniq.map(formatDateShort).join(", ")}
          </a>
        ) : (
          <a
            href={ask}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-12 items-center justify-center gap-2 rounded-md bg-(--c-bg-2) px-3 py-2 text-center text-[14px] font-bold text-(--c-primary)"
          >
            <WhatsAppIcon className="size-4 fill-[#25d366]" /> Узнать даты и записаться
          </a>
        )}
      </div>
    </article>
  )
}
