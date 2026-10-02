import Image from "next/image"
import honTam from "../../../public/images/tours/hon-tam.jpg"
import boat from "../../../public/park/hontam-boat.jpg"
import { DESTINATIONS, HONTAM_PROMO } from "./park-config"
import { SeawalkingCta } from "./seawalking-cta"
import { BookingConditions, CARD, Hero, HeroTitle, SERIF, SectionTitle, TicketCard } from "./ui"

const hontam = DESTINATIONS.hontam

const PACKAGE_NOTES: Record<string, string> = {
  basic: "Катер туда и обратно + пляж, полотенце и каякинг",
  mud: "Катер + грязевые ванны + море",
  lunch: "Катер + море + обед шведский стол",
  lunch_mud: "Катер + грязевые ванны + море + обед",
}

export function HonTamContent() {
  return (
    <>
      <Hero
        image={honTam}
        alt="Остров Хон Там"
        pills={["НЯЧАНГ", "ТРАНСФЕР ВКЛЮЧЁН"]}
        objectPosition="center 55%"
        ctaHref="#seawalking"
      >
        <HeroTitle>
          Остров
          <br />
          Хон Там
          <br />
          <span className="text-(--c-on-primary)">всего за $17</span>
        </HeroTitle>
      </Hero>

      <div className="relative z-10 -mt-12 space-y-3.5 px-4">
        <section className="rounded-[28px] bg-(--c-primary) p-5 text-white shadow-(--c-shadow-primary)">
          <div className="flex gap-3">
            <span className="text-[32px] leading-none">🚐</span>
            <div>
              <h3 className="text-[16px] leading-tight font-extrabold tracking-wide text-balance text-(--c-on-primary)">
                ТРАНСФЕР ОТ ВАШЕГО ОТЕЛЯ ВКЛЮЧЁН
              </h3>
              <p className="mt-1 text-[15px] leading-snug text-pretty">
                Катера отправляются из порта Хон Там рядом с терминалом VinWonders — мы привезём вас
                туда от отеля.
              </p>
            </div>
          </div>
          <div className="mt-3.5 rounded-2xl bg-white/12 px-3.5 py-3 text-[14px] leading-snug">
            🚤 Катер в <b className="text-(--c-on-primary)">8:00, 9:00, 10:00 или 12:00</b> —
            выезжаем от отеля за 40 минут до катера. На острове — до 16:20.
          </div>
        </section>

        <section
          id="seawalking"
          className="scroll-mt-16 overflow-hidden rounded-[24px] bg-white shadow-(--c-shadow-primary)"
        >
          {HONTAM_PROMO.videoSrc && (
            <video
              src={HONTAM_PROMO.videoSrc}
              poster={HONTAM_PROMO.posterSrc ?? undefined}
              autoPlay
              muted
              loop
              playsInline
              controls
              preload="metadata"
              className="aspect-video w-full bg-black object-cover"
            />
          )}
          <div className="p-4">
            <span className="inline-block rounded-full bg-(--c-accent) px-2.5 py-1 text-[11px] font-bold tracking-wider text-white uppercase">
              🤿 Акция
            </span>
            <h3 className="mt-2 text-[18px] leading-tight font-extrabold text-balance text-(--c-primary)">
              {HONTAM_PROMO.title}
            </h3>
            <div className="mt-3 flex items-end gap-4">
              <div>
                <span className="block text-[11px] font-bold tracking-wider text-(--c-muted) uppercase">
                  Обычная цена
                </span>
                <s
                  className={`${SERIF} text-[30px] leading-none font-bold text-[#b3402a] decoration-[3px]`}
                >
                  {HONTAM_PROMO.oldPrice}
                </s>
              </div>
              <span className="pb-1 text-[22px] text-(--c-muted)">→</span>
              <div>
                <span className="block text-[11px] font-bold tracking-wider text-(--c-accent) uppercase">
                  Только у нас
                </span>
                <b className={`${SERIF} text-[40px] leading-none text-(--c-primary)`}>
                  {HONTAM_PROMO.price}
                </b>
              </div>
            </div>
            <p className="mt-2 text-[14px] leading-snug font-semibold">{HONTAM_PROMO.text}</p>

            <ul className="mt-4 space-y-3 border-t border-(--c-bg-2) pt-4 text-[14px] leading-snug">
              <li className="flex gap-3">
                <span className="text-[22px] leading-none">🪶</span>
                <span>
                  <b className="text-(--c-primary)">Чувство невесомости.</b> Вы идёте по дну моря,
                  как космонавт, — лёгкость, которую невозможно забыть.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-[22px] leading-none">🎥</span>
                <span>
                  <b className="text-(--c-primary)">Невероятное видео на память</b> — вы среди
                  стай рыб и кораллов. Такого ролика нет ни у кого из друзей.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-[22px] leading-none">👓</span>
                <span>
                  <b className="text-(--c-primary)">Можно прямо в очках.</b> Шлем не касается
                  лица — погружаетесь в своих очках и видите всё в первом ряду.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-[22px] leading-none">🛡️</span>
                <span>
                  <b className="text-(--c-primary)">Супер безопасно.</b> В шлеме дышите как
                  обычно — уметь плавать и нырять не нужно.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-[22px] leading-none">🪸</span>
                <span>
                  <b className="text-(--c-primary)">Настоящий живой коралл, как на Красном море.</b>{" "}
                  Такое почти нигде в мире не встречается.
                </span>
              </li>
            </ul>

            <SeawalkingCta />
          </div>
        </section>

        <section className={`${CARD} overflow-hidden rounded-[24px]`}>
          <div className="relative aspect-[4/3]">
            <Image
              src={boat}
              alt="Скоростной катер у причала, на фоне канатная дорога"
              fill
              placeholder="blur"
              sizes="(max-width: 560px) 100vw, 560px"
              className="object-cover object-[center_65%]"
            />
          </div>
          <div className="p-4">
            <div className="mb-1.5 flex items-center gap-2 text-[16px] font-extrabold text-(--c-primary)">
              <span className="text-[22px]">🚤</span>Как добираемся до острова
            </div>
            <ol className="space-y-1.5 text-[13.5px] leading-snug">
              <li>
                <b className="text-(--c-primary)">1.</b> Водитель забирает вас от отеля и привозит в
                порт Хон Там — рядом с терминалом VinWonders.
              </li>
              <li>
                <b className="text-(--c-primary)">2.</b> Оттуда на остров идёт{" "}
                <b className="text-(--c-primary)">крытый скоростной катер</b> — как на фото. Катер
                туда и обратно уже входит в любой билет.
              </li>
              <li>
                <b className="text-(--c-primary)">3.</b> Обратно — тоже катером, последний
                отправляется с острова в 16:20.
              </li>
            </ol>
          </div>
        </section>



        <section>
          <SectionTitle>Варианты и цены билетов · до 31.12.2026</SectionTitle>
          <div className="grid grid-cols-2 gap-3">
            {hontam.packages.map((p) => (
              <TicketCard key={p.id} label={p.title} price={p.price} secondary={p.childPrice}>
                <p className="text-(--c-muted)">{PACKAGE_NOTES[p.id]}</p>
              </TicketCard>
            ))}
          </div>
        </section>
      </div>

      <div className="mt-7 space-y-7 px-4">
        <section>
          <SectionTitle>Категории билетов</SectionTitle>
          <div className="grid auto-rows-fr grid-cols-1 gap-3 min-[400px]:grid-cols-2">
            {hontam.guests.map((c) => (
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
                  <span
                    className={`mt-0.5 block leading-tight ${
                      c.free
                        ? "text-[14px] font-extrabold text-(--c-tint-ink)"
                        : "text-[12.5px] text-(--c-muted)"
                    }`}
                  >
                    {c.note}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <SectionTitle>Дополнительная информация</SectionTitle>
          <div className="grid auto-rows-fr grid-cols-1 gap-3 min-[400px]:grid-cols-2">
            <div className={`${CARD} p-4`}>
              <div className="mb-1.5 flex items-center gap-2 text-[16px] font-extrabold text-(--c-primary)">
                <span className="text-[22px]">🕗</span>Часы работы
              </div>
              <p className="text-[13.5px] leading-snug">
                Комплекс открыт примерно <b className="text-(--c-primary)">с 08:00 до 16:20</b> —
                последний обратный катер.
              </p>
            </div>
            <div className={`${CARD} p-4`}>
              <div className="mb-1.5 flex items-center gap-2 text-[16px] font-extrabold text-(--c-primary)">
                <span className="text-[22px]">🌊</span>Активные развлечения
              </div>
              <p className="text-[13.5px] leading-snug">
                Гидроскутеры, парашютинг, дайвинг и другие аттракционы — отметьте в форме, подберём.
              </p>
            </div>
          </div>
        </section>

        <BookingConditions />
      </div>
    </>
  )
}
