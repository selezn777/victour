import type { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import { SignOutButton } from "@/components/sign-out-button"
import { AdminNav } from "@/components/admin/admin-nav"
import { ArticleList, type AdminArticleRow } from "@/components/admin/article-list"

export const metadata: Metadata = {
  title: "Блог — админка ВикТур",
}

export default async function AdminBlogPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from("articles")
    .select("id, slug, title, destination, is_published")
    .order("created_at", { ascending: false })

  const articles: AdminArticleRow[] = (data ?? []).map((row) => ({
    id: row.id,
    slug: row.slug,
    title: row.title,
    destination: row.destination,
    isPublished: row.is_published,
  }))

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
        <div>
          <h1 className="font-heading text-2xl font-semibold sm:text-3xl">Блог</h1>
          <p className="mt-1 text-sm text-muted-foreground">Статьи для /blog — SEO-гайды по направлениям</p>
        </div>
        <SignOutButton />
      </div>

      <div className="mt-5">
        <AdminNav />
      </div>

      <div className="mt-6">
        <ArticleList articles={articles} />
      </div>
    </main>
  )
}
