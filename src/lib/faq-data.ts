import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/supabase/database.types"

function publicClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}

export type FaqItem = {
  id: string
  tourId: string | null
  tourTitle: string | null
  question: string
  answer: string
  createdAt: string
}

const FAQ_SELECT = "id, tour_id, question, answer, created_at, tours(title)"

type FaqRow = {
  id: string
  tour_id: string | null
  question: string
  answer: string | null
  created_at: string
  tours: { title: { ru: string } } | null
}

function mapFaq(row: FaqRow): FaqItem {
  return {
    id: row.id,
    tourId: row.tour_id,
    tourTitle: row.tours?.title.ru ?? null,
    question: row.question,
    answer: row.answer as string,
    createdAt: row.created_at,
  }
}

export async function getGeneralFaq(): Promise<FaqItem[]> {
  const supabase = publicClient()
  const { data, error } = await supabase
    .from("faq_items")
    .select(FAQ_SELECT)
    .is("tour_id", null)
    .not("answer", "is", null)
    .order("created_at", { ascending: true })

  if (error) throw error
  return (data as unknown as FaqRow[]).map(mapFaq)
}

export async function getFaqForTour(tourId: string): Promise<FaqItem[]> {
  const supabase = publicClient()
  const { data, error } = await supabase
    .from("faq_items")
    .select(FAQ_SELECT)
    .eq("tour_id", tourId)
    .not("answer", "is", null)
    .order("created_at", { ascending: true })

  if (error) throw error
  return (data as unknown as FaqRow[]).map(mapFaq)
}

export async function getAllAnsweredFaq(): Promise<FaqItem[]> {
  const supabase = publicClient()
  const { data, error } = await supabase
    .from("faq_items")
    .select(FAQ_SELECT)
    .not("answer", "is", null)
    .order("created_at", { ascending: true })

  if (error) throw error
  return (data as unknown as FaqRow[]).map(mapFaq)
}
