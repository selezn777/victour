import Link from "next/link"
import type { Metadata } from "next"
import { getGuides } from "@/lib/guides-data"
import { GuideCard } from "@/components/guide-card"

export const metadata: Metadata = {
  title: "Гиды — ВикТур",
}

export default async function GuidesPage() {
  const guides = await getGuides()

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      <Link href="/" className="text-sm text-muted-foreground hover:underline">
        ← На главную
      </Link>

      <h1 className="mt-4 font-heading text-2xl font-semibold sm:text-3xl">Наши гиды</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Личные гиды, которые ведут туры — фото, о себе и маршруты, в которых специализируются.
      </p>

      {guides.length === 0 ? (
        <p className="mt-8 text-sm text-muted-foreground">Пока нет гидов для показа.</p>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {guides.map((guide) => (
            <GuideCard key={guide.id} guide={guide} />
          ))}
        </div>
      )}
    </main>
  )
}
