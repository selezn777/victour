"use client"

import { useEffect, useRef, useState } from "react"
import { StarIcon } from "lucide-react"
import { AudioRecorder } from "@/components/reviews/audio-recorder"
import { createClient } from "@/lib/supabase/client"
import {
  PARK_REVIEW_SLUGS,
  REVIEW_SELECT,
  composeAuthorName,
  mapReview,
  type Review,
  type ReviewRow,
} from "@/lib/reviews-data"
import type { DestinationId } from "./park-config"
import { CARD, SERIF, SectionTitle } from "./ui"

// Отзывы гостей направления под карточкой WhatsApp. Оставить может любой,
// публикуется сразу, удаляет Виктор в /admin/bookings → «Отзывы».
// Список грузится на клиенте: лендинг статический, а новый отзыв должен
// появляться без редеплоя.

const AVATARS = ["😊", "😎", "🥰", "🤩", "🌴", "🏝️", "🌊", "☀️", "🐬", "🎢", "🚡", "🙌"]
const PAGE = 3
const INPUT =
  "w-full rounded-2xl border border-(--c-border) bg-white px-3.5 text-[16px] text-(--c-ink) outline-none placeholder:text-(--c-muted)/60 focus:border-(--c-primary-2) focus:ring-2 focus:ring-(--c-primary-2)/25"
const LABEL = "mb-1.5 block text-[13px] font-bold text-(--c-primary)"

