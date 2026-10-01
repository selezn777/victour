import Image from "next/image"
import Link from "next/link"
import cablecar from "../../../public/park/cablecar.jpg"
import parkView from "../../../public/park/park.jpg"
import { DESTINATIONS } from "./park-config"
import {
  BookingConditions,
  CARD,
  Hero,
  HeroTitle,
  Pill,
  SERIF,
  SectionTitle,
  TicketCard,
} from "./ui"

const park = DESTINATIONS.park
const pkg = (id: string) => park.packages.find((p) => p.id === id)!

// Группы доп. услуг для витрины — из того же конфига, что и форма
const extraGroups = park.extras.reduce<Record<string, typeof park.extras>>((acc, e) => {
  ;(acc[e.group ?? ""] ??= []).push(e)
  return acc
}, {})

export function VinWondersContent() {
  return (
    <>
      <Hero
        image={cablecar}
        alt="Канатная дорога в Нячанге"
        pills={["НЯЧАНГ", "ТРАНСФЕР В ПОДАРОК"]}
        objectPosition="center 40%"
      >
        <HeroTitle>
          Официальные
          <br />
          билеты в парк
          <br />
          <span className="text-(--c-on-primary)">без переплат!</span>
        </HeroTitle>
      </Hero>

      <div className="relative z-10 -mt-12 space-y-3.5 px-4">
        <section className="rounded-[28px] bg-(--c-primary) p-5 text-white shadow-(--c-shadow-primary)">
          <p className="text-[16px] leading-snug font-medium text-balance opacity-95">
            Цены — <b className="text-(--c-on-primary)">такие же, как официальные.</b> Но только у
            нас абсолютный эксклюзив:
          </p>
          <div className="mt-3.5 flex gap-3 border-t border-white/20 pt-3.5">
            <span className="text-[32px] leading-none">🎁</span>
            <div>
              <h3 className="text-[16px] leading-tight font-extrabold tracking-wide text-balance text-(--c-on-primary)">
                БЕСПЛАТНЫЙ ТРАНСФЕР ОТ ОТЕЛЯ
              </h3>
              <p className="mt-1 text-[15px] leading-snug text-pretty">
                и сопровождение до входа к канатной дороге
              </p>
            </div>
          </div>
          <div className="mt-3.5 rounded-2xl bg-white/12 px-3.5 py-3 text-[14px] leading-snug">
            💳 Оплата билета — <b className="text-(--c-on-primary)">прямо в официальной кассе</b>{" "}
            после встречи с водителем
          </div>
          <p className={`${SERIF} mt-3.5 text-[18px] font-bold text-(--c-on-primary) italic`}>
            Такого больше не предлагает никто!
          </p>
        </section>

        <section className="grid grid-cols-2 gap-3">
          <TicketCard label="Пакет на 1 день" price={pkg("1day").price} secondary={pkg("1day").childPrice}>
            <div className="rounded-xl border-2 border-dashed border-(--c-accent) bg-(--c-tint) px-2.5 py-2 font-bold text-balance text-(--c-tint-ink)">
              🍽 + ваучер 150K ₫ на рестораны парка
            </div>
          </TicketCard>
          <TicketCard label="Пакет на 2 дня" price={pkg("2days").price} secondary={pkg("2days").childPrice}>
            <p className="text-(--c-muted)">
              <b className="text-(--c-ink)">Второй день — любой</b> в течение 14 дней
            </p>
            <div className="rounded-xl bg-[#f3f3f1] px-2.5 py-2 text-[11.5px] text-(--c-muted)">
              Ваучер на 2-дневные билеты не распространяется
            </div>
          </TicketCard>
        </section>

        <section className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2.5 rounded-[20px] bg-(--c-bg-2) p-3.5">
            <span className="text-[24px] leading-none">🚡</span>
            <div>
              <b className="block text-[13.5px] leading-tight font-extrabold text-(--c-primary)">
                Канатка включена
              </b>
              <span className="block text-[12px] leading-tight text-(--c-muted)">
                без скрытых доплат
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2.5 rounded-[20px] bg-(--c-bg-2) p-3.5">
            <span className="text-[24px] leading-none">🕗</span>
            <div>
              <b className="block text-[13.5px] leading-tight font-extrabold whitespace-nowrap text-(--c-primary)">
                8:00 – 22:00
              </b>
              <span className="block text-[12px] leading-tight text-(--c-muted)">часы работы</span>
            </div>
          </div>
        </section>
      </div>

      {/* Вторая «страница» флаера — с фото парка */}
      <div className="relative mt-8 h-[200px] overflow-hidden">
        <Image
          src={parkView}
          alt="Вид на парк VinWonders"
          fill
          placeholder="blur"
          sizes="(max-width: 560px) 100vw, 560px"
          className="object-cover object-[center_60%]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgb(15_40_34/0.35)_0%,rgb(15_40_34/0.55)_50%,rgb(15_40_34/0.35)_75%,var(--c-bg)_100%)]" />
        <div className="absolute inset-x-4 top-4 flex items-center justify-between gap-2">
          <Pill>НЯЧАНГ</Pill>
          <Pill accent>БРОНЬ БЕСПЛАТНО</Pill>
        </div>
        <h2
          className={`${SERIF} absolute inset-x-4 top-16 text-[34px] leading-[1.05] font-bold text-white [text-shadow:0_4px_24px_rgb(0_0_0/0.35)]`}
        >
          Билеты <span className="text-(--c-on-primary)">и бронирование</span>
        </h2>
      </div>

      <div className="relative z-10 -mt-6 space-y-7 px-4">
        <section>
          <SectionTitle>Категории билетов</SectionTitle>
          <div className="grid auto-rows-fr grid-cols-1 gap-3 min-[400px]:grid-cols-2">
            {park.guests.map((c) => (
              <div
                key={c.key}
                className={`flex items-center gap-2.5 px-3.5 py-3 ${
                  c.free
                    ? "rounded-[20px] border-2 border-dashed border-(--c-accent) bg-(--c-tint)"
                    : CARD
                }`}
              >
                <span className="text-[26px] leading-none">{c.emoji}</span>
                <div>
                  <b className="block text-[14.5px] leading-tight text-(--c-primary)">{c.title}</b>
                  {c.free ? (
                    <span className="mt-0.5 block text-[14px] leading-tight font-extrabold text-(--c-tint-ink)">
                      {c.note}
                    </span>
                  ) : (
                    <span className="mt-0.5 block text-[12.5px] leading-tight text-(--c-muted)">
                      {c.price && <b className="text-(--c-ink)">{c.price}</b>}
                      {c.price && " · "}
                      {c.note}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <SectionTitle>Что входит в билет</SectionTitle>
          <div className={`${CARD} space-y-2.5 p-4 text-[13.5px] leading-snug`}>
            <p>
              ✅ Канатная дорога туда-обратно, <b className="text-(--c-primary)">все 6 зон</b>, все
              аттракционы, аквапарк, океанариум, зоопарк и все шоу, включая{" "}
              <b className="text-(--c-primary)">Tata Show</b>.
            </p>
            <p className="text-(--c-muted)">
              ➖ Не входит: зиплайн, еда, шкафчики, Premium-места на Tata Show.
            </p>
          </div>
        </section>

        <section>
          <SectionTitle>Дополнительно</SectionTitle>
          <div className={`${CARD} divide-y divide-(--c-bg-2) px-4`}>
            {Object.entries(extraGroups).map(([group, items]) => (
              <div key={group} className="py-3">
                <b className="block text-[14.5px] text-(--c-primary)">{group}</b>
                <ul className="mt-1.5 space-y-1">
                  {items.map((e) => (
                    <li key={e.key} className="flex justify-between gap-3 text-[13px] leading-snug">
                      <span>{e.label}</span>
                      <span className="shrink-0 font-bold whitespace-nowrap">{e.price}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <p className="py-3 text-[12.5px] leading-snug text-(--c-muted)">
              Цены за 1 человека. На острове можно купить чуть дешевле, но придётся искать
              отдельную кассу Fast Pass и стоять в очереди. Мы покупаем заранее — в парке вы сразу
              идёте кататься. Отметьте нужное в форме ниже.
            </p>
          </div>
          <div className={`${CARD} mt-2.5 p-4`}>
            <div className="mb-1.5 flex items-center gap-2 text-[16px] font-extrabold text-(--c-primary)">
              <span className="text-[22px]">🚌</span>Обратная дорога
            </div>
            <p className="text-[13.5px] leading-snug">
              <b className="text-(--c-primary)">Бесплатный общий автобус №23</b> — идёт по первой
              линии и удобно развозит посетителей.
            </p>
          </div>
        </section>

        <Link
          href="/park/pamyatka"
          className="flex items-center gap-3.5 rounded-[20px] border-2 border-(--c-primary) bg-white p-4 active:scale-[0.99]"
        >
          <span className="text-[30px] leading-none">📄</span>
          <span className="flex-1">
            <b className="block text-[15px] leading-tight text-(--c-primary)">
              Памятка VinWonders 2026
            </b>
            <span className="mt-0.5 block text-[12.5px] leading-snug text-(--c-muted)">
              Все рестораны для ваучера, шоу по часам, правила горок. Открыть или скачать PDF
            </span>
          </span>
          <span className="text-[20px] text-(--c-primary)">›</span>
        </Link>

        <BookingConditions />
      </div>
    </>
  )
}
