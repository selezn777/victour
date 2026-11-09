import Image from "@/components/img"
import aerial from "../../../public/phuquoc/honthom-aerial.jpg"
import town from "../../../public/phuquoc/honthom-town.jpg"
import { DESTINATIONS } from "../park/park-config"
import { BookingConditions, CARD, Hero, HeroTitle, Pill, SERIF, SectionTitle, TicketCard } from "../park/ui"
import { GuideItem, InfoTile, PhotoCredits } from "./pq-ui"

const dest = DESTINATIONS.pq_honthom
const pkg = (id: string) => dest.packages.find((p) => p.id === id)!
const minTransfer = Math.min(...(dest.districts ?? []).map((d) => d.priceUsd))

export function PqHonThomContent() {
  return (
    <>
      <Hero
        image={aerial}
        alt="Кабинка канатной дороги на Хон Тхом над морем"
        pills={["ФУКУОК", "БИЛЕТЫ + ТРАНСФЕР"]}
        ctaLabel="Забронировать"
        objectPosition="center 45%"
      >
        <HeroTitle>
          8 км над морем
          <br />
          на остров
          <br />
          <span className="text-(--c-on-primary)">Хон Тхом</span>
        </HeroTitle>
      </Hero>

      <div className="relative z-10 -mt-12 space-y-3.5 px-4">
        <section className="rounded-[28px] bg-(--c-primary) p-5 text-white shadow-(--c-shadow-primary)">
          <p className="text-[16px] leading-snug font-medium text-balance opacity-95">
            <b className="text-(--c-on-primary)">Самая длинная морская канатная дорога в мире</b>{" "}
            (рекорд Гиннесса, почти 8 км). Минут пятнадцать летите над островами и бирюзовой водой
            юга Фукуока.
          </p>
          <div className="mt-3.5 flex gap-3 border-t border-white/20 pt-3.5">
            <span className="text-[32px] leading-none">🚐</span>
            <div>
              <h3 className="text-[16px] leading-tight font-extrabold tracking-wide text-balance text-(--c-on-primary)">
                ЛИЧНЫЙ ТРАНСФЕР ОТ ${minTransfer}
              </h3>
              <p className="mt-1 text-[15px] leading-snug text-pretty">
                туда-обратно за всю машину, по себестоимости. Билеты выкупаем заранее.
              </p>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-2 gap-3">
          <TicketCard
            label="Канатка туда-обратно"
            price={pkg("cable").price}
            secondary={pkg("cable").childPrice}
            secondaryLabel="дети"
          />
          <TicketCard
            label="То же + обед"
            price={pkg("cable_lunch").price}
            secondary={pkg("cable_lunch").childPrice}
            secondaryLabel="дети"
          />
        </section>

        <section className="grid grid-cols-2 gap-3">
          <InfoTile emoji="🚡" title="Туда и обратно" note="канатка в билете" />
          <InfoTile emoji="🏖" title="Пляж на острове" note="чистая вода" />
        </section>
      </div>

      <div className="relative mt-8 h-[200px] overflow-hidden">
        <Image
          src={town}
          alt="Канатная дорога над Sunset Town"
          fill
          placeholder="blur"
          sizes="(max-width: 560px) 100vw, 560px"
          className="object-cover object-[center_55%]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgb(6_45_54/0.35)_0%,rgb(6_45_54/0.55)_50%,rgb(6_45_54/0.35)_75%,var(--c-bg)_100%)]" />
        <div className="absolute inset-x-4 top-4 flex items-center justify-between gap-2">
          <Pill>ЮГ ФУКУОКА</Pill>
          <Pill accent>БРОНЬ БЕСПЛАТНО</Pill>
        </div>
        <h2
          className={`${SERIF} absolute inset-x-4 top-16 text-[34px] leading-[1.05] font-bold text-white [text-shadow:0_4px_24px_rgb(0_0_0/0.35)]`}
        >
          День <span className="text-(--c-on-primary)">и вечер</span>
        </h2>
      </div>

      <div className="relative z-10 -mt-6 space-y-7 px-4">
        <section className="space-y-3">
          <div className={`${CARD} space-y-2 p-4 text-[13.5px] leading-snug`}>
            <b className="block text-[16px] text-(--c-primary)">🏝 Остров Хон Тхом</b>
            <p>
              Канатка стартует из Sunset Town и через три острова довозит до Хон Тхома. Там деревня Exotica и пляж
              с чистой водой.
            </p>
          </div>
          <div className={`${CARD} space-y-2 p-4 text-[13.5px] leading-snug`}>
            <b className="block text-[16px] text-(--c-primary)">🌅 Sunset Town вечером</b>
            <p>
              Городок в средиземноморском стиле у нижней станции: гулять бесплатно, закат с моста
              Поцелуя, рестораны у моря.
            </p>
            <p>
              Два шоу на воде: в 19:30 Symphony of the Sea (от 700K ₫, с ужином 1 200K ₫, в выходные
              1 300K ₫) и в 21:00 Kiss of the Sea с фейерверком (800K ₫, главная трибуна). Билеты на
              шоу забронируем, отметьте в форме.
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
              Выезжайте утром, чтобы застать канатку без толпы. День на острове: пляж, деревня Exotica,
              обед. После обеда обратно на канатке, вечер в Sunset Town с закатом и шоу в 19:30 и 21:00.
            </p>
          </GuideItem>
          <GuideItem emoji="🎒" title="Что взять с собой">
            <p>Купальник, полотенце, крем от солнца, сменную одежду на вечер, немного наличных.</p>
            <p>Дети ниже 1 метра едут бесплатно, рост меряют на входе.</p>
          </GuideItem>
          <GuideItem emoji="🍽" title="Где поесть">
            <p>
              На острове кафе и буфет (если взять билет с обедом, он уже оплачен). Вечером в Sunset
              Town рестораны у воды, морепродукты и итальянская кухня.
            </p>
          </GuideItem>
          <GuideItem emoji="🚐" title="Как работает трансфер">
            <p>
              Машина только для вас: заберём от отеля во сколько удобно и вернём, когда скажете,
              хоть после вечернего шоу. Цена за всю машину туда-обратно, не за человека.
            </p>
          </GuideItem>
        </section>

        <BookingConditions />
        <PhotoCredits>
          Фото: канатная дорога Хон Тхом - Vivu Vietnam, Wikimedia Commons, CC BY-SA 4.0.
        </PhotoCredits>
      </div>
    </>
  )
}
