"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"

export type AdminFaqItem = {
  id: string
  question: string
  answer: string | null
  tour_title: string | null
  created_at: string
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("ru-RU", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function FaqAdminList({ items }: { items: AdminFaqItem[] }) {
  const pending = items.filter((i) => !i.answer)
  const answered = items.filter((i) => i.answer)

  if (items.length === 0) return null

  return (
    <details className="mb-6 rounded-xl border border-border bg-card p-5 shadow-sm" open={pending.length > 0}>
      <summary className="cursor-pointer text-sm font-medium">
        Вопросы гостей ({items.length}){pending.length > 0 ? ` — ${pending.length} без ответа` : ""}
      </summary>
      <div className="mt-4 flex flex-col gap-2">
        {pending.map((item) => (
          <PendingRow key={item.id} item={item} />
        ))}
        {answered.map((item) => (
          <AnsweredRow key={item.id} item={item} />
        ))}
      </div>
    </details>
  )
}

function PendingRow({ item }: { item: AdminFaqItem }) {
  const router = useRouter()
  const [answer, setAnswer] = useState("")
  const [isPending, startTransition] = useTransition()

  function submit() {
    if (!answer.trim()) return
    startTransition(async () => {
      const supabase = createClient()
      await supabase.rpc("admin_answer_faq", { p_id: item.id, p_answer: answer.trim() })
      router.refresh()
    })
  }

  return (
    <div className="rounded-lg border border-border px-3 py-2 text-sm">
      <div className="text-xs text-muted-foreground">
        {item.tour_title ? `${item.tour_title} · ` : "Общий вопрос · "}
        {formatDateTime(item.created_at)}
      </div>
      <p className="mt-1 font-medium">{item.question}</p>
      <textarea
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        rows={2}
        placeholder="Ответ — появится в FAQ сразу после отправки"
        className="mt-2 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
      />
      <Button size="sm" className="mt-2" disabled={isPending || !answer.trim()} onClick={submit}>
        Ответить
      </Button>
    </div>
  )
}

function AnsweredRow({ item }: { item: AdminFaqItem }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function remove() {
    if (!confirm("Удалить вопрос безвозвратно?")) return
    startTransition(async () => {
      const supabase = createClient()
      await supabase.from("faq_items").delete().eq("id", item.id)
      router.refresh()
    })
  }

  return (
    <div className="flex flex-wrap items-start justify-between gap-2 rounded-lg border border-border px-3 py-2 text-sm">
      <div>
        <div className="text-xs text-muted-foreground">
          {item.tour_title ? `${item.tour_title} · ` : "Общий вопрос · "}
          {formatDateTime(item.created_at)}
        </div>
        <p className="mt-1 font-medium">{item.question}</p>
        <p className="mt-1 text-muted-foreground">{item.answer}</p>
      </div>
      <Button size="sm" variant="destructive" disabled={isPending} onClick={remove}>
        Удалить
      </Button>
    </div>
  )
}
