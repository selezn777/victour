"use client"

import { useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { PlusIcon, Trash2Icon } from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"

// Мини-CRM (Виктор 2026-11-08): клиенты из Instagram/WhatsApp, статусы воронки и дата
// «напомнить». Сортировка: сначала просроченные/сегодняшние напоминания, потом будущие,
// потом без даты (свежие сверху). Пишем напрямую в crm_clients - RLS пускает только админа.

export type CrmClient = {
  id: string
  name: string
  channel: "instagram" | "whatsapp" | "telegram" | "other"
  contact: string | null
  status: Status
  date_from: string | null
  date_to: string | null
  people: number | null
  tour: string | null
  price_usd: number | null
  note: string | null
  remind_on: string | null
  created_at: string
}

type Status = "new" | "thinking" | "on_arrival" | "booked" | "lost"

const STATUSES: { key: Status; label: string; cls: string }[] = [
  { key: "new", label: "Новый", cls: "bg-sky-500/15 text-sky-300" },
  { key: "thinking", label: "Думает", cls: "bg-amber-500/15 text-amber-300" },
  { key: "on_arrival", label: "Напишет по приезду", cls: "bg-violet-500/15 text-violet-300" },
  { key: "booked", label: "Забронировал", cls: "bg-emerald-500/15 text-emerald-300" },
  { key: "lost", label: "Отказ", cls: "bg-muted text-muted-foreground" },
]
const ACTIVE: Status[] = ["new", "thinking", "on_arrival"]

const CHANNELS: { key: CrmClient["channel"]; label: string }[] = [
  { key: "instagram", label: "Instagram" },
  { key: "whatsapp", label: "WhatsApp" },
  { key: "telegram", label: "Telegram" },
  { key: "other", label: "Другое" },
]

const today = () => new Date().toLocaleDateString("sv-SE")

function contactHref(c: CrmClient): string | null {
  const v = (c.contact ?? "").trim()
  if (!v) return null
  if (/^https?:\/\//.test(v)) return v
  const nick = v.replace(/^@/, "")
  if (c.channel === "instagram") return `https://instagram.com/${nick}`
  if (c.channel === "telegram") return `https://t.me/${nick}`
  if (c.channel === "whatsapp") return `https://wa.me/${v.replace(/\D/g, "")}`
  return null
}

function fmtDate(iso: string | null) {
  if (!iso) return ""
  return new Date(`${iso}T00:00:00`).toLocaleDateString("ru-RU", { day: "numeric", month: "short" })
}

function sortKey(c: CrmClient) {
  // 0 - пора написать, 1 - напомнить позже, 2 - без даты
  if (c.remind_on && ACTIVE.includes(c.status)) return [c.remind_on <= today() ? 0 : 1, c.remind_on]
  return [2, ""]
}

const FIELD = "h-10 w-full rounded-lg border border-input bg-transparent px-3 text-[15px] outline-none focus:border-primary"

export function ClientsBoard({ clients, tourTitles }: { clients: CrmClient[]; tourTitles: string[] }) {
  const [filter, setFilter] = useState<"active" | Status>("active")
  const [adding, setAdding] = useState(clients.length === 0)

  const counts = useMemo(() => {
    const m: Record<string, number> = { active: 0 }
    for (const c of clients) {
      m[c.status] = (m[c.status] ?? 0) + 1
      if (ACTIVE.includes(c.status)) m.active++
    }
    return m
  }, [clients])
  const due = clients.filter((c) => ACTIVE.includes(c.status) && c.remind_on && c.remind_on <= today()).length

  const shown = useMemo(() => {
    const list = clients.filter((c) => (filter === "active" ? ACTIVE.includes(c.status) : c.status === filter))
    return list.sort((a, b) => {
      const [ga, da] = sortKey(a)
      const [gb, db] = sortKey(b)
      if (ga !== gb) return (ga as number) - (gb as number)
      if (da !== db) return String(da).localeCompare(String(db))
      return b.created_at.localeCompare(a.created_at)
    })
  }, [clients, filter])

  return (
    <div className="mt-6 space-y-4">
      {due > 0 && (
        <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm font-medium text-amber-200">
          🔔 Пора написать: {due}
        </div>
      )}

      <div className="-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
        {[{ key: "active" as const, label: "В работе" }, ...STATUSES].map((s) => (
          <button
            key={s.key}
            type="button"
            onClick={() => setFilter(s.key)}
            className={cn(
              "shrink-0 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
              filter === s.key ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground",
            )}
          >
            {s.label} <span className="opacity-70">{counts[s.key] ?? 0}</span>
          </button>
        ))}
      </div>

      {adding ? (
        <ClientForm tourTitles={tourTitles} onDone={() => setAdding(false)} />
      ) : (
        <div>
          <Button size="lg" onClick={() => setAdding(true)}>
            <PlusIcon className="size-4" /> Добавить клиента
          </Button>
        </div>
      )}

      {shown.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">Здесь пока никого</p>
      ) : (
        shown.map((c) => <ClientCard key={c.id} c={c} tourTitles={tourTitles} />)
      )}

      <datalist id="crm-tours">
        {tourTitles.map((t) => (
          <option key={t} value={t} />
        ))}
      </datalist>
    </div>
  )
}

type Draft = Omit<CrmClient, "id" | "created_at">
const EMPTY: Draft = {
  name: "", channel: "instagram", contact: "", status: "new", date_from: null, date_to: null,
  people: null, tour: "", price_usd: null, note: "", remind_on: null,
}

function toRow(d: Draft) {
  const n = (v: unknown) => (v === "" || v === undefined ? null : v)
  return {
    name: d.name.trim(), channel: d.channel, contact: n(d.contact?.trim()), status: d.status,
    date_from: n(d.date_from), date_to: n(d.date_to), people: d.people || null, tour: n(d.tour?.trim()),
    price_usd: d.price_usd || null, note: n(d.note?.trim()), remind_on: n(d.remind_on), updated_at: new Date().toISOString(),
  }
}

function ClientForm({ initial, onDone, id }: { initial?: Draft; onDone: () => void; id?: string; tourTitles: string[] }) {
  const router = useRouter()
  const [d, setD] = useState<Draft>(initial ?? EMPTY)
  const [err, setErr] = useState<string | null>(null)
  const [pending, start] = useTransition()
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((x) => ({ ...x, [k]: v }))

  function save() {
    if (!d.name.trim()) return setErr("Укажите имя")
    start(async () => {
      const sb = createClient()
      const row = toRow(d)
      const { error } = id ? await sb.from("crm_clients").update(row).eq("id", id) : await sb.from("crm_clients").insert(row)
      if (error) return setErr(error.message)
      router.refresh()
      onDone()
    })
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4">
      <div className="grid grid-cols-1 gap-3 min-[460px]:grid-cols-2">
        <Input placeholder="Имя *" value={d.name} onChange={(e) => set("name", e.target.value)} className="h-10" />
        <div className="flex gap-2">
          <select value={d.channel} onChange={(e) => set("channel", e.target.value as Draft["channel"])} className={cn(FIELD, "w-auto bg-card")}>
            {CHANNELS.map((c) => (
              <option key={c.key} value={c.key}>{c.label}</option>
            ))}
          </select>
          <Input placeholder="ник или номер" value={d.contact ?? ""} onChange={(e) => set("contact", e.target.value)} className="h-10" />
        </div>
        <label className="text-xs text-muted-foreground">
          Приезд
          <input type="date" value={d.date_from ?? ""} onChange={(e) => set("date_from", e.target.value || null)} className={cn(FIELD, "mt-1")} />
        </label>
        <label className="text-xs text-muted-foreground">
          Отъезд
          <input type="date" value={d.date_to ?? ""} onChange={(e) => set("date_to", e.target.value || null)} className={cn(FIELD, "mt-1")} />
        </label>
        <Input placeholder="Тур" list="crm-tours" value={d.tour ?? ""} onChange={(e) => set("tour", e.target.value)} className="h-10" />
        <div className="flex gap-2">
          <Input type="number" inputMode="numeric" placeholder="Человек" value={d.people ?? ""} onChange={(e) => set("people", e.target.value ? Number(e.target.value) : null)} className="h-10" />
          <Input type="number" inputMode="decimal" placeholder="Цена $" value={d.price_usd ?? ""} onChange={(e) => set("price_usd", e.target.value ? Number(e.target.value) : null)} className="h-10" />
        </div>
        <select value={d.status} onChange={(e) => set("status", e.target.value as Status)} className={cn(FIELD, "bg-card")}>
          {STATUSES.map((s) => (
            <option key={s.key} value={s.key}>{s.label}</option>
          ))}
        </select>
        <label className="text-xs text-muted-foreground">
          Напомнить
          <input type="date" value={d.remind_on ?? ""} onChange={(e) => set("remind_on", e.target.value || null)} className={cn(FIELD, "mt-1")} />
        </label>
      </div>
      <textarea
        placeholder="Заметка: о чём договорились, отель, пожелания"
        value={d.note ?? ""}
        onChange={(e) => set("note", e.target.value)}
        rows={2}
        className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-[15px] outline-none focus:border-primary"
      />
      {err && <p className="text-sm text-destructive">{err}</p>}
      <div className="flex gap-2">
        <Button onClick={save} disabled={pending}>{id ? "Сохранить" : "Добавить"}</Button>
        <Button variant="ghost" onClick={onDone}>Отмена</Button>
      </div>
    </div>
  )
}

function ClientCard({ c, tourTitles }: { c: CrmClient; tourTitles: string[] }) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [pending, start] = useTransition()
  const st = STATUSES.find((s) => s.key === c.status)!
  const href = contactHref(c)
  const isDue = ACTIVE.includes(c.status) && c.remind_on && c.remind_on <= today()

  function patch(fields: Partial<CrmClient>) {
    start(async () => {
      await createClient().from("crm_clients").update({ ...fields, updated_at: new Date().toISOString() }).eq("id", c.id)
      router.refresh()
    })
  }

  function remove() {
    if (!window.confirm(`Удалить ${c.name}?`)) return
    start(async () => {
      await createClient().from("crm_clients").delete().eq("id", c.id)
      router.refresh()
    })
  }

  if (editing) {
    const { id, created_at, ...draft } = c
    void created_at
    return <ClientForm id={id} initial={draft} tourTitles={tourTitles} onDone={() => setEditing(false)} />
  }

  const dates = c.date_from ? `${fmtDate(c.date_from)}${c.date_to ? ` - ${fmtDate(c.date_to)}` : ""}` : null
  const facts = [dates && `📅 ${dates}`, c.people && `👥 ${c.people}`, c.tour && `🗺 ${c.tour}`, c.price_usd && `💵 $${c.price_usd}`].filter(Boolean)

  return (
    <div className={cn("rounded-2xl border bg-card p-4", isDue ? "border-amber-500/60" : "border-border", pending && "opacity-60")}>
      <div className="flex items-start justify-between gap-3">
        <button type="button" onClick={() => setEditing(true)} className="min-w-0 text-left">
          <div className="text-[17px] font-semibold">{c.name}</div>
          <div className="mt-0.5 text-sm text-muted-foreground">
            {CHANNELS.find((x) => x.key === c.channel)?.label}
            {c.contact ? `: ${c.contact}` : ""}
          </div>
        </button>
        <span className={cn("shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold", st.cls)}>{st.label}</span>
      </div>

      {facts.length > 0 && <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-sm">{facts.map((f) => <span key={String(f)}>{f}</span>)}</div>}
      {c.note && <p className="mt-2 text-sm whitespace-pre-line text-muted-foreground">{c.note}</p>}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {href && (
          <a href={href} target="_blank" rel="noreferrer" className={buttonVariants({ size: "sm", variant: "outline" })}>
            Написать
          </a>
        )}
        <select
          value={c.status}
          onChange={(e) => patch({ status: e.target.value as Status })}
          className="h-8 rounded-lg border border-input bg-card px-2 text-sm"
          aria-label="Статус"
        >
          {STATUSES.map((s) => (
            <option key={s.key} value={s.key}>{s.label}</option>
          ))}
        </select>
        <label className={cn("flex items-center gap-1.5 text-sm", isDue ? "text-amber-300" : "text-muted-foreground")}>
          🔔
          <input
            type="date"
            value={c.remind_on ?? ""}
            onChange={(e) => patch({ remind_on: e.target.value || null })}
            className="h-8 rounded-lg border border-input bg-transparent px-2 text-sm"
            aria-label="Напомнить"
          />
        </label>
        <Button size="icon-sm" variant="ghost" onClick={remove} aria-label="Удалить" className="ml-auto">
          <Trash2Icon className="size-4" />
        </Button>
      </div>
    </div>
  )
}
