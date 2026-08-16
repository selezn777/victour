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
  depositUsd: number
}

export type PrimaryGuide = {
  id: string
  name: string
  whatsapp: string | null
  telegram: string | null
  instagram: string | null
}

export type ItineraryItem = {
  day: number
  title: string
  description: string
}

export type TicketOption = {
  location: string
  guestVnd: number | null
  guideVnd: number | null
  note: string | null
}

export type TourPricingTier = {
  guestCount: number
  priceAdultUsd: number
  priceChildUsd: number | null
}

export type TourGuide = {
  id: string
  name: string
  bio: string | null
  whatsapp: string | null
  telegram: string | null
  instagram: string | null
  bookedDates: string[]
}

export type TourDetail = {
  id: string
  slug: string
  title: string
  shortDescription: string
  durationLabel: string
  durationDays: number
  isDalatTwoDay: boolean
  heroImageUrl: string | null
  galleryUrls: string[]
  itinerary: ItineraryItem[]
  includes: string[]
  excludes: string[]
  ticketOptions: TicketOption[]
  pricingTiers: TourPricingTier[]
}

export async function getTourPageData(slug: string): Promise<{
  tour: TourDetail
  guides: TourGuide[]
  settings: SiteSettings
} | null> {
  const supabase = publicClient()

  const [tourRes, guidesRes, settingsRes] = await Promise.all([
    supabase
      .from("tours")
      .select(
        "id, slug, title, short_description, duration_label, duration_days, is_dalat_two_day, hero_image_url, gallery_urls, itinerary, includes, excludes, ticket_options, pricing_tiers(guest_count, price_adult_usd, price_child_usd)",
      )
      .eq("slug", slug)
      .eq("is_active", true)
      .maybeSingle(),
    supabase
      .from("guides")
      .select("id, name, bio, whatsapp, telegram, instagram, guide_availability(date, status)")
      .eq("is_active", true)
      .order("sort_order", { ascending: true }),
    supabase.from("settings").select("key, value"),
  ])

  if (tourRes.error) throw tourRes.error
  if (guidesRes.error) throw guidesRes.error
  if (settingsRes.error) throw settingsRes.error
  if (!tourRes.data) return null

  const row = tourRes.data
  const title = row.title as { ru: string }
  const shortDescription = row.short_description as { ru: string }
  const durationLabel = row.duration_label as { ru: string }
  const itinerary = row.itinerary as { day: number; title: { ru: string }; description: { ru: string } }[]
  const includes = row.includes as { ru: string }[]
  const excludes = row.excludes as { ru: string }[]
  const ticketOptions = row.ticket_options as {
    location: { ru: string }
    guest_vnd: number | null
    guide_vnd: number | null
    note: { ru: string | null }
  }[]
  const pricingTiers = row.pricing_tiers as {
    guest_count: number
    price_adult_usd: number
    price_child_usd: number | null
  }[]

  const tour: TourDetail = {
    id: row.id,
    slug: row.slug,
    title: title.ru,
    shortDescription: shortDescription.ru,
    durationLabel: durationLabel.ru,
    durationDays: row.duration_days,
    isDalatTwoDay: row.is_dalat_two_day,
    heroImageUrl: row.hero_image_url,
    galleryUrls: row.gallery_urls ?? [],
    itinerary: itinerary
      .map((i) => ({ day: i.day, title: i.title.ru, description: i.description.ru }))
      .sort((a, b) => a.day - b.day),
    includes: includes.map((i) => i.ru),
    excludes: excludes.map((i) => i.ru),
    ticketOptions: ticketOptions.map((t) => ({
      location: t.location.ru,
      guestVnd: t.guest_vnd,
      guideVnd: t.guide_vnd,
      note: t.note.ru,
    })),
    pricingTiers: pricingTiers
      .map((t) => ({
        guestCount: t.guest_count,
        priceAdultUsd: t.price_adult_usd,
        priceChildUsd: t.price_child_usd,
      }))
      .sort((a, b) => a.guestCount - b.guestCount),
  }

  const guides: TourGuide[] = guidesRes.data.map((g) => {
    const bio = g.bio as { ru: string } | null
    const availability = g.guide_availability as { date: string; status: string }[]
    return {
      id: g.id,
      name: g.name,
      bio: bio?.ru ?? null,
      whatsapp: g.whatsapp,
      telegram: g.telegram,
      instagram: g.instagram,
      bookedDates: availability.map((a) => a.date),
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
    depositUsd: (byKey.get("deposit_usd")?.amount as number) ?? 80,
  }

  return { tour, guides, settings }
}

export type Surcharge = {
  code: string
  name: string
  amountVnd: number
  unit: string
}

export async function getRequestPageData(): Promise<{
  settings: SiteSettings
  surcharges: Surcharge[]
}> {
  const supabase = publicClient()

  const [settingsRes, surchargesRes] = await Promise.all([
    supabase.from("settings").select("key, value"),
    supabase.from("surcharges").select("code, name, amount_vnd, unit").eq("is_active", true),
  ])

  if (settingsRes.error) throw settingsRes.error
  if (surchargesRes.error) throw surchargesRes.error

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
    depositUsd: (byKey.get("deposit_usd")?.amount as number) ?? 80,
  }

  const surcharges: Surcharge[] = surchargesRes.data.map((s) => ({
    code: s.code,
    name: (s.name as { ru: string }).ru,
    amountVnd: s.amount_vnd,
    unit: s.unit,
  }))

  return { settings, surcharges }
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
      .eq("is_active", true)
      .order("sort_order", { ascending: true }),
    supabase.from("settings").select("key, value"),
    supabase
      .from("guides")
      .select("id, name, whatsapp, telegram, instagram")
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
    depositUsd: (byKey.get("deposit_usd")?.amount as number) ?? 80,
  }

  return { tours, settings, guide: guideRes.data }
}
