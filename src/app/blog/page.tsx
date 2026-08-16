import Link from "next/link"
import Image from "next/image"
import type { Metadata } from "next"
import { getPublishedArticles } from "@/lib/articles-data"
import { destinationLabel } from "@/lib/article-destinations"

export const metadata: Metadata = {
  title: "Блог — ВикТур",
  description: "Гайды по Камрани, Винперлу и другим направлениям во Вьетнаме.",
}

export default async function BlogPage() {
  const articles = await getPublishedArticles()

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
      <Link href="/" className="text-sm text-muted-foreground hover:underline">
        ← На главную
      </Link>

      <h1 className="mt-4 font-heading text-2xl font-semibold sm:text-3xl">Блог</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Гайды по Камрани, Винперлу и другим местам — как классно провести время во Вьетнаме.
      </p>

      {articles.length === 0 ? (
        <p className="mt-8 text-sm text-muted-foreground">Статей пока нет.</p>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {articles.map((article) => (
            <Link
              key={article.id}
              href={`/blog/${article.slug}`}
              className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card"
            >
              {article.coverImageUrl && (
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
                  <Image
                    src={article.coverImageUrl}
                    alt={article.title}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                    sizes="(min-width: 640px) 360px, 100vw"
                  />
                </div>
              )}
              <div className="flex flex-1 flex-col gap-1.5 p-4">
                <span className="text-xs font-medium text-primary">
                  {destinationLabel(article.destination)}
                </span>
                <h2 className="font-heading text-base font-semibold sm:text-lg">{article.title}</h2>
                {article.excerpt && (
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{article.excerpt}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  )
}
