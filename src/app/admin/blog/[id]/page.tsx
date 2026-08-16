import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import { getTourOptions } from "@/lib/reviews-data"
import { SignOutButton } from "@/components/sign-out-button"
import { ArticleEditor } from "@/components/admin/article-editor"
import type { Article } from "@/lib/articles-data"

export const metadata: Metadata = {
  title: "Статья — админка ВикТур",
}

export default async function AdminArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const [{ data }, tours] = await Promise.all([
    supabase
      .from("articles")
      .select("id, slug, title, destination, excerpt, cover_image_url, body, related_tour_id, is_published, published_at")
      .eq("id", id)
      .maybeSingle(),
    getTourOptions(),
  ])

  if (!data) notFound()

  const article: Article = {
    id: data.id,
    slug: data.slug,
    title: data.title,
    destination: data.destination,
    excerpt: data.excerpt,
    coverImageUrl: data.cover_image_url,
    body: data.body,
    relatedTourId: data.related_tour_id,
    isPublished: data.is_published,
    publishedAt: data.published_at,
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="flex items-start justify-between gap-4">
        <Link href="/admin/blog" className="text-sm text-muted-foreground hover:underline">
          ← Все статьи
        </Link>
        <SignOutButton />
      </div>

      <h1 className="mt-2 font-heading text-2xl font-semibold sm:text-3xl">Редактирование статьи</h1>

      <div className="mt-6">
        <ArticleEditor article={article} tours={tours} />
      </div>
    </main>
  )
}
