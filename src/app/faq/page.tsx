import Link from "next/link"
import type { Metadata } from "next"
import { getAllAnsweredFaq } from "@/lib/faq-data"
import { getTourOptions } from "@/lib/reviews-data"
import { FaqSection } from "@/components/faq/faq-section"

export const metadata: Metadata = {
  title: "Вопросы и ответы — ВикТур",
}

export default async function FaqPage() {
  const [items, tours] = await Promise.all([getAllAnsweredFaq(), getTourOptions()])

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
      <Link href="/" className="text-sm text-muted-foreground hover:underline">
        ← На главную
      </Link>

      <h1 className="mt-4 font-heading text-2xl font-semibold sm:text-3xl">Вопросы и ответы</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Не нашли ответ — спросите, Виктор ответит лично, и вопрос появится здесь.
      </p>

      <div className="mt-6">
        <FaqSection
          title="Все вопросы"
          items={items}
          tours={tours}
          showTourTitle
          emptyMessage="Вопросов пока нет — станьте первым."
        />
      </div>
    </main>
  )
}
