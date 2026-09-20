"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"

// Виктор: "добавить больше вариантов управления, в том числе смену
// тургида и перенос даты" — реальная запись в БД (см. RPC
// admin_reschedule_booking_item), не просто для вида: гость увидит
// новые данные в своём ЛК, а старый гид перестанет считаться занятым
// по прежним датам (если бронь уже подтверждена).
export function RescheduleBookingItem({
  itemId,
  currentGuideId,
  currentDate,
  currentDateEnd,
  isTwoDay,
  guides,
}: {
  itemId: string
  currentGuideId: string | null
  currentDate: string
  currentDateEnd: string | null
  isTwoDay: boolean
  guides: { id: string; name: string }[]
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [guideId, setGuideId] = useState(currentGuideId ?? "")
  const [date, setDate] = useState(currentDate)
  const [dateEnd, setDateEnd] = useState(currentDateEnd ?? "")
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function save() {
    setError(null)
    startTransition(async () => {
      const supabase = createClient()
      const { error } = await supabase.rpc("admin_reschedule_booking_item", {
        p_item_id: itemId,
        p_guide_id: guideId || null,
        p_date: date,
        p_date_end: isTwoDay ? dateEnd || null : null,
      })
      if (error) {
        setError(
          error.message.includes("guide not available")
            ? "Гид уже занят на эту дату"
            : error.message,
        )
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
        Изменить гида/дату
      </button>
    )
  }

  return (
    <div className="mt-2 flex flex-wrap items-center gap-2 rounded-lg border border-border p-2">
      <select
        value={guideId}
        onChange={(e) => setGuideId(e.target.value)}
        className="rounded-md border border-border bg-background px-2 py-1.5 text-xs"
      >
        <option value="">Без гида</option>
        {guides.map((g) => (
          <option key={g.id} value={g.id}>
            {g.name}
          </option>
        ))}
      </select>
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="rounded-md border border-border bg-background px-2 py-1.5 text-xs"
      />
      {isTwoDay && (
        <input
          type="date"
          value={dateEnd}
          onChange={(e) => setDateEnd(e.target.value)}
          className="rounded-md border border-border bg-background px-2 py-1.5 text-xs"
        />
      )}
      <Button size="sm" disabled={isPending} onClick={save}>
        Сохранить
      </Button>
      <Button size="sm" variant="outline" disabled={isPending} onClick={() => setOpen(false)}>
        Отмена
      </Button>
      {error && <span className="w-full text-xs text-destructive">{error}</span>}
    </div>
  )
}
