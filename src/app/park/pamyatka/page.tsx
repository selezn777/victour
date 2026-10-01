import type { Metadata, Viewport } from "next"
import Link from "next/link"
import { lora, manrope } from "../fonts"
import { THEMES } from "../ui"

// Памятка для туриста по VinWonders (тексты — от Виктора, 01.10.2026).
// PDF-версия лежит в public/park/vinwonders-pamyatka.pdf — это печать этой же
// страницы (Chrome → Печать → Сохранить как PDF, A4). После правок текста
// PDF нужно пересохранить, иначе он разойдётся со страницей.

export const metadata: Metadata = {
  title: "Памятка VinWonders Нячанг 2026 | ВикТур",
  description:
    "Билеты, ваучер на еду и все рестораны, где он действует, часы работы, шоу и Tata Show — всё, что нужно знать о VinWonders Нячанг.",
}

export const viewport: Viewport = { themeColor: "#f4ead8" }

const PDF_HREF = "/park/vinwonders-pamyatka.pdf"

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="break-inside-avoid rounded-[20px] bg-white p-4 shadow-[0_6px_18px_rgb(60_60_40/0.09)]">
      <h2 className="mb-2.5 text-[17px] font-extrabold text-(--c-primary)">{title}</h2>
      <div className="space-y-2 text-[14px] leading-snug">{children}</div>
    </section>
  )
}

function Rows({ rows }: { rows: [string, string][] }) {
  return (
    <ul className="divide-y divide-(--c-bg-2)">
      {rows.map(([a, b]) => (
        <li key={a} className="flex justify-between gap-3 py-1.5">
          <span>{a}</span>
          <b className="shrink-0 text-right whitespace-nowrap">{b}</b>
        </li>
      ))}
    </ul>
  )
}

