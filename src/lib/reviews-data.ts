import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/supabase/database.types"

function publicClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}

export type Review = {
  id: string
  authorName: string
  /** Эмодзи-аватар, выбранный гостем (хранится префиксом в author_name). */
  avatarEmoji: string | null
  rating: number
  text: string | null
  photoUrl: string | null
  audioUrl: string | null
  createdAt: string
  tourId: string | null
  tourTitle: string | null
  tourSlug: string | null
  guideId: string | null
  guideName: string | null
}

export const REVIEW_SELECT =
  "id, author_name, rating, text, photo_url, audio_url, created_at, tour_id, guide_id, tours(title, slug), guides(name)"

export type ReviewRow = {
  id: string
  author_name: string
  rating: number
  text: string | null
  photo_url: string | null
  audio_url: string | null
  created_at: string
  tour_id: string | null
  guide_id: string | null
  tours: { title: { ru: string }; slug: string } | null
  guides: { name: string } | null
}

// Отзывы с лендинга /park привязаны к скрытым «турам-якорям» (миграция
// 20261005000000) — у них нет страницы /tours/<slug>, ведём на сам лендинг.
export const PARK_REVIEW_SLUGS = { park: "park-vinwonders", hontam: "park-hontam" } as const
export const isParkAnchorSlug = (slug: string) => slug.startsWith("park-")

export function reviewTourHref(slug: string): string {
  if (slug === PARK_REVIEW_SLUGS.hontam) return "/park?t=hontam"
  if (isParkAnchorSlug(slug)) return "/park"
  return `/tours/${slug}`
}

// Отдельной колонки под аватар нет (нет доступа к DDL) — эмодзи пишется
// в начало author_name через пробел: «🌴 Анна».
const EMOJI_PREFIX = /^(\p{Extended_Pictographic}(?:\uFE0F|\u200D\p{Extended_Pictographic}|\p{Emoji_Modifier})*) (.+)$/u

export function composeAuthorName(emoji: string | null, name: string): string {
  return emoji ? `${emoji} ${name}` : name
}

export function splitAuthorName(raw: string): { emoji: string | null; name: string } {
  const m = raw.match(EMOJI_PREFIX)
  return m ? { emoji: m[1], name: m[2] } : { emoji: null, name: raw }
}

export function mapReview(row: ReviewRow): Review {
  const author = splitAuthorName(row.author_name)
  return {
    id: row.id,
    authorName: author.name,
    avatarEmoji: author.emoji,
    rating: row.rating,
    text: row.text,
    photoUrl: row.photo_url,
    audioUrl: row.audio_url,
    createdAt: row.created_at,
    tourId: row.tour_id,
    tourTitle: row.tours?.title.ru ?? null,
    tourSlug: row.tours?.slug ?? null,
    guideId: row.guide_id,
    guideName: row.guides?.name ?? null,
  }
}

export async function getReviewsForTour(tourId: string): Promise<Review[]> {
  const supabase = publicClient()
  const { data, error } = await supabase
    .from("reviews")
    .select(REVIEW_SELECT)
    .eq("tour_id", tourId)
    .order("created_at", { ascending: false })

  if (error) throw error
  return (data as unknown as ReviewRow[]).map(mapReview)
}

export async function getReviewsForGuide(guideId: string): Promise<Review[]> {
  const supabase = publicClient()
  const { data, error } = await supabase
    .from("reviews")
    .select(REVIEW_SELECT)
    .eq("guide_id", guideId)
    .order("created_at", { ascending: false })

  if (error) throw error
  return (data as unknown as ReviewRow[]).map(mapReview)
}

export async function getAllReviews(): Promise<Review[]> {
  const supabase = publicClient()
  const { data, error } = await supabase
    .from("reviews")
    .select(REVIEW_SELECT)
    .order("created_at", { ascending: false })

  if (error) throw error
  return (data as unknown as ReviewRow[]).map(mapReview)
}

export type TourOption = { id: string; slug: string; title: string }

export async function getTourOptions(): Promise<TourOption[]> {
  const supabase = publicClient()
  const { data, error } = await supabase
    .from("tours")
    .select("id, slug, title, sort_order")
    .not("slug", "like", "park-%")
    .order("sort_order", { ascending: true })

  if (error) throw error
  return data.map((row) => ({
    id: row.id,
    slug: row.slug,
    title: (row.title as { ru: string }).ru,
  }))
}
