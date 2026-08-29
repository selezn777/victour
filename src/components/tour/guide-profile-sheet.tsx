"use client"

import Image from "next/image"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { ReviewCard } from "@/components/reviews/review-card"
import { StarRatingDisplay } from "@/components/reviews/star-rating"
import type { Guide } from "@/lib/guides-data"
import type { Review } from "@/lib/reviews-data"

type Profile = { guide: Guide; reviews: Review[] }

// Попап "почитать про гида" со слайда брони (Виктор: неудобно, что гид
// выбирается без возможности сначала посмотреть описание/отзывы) — bottom
// sheet, а не переход на /guides/[id]: бронь клиентская и держит
// дату/гостей в состоянии, полноценный переход на другую страницу их бы
// сбросил. Профиль+отзывы догружаются лениво при открытии (не на каждый
// гид сразу) через /api/guides/[id].
export function GuideProfileSheet({
  guideId,
  guideName,
  open,
  onOpenChange,
}: {
  guideId: string
  guideName: string
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  // profile стартует с null и остаётся null, пока фетч не резолвится —
  // отдельного loading-стейта нет (react-hooks/set-state-in-effect не
  // пускает setState синхронно в теле эффекта, а "null -> данные" и так
  // однозначно читается как индикатор загрузки, key={guideId} у родителя
  // (см. tour-booking-slide) размонтирует/сбрасывает состояние при смене гида).
  const [profile, setProfile] = useState<Profile | null>(null)

  useEffect(() => {
    if (!open) return
    let cancelled = false
    fetch(`/api/guides/${guideId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data: Profile | null) => {
        if (!cancelled) setProfile(data)
      })
    return () => {
      cancelled = true
    }
  }, [open, guideId])

  const avgRating =
    profile && profile.reviews.length > 0
      ? profile.reviews.reduce((sum, r) => sum + r.rating, 0) / profile.reviews.length
      : null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto rounded-t-2xl">
        <SheetHeader>
          <SheetTitle>{guideName}</SheetTitle>
        </SheetHeader>

        <div className="px-4 pb-6">
          {!profile && (
            <p className="py-6 text-center text-sm text-muted-foreground">Загрузка…</p>
          )}

          {profile && (
            <>
              <div className="flex items-start gap-4">
                {profile.guide.photoUrl && (
                  <div className="relative aspect-square w-24 shrink-0 overflow-hidden rounded-xl bg-muted">
                    <Image
                      src={profile.guide.photoUrl}
                      alt={profile.guide.name}
                      fill
                      className="object-cover"
                      sizes="96px"
                    />
                  </div>
                )}
                <div className="min-w-0">
                  {avgRating != null && (
                    <div className="flex items-center gap-1.5">
                      <StarRatingDisplay rating={Math.round(avgRating)} />
                      <span className="text-xs text-muted-foreground">
                        {avgRating.toFixed(1)} · {profile.reviews.length} отзыв(ов)
                      </span>
                    </div>
                  )}
                  {profile.guide.specialties.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {profile.guide.specialties.map((s) => (
                        <span key={s} className="rounded-full bg-muted px-2.5 py-1 text-xs">
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {profile.guide.bio && (
                <p className="mt-4 text-sm whitespace-pre-line text-foreground/90">{profile.guide.bio}</p>
              )}

              {profile.reviews.length > 0 && (
                <div className="mt-5 space-y-3">
                  <h3 className="text-sm font-medium text-muted-foreground">Отзывы</h3>
                  {profile.reviews.map((review) => (
                    <ReviewCard key={review.id} review={review} hideTarget="guide" />
                  ))}
                </div>
              )}

              <Button type="button" className="mt-5 w-full" onClick={() => onOpenChange(false)}>
                Вернуться к бронированию
              </Button>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
