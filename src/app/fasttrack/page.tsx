import type { Metadata, Viewport } from "next"
import Image from "@/components/img"
import Link from "next/link"
import { SiteMenu } from "@/components/site-menu"
import { comboUsd, FT_PRICE_USD, FT_ZONES } from "@/lib/fasttrack"
import entrance from "../../../public/fasttrack/terminal-entrance.jpg"
import front from "../../../public/fasttrack/terminal-front.jpg"
import hall from "../../../public/fasttrack/arrival-hall.jpg"
import { lora, manrope } from "../park/fonts"
import { PARK_WHATSAPP } from "../park/park-config"
import { CARD, Hero, HeroTitle, Pill, SERIF, SectionTitle } from "../park/ui"
import { WhatsAppIcon } from "../park/whatsapp-icon"
import { GuideItem, InfoTile, PhotoCredits } from "../phuquoc/pq-ui"
import { FasttrackForm } from "./fasttrack-form"

// Фаст-трек в аэропорту Фукуока (Виктор 2026-11-10): отдельная страница, как билеты
// в парки. Продаём фаст-трек, трансфер до отеля - бонус. Паспорта прикрепляют в форме.

export const metadata: Metadata = {
  metadataBase: new URL("https://victour.online"),
  title: "Фаст-трек в аэропорту Фукуока + трансфер до отеля | ВикТур",
  description:
    "Паспортный контроль без очереди в аэропорту Фукуока: встретим у выхода из самолёта и проведём по отдельному коридору. Трансфер до отеля бонусом. Паспорта можно прикрепить прямо в заявке.",
}

export const viewport: Viewport = { themeColor: "#e8eef5" }

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
  "--c-hero-fade": "rgb(10 30 55 / 0.6)",
  "--c-shadow-primary": "0 14px 36px rgb(22 64 107 / 0.3)",
} as React.CSSProperties

const STEPS = [
  { emoji: "🙋", title: "Встречаем с табличкой", text: "Сотрудник ждёт вас сразу после выхода из самолёта, с вашим именем на табличке." },
  { emoji: "🛂", title: "Паспортный контроль без очереди", text: "Проводим по отдельному коридору, пока остальные стоят в общей очереди после ночного рейса." },
  { emoji: "🧳", title: "Багаж и выход", text: "Помогаем забрать чемоданы и выводим к выходу, где ждёт водитель." },
  { emoji: "🚐", title: "Сразу в отель", text: "Машина с кондиционером только для вас. Без торга с таксистами и объяснения адреса." },
]

