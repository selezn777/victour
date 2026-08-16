import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/supabase/database.types"

function publicClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}

export type ArticleSummary = {
  id: string
  slug: string
  title: string
  destination: string
  excerpt: string | null
  coverImageUrl: string | null
  publishedAt: string | null
}

export type Article = ArticleSummary & {
  body: string
  relatedTourId: string | null
  isPublished: boolean
}

const SUMMARY_SELECT = "id, slug, title, destination, excerpt, cover_image_url, published_at"
const FULL_SELECT = `${SUMMARY_SELECT}, body, related_tour_id, is_published`

function mapSummary(row: {
  id: string
  slug: string
  title: string
  destination: string
  excerpt: string | null
  cover_image_url: string | null
  published_at: string | null
}): ArticleSummary {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    destination: row.destination,
    excerpt: row.excerpt,
    coverImageUrl: row.cover_image_url,
    publishedAt: row.published_at,
  }
}

export async function getPublishedArticles(): Promise<ArticleSummary[]> {
  const supabase = publicClient()
  const { data, error } = await supabase
    .from("articles")
    .select(SUMMARY_SELECT)
    .eq("is_published", true)
    .order("published_at", { ascending: false })

  if (error) throw error
  return data.map(mapSummary)
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const supabase = publicClient()
  const { data, error } = await supabase
    .from("articles")
    .select(FULL_SELECT)
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle()

  if (error) throw error
  if (!data) return null

  return {
    ...mapSummary(data),
    body: data.body,
    relatedTourId: data.related_tour_id,
    isPublished: data.is_published,
  }
}
