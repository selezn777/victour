import Image from "@/components/img"
import Link from "next/link"
import giraffe from "../../../public/phuquoc/safari-giraffe-buggy.webp"
import vinwonders from "../../../public/phuquoc/vinwonders.jpg"
import { DESTINATIONS } from "../park/park-config"
import { BookingConditions, CARD, Hero, HeroTitle, Pill, SERIF, SectionTitle, TicketCard } from "../park/ui"
import { GuideItem, InfoTile, PhotoCredits } from "./pq-ui"

const dest = DESTINATIONS.pq_vin
const pkg = (id: string) => dest.packages.find((p) => p.id === id)!
const minTransfer = Math.min(...(dest.districts ?? []).map((d) => d.priceUsd))

export function PqVinContent() {
  return (
    <>
      <Hero
        image={vinwonders}
        alt="VinWonders Фукуок с высоты"
        pills={["ФУКУОК", "БИЛЕТЫ + ТРАНСФЕР"]}
        ctaLabel="Забронировать"
        objectPosition="center 45%"
      >
        <HeroTitle>
          VinWonders
          <br />и Сафари
          <br />
          <span className="text-(--c-on-primary)">без очереди в кассу</span>
        </HeroTitle>
      </Hero>

      <div className="relative z-10 -mt-12 space-y-3.5 px-4">
        <section className="rounded-[28px] bg-(--c-primary) p-5 text-white shadow-(--c-shadow-primary)">
          <p className="text-[16px] leading-snug font-medium text-balance opacity-95">
            Билеты <b className="text-(--c-on-primary)">по официальным ценам</b>, выкупаем заранее:
            приезжаете и сразу идёте на вход.
          </p>
          <div className="mt-3.5 flex gap-3 border-t border-white/20 pt-3.5">
            <span className="text-[32px] leading-none">🚐</span>
            <div>
              <h3 className="text-[16px] leading-tight font-extrabold tracking-wide text-balance text-(--c-on-primary)">
                ЛИЧНЫЙ ТРАНСФЕР ОТ ${minTransfer}
              </h3>
              <p className="mt-1 text-[15px] leading-snug text-pretty">
                туда-обратно за всю машину, по себестоимости. Заберём во сколько удобно вам.
              </p>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-2 gap-3">
          <TicketCard label="VinWonders" price={pkg("vin").price} secondary={pkg("vin").childPrice} />
          <TicketCard label="Сафари днём" price={pkg("safari").price} secondary={pkg("safari").childPrice} />
        </section>
        <TicketCard label="Комбо: оба парка в один день" price={pkg("combo").price} secondary={pkg("combo").childPrice}>
          <div className="rounded-xl border-2 border-dashed border-(--c-accent) bg-(--c-tint) px-2.5 py-2 font-bold text-balance text-(--c-tint-ink)">
            Выгоднее, чем по отдельности. Утром сафари, после обеда VinWonders
          </div>
        </TicketCard>

        <section className="grid grid-cols-2 gap-3">
          <InfoTile emoji="🦒" title="8:30 – 16:00" note="сафари" />
          <InfoTile emoji="🎢" title="10:00 – 19:30" note="VinWonders" />
        </section>
      </div>

      <div className="relative mt-8 h-[200px] overflow-hidden">
        <Image
          src={giraffe}
          alt="Жираф у машины в Vinpearl Safari"
          fill
          placeholder="blur"
          sizes="(max-width: 560px) 100vw, 560px"
          className="object-cover object-[center_35%]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgb(60_25_8/0.35)_0%,rgb(60_25_8/0.55)_50%,rgb(60_25_8/0.35)_75%,var(--c-bg)_100%)]" />
        <div className="absolute inset-x-4 top-4 flex items-center justify-between gap-2">
          <Pill>ФУКУОК</Pill>
          <Pill accent>БРОНЬ БЕСПЛАТНО</Pill>
        </div>
        <h2
          className={`${SERIF} absolute inset-x-4 top-16 text-[34px] leading-[1.05] font-bold text-white [text-shadow:0_4px_24px_rgb(0_0_0/0.35)]`}
        >
          Что вас <span className="text-(--c-on-primary)">ждёт</span>
        </h2>
      </div>

      <div className="relative z-10 -mt-6 space-y-7 px-4">
        <section className="space-y-3">
          <div className={`${CARD} overflow-hidden`}>
            <div className="space-y-2 p-4 text-[13.5px] leading-snug">
              <b className="block text-[16px] text-(--c-primary)">🦁 Vinpearl Safari, самый большой сафари-парк Вьетнама</b>
              <p>
                Больше 90 видов животных. Сначала гуляете по зоопарку открытого типа, потом
                садитесь в автобус и едете через зону, где звери ходят свободно: зебры, бенгальские
                тигры, белые носороги, жирафы прямо у окна.
              </p>
              <p>
                Шоу животных в 10:00 и в 14:00 (дневного нет по вторникам и средам). Утром звери
                активнее, поэтому сафари лучше ставить первым.
              </p>
              <p>
                Билеты продаём на дневное сафари. Ночное сафари с подсветкой - только в нашем туре
                <Link href="/tours/phuquoc-vecher-safari" className="font-bold text-(--c-primary) underline">«Вечерний Фукуок»</Link>.
              </p>
            </div>
          </div>

          <div className={`${CARD} space-y-2 p-4 text-[13.5px] leading-snug`}>
            <b className="block text-[16px] text-(--c-primary)">🎢 VinWonders, самый большой тематический парк страны</b>
            <p>
              Шесть зон: горки и аттракционы, «европейский» бульвар, аквапарк, океанариум в
              Дворце Морского царя с кормлением рыб в 11:00, детские зоны.
            </p>
            <p>
              Вечером, в 18:45, шоу Once с фонтанами, огнём и светом: ради него стоит остаться до
              конца.
            </p>
          </div>
        </section>

        <section>
          <SectionTitle>Категории билетов</SectionTitle>
          <div className="grid auto-rows-fr grid-cols-1 gap-3 min-[400px]:grid-cols-2">
            {dest.guests.map((c) => (
              <div
                key={c.key}
                className={`flex items-center gap-2.5 px-3.5 py-3 ${
                  c.free ? "rounded-[20px] border-2 border-dashed border-(--c-accent) bg-(--c-tint)" : CARD
                }`}
              >
                <span className="text-[26px] leading-none">{c.emoji}</span>
                <div>
                  <b className="block text-[14.5px] leading-tight text-(--c-primary)">{c.title}</b>
                  <span
                    className={`mt-0.5 block leading-tight ${
                      c.free ? "text-[14px] font-extrabold text-(--c-tint-ink)" : "text-[12.5px] text-(--c-muted)"
                    }`}
                  >
                    {c.note}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-2.5">
          <SectionTitle>Путеводитель</SectionTitle>
          <GuideItem emoji="🗺" title="Как построить день" open>
            <p>
              <b>Комбо:</b> выезд около 8:00, сафари с открытия (8:30), обед, после 14:00
              VinWonders до шоу в 18:45, домой около 20:00.
            </p>
            <p>
              <b>Один парк:</b> на сафари достаточно 3-4 часов, на VinWonders закладывайте весь
              день.
            </p>
          </GuideItem>
          <GuideItem emoji="🎒" title="Что взять с собой">
            <p>Купальник и полотенце (в VinWonders есть аквапарк), крем от солнца, головной убор, воду.</p>
            <p>Пенсионерам 60+ обязательно паспорт, иначе льготный билет не дадут.</p>
            <p>С малышами до 6 лет удобно взять коляску: парки большие.</p>
          </GuideItem>
          <GuideItem emoji="🍜" title="Где поесть">
            <p>
              В обоих парках есть кафе и рестораны: вьетнамская кухня, фастфуд, пицца. Цены выше
              городских, но без сюрпризов. Воду можно пронести с собой.
            </p>
          </GuideItem>
          <GuideItem emoji="🚐" title="Как работает трансфер">
            <p>
              Машина только для вас. Вы выбираете район отеля и время, водитель забирает от отеля и
              привозит обратно, когда скажете. Цена за всю машину туда-обратно, не за человека.
            </p>
          </GuideItem>
        </section>

        <BookingConditions />
        <PhotoCredits>
          Фото: VinWonders с колеса обозрения - lol1VNIO, Wikimedia Commons, CC BY-SA 4.0.
        </PhotoCredits>
      </div>
    </>
  )
}
