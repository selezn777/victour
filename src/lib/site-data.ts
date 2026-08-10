import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/supabase/database.types"

function publicClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}

export type CatalogTour = {
  slug: string
  title: string
  shortDescription: string
  durationLabel: string
  heroImageUrl: string | null
  priceFromUsd: number
}

export type SiteSettings = {
  usdVndRate: number
  usdRubRate: number
  rubMarkupPct: number
  packageDiscounts: Record<string, number>
}

export type PrimaryGuide = {
  name: string
  whatsapp: string | null
  telegram: string | null
  instagram: string | null
}

export async function getHomepageData(): Promise<{
  tours: CatalogTour[]
  settings: SiteSettings
  guide: PrimaryGuide | null
}> {
  const supabase = publicClient()

  const [toursRes, settingsRes, guideRes] = await Promise.all([
    supabase
      .from("tours")
      .select("slug, title, short_description, duration_label, hero_image_url, sort_order, pricing_tiers(price_adult_usd)")
      .order("sort_order", { ascending: true }),
    supabase.from("settings").select("key, value"),
    supabase
      .from("guides")
      .select("name, whatsapp, telegram, instagram")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .limit(1)
      .maybeSingle(),
  ])

  if (toursRes.error) throw toursRes.error
  if (settingsRes.error) throw settingsRes.error
  if (guideRes.error) throw guideRes.error

  const tours: CatalogTour[] = toursRes.data.map((row) => {
    const title = row.title as { ru: string }
    const shortDescription = row.short_description as { ru: string }
    const durationLabel = row.duration_label as { ru: string }
    const prices = (row.pricing_tiers as { price_adult_usd: number }[]).map(
      (t) => t.price_adult_usd,
    )
    return {
      slug: row.slug,
      title: title.ru,
      shortDescription: shortDescription.ru,
      durationLabel: durationLabel.ru,
      heroImageUrl: row.hero_image_url,
      priceFromUsd: Math.min(...prices),
    }
  })

  const byKey = new Map(settingsRes.data.map((s) => [s.key, s.value as Record<string, unknown>]))

  const settings: SiteSettings = {
    usdVndRate: (byKey.get("usd_vnd_rate")?.rate as number) ?? 26000,
    usdRubRate: (byKey.get("usd_rub_rate")?.rate as number) ?? 82,
    rubMarkupPct: (byKey.get("rub_markup_pct")?.pct as number) ?? 8,
    packageDiscounts: (byKey.get("package_discounts") as Record<string, number>) ?? {
      "2": 5,
      "3": 10,
      "4": 15,
    },
  }

  return { tours, settings, guide: guideRes.data }
}
