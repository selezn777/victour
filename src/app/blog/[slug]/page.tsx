import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { getArticleBySlug } from "@/lib/articles-data"
import { getTourOptions } from "@/lib/reviews-data"
import { destinationLabel } from "@/lib/article-destinations"
import { ArticleBody } from "@/components/article-body"
import { Button } from "@/components/ui/button"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const article = await getArticleBySlug(slug)
  return {
    title: article ? `${article.title} — ВикТур` : "Статья — ВикТур",
    description: article?.excerpt ?? undefined,
  }
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const [article, tours] = await Promise.all([getArticleBySlug(slug), getTourOptions()])

  if (!article) notFound()

  const relatedTour = tours.find((t) => t.id === article.relatedTourId)

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <Link href="/blog" className="text-sm text-muted-foreground hover:underline">
        ← Все статьи
      </Link>

      <span className="mt-4 block text-xs font-medium text-primary">
        {destinationLabel(article.destination)}
      </span>
      <h1 className="mt-1 font-heading text-2xl font-semibold sm:text-3xl">{article.title}</h1>

      {article.coverImageUrl && (
        <div className="relative mt-6 aspect-[16/9] w-full overflow-hidden rounded-2xl bg-muted">
          <Image
            src={article.coverImageUrl}
            alt={article.title}
            fill
            className="object-cover"
            sizes="(min-width: 768px) 720px, 100vw"
            priority
          />
        </div>
      )}

      <div className="mt-8">
        <ArticleBody body={article.body} />
      </div>

      <div className="mt-10 rounded-2xl border border-border bg-card px-4 py-5 text-center sm:px-6 sm:py-6">
        <p className="font-heading text-base font-semibold sm:text-lg">
          {relatedTour ? `Хотите увидеть это своими глазами?` : "Готовы к своему туру по Вьетнаму?"}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          {relatedTour ? relatedTour.title : "Подберём маршрут под вас — больше гостей, дешевле."}
        </p>
        <Button
          size="lg"
          className="mt-4"
          nativeButton={false}
          render={<Link href={relatedTour ? `/tours/${relatedTour.slug}` : "/tours"} />}
        >
          Забронировать тур
        </Button>
      </div>
    </main>
  )
}
