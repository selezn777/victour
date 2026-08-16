import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Политика конфиденциальности — ВикТур",
}

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <Link href="/" className="text-sm text-muted-foreground hover:underline">
        ← На главную
      </Link>

      <h1 className="mt-4 font-heading text-2xl font-semibold sm:text-3xl">
        Политика конфиденциальности
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">Обработка персональных данных на сайте ВикТур</p>

      <div className="mt-8 flex flex-col gap-6 text-sm leading-relaxed text-foreground/90">
        <section>
          <h2 className="font-heading text-lg font-semibold">1. Оператор данных</h2>
          <p className="mt-2">
            Обработку персональных данных, полученных через сайт ВикТур, осуществляет Виктор
            (далее — «Оператор»), контакты: Telegram{" "}
            <a href="https://t.me/viktor_Vietnam" className="text-primary hover:underline">
              @viktor_Vietnam
            </a>
            , WhatsApp +84 38 371 46 38.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-lg font-semibold">2. Какие данные собираются</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Имя, контакт для связи (телефон / Telegram / WhatsApp / VK / MAX)</li>
            <li>Отель проживания, пожелания к туру</li>
            <li>Технические данные при использовании сайта (файлы cookie, аналитика посещений)</li>
          </ul>
          <p className="mt-2">
            Данные банковских карт сайт не собирает и не хранит — оплата принимается по
            реквизитам, которые Оператор высылает лично после подтверждения заявки.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-lg font-semibold">3. Цель обработки</h2>
          <p className="mt-2">
            Данные используются только для оформления и подтверждения заявки на тур, связи с
            гостем и выставления квитанции об оплате. Данные не передаются третьим лицам, кроме
            случаев, прямо предусмотренных законодательством РФ.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-lg font-semibold">4. Срок хранения</h2>
          <p className="mt-2">
            Данные хранятся не дольше, чем это необходимо для целей обработки, либо до отзыва
            согласия гостем.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-lg font-semibold">5. Права гостя</h2>
          <p className="mt-2">
            Вы вправе в любой момент запросить удаление своих данных или отозвать согласие на
            обработку — напишите об этом в Telegram{" "}
            <a href="https://t.me/viktor_Vietnam" className="text-primary hover:underline">
              @viktor_Vietnam
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="font-heading text-lg font-semibold">6. Файлы cookie и аналитика</h2>
          <p className="mt-2">
            Сайт использует Google Analytics для оценки посещаемости. Аналитика включается
            только после вашего согласия в баннере cookie внизу экрана — до согласия счётчик не
            запускается. Отозвать согласие можно, очистив cookie сайта в браузере.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-lg font-semibold">7. Согласие</h2>
          <p className="mt-2">
            Оставляя заявку на сайте, вы подтверждаете, что ознакомлены с настоящей политикой и
            даёте согласие на обработку указанных данных для целей, перечисленных выше.
          </p>
        </section>
      </div>
    </main>
  )
}
