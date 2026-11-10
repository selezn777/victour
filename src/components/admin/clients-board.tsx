"use client"

import { useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { PlusIcon, SearchIcon, Trash2Icon } from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"

// CRM Виктора (2026-11-08, переделка 2026-11-10: «стадию не видно, ни цвета, по ширине
// экрана, кнопки-переключатели как на сайте»). Лиды из Instagram/WhatsApp и заявки
// фаст-трека с сайта (crm_clients). Сверху воронка по стадиям, фильтры по типу
// (туры / фаст-трек / билеты / вопросы), на компьютере таблица, на телефоне карточки.

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

export const STATUSES: { key: Status; label: string; pill: string; bar: string }[] = [
  { key: "new", label: "Новый", pill: "bg-sky-500 text-white", bar: "bg-sky-500" },
  { key: "thinking", label: "Думает", pill: "bg-amber-400 text-amber-950", bar: "bg-amber-400" },
  { key: "on_arrival", label: "По приезду", pill: "bg-violet-500 text-white", bar: "bg-violet-500" },
  { key: "booked", label: "Забронировал", pill: "bg-emerald-500 text-white", bar: "bg-emerald-500" },
  { key: "lost", label: "Отказ", pill: "bg-zinc-600 text-zinc-100", bar: "bg-zinc-600" },
]
const ACTIVE: Status[] = ["new", "thinking", "on_arrival"]

type Kind = "tour" | "fasttrack" | "tickets" | "question"
const KINDS: { key: Kind; label: string; emoji: string; preset: string }[] = [
  { key: "tour", label: "Туры", emoji: "🗺", preset: "" },
  { key: "fasttrack", label: "Фаст-трек", emoji: "✈️", preset: "Фаст-трек" },
  { key: "tickets", label: "Билеты", emoji: "🎟", preset: "Билеты " },
  { key: "question", label: "Вопросы", emoji: "💬", preset: "Вопрос: " },
]

/** Тип лида по тексту «что хочет» - отдельной колонки в базе нет */
function kindOf(c: Pick<CrmClient, "tour">): Kind {
  const t = (c.tour ?? "").toLowerCase()
  if (!t || t.startsWith("вопрос")) return "question"
  if (t.includes("фаст")) return "fasttrack"
  if (/билет|vinwonders|винвондерс|сафари|канатк|парк/.test(t)) return "tickets"
  return "tour"
}

const CHANNELS: { key: CrmClient["channel"]; label: string }[] = [
  { key: "instagram", label: "Instagram" },
  { key: "whatsapp", label: "WhatsApp" },
  { key: "telegram", label: "Telegram" },
  { key: "other", label: "Другое" },
]

const today = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh" }).format(new Date())

function contactHref(c: CrmClient): string | null {
  const v = (c.contact ?? "").trim()
  if (!v) return null
  if (/^https?:\/\//.test(v)) return v
  const nick = v.split(/[\s(]/)[0].replace(/^@/, "")
  if (c.channel === "instagram" && /^[\w.]+$/.test(nick)) return `https://instagram.com/${nick}`
  if (c.channel === "telegram" && /^\w+$/.test(nick)) return `https://t.me/${nick}`
  if (c.channel === "whatsapp" && v.replace(/\D/g, "").length >= 8) return `https://wa.me/${v.replace(/\D/g, "")}`
  return null
}

function fmtDate(iso: string | null) {
  if (!iso) return ""
  return new Date(`${iso}T00:00:00`).toLocaleDateString("ru-RU", { day: "numeric", month: "short" })
}

function sortKey(c: CrmClient): [number, string] {
  // 0 - пора написать, 1 - напомнить позже, 2 - без даты
  if (c.remind_on && ACTIVE.includes(c.status)) return [c.remind_on <= today() ? 0 : 1, c.remind_on]
  return [2, ""]
}

const isDue = (c: CrmClient) => ACTIVE.includes(c.status) && !!c.remind_on && c.remind_on <= today()

const CHIP = "shrink-0 rounded-full border-2 px-3.5 py-1.5 text-sm font-semibold transition-colors"
const chipCls = (on: boolean) =>
  on ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground hover:text-foreground"

export function ClientsBoard({ clients, tourTitles }: { clients: CrmClient[]; tourTitles: string[] }) {
  const [status, setStatus] = useState<"active" | "due" | "all" | Status>("active")
  const [kind, setKind] = useState<"all" | Kind>("all")
  const [q, setQ] = useState("")
  const [adding, setAdding] = useState(false)

  const byStatus = useMemo(() => {
    const m: Record<string, number> = {}
    for (const c of clients) m[c.status] = (m[c.status] ?? 0) + 1
    return m
  }, [clients])
  const due = clients.filter(isDue).length
  const activeCount = clients.filter((c) => ACTIVE.includes(c.status)).length
  const pipelineUsd = clients
    .filter((c) => ACTIVE.includes(c.status))
    .reduce((s, c) => s + (Number(c.price_usd) || 0), 0)
  const bookedUsd = clients.filter((c) => c.status === "booked").reduce((s, c) => s + (Number(c.price_usd) || 0), 0)

  const byKind = useMemo(() => {
    const m: Record<string, number> = {}
    for (const c of clients) if (ACTIVE.includes(c.status)) m[kindOf(c)] = (m[kindOf(c)] ?? 0) + 1
    return m
  }, [clients])

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return clients
      .filter((c) =>
        status === "active" ? ACTIVE.includes(c.status) : status === "due" ? isDue(c) : status === "all" ? true : c.status === status,
      )
      .filter((c) => kind === "all" || kindOf(c) === kind)
      .filter((c) => !needle || [c.name, c.contact, c.tour, c.note].some((v) => v?.toLowerCase().includes(needle)))
      .sort((a, b) => {
        const [ga, da] = sortKey(a)
        const [gb, db] = sortKey(b)
        if (ga !== gb) return ga - gb
        if (da !== db) return da.localeCompare(db)
        return b.created_at.localeCompare(a.created_at)
      })
  }, [clients, status, kind, q])

  return (
    <div className="mt-6 space-y-4">
      {/* Воронка: сколько на какой стадии, клик - фильтр */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        <button
          type="button"
          onClick={() => setStatus("due")}
          className={cn(
            "rounded-2xl border-2 p-3 text-left transition-colors",
            status === "due" ? "border-amber-400 bg-amber-400/15" : "border-amber-400/40 bg-card",
          )}
        >
          <div className="text-xs font-semibold text-amber-300">🔔 Пора написать</div>
          <div className="mt-1 text-2xl font-bold tabular-nums">{due}</div>
        </button>
        {STATUSES.map((s) => (
          <button
            key={s.key}
            type="button"
            onClick={() => setStatus(s.key)}
            className={cn(
              "rounded-2xl border-2 bg-card p-3 text-left transition-colors",
              status === s.key ? "border-primary" : "border-border",
            )}
          >
            <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
              <span className={cn("size-2.5 rounded-full", s.bar)} /> {s.label}
            </div>
            <div className="mt-1 text-2xl font-bold tabular-nums">{byStatus[s.key] ?? 0}</div>
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-muted-foreground">
        <span>
          В работе: <b className="text-foreground">{activeCount}</b>
        </span>
        <span>
          Потенциал: <b className="text-foreground">${Math.round(pipelineUsd)}</b>
        </span>
        <span>
          Забронировано: <b className="text-emerald-400">${Math.round(bookedUsd)}</b>
        </span>
      </div>

      {/* Фильтры-переключатели */}
      <div className="space-y-2">
        <div className="-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
          {(
            [
              { key: "active", label: `В работе ${activeCount}` },
              { key: "all", label: `Все ${clients.length}` },
            ] as const
          ).map((s) => (
            <button key={s.key} type="button" onClick={() => setStatus(s.key)} className={cn(CHIP, chipCls(status === s.key))}>
              {s.label}
            </button>
          ))}
          <span className="mx-1 w-px shrink-0 self-stretch bg-border" />
          <button type="button" onClick={() => setKind("all")} className={cn(CHIP, chipCls(kind === "all"))}>
            Всё
          </button>
          {KINDS.map((k) => (
            <button key={k.key} type="button" onClick={() => setKind(k.key)} className={cn(CHIP, chipCls(kind === k.key))}>
              {k.emoji} {k.label} <span className="opacity-70">{byKind[k.key] ?? 0}</span>
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-0 flex-1 sm:max-w-xs">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Поиск: имя, ник, отель" className="h-10 pl-9" />
          </div>
          {!adding && (
            <Button size="lg" onClick={() => setAdding(true)}>
              <PlusIcon className="size-4" /> Добавить
            </Button>
          )}
        </div>
      </div>

      {adding && <ClientForm tourTitles={tourTitles} onDone={() => setAdding(false)} />}

      {shown.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">Здесь пока никого</p>
      ) : (
        <>
          {/* Компьютер: таблица */}
          <div className="hidden overflow-hidden rounded-2xl border border-border lg:block">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left text-xs font-semibold text-muted-foreground">
                <tr>
                  <th className="px-3 py-2.5">Клиент</th>
                  <th className="px-3 py-2.5">Что хочет</th>
                  <th className="px-3 py-2.5 whitespace-nowrap">Приезд</th>
                  <th className="px-3 py-2.5 text-right">Чел.</th>
                  <th className="px-3 py-2.5 text-right">Сумма</th>
                  <th className="px-3 py-2.5">Стадия</th>
                  <th className="px-3 py-2.5">Напомнить</th>
                  <th className="px-3 py-2.5" />
                </tr>
              </thead>
              <tbody>
                {shown.map((c) => (
                  <ClientRow key={c.id} c={c} tourTitles={tourTitles} />
                ))}
              </tbody>
            </table>
          </div>
          {/* Телефон и планшет: карточки */}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:hidden">
            {shown.map((c) => (
              <ClientCard key={c.id} c={c} tourTitles={tourTitles} />
            ))}
          </div>
        </>
      )}

      <datalist id="crm-tours">
        {tourTitles.map((t) => (
          <option key={t} value={t} />
        ))}
      </datalist>
    </div>
  )
}

function useClientActions(c: CrmClient) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const patch = (fields: Partial<CrmClient>) =>
    start(async () => {
      await createClient().from("crm_clients").update({ ...fields, updated_at: new Date().toISOString() }).eq("id", c.id)
      router.refresh()
    })
  const remove = () => {
    if (!window.confirm(`Удалить ${c.name}?`)) return
    start(async () => {
      await createClient().from("crm_clients").delete().eq("id", c.id)
      router.refresh()
    })
  }
  return { pending, patch, remove }
}

function StatusSelect({ c, patch }: { c: CrmClient; patch: (f: Partial<CrmClient>) => void }) {
  const st = STATUSES.find((s) => s.key === c.status)!
  return (
    <select
      value={c.status}
      onChange={(e) => patch({ status: e.target.value as Status })}
      aria-label="Стадия"
      className={cn("h-8 cursor-pointer rounded-full border-0 px-3 text-xs font-bold outline-none", st.pill)}
    >
      {STATUSES.map((s) => (
        <option key={s.key} value={s.key} className="bg-card text-foreground">
          {s.label}
        </option>
      ))}
    </select>
  )
}

function RemindInput({ c, patch }: { c: CrmClient; patch: (f: Partial<CrmClient>) => void }) {
  return (
    <input
      type="date"
      value={c.remind_on ?? ""}
      onChange={(e) => patch({ remind_on: e.target.value || null })}
      aria-label="Напомнить"
      className={cn(
        "h-8 rounded-lg border bg-transparent px-2 text-sm",
        isDue(c) ? "border-amber-400 font-semibold text-amber-300" : "border-input text-muted-foreground",
      )}
    />
  )
}

function KindBadge({ c }: { c: CrmClient }) {
  const k = KINDS.find((x) => x.key === kindOf(c))!
  return <span className="mr-1">{k.emoji}</span>
}

function ClientRow({ c, tourTitles }: { c: CrmClient; tourTitles: string[] }) {
  const { pending, patch, remove } = useClientActions(c)
  const [editing, setEditing] = useState(false)
  const href = contactHref(c)
  if (editing) {
    const { id, created_at, ...draft } = c
    void created_at
    return (
      <tr>
        <td colSpan={8} className="p-3">
          <ClientForm id={id} initial={draft} tourTitles={tourTitles} onDone={() => setEditing(false)} />
        </td>
      </tr>
    )
  }
  return (
    <tr className={cn("border-t border-border align-top", isDue(c) && "bg-amber-400/5", pending && "opacity-60")}>
      <td className="max-w-56 px-3 py-2.5">
        <button type="button" onClick={() => setEditing(true)} className="text-left font-semibold hover:underline">
          {c.name}
        </button>
        <div className="truncate text-xs text-muted-foreground">
          {CHANNELS.find((x) => x.key === c.channel)?.label}
          {c.contact ? `: ${c.contact}` : ""}
        </div>
      </td>
      <td className="max-w-80 px-3 py-2.5">
        <div>
          <KindBadge c={c} />
          {c.tour || <span className="text-muted-foreground">вопрос</span>}
        </div>
        {c.note && <div className="mt-0.5 line-clamp-2 text-xs text-muted-foreground" title={c.note}>{c.note}</div>}
      </td>
      <td className="px-3 py-2.5 whitespace-nowrap">
        {fmtDate(c.date_from)}
        {c.date_to ? ` - ${fmtDate(c.date_to)}` : ""}
      </td>
      <td className="px-3 py-2.5 text-right tabular-nums">{c.people ?? ""}</td>
      <td className="px-3 py-2.5 text-right font-semibold tabular-nums">{c.price_usd ? `$${Number(c.price_usd)}` : ""}</td>
      <td className="px-3 py-2.5">
        <StatusSelect c={c} patch={patch} />
      </td>
      <td className="px-3 py-2.5">
        <RemindInput c={c} patch={patch} />
      </td>
      <td className="px-3 py-2.5">
        <div className="flex items-center justify-end gap-1">
          {href && (
            <a href={href} target="_blank" rel="noreferrer" className={buttonVariants({ size: "sm", variant: "outline" })}>
              Написать
            </a>
          )}
          <Button size="icon-sm" variant="ghost" onClick={remove} aria-label="Удалить">
            <Trash2Icon className="size-4" />
          </Button>
        </div>
      </td>
    </tr>
  )
}

function ClientCard({ c, tourTitles }: { c: CrmClient; tourTitles: string[] }) {
  const { pending, patch, remove } = useClientActions(c)
  const [editing, setEditing] = useState(false)
  const st = STATUSES.find((s) => s.key === c.status)!
  const href = contactHref(c)

  if (editing) {
    const { id, created_at, ...draft } = c
    void created_at
    return <ClientForm id={id} initial={draft} tourTitles={tourTitles} onDone={() => setEditing(false)} />
  }

  const dates = c.date_from ? `${fmtDate(c.date_from)}${c.date_to ? ` - ${fmtDate(c.date_to)}` : ""}` : null
  const facts = [dates && `📅 ${dates}`, c.people && `👥 ${c.people}`, c.price_usd && `💵 $${Number(c.price_usd)}`].filter(Boolean)

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border bg-card p-4 pl-5",
        isDue(c) ? "border-amber-400/70" : "border-border",
        pending && "opacity-60",
      )}
    >
      <span className={cn("absolute inset-y-0 left-0 w-1.5", st.bar)} aria-hidden />
      <div className="flex items-start justify-between gap-3">
        <button type="button" onClick={() => setEditing(true)} className="min-w-0 text-left">
          <div className="text-[17px] leading-tight font-semibold">{c.name}</div>
          <div className="mt-0.5 truncate text-sm text-muted-foreground">
            {CHANNELS.find((x) => x.key === c.channel)?.label}
            {c.contact ? `: ${c.contact}` : ""}
          </div>
        </button>
        <StatusSelect c={c} patch={patch} />
      </div>

      <div className="mt-2 text-sm">
        <KindBadge c={c} />
        {c.tour || <span className="text-muted-foreground">вопрос</span>}
      </div>
      {facts.length > 0 && (
        <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-sm">
          {facts.map((f) => (
            <span key={String(f)}>{f}</span>
          ))}
        </div>
      )}
      {c.note && <p className="mt-2 line-clamp-3 text-sm whitespace-pre-line text-muted-foreground">{c.note}</p>}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {href && (
          <a href={href} target="_blank" rel="noreferrer" className={buttonVariants({ size: "sm", variant: "outline" })}>
            Написать
          </a>
        )}
        <span className="text-sm">🔔</span>
        <RemindInput c={c} patch={patch} />
        <Button size="icon-sm" variant="ghost" onClick={remove} aria-label="Удалить" className="ml-auto">
          <Trash2Icon className="size-4" />
        </Button>
      </div>
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

const FIELD = "h-10 w-full rounded-lg border border-input bg-transparent px-3 text-[15px] outline-none focus:border-primary"

/** Напоминание за неделю до приезда (Виктор 2026-11-10), но не раньше сегодня */
function weekBefore(dateFrom: string | null): string | null {
  if (!dateFrom) return null
  const d = new Date(Date.parse(`${dateFrom}T00:00:00Z`) - 7 * 86400_000).toISOString().slice(0, 10)
  return d > today() ? d : today()
}

function ClientForm({ initial, onDone, id }: { initial?: Draft; onDone: () => void; id?: string; tourTitles: string[] }) {
  const router = useRouter()
  const [d, setD] = useState<Draft>(initial ?? EMPTY)
  const [err, setErr] = useState<string | null>(null)
  const [pending, start] = useTransition()
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((x) => ({ ...x, [k]: v }))
  const kind = kindOf(d)

  function save() {
    if (!d.name.trim()) return setErr("Укажите имя")
    start(async () => {
      const sb = createClient()
      const row = toRow({ ...d, remind_on: d.remind_on ?? weekBefore(d.date_from) })
      const { error } = id ? await sb.from("crm_clients").update(row).eq("id", id) : await sb.from("crm_clients").insert(row)
      if (error) return setErr(error.message)
      router.refresh()
      onDone()
    })
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl border-2 border-primary/50 bg-card p-4">
      <div className="flex flex-wrap gap-1.5">
        {KINDS.map((k) => (
          <button
            key={k.key}
            type="button"
            onClick={() => kind !== k.key && set("tour", k.preset)}
            className={cn(CHIP, chipCls(kind === k.key))}
          >
            {k.emoji} {k.label}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Input placeholder="Имя *" value={d.name} onChange={(e) => set("name", e.target.value)} className="h-10" />
        <div className="flex gap-2 lg:col-span-2">
          <select value={d.channel} onChange={(e) => set("channel", e.target.value as Draft["channel"])} className={cn(FIELD, "w-auto bg-card")}>
            {CHANNELS.map((c) => (
              <option key={c.key} value={c.key}>{c.label}</option>
            ))}
          </select>
          <Input placeholder="ник или номер" value={d.contact ?? ""} onChange={(e) => set("contact", e.target.value)} className="h-10" />
        </div>
        <Input placeholder="Что хочет: тур, фаст-трек, билеты" list="crm-tours" value={d.tour ?? ""} onChange={(e) => set("tour", e.target.value)} className="h-10" />
        <label className="text-xs text-muted-foreground">
          Приезд
          <input type="date" value={d.date_from ?? ""} onChange={(e) => set("date_from", e.target.value || null)} className={cn(FIELD, "mt-1")} />
        </label>
        <label className="text-xs text-muted-foreground">
          Отъезд
          <input type="date" value={d.date_to ?? ""} onChange={(e) => set("date_to", e.target.value || null)} className={cn(FIELD, "mt-1")} />
        </label>
        <label className="text-xs text-muted-foreground">
          Человек / цена $
          <div className="mt-1 flex gap-2">
            <Input type="number" inputMode="numeric" placeholder="чел." value={d.people ?? ""} onChange={(e) => set("people", e.target.value ? Number(e.target.value) : null)} className="h-10" />
            <Input type="number" inputMode="decimal" placeholder="$" value={d.price_usd ?? ""} onChange={(e) => set("price_usd", e.target.value ? Number(e.target.value) : null)} className="h-10" />
          </div>
        </label>
        <label className="text-xs text-muted-foreground">
          Напомнить {d.date_from && !d.remind_on ? "(авто: за неделю)" : ""}
          <input type="date" value={d.remind_on ?? ""} onChange={(e) => set("remind_on", e.target.value || null)} className={cn(FIELD, "mt-1")} />
        </label>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {STATUSES.map((s) => (
          <button
            key={s.key}
            type="button"
            onClick={() => set("status", s.key)}
            className={cn("rounded-full px-3.5 py-1.5 text-sm font-bold transition-opacity", s.pill, d.status === s.key ? "ring-2 ring-foreground ring-offset-2 ring-offset-card" : "opacity-45")}
          >
            {s.label}
          </button>
        ))}
      </div>
      <textarea
        placeholder="Заметка: о чём договорились, отель, пожелания"
        value={d.note ?? ""}
        onChange={(e) => set("note", e.target.value)}
        rows={3}
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
