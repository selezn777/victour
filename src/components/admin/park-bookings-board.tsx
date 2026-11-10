"use client"

import { useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { CopyIcon } from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"

// Заявки на билеты/трансфер с /park и /phuquoc (park_bookings). Виктор 2026-11-10:
// «билеты нам обязательно, всё это агенту передавать, чтобы агент не взорвался» -
// кнопка «Скопировать для агента» собирает аккуратный английский список.

export type ParkRow = {
  id: string
  short_id: string | null
  destination: string
  date: string
  package_title: string | null
  departure_time: string | null
  guests: Record<string, number>
  guests_total: number
  extras: Record<string, number>
  hotel: string
  district: string | null
  transfer_usd: number | null
  tickets_vnd: number | null
  name: string
  contact_channel: string
  contact: string
  comment: string | null
  stage: Stage
  note: string | null
  created_at: string
}

type Stage = "new" | "client_confirmed" | "passed" | "done" | "cancelled"
const STAGES: { key: Stage; label: string; pill: string }[] = [
  { key: "new", label: "Новая", pill: "bg-sky-500 text-white" },
  { key: "client_confirmed", label: "Подтвердил", pill: "bg-amber-400 text-amber-950" },
  { key: "passed", label: "Передана агенту", pill: "bg-violet-500 text-white" },
  { key: "done", label: "Съездили", pill: "bg-emerald-500 text-white" },
  { key: "cancelled", label: "Отмена", pill: "bg-zinc-600 text-zinc-100" },
]
const OPEN: Stage[] = ["new", "client_confirmed"]

const PLACE: Record<string, string> = {
  park: "VinWonders Nha Trang",
  hontam: "Hon Tam island",
  pq_vin: "VinWonders / Safari Phu Quoc",
  pq_honthom: "Hon Thom cable car",
}
const GUEST_EN: Record<string, string> = { adults: "adult", children: "child", seniors: "60+", infants: "infant (free)" }

const today = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh" }).format(new Date())
const vnd = (n: number | null) => (n ? `${n.toLocaleString("ru-RU")} ₫` : "")
const fmtDate = (iso: string) => new Date(`${iso}T00:00:00`).toLocaleDateString("ru-RU", { day: "numeric", month: "short", weekday: "short" })

function guestsEn(g: Record<string, number>) {
  return Object.entries(g)
    .filter(([, n]) => n > 0)
    .map(([k, n]) => `${n} ${GUEST_EN[k] ?? k}`)
    .join(", ")
}

function agentText(rows: ParkRow[]): string {
  return rows
    .map((r, i) =>
      [
        `${i + 1}) ${r.date}${r.departure_time ? ` ${r.departure_time}` : ""} - ${PLACE[r.destination] ?? r.destination}`,
        `   Ticket: ${r.package_title ?? "-"}; guests: ${guestsEn(r.guests)} (total ${r.guests_total})`,
        `   Name: ${r.name}; hotel: ${r.hotel}${r.district ? ` (${r.district}, transfer)` : ""}`,
        ...(r.comment ? [`   Note: ${r.comment}`] : []),
      ].join("\n"),
    )
    .join("\n\n")
}

export function ParkBookingsBoard({ rows, error }: { rows: ParkRow[]; error?: string }) {
  const [filter, setFilter] = useState<"upcoming" | "open" | "all">("upcoming")
  const [copied, setCopied] = useState(false)

  const shown = useMemo(() => {
    const t = today()
    return rows
      .filter((r) =>
        filter === "upcoming" ? r.date >= t && r.stage !== "cancelled" : filter === "open" ? OPEN.includes(r.stage) : true,
      )
      .sort((a, b) => (filter === "all" ? b.date.localeCompare(a.date) : a.date.localeCompare(b.date)))
  }, [rows, filter])

  const forAgent = shown.filter((r) => OPEN.includes(r.stage))

  async function copy() {
    await navigator.clipboard.writeText(agentText(forAgent))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (error) {
    return <p className="mt-6 rounded-xl border border-destructive/40 p-4 text-sm text-destructive">Не удалось загрузить: {error}</p>
  }

  return (
    <div className="mt-6 space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {(
          [
            { key: "upcoming", label: "Ближайшие" },
            { key: "open", label: "Не переданы агенту" },
            { key: "all", label: `Все ${rows.length}` },
          ] as const
        ).map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            className={cn(
              "rounded-md border-2 px-3.5 py-1.5 text-sm font-semibold transition-colors",
              filter === f.key ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground",
            )}
          >
            {f.label}
          </button>
        ))}
        <Button onClick={copy} disabled={!forAgent.length} variant="outline" className="rounded-md sm:ml-auto">
          <CopyIcon className="size-4" />
          {copied ? "Скопировано" : `Скопировать для агента (${forAgent.length})`}
        </Button>
      </div>

      {shown.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">
          Заявок пока нет. Новые с сайта появляются здесь сами.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {shown.map((r) => (
            <ParkCard key={r.id} r={r} />
          ))}
        </div>
      )}
    </div>
  )
}

function ParkCard({ r }: { r: ParkRow }) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const st = STAGES.find((s) => s.key === r.stage) ?? STAGES[0]
  const wa = r.contact_channel === "whatsapp" ? `https://wa.me/${r.contact.replace(/\D/g, "")}` : null
  const [copied, setCopied] = useState(false)
  async function copyOne() {
    try {
      await navigator.clipboard.writeText(agentText([r]).replace(/^1\) /, ""))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  function setStage(stage: Stage) {
    start(async () => {
      await createClient().from("park_bookings").update({ stage, updated_at: new Date().toISOString() }).eq("id", r.id)
      router.refresh()
    })
  }

  return (
    <div className={cn("rounded-md border border-border bg-card p-4", pending && "opacity-60")}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs font-semibold text-muted-foreground uppercase">{fmtDate(r.date)}{r.departure_time ? ` · ${r.departure_time}` : ""}</div>
          <div className="mt-0.5 font-semibold">{PLACE[r.destination] ?? r.destination}</div>
          <div className="text-sm text-muted-foreground">{r.package_title}</div>
        </div>
        <select
          value={r.stage}
          onChange={(e) => setStage(e.target.value as Stage)}
          aria-label="Стадия"
          className={cn("h-8 max-w-40 cursor-pointer rounded-md border-0 px-3 text-xs font-bold outline-none", st.pill)}
        >
          {STAGES.map((s) => (
            <option key={s.key} value={s.key} className="bg-card text-foreground">
              {s.label}
            </option>
          ))}
        </select>
      </div>
      <div className="mt-2 space-y-0.5 text-sm">
        <div>👥 {r.guests_total} чел. ({guestsEn(r.guests)})</div>
        <div>🏨 {r.hotel}</div>
        {r.district && <div>🚐 {r.district} · ${Number(r.transfer_usd)}</div>}
        <div>👤 {r.name} · {r.contact_channel}: {r.contact}</div>
        {r.comment && <div className="text-muted-foreground">💬 {r.comment}</div>}
      </div>
      <div className="mt-3 flex items-center justify-between gap-2 border-t border-border pt-3">
        <span className="text-sm font-bold tabular-nums">
          {vnd(r.tickets_vnd)}
          {r.transfer_usd ? ` + $${Number(r.transfer_usd)}` : ""}
        </span>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={copyOne} className="rounded-md">
            <CopyIcon className="size-3.5" /> {copied ? "Скопировано" : "Агенту"}
          </Button>
          {wa && (
            <a href={wa} target="_blank" rel="noreferrer" className={cn(buttonVariants({ size: "sm", variant: "outline" }), "rounded-md")}>
              Написать
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