export default function FasttrackPage() {
  return (
    <div
      style={THEME}
      className={`${lora.variable} ${manrope.variable} flex flex-1 flex-col bg-(--c-bg) font-(family-name:--font-park-sans) text-(--c-ink)`}
    >
      <header className="fixed inset-x-0 top-0 z-30 bg-(--c-primary) pt-[env(safe-area-inset-top)] shadow-[0_4px_16px_rgb(0_0_0/0.15)]">
        <div className="mx-auto grid h-13 max-w-[560px] grid-cols-[1fr_auto_1fr] items-center px-3">
          <span />
          <Link href="/" className="font-heading text-[22px] font-medium text-white">
            ВикТур
          </Link>
          <div className="justify-self-end">
            <SiteMenu triggerClassName="text-white hover:bg-white/15 hover:text-white" accent="#16406b" />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[560px] pt-13 pb-16">
        <Hero image={entrance} alt="Вход в аэропорт Фукуока" pills={["ФУКУОК", "АЭРОПОРТ PQC"]} ctaLabel="Заказать" objectPosition="center 60%">
          <HeroTitle>
            Фаст-трек
            <br />
            <span className="text-(--c-on-primary)">без очереди</span>
            <br />
            на паспортном
          </HeroTitle>
        </Hero>

        <div className="relative z-10 -mt-12 space-y-3.5 px-4">
          <section className="rounded-lg bg-(--c-primary) p-5 text-white shadow-(--c-shadow-primary)">
            <p className="text-[16px] leading-snug font-medium text-balance opacity-95">
              Прилетаете, а вас уже ждут: <b className="text-(--c-on-primary)">паспортный контроль по отдельному коридору</b>,
              помощь с багажом и выход прямо к машине.
            </p>
            <div className="mt-3.5 flex items-end justify-between gap-3 border-t border-white/20 pt-3.5">
              <div>
                <span className="block text-[12px] font-bold tracking-[0.14em] text-(--c-on-primary)">ФАСТ-ТРЕК</span>
                <b className={`${SERIF} text-[40px] leading-none`}>${FT_PRICE_USD}</b>
                <span className="ml-1.5 text-[15px] opacity-90">за человека</span>
              </div>
              <span className="rounded-md bg-(--c-accent) px-3 py-1.5 text-[12px] font-extrabold tracking-wide">
                🚐 ТРАНСФЕР БОНУСОМ
              </span>
            </div>
          </section>

          <section className="grid grid-cols-2 gap-3">
            <InfoTile emoji="📎" title="Паспорта онлайн" note="прикрепите в заявке" />
            <InfoTile emoji="⏱" title="Без очереди" note="паспортный контроль" />
          </section>
        </div>

        <div className="mt-8 space-y-7 px-4">
          <section>
            <SectionTitle>Как это работает</SectionTitle>
            <ol className="space-y-2.5">
              {STEPS.map((s, i) => (
                <li key={s.title} className={`${CARD} flex gap-3 p-4`}>
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-(--c-bg-2) text-[20px]">{s.emoji}</span>
                  <div>
                    <b className="block text-[15px] leading-tight text-(--c-primary)">
                      {i + 1}. {s.title}
                    </b>
                    <p className="mt-1 text-[13.5px] leading-snug">{s.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <div className="relative h-[220px] overflow-hidden rounded-lg">
            <Image src={hall} alt="Зал аэропорта Фукуока" fill placeholder="blur" sizes="(max-width: 560px) 100vw, 560px" className="object-cover object-[center_40%]" />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgb(10_30_55/0.1)_30%,rgb(10_30_55/0.75)_100%)]" />
            <p className={`${SERIF} absolute inset-x-4 bottom-4 text-[24px] leading-tight font-bold text-white`}>
              Пока все в очереди, <span className="text-(--c-on-primary)">вы уже едете в отель</span>
            </p>
          </div>

          <section>
            <SectionTitle>Цены: фаст-трек + машина до отеля</SectionTitle>
            <div className={`${CARD} overflow-hidden`}>
              <table className="w-full text-[14px]">
                <thead>
                  <tr className="bg-(--c-primary) text-left text-white">
                    <th className="px-3 py-2.5 font-bold">Человек</th>
                    <th className="px-3 py-2.5 text-right font-bold">
                      Весь остров
                      <span className="block text-[11px] font-semibold text-(--c-on-primary)">центр, Онг Ланг, Лонг Бич, юг</span>
                    </th>
                    <th className="px-3 py-2.5 text-right font-bold">
                      Север
                      <span className="block text-[11px] font-semibold text-(--c-on-primary)">Бай Дай, Гань Дау</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <tr key={n} className="border-t border-(--c-border) first:border-t-0">
                      <td className="px-3 py-2.5 font-bold whitespace-nowrap">
                        {n} {n === 1 ? "человек" : "человека"}
                      </td>
                      <td className="px-3 py-2.5 text-right font-extrabold text-(--c-primary) tabular-nums">${comboUsd(n, FT_ZONES[0])}</td>
                      <td className="px-3 py-2.5 text-right font-extrabold text-(--c-primary) tabular-nums">${comboUsd(n, FT_ZONES[3])}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="border-t border-(--c-border) bg-(--c-tint) px-3 py-2.5 text-[13px] leading-snug text-(--c-tint-ink)">
                Цена за всю группу: фаст-трек на каждого и машина до отеля. Больше 5 человек - посчитаем в форме ниже.
                Без трансфера - <b>${FT_PRICE_USD} за человека</b>.
              </p>
            </div>
          </section>

          <div className="relative h-[200px] overflow-hidden rounded-lg">
            <Image src={front} alt="Терминал аэропорта Фукуока" fill placeholder="blur" sizes="(max-width: 560px) 100vw, 560px" className="object-cover object-[center_80%]" />
            <div className="absolute inset-x-4 top-4 flex items-center justify-between gap-2">
              <Pill>ВЫХОД ИЗ ТЕРМИНАЛА</Pill>
            </div>
            <div className="absolute inset-x-0 bottom-0 bg-[linear-gradient(180deg,transparent,rgb(10_30_55/0.8))] px-4 pt-10 pb-4 text-[14.5px] leading-snug font-semibold text-white">
              Водитель ждёт на выходе. Не нужно искать такси и торговаться.
            </div>
          </div>

          <section className="space-y-2.5">
            <SectionTitle>Частые вопросы</SectionTitle>
            <GuideItem emoji="📎" title="Зачем паспорта заранее" open>
              <p>
                Фаст-трек оформляется на конкретных людей, поэтому нужен разворот с фото каждого, кто летит. Прикрепите
                фото в форме: они уходят напрямую Виктору и не хранятся на сайте. Можно и позже в WhatsApp.
              </p>
            </GuideItem>
            <GuideItem emoji="🛬" title="Что, если рейс задержится">
              <p>
                Укажите номер рейса точно, по нему мы планируем встречу. Если рейс перенесли, сразу напишите нам в WhatsApp.
              </p>
            </GuideItem>
            <GuideItem emoji="👶" title="Летим с детьми">
              <p>Фаст-трек нужен на каждого пассажира, включая детей. Укажите всех в количестве человек.</p>
            </GuideItem>
            <GuideItem emoji="🏨" title="Отель далеко на севере">
              <p>
                Бай Дай и Гань Дау (Grand World, Vinpearl, Wyndham Grand) дальше от аэропорта, туда машина +$20. Остальные
                районы по одной цене.
              </p>
            </GuideItem>
          </section>

          <section id="order">
            <SectionTitle>Заявка на фаст-трек</SectionTitle>
            <FasttrackForm />
          </section>

          <a
            href={PARK_WHATSAPP.href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3.5 rounded-lg border-[3px] border-[#25d366] bg-white px-4 py-3.5 shadow-[0_8px_24px_rgb(60_60_40/0.14)] active:scale-[0.99]"
          >
            <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[#25d366]">
              <WhatsAppIcon className="size-7 fill-white" />
            </span>
            <span>
              <small className="block text-[12px] tracking-wider text-(--c-muted)">
                WHATSAPP · {PARK_WHATSAPP.name.toUpperCase()}
              </small>
              <b className={`block ${SERIF} text-[24px] leading-tight text-(--c-primary)`}>{PARK_WHATSAPP.display}</b>
            </span>
          </a>

          <PhotoCredits>
            Фото: вход в терминал - Michael Gerard Burns, public domain; терминал - Martin Lewison, CC BY 2.0; зал - Phương
            Huy, CC BY-SA 4.0. Wikimedia Commons.
          </PhotoCredits>
        </div>
      </main>
    </div>
  )
}
