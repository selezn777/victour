"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import type { TourOption } from "@/lib/reviews-data"

export function FaqQuestionForm({
  tours,
  lockedTourId,
}: {
  tours: TourOption[]
  /** Форма встроена на странице конкретного тура — тур уже выбран и не меняется. */
  lockedTourId?: string
}) {
  const [question, setQuestion] = useState("")
  const [tourId, setTourId] = useState(lockedTourId ?? "")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!question.trim()) return setError("Напишите вопрос")

    setSubmitting(true)
    try {
      const supabase = createClient()
      const { data: questionId, error: rpcError } = await supabase.rpc("ask_faq_question", {
        p_question: question.trim(),
        p_tour_id: tourId || null,
      })

      if (rpcError || !questionId) {
        setError("Не получилось отправить вопрос. Попробуйте ещё раз.")
        setSubmitting(false)
        return
      }

      fetch("/api/notify-faq-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId }),
      }).catch(() => {})

      setDone(true)
    } catch {
      setError("Не получилось отправить вопрос. Попробуйте ещё раз.")
    } finally {
      setSubmitting(false)
    }
  }

  if (done) {
    return (
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm text-sm">
        Спасибо! Виктор ответит лично, и вопрос появится здесь в FAQ.
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5 shadow-sm">
      <h3 className="font-heading text-base font-semibold">Задать вопрос</h3>

      <textarea
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        rows={3}
        placeholder="Напишите вопрос — Виктор ответит лично"
        className="w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-base outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm dark:bg-input/30"
      />

      {!lockedTourId && tours.length > 0 && (
        <div>
          <label className="text-sm font-medium" htmlFor="faq-tour">Тур (необязательно)</label>
          <select
            id="faq-tour"
            value={tourId}
            onChange={(e) => setTourId(e.target.value)}
            className="mt-1.5 h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
          >
            <option value="">Общий вопрос</option>
            {tours.map((t) => (
              <option key={t.id} value={t.id}>{t.title}</option>
            ))}
          </select>
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" disabled={submitting} className="mt-1 w-fit">
        {submitting ? "Отправляем…" : "Отправить вопрос"}
      </Button>
    </form>
  )
}
