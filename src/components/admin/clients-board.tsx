"use client"

import { useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { CopyIcon, PlusIcon, SearchIcon, Trash2Icon } from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"
import { buildNote, nowStamp, parseNote, stampRu } from "@/lib/crm-note"
import { cn } from "@/lib/utils"

// CRM Виктора. 2026-11-10 (2-я итерация): «комментарии с датой, скругления как на сайте,
// переключатели вверху не нравятся, фильтры старые/новые/срочные - в стиле рола
// (выпадающий список - на телефоне это барабан), агенту скопировать всё одним
// нажатием, на фаст-треке отмечать старшего группы».

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

export const STATUSES: { key: Status; label: string; pill: string; dot: string }[] = [
  { key: "new", label: "Новый", pill: "bg-sky-500 text-white", dot: "bg-sky-500" },
  { key: "thinking", label: "Думает", pill: "bg-amber-400 text-amber-950", dot: "bg-amber-400" },
  { key: "on_arrival", label: "По приезду", pill: "bg-violet-500 text-white", dot: "bg-violet-500" },
  { key: "booked", label: "Забронировал", pill: "bg-emerald-500 text-white", dot: "bg-emerald-500" },
  { key: "lost", label: "Отказ", pill: "bg-zinc-600 text-zinc-100", dot: "bg-zinc-600" },
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

type Order = "urgent" | "newest" | "oldest" | "arrival"
const ORDERS: { key: Order; label: string }[] = [
  { key: "urgent", label: "Сначала срочные" },
  { key: "arrival", label: "По дате приезда" },
  { key: "newest", label: "Сначала новые" },
  { key: "oldest", label: "Сначала старые" },
]

const today = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh" }).format(new Date())

function contactHref(c: CrmClient): string | null {
  const v = (c.contact ?? "").trim()
  if (!v) return null
  if (/^https?:\/\//.test(v)) return v
  const phone = v.match(/\+?\d[\d\s()-]{7,}\d/)
  if (c.channel === "whatsapp" && phone) return `https://wa.me/${phone[0].replace(/\D/g, "")}`
  const nick = v.split(/[\s(,]/)[0].replace(/^@/, "")
  if (c.channel === "instagram" && /^[\w.]+$/.test(nick)) return `https://instagram.com/${nick}`
  if (c.channel === "telegram" && /^\w+$/.test(nick)) return `https://t.me/${nick}`
  return null
}

function fmtDate(iso: string | null) {
  if (!iso) return ""
  return new Date(`${iso}T00:00:00`).toLocaleDateString("ru-RU", { day: "numeric", month: "short" })
}

const isDue = (c: CrmClient) => ACTIVE.includes(c.status) && !!c.remind_on && c.remind_on <= today()

function urgentKey(c: CrmClient): [number, string] {
  // 0 - пора написать, 1 - напомнить позже, 2 - без даты
  if (c.remind_on && ACTIVE.includes(c.status)) return [c.remind_on <= today() ? 0 : 1, c.remind_on]
  return [2, ""]
}

function sortBy(order: Order) {
  return (a: CrmClient, b: CrmClient) => {
    if (order === "newest") return b.created_at.localeCompare(a.created_at)
    if (order === "oldest") return a.created_at.localeCompare(b.created_at)
    if (order === "arrival") return (a.date_from ?? "9999").localeCompare(b.date_from ?? "9999")
    const [ga, da] = urgentKey(a)
    const [gb, db] = urgentKey(b)
    if (ga !== gb) return ga - gb
    if (da !== db) return da.localeCompare(db)
    return b.created_at.localeCompare(a.created_at)
  }
}

/** Всё для агента одним текстом (Виктор: «чтобы ему было легко и понятно») */
function agentText(c: CrmClient): string {
  const n = parseNote(c.note)
  const dates = c.date_from ? `${c.date_from}${c.date_to ? ` - ${c.date_to}` : ""}` : "уточняется"
  return [
    `${KINDS.find((k) => k.key === kindOf(c))?.emoji} ${c.tour || "Запрос"}`,
    `Клиент / Client: ${c.name}`,
    `Даты / Dates: ${dates}`,
    ...(c.people ? [`Человек / Pax: ${c.people}`] : []),
    ...(n.leader ? [`Старший группы / Group leader: ${n.leader}`] : []),
    ...(c.contact ? [`Контакт / Contact: ${c.contact}`] : []),
    ...(n.body ? [`Детали / Details: ${n.body}`] : []),
  ].join("\n")
}

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}

const SELECT =
  "h-11 w-full min-w-0 cursor-pointer rounded-md border border-border bg-card px-3 text-[15px] font-semibold outline-none focus:border-primary"

export function ClientsBoard({ clients, tourTitles }: { clients: CrmClient[]; tourTitles: string[] }) {
  const [status, setStatus] = useState<"active" | "due" | "all" | Status>("active")
  const [kind, setKind] = useState<"all" | Kind>("all")
  const [order, setOrder] = useState<Order>("urgent")
  const [q, setQ] = useState("")
  const [adding, setAdding] = useState(false)
  const [copiedAll, setCopiedAll] = useState(false)

  const count = (f: (c: CrmClient) => boolean) => clients.filter(f).length
  const due = count(isDue)
  const activeCount = count((c) => ACTIVE.includes(c.status))
  const pipelineUsd = clients.filter((c) => ACTIVE.includes(c.status)).reduce((s, c) => s + (Number(c.price_usd) || 0), 0)
  const bookedUsd = clients.filter((c) => c.status === "booked").reduce((s, c) => s + (Number(c.price_usd) || 0), 0)

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return clients
      .filter((c) =>
        status === "active" ? ACTIVE.includes(c.status) : status === "due" ? isDue(c) : status === "all" ? true : c.status === status,
      )
      .filter((c) => kind === "all" || kindOf(c) === kind)
      .filter((c) => !needle || [c.name, c.contact, c.tour, c.note].some((v) => v?.toLowerCase().includes(needle)))
      .sort(sortBy(order))
  }, [clients, status, kind, order, q])

  async function copyAll() {
    if (await copyText(shown.map(agentText).join("\n\n— — —\n\n"))) {
      setCopiedAll(true)
      setTimeout(() => setCopiedAll(false), 2000)
    }
  }

  return (
    <div className="mt-5 space-y-4">
      {/* Сводка одной строкой: цифры кликабельны */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-md border border-border bg-card px-4 py-3 text-sm">
        <button type="button" onClick={() => setStatus("due")} className="font-semibold text-amber-300">
          🔔 Пора написать: <b className="text-base">{due}</b>
        </button>
        <span className="text-muted-foreground">
          В работе: <b className="text-foreground">{activeCount}</b>
        </span>
        <span className="text-muted-foreground">
          Потенциал: <b className="text-foreground">${Math.round(pipelineUsd)}</b>
        </span>
        <span className="text-muted-foreground">
          Забронировано: <b className="text-emerald-400">${Math.round(bookedUsd)}</b>
        </span>
      </div>

      {/* Фильтры выпадающими списками (на телефоне - барабан) */}
      <div className="grid grid-cols-2 gap-2 lg:grid-cols-[repeat(3,minmax(0,220px))_1fr_auto]">
        <select value={status} onChange={(e) => setStatus(e.target.value as typeof status)} aria-label="Стадия" className={SELECT}>
          <option value="active">В работе ({activeCount})</option>
          <option value="due">🔔 Пора написать ({due})</option>
          {STATUSES.map((s) => (
            <option key={s.key} value={s.key}>
              {s.label} ({count((c) => c.status === s.key)})
            </option>
          ))}
          <option value="all">Все ({clients.length})</option>
        </select>
        <select value={kind} onChange={(e) => setKind(e.target.value as typeof kind)} aria-label="Тип" className={SELECT}>
          <option value="all">Все типы</option>
          {KINDS.map((k) => (
            <option key={k.key} value={k.key}>
              {k.emoji} {k.label} ({count((c) => kindOf(c) === k.key && ACTIVE.includes(c.status))})
            </option>
          ))}
        </select>
        <select value={order} onChange={(e) => setOrder(e.target.value as Order)} aria-label="Порядок" className={SELECT}>
          {ORDERS.map((o) => (
            <option key={o.key} value={o.key}>
              {o.label}
            </option>
          ))}
        </select>
        <div className="relative min-w-0">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Поиск" className="h-11 rounded-md pl-9" />
        </div>
        <div className="col-span-2 flex gap-2 lg:col-span-1">
          <Button size="lg" onClick={() => setAdding(true)} disabled={adding} className="h-11 flex-1 rounded-md lg:flex-none">
            <PlusIcon className="size-4" /> Добавить
          </Button>
          <Button size="lg" variant="outline" onClick={copyAll} disabled={!shown.length} className="h-11 flex-1 rounded-md lg:flex-none">
            <CopyIcon className="size-4" /> {copiedAll ? "Скопировано" : `Агенту (${shown.length})`}
          </Button>
        </div>
      </div>

      {adding && <ClientForm tourTitles={tourTitles} onDone={() => setAdding(false)} />}

      {shown.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">Здесь пока никого</p>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {shown.map((c) => (
            <ClientCard key={c.id} c={c} tourTitles={tourTitles} />
          ))}
        </div>
      )}

      <datalist id="crm-tours">
        {tourTitles.map((t) => (
          <option key={t} value={t} />
        ))}
      </datalist>
    </div>
  )
}

