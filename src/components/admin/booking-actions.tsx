"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"

export function BookingActions({ bookingId, status }: { bookingId: string; status: string }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function setStatus(next: "confirmed" | "alt_proposed" | "cancelled") {
    setError(null)
    startTransition(async () => {
      const supabase = createClient()
      const { error } = await supabase.rpc("admin_set_booking_status", {
        p_booking_id: bookingId,
        p_status: next,
      })
      if (error) {
        setError(error.message)
        return
      }
      router.refresh()
    })
  }

  if (status !== "pending" && status !== "alt_proposed") return null

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button size="sm" disabled={isPending} onClick={() => setStatus("confirmed")}>
        Подтвердить
      </Button>
      <Button
        size="sm"
        variant="outline"
        disabled={isPending}
        onClick={() => setStatus("alt_proposed")}
      >
        Предложить другую дату
      </Button>
      <Button
        size="sm"
        variant="destructive"
        disabled={isPending}
        onClick={() => setStatus("cancelled")}
      >
        Отклонить
      </Button>
      {error && <span className="text-xs text-destructive">{error}</span>}
    </div>
  )
}