function Stars({ value, size = "size-4" }: { value: number; size?: string }) {
  return (
    <span className="flex gap-0.5" aria-label={`${value} из 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <StarIcon
          key={n}
          className={`${size} ${n <= Math.round(value) ? "fill-amber-400 text-amber-400" : "fill-none text-(--c-border)"}`}
        />
      ))}
    </span>
  )
}

async function fetchReviews(destination: DestinationId): Promise<Review[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("reviews")
    .select(REVIEW_SELECT.replace("tours(", "tours!inner("))
    .eq("tours.slug", PARK_REVIEW_SLUGS[destination])
    .order("created_at", { ascending: false })
  if (error) throw error
  return (data as unknown as ReviewRow[]).map(mapReview)
}

export function ParkReviews({ destination }: { destination: DestinationId }) {
  const [reviews, setReviews] = useState<Review[] | null>(null)
  const [shown, setShown] = useState(PAGE)
  const [formOpen, setFormOpen] = useState(false)

  useEffect(() => {
    // смена направления перемонтирует компонент (key в landing.tsx)
    let cancelled = false
    fetchReviews(destination)
      .then((r) => !cancelled && setReviews(r))
      .catch(() => !cancelled && setReviews([]))
    return () => {
      cancelled = true
    }
  }, [destination])

  const avg = reviews?.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0

  return (
    <section id="reviews">
      <SectionTitle>Отзывы гостей</SectionTitle>

      <div className={`${CARD} flex items-center gap-4 px-4 py-4`}>
        {reviews && reviews.length > 0 ? (
          <>
            <div className={`${SERIF} text-[40px] leading-none font-bold text-(--c-primary)`}>
              {avg.toFixed(1).replace(".", ",")}
            </div>
            <div className="min-w-0 flex-1">
              <Stars value={avg} size="size-5" />
              <div className="mt-1 text-[13px] text-(--c-muted)">{reviewsCount(reviews.length)}</div>
            </div>
          </>
        ) : (
          <div className="flex-1 text-[14px] leading-snug text-(--c-muted)">
            {reviews ? "Будьте первым — расскажите, как всё прошло!" : "Загружаем отзывы…"}
          </div>
        )}
      </div>

      {!formOpen && (
        <button
          type="button"
          onClick={() => setFormOpen(true)}
          className="mt-3 flex h-13 w-full items-center justify-center gap-2 rounded-full border-2 border-(--c-primary) bg-white text-[15px] font-bold text-(--c-primary) transition active:scale-[0.99]"
        >
          ✍️ Оставить отзыв
        </button>
      )}

      {formOpen && (
        <ParkReviewForm
          destination={destination}
          onCancel={() => setFormOpen(false)}
          onDone={(review) => {
            setReviews((r) => [review, ...(r ?? [])])
            setShown((n) => n + 1)
          }}
        />
      )}

      {reviews && reviews.length > 0 && (
        <div className="mt-4 flex flex-col gap-3">
          {reviews.slice(0, shown).map((r) => (
            <ParkReviewCard key={r.id} review={r} />
          ))}
          {reviews.length > shown && (
            <button
              type="button"
              onClick={() => setShown((n) => n + PAGE * 2)}
              className="mx-auto h-10 rounded-full bg-(--c-bg-2) px-5 text-[14px] font-bold text-(--c-primary)"
            >
              Показать ещё ({reviews.length - shown})
            </button>
          )}
        </div>
      )}
    </section>
  )
}

function reviewsCount(n: number): string {
  const mod10 = n % 10
  const mod100 = n % 100
  const word =
    mod10 === 1 && mod100 !== 11
      ? "отзыв"
      : mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)
        ? "отзыва"
        : "отзывов"
  return `${n} ${word}`
}

function ParkReviewCard({ review }: { review: Review }) {
  const [zoom, setZoom] = useState(false)
  return (
    <article className={`${CARD} flex flex-col gap-2.5 px-4 py-4`}>
      <div className="flex items-center gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-(--c-bg-2) text-[24px] leading-none">
          {review.avatarEmoji ?? "🙂"}
        </span>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[15px] font-bold text-(--c-ink)">{review.authorName}</div>
          <div className="text-[12px] text-(--c-muted)">
            {new Date(review.createdAt).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })}
          </div>
        </div>
        <Stars value={review.rating} />
      </div>

      {review.text && (
        <p className="text-[14.5px] leading-snug whitespace-pre-line text-(--c-ink)">{review.text}</p>
      )}

      {review.audioUrl && <audio controls preload="none" src={review.audioUrl} className="h-10 w-full" />}

      {review.photoUrl && (
        <button type="button" onClick={() => setZoom((z) => !z)} className="block overflow-hidden rounded-2xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={review.photoUrl}
            alt=""
            loading="lazy"
            className={`w-full object-cover transition-[max-height] duration-300 ${zoom ? "max-h-[80vh] object-contain" : "max-h-56"}`}
          />
        </button>
      )}
    </article>
  )
}

// Фото с телефона бывает 10+ МБ — ужимаем до 1600px JPEG перед загрузкой.
async function shrinkPhoto(file: File): Promise<Blob> {
  try {
    const bitmap = await createImageBitmap(file)
    const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height))
    const canvas = document.createElement("canvas")
    canvas.width = Math.round(bitmap.width * scale)
    canvas.height = Math.round(bitmap.height * scale)
    canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
    const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, "image/jpeg", 0.85))
    return blob ?? file
  } catch {
    return file
  }
}

async function uploadFile(file: Blob, kind: "photo" | "audio"): Promise<string> {
  const formData = new FormData()
  formData.append("file", file, kind === "audio" ? "audio.webm" : "photo.jpeg")
  formData.append("kind", kind)
  const res = await fetch("/api/reviews/upload", { method: "POST", body: formData })
  const data = (await res.json()) as { ok: boolean; url?: string; error?: string }
  if (!data.ok || !data.url) throw new Error(data.error ?? "upload failed")
  return data.url
}

function ParkReviewForm({
  destination,
  onCancel,
  onDone,
}: {
  destination: DestinationId
  onCancel: () => void
  onDone: (review: Review) => void
}) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [name, setName] = useState("")
  const [emoji, setEmoji] = useState(AVATARS[0])
  const [rating, setRating] = useState(0)
  const [text, setText] = useState("")
  const [audio, setAudio] = useState<Blob | null>(null)
  const [photo, setPhoto] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!name.trim()) return setError("Укажите имя")
    if (rating === 0) return setError("Поставьте оценку — нажмите на звёзды")
    if (!text.trim() && !audio) return setError("Напишите пару слов или запишите голосом")

    setSending(true)
    try {
      const [photoUrl, audioUrl] = await Promise.all([
        photo ? shrinkPhoto(photo).then((b) => uploadFile(b, "photo")) : null,
        audio ? uploadFile(audio, "audio") : null,
      ])
      const supabase = createClient()
      const { data: tour } = await supabase
        .from("tours")
        .select("id")
        .eq("slug", PARK_REVIEW_SLUGS[destination])
        .single()
      if (!tour) throw new Error("no anchor tour")

      const { data: row, error: insertError } = await supabase
        .from("reviews")
        .insert({
          tour_id: tour.id,
          author_name: composeAuthorName(emoji, name.trim()),
          rating,
          text: text.trim() || null,
          photo_url: photoUrl,
          audio_url: audioUrl,
        })
        .select(REVIEW_SELECT)
        .single()
      if (insertError || !row) throw insertError ?? new Error("insert failed")

      fetch("/api/notify-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewId: row.id }),
      }).catch(() => {})

      onDone(mapReview(row as unknown as ReviewRow))
      setDone(true)
    } catch {
      setError("Не получилось отправить. Попробуйте ещё раз.")
    } finally {
      setSending(false)
    }
  }

  if (done) {
    return (
      <div className="mt-3 rounded-[20px] bg-(--c-primary) px-4 py-4 text-center text-[15px] font-bold text-white">
        🙏 Спасибо! Отзыв уже опубликован.
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="mt-3 flex flex-col gap-4 rounded-[24px] bg-(--c-tint) p-4 shadow-[0_8px_24px_rgb(60_60_40/0.11)]">
      <div className="flex items-center justify-between">
        <h3 className={`${SERIF} text-[20px] font-bold text-(--c-primary)`}>Ваш отзыв</h3>
        <button type="button" onClick={onCancel} className="text-[13px] font-bold text-(--c-muted)">
          Отмена
        </button>
      </div>

      <div>
        <span className={LABEL}>Оценка</span>
        <div className="flex gap-1" role="radiogroup" aria-label="Оценка">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={n === rating}
              aria-label={`${n} из 5`}
              onClick={() => setRating(n)}
              className="p-0.5 transition active:scale-90"
            >
              <StarIcon
                className={`size-9 ${n <= rating ? "fill-amber-400 text-amber-400" : "fill-white text-(--c-border)"}`}
              />
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="park-review-name" className={LABEL}>
          Как вас зовут
        </label>
        <input
          id="park-review-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Имя"
          maxLength={40}
          className={`${INPUT} h-12`}
        />
      </div>

      <div>
        <span className={LABEL}>Аватарка</span>
        <div className="grid grid-cols-6 gap-1.5">
          {AVATARS.map((a) => (
            <button
              key={a}
              type="button"
              aria-pressed={a === emoji}
              onClick={() => setEmoji(a)}
              className={`flex aspect-square items-center justify-center rounded-full text-[22px] leading-none transition ${
                a === emoji ? "bg-(--c-primary) ring-2 ring-(--c-accent) ring-offset-2 ring-offset-(--c-tint)" : "bg-white"
              }`}
            >
              {a}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="park-review-text" className={LABEL}>
          Отзыв
        </label>
        <textarea
          id="park-review-text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          maxLength={2000}
          placeholder="Как всё прошло? Можно не писать, а записать голосом 👇"
          className={`${INPUT} resize-none py-3`}
        />
        <div className="mt-2">
          <AudioRecorder
            onChange={setAudio}
            buttonClassName="h-10 rounded-full border-(--c-border) bg-white px-4 text-[14px] font-bold text-(--c-primary) hover:bg-(--c-bg-2) hover:text-(--c-primary) dark:border-(--c-border) dark:bg-white dark:hover:bg-(--c-bg-2)"
          />
        </div>
      </div>

      <div>
        {preview ? (
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="" className="size-16 rounded-xl object-cover" />
            <button
              type="button"
              onClick={() => {
                setPhoto(null)
                setPreview(null)
                if (fileRef.current) fileRef.current.value = ""
              }}
              className="h-10 rounded-full bg-white px-4 text-[14px] font-bold text-(--c-muted)"
            >
              Убрать фото
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="h-10 rounded-full border border-(--c-border) bg-white px-4 text-[14px] font-bold text-(--c-primary)"
          >
            📷 Добавить фото
          </button>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0] ?? null
            setPhoto(f)
            setPreview(f ? URL.createObjectURL(f) : null)
          }}
        />
      </div>

      {error && <p className="text-[14px] font-bold text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={sending}
        className="h-14 w-full rounded-full bg-(--c-accent) text-[16px] font-extrabold text-white shadow-[0_8px_20px_rgb(0_0_0/0.18)] transition active:scale-[0.99] disabled:opacity-60"
      >
        {sending ? "Отправляем…" : "Опубликовать отзыв"}
      </button>
    </form>
  )
}
