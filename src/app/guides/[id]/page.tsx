import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { getGuideById } from "@/lib/guides-data"
import { getReviewsForGuide, getTourOptions } from "@/lib/reviews-data"
import { ReviewsSection } from "@/components/reviews/reviews-section"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const guide = await getGuideById(id)
  return { title: guide ? `Гид ${guide.name} — ВикТур` : "Гид — ВикТур" }
}

export default async function GuideProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [guide, tours] = await Promise.all([getGuideById(id), getTourOptions()])

  if (!guide) notFound()

  const reviews = await getReviewsForGuide(guide.id)

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
      <Link href="/guides" className="text-sm text-muted-foreground hover:underline">
        ← Все гиды
      </Link>

      <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-start">
        <div className="relative aspect-square w-full max-w-[220px] shrink-0 overflow-hidden rounded-2xl bg-muted shadow-sm">
          {guide.photoUrl && (
            <Image src={guide.photoUrl} alt={guide.name} fill className="object-cover" sizes="220px" />
          )}
        </div>

        <div className="flex-1">
          <h1 className="font-heading text-2xl font-semibold sm:text-3xl">{guide.name}</h1>

          {guide.specialties.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {guide.specialties.map((s) => (
                <span key={s} className="rounded-full bg-muted px-2.5 py-1 text-xs">
                  {s}
                </span>
              ))}
            </div>
          )}

          {guide.bio && <p className="mt-4 text-sm text-foreground/90 whitespace-pre-line">{guide.bio}</p>}

          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-sm">
            {guide.whatsapp && (
              <a
                className="text-primary hover:underline"
                href={`https://wa.me/${guide.whatsapp.replace(/[^\d]/g, "")}`}
                target="_blank"
                rel="noreferrer"
              >
                WhatsApp
              </a>
            )}
            {guide.telegram && (
              <a
                className="text-primary hover:underline"
                href={`https://t.me/${guide.telegram.replace(/^@/, "")}`}
                target="_blank"
                rel="noreferrer"
              >
                Telegram
              </a>
            )}
            {guide.instagram && (
              <a
                className="text-primary hover:underline"
                href={`https://instagram.com/${guide.instagram.replace(/^@/, "")}`}
                target="_blank"
                rel="noreferrer"
              >
                Instagram
              </a>
            )}
          </div>
        </div>
      </div>

      {guide.galleryUrls.length > 0 && (
        <div className="mt-10">
          <h2 className="font-heading text-lg font-semibold sm:text-xl">Фото с туров</h2>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {guide.galleryUrls.map((url) => (
              <div key={url} className="relative aspect-square overflow-hidden rounded-xl bg-muted">
                <Image src={url} alt="" fill className="object-cover" sizes="(min-width: 640px) 240px, 50vw" />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-10">
        <ReviewsSection
          title="Отзывы"
          reviews={reviews}
          tours={tours}
          guideId={guide.id}
          guideName={guide.name}
          hideTarget="guide"
          emptyMessage="Пока нет отзывов о гиде — станьте первым."
        />
      </div>
    </main>
  )
}
