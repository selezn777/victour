"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"

const CONTACT_LABELS: Record<string, string> = {
  whatsapp: "WhatsApp",
  telegram: "Telegram",
  max: "MAX",
  vk: "ВКонтакте",
}

export type Lead = {
  id: string
  contact_channel: string
  contact_value: string
  tour_interest: string | null
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

export function LeadsList({ leads }: { leads: Lead[] }) {
  if (leads.length === 0) return null

  return (
    <details className="mb-6 rounded-xl border border-border bg-card p-5 shadow-sm" open>
      <summary className="cursor-pointer text-sm font-medium">
        Незавершённые контакты ({leads.length}) — оставили контакт, но не отправили заявку
      </summary>
      <div className="mt-4 flex flex-col gap-2">
        {leads.map((lead) => (
          <LeadRow key={lead.id} lead={lead} />
        ))}
      </div>
    </details>
  )
}

function LeadRow({ lead }: { lead: Lead }) {
  const router = useRouter()
  const [copied, setCopied] = useState(false)
  const [isPending, startTransition] = useTransition()

  async function copyValue() {
    await navigator.clipboard.writeText(lead.contact_value)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  function markContacted() {
    startTransition(async () => {
      const supabase = createClient()
      await supabase.rpc("admin_mark_lead_contacted", { p_lead_id: lead.id })
      router.refresh()
    })
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border px-3 py-2 text-sm">
      <div>
        <button
          type="button"
          onClick={copyValue}
          className="font-medium hover:underline"
        >
          {CONTACT_LABELS[lead.contact_channel] ?? lead.contact_channel}: {lead.contact_value}
          {copied && <span className="ml-2 text-xs text-muted-foreground">Скопировано</span>}
        </button>
        <div className="text-xs text-muted-foreground">
          {lead.tour_interest ? `${lead.tour_interest} · ` : ""}
          {formatDateTime(lead.created_at)}
        </div>
      </div>
      <Button size="sm" variant="outline" disabled={isPending} onClick={markContacted}>
        Обработано
      </Button>
    </div>
  )
}
