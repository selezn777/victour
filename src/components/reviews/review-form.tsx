"use client"

import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { ImagePlusIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { StarRatingInput } from "@/components/reviews/star-rating"
import { AudioRecorder } from "@/components/reviews/audio-recorder"
import { createClient } from "@/lib/supabase/client"
import type { TourOption } from "@/lib/reviews-data"

async function uploadFile(file: Blob, kind: "photo" | "audio"): Promise<string> {
  const formData = new FormData()
  formData.append("file", file, kind === "audio" ? "audio.webm" : "photo.jpg")
  formData.append("kind", kind)
  const res = await fetch("/api/reviews/upload", { method: "POST", body: formData })
  const data = (await res.json()) as { ok: boolean; url?: string; error?: string }
  if (!data.ok || !data.url) throw new Error(data.error ?? "upload failed")
  return data.url
}

export function ReviewForm({
  tours,
  guideId,
  guideName,
  lockedTourId,
}: {
  tours: TourOption[]
  guideId: string | null
  guideName: string | null
  /** Форма встроена на странице конкретного тура — тур уже выбран и не меняется. */
  lockedTourId?: string
}) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [name, setName] = useState("")
  const [rating, setRating] = useState(0)
  const [text, setText] = useState("")
  const [tourId, setTourId] = useState(lockedTourId ?? "")
  const [aboutGuide, setAboutGuide] = useState(Boolean(lockedTourId) === false && Boolean(guideId))
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  function onPhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null
    setPhotoFile(file)
    setPhotoPreview(file ? URL.createObjectURL(file) : null)
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!name.trim()) return setError("Укажите имя")
    if (rating === 0) return setError("Поставьте оценку")
    if (!text.trim() && !audioBlob) return setError("Напишите отзыв текстом или запишите голосом")
    if (!tourId && !aboutGuide) return setError("Выберите тур или отметьте отзыв о гиде")

    setSubmitting(true)
    try {
      const [photoUrl, audioUrl] = await Promise.all([
        photoFile ? uploadFile(photoFile, "photo") : Promise.resolve(null),
        audioBlob ? uploadFile(audioBlob, "audio") : Promise.resolve(null),
      ])

      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      const { data: review, error: insertError } = await supabase
        .from("reviews")
        .insert({
          user_id: user?.id ?? null,
          tour_id: tourId || null,
          guide_id: aboutGuide ? guideId : null,
          author_name: name.trim(),
          rating,
          text: text.trim() || null,
          photo_url: photoUrl,
          audio_url: audioUrl,
        })
        .select("id")
        .single()

      if (insertError || !review) {
        setError("Не получилось отправить отзыв. Попробуйте ещё раз.")
        setSubmitting(false)
        return
      }

      fetch("/api/notify-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewId: review.id }),
      }).catch(() => {})

      setDone(true)
      router.refresh()
    } catch {
      setError("Не получилось отправить отзыв. Попробуйте ещё раз.")
    } finally {
      setSubmitting(false)
    }
  }

  if (done) {
    return (
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm text-sm">
        Спасибо за отзыв! Он уже опубликован.
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5 shadow-sm">
      <h3 className="font-heading text-base font-semibold">Оставить отзыв</h3>

      <StarRatingInput value={rating} onChange={setRating} />

      <div>
        <label className="text-sm font-medium" htmlFor="review-name">Имя</label>
        <Input id="review-name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1.5" />
      </div>

      <div>
        <label className="text-sm font-medium" htmlFor="review-text">Отзыв</label>
        <textarea
          id="review-text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          placeholder="Как прошла экскурсия? Можно оставить пусто, если запишете голосом"
          className="mt-1.5 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-base outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm dark:bg-input/30"
        />
      </div>

      <AudioRecorder onChange={setAudioBlob} />

      <div>
        {photoPreview ? (
          <div className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photoPreview} alt="" className="h-16 w-16 rounded-lg object-cover" />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setPhotoFile(null)
                setPhotoPreview(null)
                if (fileInputRef.current) fileInputRef.current.value = ""
              }}
            >
              Убрать фото
            </Button>
          </div>
        ) : (
          <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
            <ImagePlusIcon className="size-4" />
            Добавить фото
          </Button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onPhotoChange}
        />
      </div>

      {!lockedTourId && tours.length > 0 && (
        <div>
          <label className="text-sm font-medium" htmlFor="review-tour">Тур (необязательно)</label>
          <select
            id="review-tour"
            value={tourId}
            onChange={(e) => setTourId(e.target.value)}
            className="mt-1.5 h-11 w-full rounded-lg border border-input bg-transparent px-3.5 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm dark:bg-input/30"
          >
            <option value="">Не выбран</option>
            {tours.map((t) => (
              <option key={t.id} value={t.id}>{t.title}</option>
            ))}
          </select>
        </div>
      )}

      {guideId && guideName && (
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={aboutGuide}
            onChange={(e) => setAboutGuide(e.target.checked)}
            className="size-4 rounded border-input accent-primary"
          />
          Отзыв о гиде {guideName}
        </label>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" disabled={submitting} className="mt-1 w-fit">
        {submitting ? "Отправляем…" : "Отправить отзыв"}
      </Button>
    </form>
  )
}