export default function MemoPage() {
  return (
    <div
      style={THEMES.park as React.CSSProperties}
      className={`${lora.variable} ${manrope.variable} flex-1 bg-(--c-bg) font-(family-name:--font-park-sans) text-(--c-ink)`}
    >
      <main className="mx-auto max-w-[640px] space-y-3.5 px-4 pt-5 pb-12">
        <div className="flex print:hidden items-center justify-between gap-3">
          <Link href="/park" className="text-[14px] font-bold text-(--c-primary)">
            ‹ К бронированию
          </Link>
          <a
            href={PDF_HREF}
            download
            className="flex h-11 items-center gap-2 rounded-full bg-(--c-accent) px-4 text-[14px] font-extrabold text-white"
          >
            ⬇ Скачать PDF
          </a>
        </div>

        <header className="pt-2">
          <p className="text-[12px] font-bold tracking-[0.18em] text-(--c-primary-2)">
            ПАМЯТКА · ВИКТУР
          </p>
          <h1 className="mt-1 font-(family-name:--font-park-serif) text-[30px] leading-tight font-bold text-(--c-primary)">
            🎢 VinWonders Нячанг — всё, что нужно знать (2026)
          </h1>
          <p className="mt-2 text-[14px] leading-snug">
            Парк находится на острове Хон Тре. Добираться по канатной дороге через море, она уже
            входит в билет. В парке 6 зон: сад растений World Garden, зоопарк King&apos;s Garden,
            сказочный Fairy Land, океанариум Sea World, аттракционы Festive Hill и аквапарк Tropical
            Paradise.
          </p>
        </header>

        <Block title="🎟 Билеты">
          <p className="text-(--c-muted)">
            Стандартный билет на весь день с канатной дорогой туда-обратно:
          </p>
          <Rows
            rows={[
              ["Взрослый (рост от 140 см)", "1 050 000 ₫"],
              ["Ребёнок (рост 100–139 см)", "800 000 ₫"],
              ["Пенсионер (от 60 лет) — обязательно взять паспорт", "800 000 ₫"],
              ["Дети ниже 100 см", "бесплатно"],
            ]}
          />
          <p>
            <b>Что входит:</b> канатная дорога туда-обратно, все 6 зон, все аттракционы, аквапарк,
            океанариум, зоопарк и все шоу, включая Tata Show.
          </p>
          <p>
            <b>Что не входит:</b> зиплайн, еда, шкафчики, Premium-места на Tata Show.
          </p>
          <p className="pt-1 text-(--c-muted)">Билет на 2 дня (взрослый / ребёнок и пенсионер):</p>
          <Rows rows={[["Второй день — любой в течение 14 дней", "1 350 000 / 1 050 000 ₫"]]} />
          <p className="rounded-xl bg-(--c-tint) p-3 text-[13px] text-(--c-tint-ink)">
            ⚠️ Горки в аквапарке: рост от 130 см, вес до 100 кг, возраст до 50 лет. Дети ниже 140 см
            и младше 14 лет — только со взрослым.
          </p>
        </Block>

        <Block title="🍔 Ваучер на еду">
          <p>
            Акция действует <b>с 3 сентября по 30 ноября 2026</b>, только с билетом на 1 день.
          </p>
          <Rows
            rows={[
              ["Взрослый", "150 000 ₫"],
              ["Ребёнок и пенсионер", "100 000 ₫"],
            ]}
          />
          <p className="text-[13px] text-(--c-muted)">
            Использовать можно один раз, в одной точке. Сдачу не дают, в деньги не меняется. Если
            заказ дороже — доплачиваете разницу.
          </p>
          <p className="pt-1 font-bold text-(--c-primary)">Где принимают:</p>
          <Rows
            rows={[
              ["Wind & Sea и Coral — буфеты на Food Street", "10:30–14:30, 16:30–19:30"],
              ["Yummy Water World — фастфуд в аквапарке", "10:00–18:00"],
              ["Yummy World Garden — вьетнамская кухня", "10:00–18:00"],
              ["Street Food — уличная еда", "09:00–19:00"],
              ["Wonder Ice Cream & Bakery — мороженое и выпечка", "09:00–19:00"],
              ["Kiosk Monta", "10:00–18:00"],
            ]}
          />
        </Block>

        <Block title="🕘 Часы работы и дневные шоу">
          <Rows
            rows={[
              ["Парк", "08:30–20:00"],
              ["Аквапарк", "10:00–17:30"],
              ["Колесо обозрения", "10:00–18:30"],
              ["🧜‍♀️ Шоу русалок (океанариум Sea World)", "09:30–09:45"],
              ["🐠 Кормление рыб (океанариум) — точное время на табло у входа", "≈ 10:00 и 17:00"],
              ["🦜 Шоу птиц (King's Garden)", "11:00–11:20, 15:00–15:20"],
              ["🎭 Парад принцессы Марины (Ocean Square)", "16:30–17:00"],
            ]}
          />
        </Block>

        <Block title="🌙 Вечерняя программа">
          <Rows
            rows={[
              ["⛲ Шоу поющих фонтанов", "19:00–19:15"],
              ["✨ TATA SHOW — площадь Мифов (Luminary Square)", "19:30–20:10"],
              ["🏴‍☠️ Трюковое шоу на воде «Rise of the Ocean Princess» — Vinpearl Harbour, 3 минуты пешком от парка, бесплатно", "21:15"],
            ]}
          />
        </Block>

        <Block title="⭐ Tata Show">
          <p>
            Около 40 минут: 3D-мэппинг на замке, огонь, дым, свет, больше 100 артистов. Сюжет про
            принцессу Тату и борьбу со злом, поэтому понятно без слов.
          </p>
          <p>
            <b>1️⃣ Общая зона</b> — входит в билет. Можно смотреть просто стоя. Приходите к 19:00,
            иначе будете смотреть из-за спин.
          </p>
          <p>
            <b>2️⃣ Premium-места</b> — сидячие, с лучшим обзором, 200 000 ₫. Можно заказать у нас.
          </p>
          <p>
            🎆 <b>Салют.</b> По последнему официальному объявлению большой салют проходит по
            субботам в 20:20 в Vinpearl Harbour, а в пятницу и воскресенье пиротехника включена в
            Tata Show.
          </p>
          <p className="text-[13px] text-(--c-muted)">
            🌧 В сильный дождь и ветер шоу могут отменить или перенести. В плохую погоду вместо
            канатки пускают катера.
          </p>
        </Block>

        <Block title="📞 Связь с нами">
          <p>
            WhatsApp Виктора: <b>+84 383 714 638</b> (wa.me/84383714638). Бронь трансфера и билетов
            — на victour.vercel.app/park
          </p>
        </Block>
      </main>
    </div>
  )
}
