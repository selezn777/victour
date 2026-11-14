import type { Metadata, Viewport } from "next"
import Image from "@/components/img"
import Link from "next/link"
import { SiteMenu } from "@/components/site-menu"
import { getUpcomingDepartures, type GroupDeparture } from "@/lib/group-departures"
import { formatDateShort } from "@/lib/group-schedule-parse"
import { findGroupProgram, GROUP_PROGRAMS, type GroupProgram } from "@/lib/group-tours"
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
  title: "Групповые туры на Фукуоке: расписание и свободные места | ВикТур",
  description:
    "Небольшие группы с нашими гидами: даты выездов, свободные места и запись онлайн. Дешевле индивидуального тура, тот же маршрут и забор от отеля.",
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
  const hero = GROUP_PROGRAMS[0]

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
            <Pill accent>ГРУППЫ ДО 12 ЧЕЛОВЕК</Pill>
          </div>
          <div className="absolute inset-x-4 bottom-14 text-white lg:inset-x-8 lg:bottom-8">
            <h1 className={`${SERIF} text-[40px] leading-[1.04] font-bold [text-shadow:0_4px_24px_rgb(0_0_0/0.35)] sm:text-[48px]`}>
              Групповые
              <br />
              <span className="text-(--c-on-primary)">выезды</span>
            </h1>
            <p className="mt-2 max-w-[460px] text-[16px] leading-snug font-medium [text-shadow:0_2px_12px_rgb(0_0_0/0.4)]">
              Наши маршруты и наши гиды, только компанией. Выбирайте дату и записывайтесь на свободные места.
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

        <div className="mt-9 space-y-10 px-4">
          <section id="schedule" className="scroll-mt-16">
            <SectionTitle>Ближайшие выезды</SectionTitle>
            <GroupSchedule departures={departures} links={links} />
          </section>

          <section>
            <SectionTitle>Групповые программы и гиды</SectionTitle>
            <div className="grid items-start gap-4 lg:grid-cols-3">
              {GROUP_PROGRAMS.map((p) => (
                <ProgramCard key={p.slug} p={p} dates={departures.filter((d) => d.tourSlug === p.slug).map((d) => d.date)} />
              ))}
            </div>
          </section>

          <section className="space-y-2.5 lg:max-w-[720px]">
            <SectionTitle>Частые вопросы</SectionTitle>
            <GuideItem emoji="✍️" title="Как записаться" open>
              <p>
                Выберите дату, нажмите «Записаться» и оставьте контакт. Это бесплатно. Виктор напишет вам, подтвердит место и
                скажет, во сколько и откуда забираем.
              </p>
            </GuideItem>
            <GuideItem emoji="👥" title="Чем группа отличается от индивидуального тура">
              <p>
                Маршрут и гиды те же, но едете вместе с другими туристами, поэтому дешевле. В индивидуальном туре машина и гид
                только ваши, а время и остановки подстраиваем под вас.
              </p>
            </GuideItem>
            <GuideItem emoji="📅" title="А если группа не соберётся">
              <p>Предупредим заранее и предложим другую дату или индивидуальный тур.</p>
            </GuideItem>
            <GuideItem emoji="👶" title="Можно с детьми">
              <p>Да. Напишите возраст детей в комментарии, подскажем, какой маршрут им будет интереснее.</p>
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
        </div>
      </main>
    </div>
  )
}

function ProgramCard({ p, dates }: { p: GroupProgram; dates: string[] }) {
  const uniq = [...new Set(dates)].slice(0, 6)
  return (
    <article id={p.slug} className={`${CARD} scroll-mt-16 overflow-hidden`}>
      <div className="relative h-[200px]">
        <Image src={p.heroImageUrl} alt={p.title} fill sizes="(max-width: 1024px) 100vw, 360px" className="object-cover" />
        <div className="absolute inset-x-0 bottom-0 bg-[linear-gradient(180deg,transparent,rgb(0_0_0/0.7))] px-4 pt-10 pb-3 text-white">
          <h3 className={`${SERIF} text-[22px] leading-tight font-bold`}>{p.title}</h3>
          <p className="mt-0.5 text-[13px] font-semibold opacity-90">
            {p.time} · {p.groupSize}
          </p>
        </div>
      </div>
      <div className="space-y-4 p-4">
        <p className="text-[14.5px] leading-snug">{p.pitch}</p>

        <div className="rounded-md bg-(--c-tint) p-3.5">
          <p className="text-[11px] font-bold tracking-[0.14em] text-(--c-tint-ink) uppercase">Кто ведёт</p>
          <b className="mt-1 block text-[15.5px] leading-tight text-(--c-primary)">{p.guide.name ?? p.guide.role}</b>
          {p.guide.name && <span className="block text-[12.5px] font-semibold text-(--c-tint-ink)">{p.guide.role}</span>}
          <p className="mt-1 text-[13.5px] leading-snug">{p.guide.about}</p>
        </div>

        <ul className="space-y-2.5">
          {p.highlights.map((h) => (
            <li key={h.title} className="text-[13.5px] leading-snug">
              <b className="block text-[14.5px] text-(--c-primary)">{h.title}</b>
              {h.text}
            </li>
          ))}
        </ul>

        <div>
          <p className="mb-1.5 text-[12px] font-bold tracking-[0.12em] text-(--c-primary-2) uppercase">Что включено</p>
          <ul className="space-y-1 text-[13.5px] leading-snug">
            {p.includes.map((i) => (
              <li key={i} className="flex gap-2">
                <span aria-hidden className="text-(--c-primary-2)">•</span>
                {i}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-end justify-between gap-3 border-t border-(--c-border) pt-3.5">
          <div>
            <span className="block text-[11px] font-bold tracking-[0.12em] text-(--c-muted)">ОТ</span>
            <b className={`${SERIF} text-[30px] leading-none text-(--c-primary)`}>${p.priceUsd}</b>
            <span className="ml-1 text-[13px] text-(--c-muted)">с человека</span>
          </div>
          {p.individualSlug && (
            <Link href={`/tours/${p.individualSlug}`} className="text-right text-[13px] font-semibold text-(--c-primary-2) underline underline-offset-2">
              маршрут с фото
            </Link>
          )}
        </div>
        <a
          href="#schedule"
          className="flex min-h-12 flex-wrap items-center justify-center gap-x-1.5 rounded-md bg-(--c-bg-2) px-3 py-2 text-center text-[14px] font-bold text-(--c-primary)"
        >
          {uniq.length ? <>Ближайшие даты: {uniq.map(formatDateShort).join(", ")}</> : "Даты скоро, спросите в WhatsApp"}
        </a>
      </div>
    </article>
  )
}