function ClientCard({ c, tourTitles }: { c: CrmClient; tourTitles: string[] }) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const [editing, setEditing] = useState(false)
  const [comment, setComment] = useState("")
  const [showAll, setShowAll] = useState(false)
  const [copied, setCopied] = useState(false)
  const st = STATUSES.find((s) => s.key === c.status)!
  const href = contactHref(c)
  const n = parseNote(c.note)
  const kind = KINDS.find((k) => k.key === kindOf(c))!

  const patch = (fields: Partial<CrmClient>) =>
    start(async () => {
      await createClient().from("crm_clients").update({ ...fields, updated_at: new Date().toISOString() }).eq("id", c.id)
      router.refresh()
    })

  function addComment() {
    const text = comment.trim()
    if (!text) return
    patch({ note: buildNote({ ...n, comments: [...n.comments, { at: nowStamp(), text }] }) })
    setComment("")
  }

  function remove() {
    if (!window.confirm(`Удалить ${c.name}?`)) return
    start(async () => {
      await createClient().from("crm_clients").delete().eq("id", c.id)
      router.refresh()
    })
  }

  async function copy() {
    if (await copyText(agentText(c))) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (editing) {
    const { id, created_at, ...draft } = c
    void created_at
    return <ClientForm id={id} initial={draft} tourTitles={tourTitles} onDone={() => setEditing(false)} />
  }

  const dates = c.date_from ? `${fmtDate(c.date_from)}${c.date_to ? ` - ${fmtDate(c.date_to)}` : ""}` : null
  const facts = [dates && `📅 ${dates}`, c.people && `👥 ${c.people}`, c.price_usd && `💵 $${Number(c.price_usd)}`].filter(Boolean)
  const comments = [...n.comments].reverse()
  const visible = showAll ? comments : comments.slice(0, 2)

  return (
    <div
      className={cn(
        "relative flex flex-col overflow-hidden rounded-md border bg-card p-4 pl-5",
        isDue(c) ? "border-amber-400/70" : "border-border",
        pending && "opacity-60",
      )}
    >
      <span className={cn("absolute inset-y-0 left-0 w-1.5", st.dot)} aria-hidden />
      <div className="flex items-start justify-between gap-3">
        <button type="button" onClick={() => setEditing(true)} className="min-w-0 text-left">
          <div className="text-[17px] leading-tight font-semibold">{c.name}</div>
          <div className="mt-0.5 truncate text-sm text-muted-foreground">
            {CHANNELS.find((x) => x.key === c.channel)?.label}
            {c.contact ? `: ${c.contact}` : ""}
          </div>
        </button>
        <select
          value={c.status}
          onChange={(e) => patch({ status: e.target.value as Status })}
          aria-label="Стадия"
          className={cn("h-8 shrink-0 cursor-pointer rounded-md border-0 px-2.5 text-xs font-bold outline-none", st.pill)}
        >
          {STATUSES.map((s) => (
            <option key={s.key} value={s.key} className="bg-card text-foreground">
              {s.label}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-2 text-sm">
        <span className="mr-1">{kind.emoji}</span>
        {c.tour || <span className="text-muted-foreground">вопрос</span>}
      </div>
      {facts.length > 0 && (
        <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-sm">
          {facts.map((f) => (
            <span key={String(f)}>{f}</span>
          ))}
        </div>
      )}
      {n.leader && (
        <div className="mt-2 inline-flex w-fit items-center gap-1.5 rounded-md bg-amber-400/15 px-2 py-1 text-sm font-semibold text-amber-200">
          👑 Старший: {n.leader}
        </div>
      )}
      {n.body && <p className="mt-2 line-clamp-3 text-sm whitespace-pre-line text-muted-foreground" title={n.body}>{n.body}</p>}

      {/* История комментариев: дата и текст */}
      <div className="mt-3 space-y-1.5 border-t border-border pt-3">
        {visible.map((m, i) => (
          <div key={`${m.at}-${i}`} className="text-sm">
            <span className="mr-1.5 text-xs font-semibold text-muted-foreground">{stampRu(m.at)}</span>
            {m.text}
          </div>
        ))}
        {comments.length > 2 && (
          <button type="button" onClick={() => setShowAll((v) => !v)} className="text-xs font-semibold text-primary">
            {showAll ? "Свернуть" : `Ещё ${comments.length - 2}`}
          </button>
        )}
        <div className="flex gap-2">
          <Input
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addComment()}
            placeholder="Комментарий…"
            className="h-9 rounded-md text-sm"
          />
          <Button size="sm" onClick={addComment} disabled={!comment.trim() || pending} className="h-9 rounded-md">
            ➤
          </Button>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {href && (
          <a href={href} target="_blank" rel="noreferrer" className={cn(buttonVariants({ size: "sm", variant: "outline" }), "rounded-md")}>
            Написать
          </a>
        )}
        <Button size="sm" variant="outline" onClick={copy} className="rounded-md">
          <CopyIcon className="size-3.5" /> {copied ? "Скопировано" : "Агенту"}
        </Button>
        <label className={cn("flex items-center gap-1 text-sm", isDue(c) ? "text-amber-300" : "text-muted-foreground")}>
          🔔
          <input
            type="date"
            value={c.remind_on ?? ""}
            onChange={(e) => patch({ remind_on: e.target.value || null })}
            aria-label="Напомнить"
            className={cn("h-8 rounded-md border bg-transparent px-2 text-sm", isDue(c) ? "border-amber-400 font-semibold" : "border-input")}
          />
        </label>
        <Button size="icon-sm" variant="ghost" onClick={remove} aria-label="Удалить" className="ml-auto rounded-md">
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

const FIELD = "h-10 w-full rounded-md border border-input bg-transparent px-3 text-[15px] outline-none focus:border-primary"
const CHIP = "shrink-0 rounded-md border-2 px-3 py-1.5 text-sm font-semibold transition-colors"
const chipCls = (on: boolean) =>
  on ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground hover:text-foreground"

/** Напоминание за неделю до приезда (Виктор 2026-11-10), но не раньше сегодня */
function weekBefore(dateFrom: string | null): string | null {
  if (!dateFrom) return null
  const d = new Date(Date.parse(`${dateFrom}T00:00:00Z`) - 7 * 86400_000).toISOString().slice(0, 10)
  return d > today() ? d : today()
}

function ClientForm({ initial, onDone, id }: { initial?: Draft; onDone: () => void; id?: string; tourTitles: string[] }) {
  const router = useRouter()
  const start0 = initial ?? EMPTY
  const parsed = parseNote(start0.note)
  const [d, setD] = useState<Draft>(start0)
  const [body, setBody] = useState(parsed.body)
  const [leader, setLeader] = useState(parsed.leader)
  const [err, setErr] = useState<string | null>(null)
  const [pending, start] = useTransition()
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((x) => ({ ...x, [k]: v }))
  const kind = kindOf(d)

  function save() {
    if (!d.name.trim()) return setErr("Укажите имя")
    const n = (v: unknown) => (v === "" || v === undefined ? null : v)
    const row = {
      name: d.name.trim(), channel: d.channel, contact: n(d.contact?.trim()), status: d.status,
      date_from: n(d.date_from), date_to: n(d.date_to), people: d.people || null, tour: n(d.tour?.trim()),
      price_usd: d.price_usd || null, remind_on: n(d.remind_on) ?? weekBefore(d.date_from),
      note: buildNote({ body, leader, comments: parsed.comments }), updated_at: new Date().toISOString(),
    }
    start(async () => {
      const sb = createClient()
      const { error } = id ? await sb.from("crm_clients").update(row).eq("id", id) : await sb.from("crm_clients").insert(row)
      if (error) return setErr(error.message)
      router.refresh()
      onDone()
    })
  }

  return (
    <div className="flex flex-col gap-3 rounded-md border-2 border-primary/50 bg-card p-4 md:col-span-2 xl:col-span-3">
      <div className="flex flex-wrap gap-1.5">
        {KINDS.map((k) => (
          <button key={k.key} type="button" onClick={() => kind !== k.key && set("tour", k.preset)} className={cn(CHIP, chipCls(kind === k.key))}>
            {k.emoji} {k.label}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Input placeholder="Имя *" value={d.name} onChange={(e) => set("name", e.target.value)} className="h-10 rounded-md" />
        <div className="flex gap-2 lg:col-span-2">
          <select value={d.channel} onChange={(e) => set("channel", e.target.value as Draft["channel"])} className={cn(FIELD, "w-auto bg-card")}>
            {CHANNELS.map((c) => (
              <option key={c.key} value={c.key}>{c.label}</option>
            ))}
          </select>
          <Input placeholder="ник или номер" value={d.contact ?? ""} onChange={(e) => set("contact", e.target.value)} className="h-10 rounded-md" />
        </div>
        <Input placeholder="Что хочет: тур, фаст-трек, билеты" list="crm-tours" value={d.tour ?? ""} onChange={(e) => set("tour", e.target.value)} className="h-10 rounded-md" />
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
            <Input type="number" inputMode="numeric" placeholder="чел." value={d.people ?? ""} onChange={(e) => set("people", e.target.value ? Number(e.target.value) : null)} className="h-10 rounded-md" />
            <Input type="number" inputMode="decimal" placeholder="$" value={d.price_usd ?? ""} onChange={(e) => set("price_usd", e.target.value ? Number(e.target.value) : null)} className="h-10 rounded-md" />
          </div>
        </label>
        <label className="text-xs text-muted-foreground">
          Напомнить {d.date_from && !d.remind_on ? "(авто: за неделю)" : ""}
          <input type="date" value={d.remind_on ?? ""} onChange={(e) => set("remind_on", e.target.value || null)} className={cn(FIELD, "mt-1")} />
        </label>
      </div>
      {(kind === "fasttrack" || leader) && (
        <label className="text-xs text-muted-foreground">
          👑 Старший группы
          <Input placeholder="Имя и телефон старшего" value={leader} onChange={(e) => setLeader(e.target.value)} className="mt-1 h-10 rounded-md" />
        </label>
      )}
      <div className="flex flex-wrap gap-1.5">
        {STATUSES.map((s) => (
          <button
            key={s.key}
            type="button"
            onClick={() => set("status", s.key)}
            className={cn("rounded-md px-3 py-1.5 text-sm font-bold transition-opacity", s.pill, d.status === s.key ? "ring-2 ring-foreground ring-offset-2 ring-offset-card" : "opacity-45")}
          >
            {s.label}
          </button>
        ))}
      </div>
      <textarea
        placeholder="Заметка: рейс, отель, о чём договорились"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={3}
        className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-[15px] outline-none focus:border-primary"
      />
      {err && <p className="text-sm text-destructive">{err}</p>}
      <div className="flex gap-2">
        <Button onClick={save} disabled={pending} className="rounded-md">{id ? "Сохранить" : "Добавить"}</Button>
        <Button variant="ghost" onClick={onDone} className="rounded-md">Отмена</Button>
      </div>
    </div>
  )
}
