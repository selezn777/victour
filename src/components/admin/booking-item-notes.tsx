"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"

// Виктор: личный кабинет гостя после подтверждения предоплаты показывает
// время выезда и комментарий гида по туру — эти два поля вводит админ
// здесь, рядом с "Изменить гида/дату" (см. reschedule-booking-item.tsx,
// тот же паттерн: RLS не даёт писать в booking_items напрямую с клиента,
// только через security definer RPC).
export function BookingItemNotes({
  itemId,
  currentDepartureTime,
  currentGuideComment,
}: {
  itemId: string
  currentDepartureTime: string | null
  currentGuideComment: string | null
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [departureTime, setDepartureTime] = useState(currentDepartureTime ?? "")
  const [guideComment, setGuideComment] = useState(currentGuideComment ?? "")
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function save() {
    setError(null)
    startTransition(async () => {
      const supabase = createClient()
      const { error } = await supabase.rpc("admin_update_booking_item_notes", {
        p_item_id: itemId,
        p_departure_time: departureTime,
        p_guide_comment: guideComment,
      })
      if (error) {
        setError(error.message)
        return
      }
      setOpen(false)
      router.refresh()
    })
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-xs text-primary underline underline-offset-2"
      >
        Время выезда / комментарий гида
      </button>
    )
  }

  return (
    <div className="mt-2 flex flex-col gap-2 rounded-lg border border-border p-2">
      <input
        type="text"
        value={departureTime}
        onChange={(e) => setDepartureTime(e.target.value)}
        placeholder="Время выезда, напр. 08:00"
        className="rounded-md border border-border bg-background px-2 py-1.5 text-xs"
      />
      <textarea
        value={guideComment}
        onChange={(e) => setGuideComment(e.target.value)}
        placeholder="Комментарий гида для гостя"
        rows={2}
        className="rounded-md border border-border bg-background px-2 py-1.5 text-xs"
      />
      <div className="flex items-center gap-2">
        <Button size="sm" disabled={isPending} onClick={save}>
          Сохранить
        </Button>
        <Button size="sm" variant="outline" disabled={isPending} onClick={() => setOpen(false)}>
          Отмена
        </Button>
      </div>
      {error && <span className="text-xs text-destructive">{error}</span>}
    </div>
  )
}
