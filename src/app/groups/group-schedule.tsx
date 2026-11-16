"use client"

import { useState } from "react"
import type { GroupDeparture } from "@/lib/group-departures"
import { formatDateRu, formatDateShort } from "@/lib/group-schedule-parse"
import { PARK_WHATSAPP, waTextLink } from "../park/park-config"
import { WhatsAppIcon } from "../park/whatsapp-icon"

// Даты групповых выездов внутри карточки программы (Виктор 15.11: всегда карточка с фото и временем,
// а по кнопке дат - все даты и сколько человек на каждую). «Записаться» раскрывает короткую форму.

const LABEL = "mb-1.5 block text-[14px] font-bold text-(--c-primary)"
const FIELD =
  "h-12 w-full rounded-md border-2 border-(--c-border) bg-white px-4 text-[16px] text-(--c-ink) outline-none placeholder:text-[#9aa3a8] focus:border-(--c-primary)"

export function plural(n: number, one: string, few: string, many: string): string {
  const m10 = n % 10
  const m100 = n % 100
  if (m10 === 1 && m100 !== 11) return one
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few
  return many
}

function left(d: GroupDeparture) {
  return Math.max(0, d.seatsTotal - d.seatsBooked)
}

/** Кнопка «Даты: …» в карточке программы. По тапу - все даты списком: сколько записано и свободно, запись на нужную. */
export function ProgramDates({ departures, title }: { departures: GroupDeparture[]; title: string }) {
  const [open, setOpen] = useState(false)
  const [openId, setOpenId] = useState<string | null>(null)
  const preview = [...new Set(departures.map((d) => d.date))].slice(0, 4)
  const more = new Set(departures.map((d) => d.date)).size - preview.length

  if (!departures.length) {
    return (
      <a
        href={waTextLink(PARK_WHATSAPP.display, `Здравствуйте! Хочу в групповой тур «${title}». Какие ближайшие даты?`)}
        target="_blank"
        rel="noopener noreferrer"
        className="flex min-h-12 items-center justify-center gap-2 rounded-md bg-(--c-bg-2) px-3 py-2 text-center text-[14px] font-bold text-(--c-primary)"
      >
        <WhatsAppIcon className="size-4 fill-[#25d366]" /> Узнать даты и записаться
      </a>
    )
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={`flex min-h-12 w-full flex-wrap items-center justify-center gap-x-1.5 rounded-md px-3 py-2 text-center text-[14px] font-bold transition active:scale-[0.99] ${
          open ? "border-2 border-(--c-border) bg-white text-(--c-primary)" : "bg-(--c-accent) text-white"
        }`}
      >
        {open ? (
          "Свернуть даты"
        ) : (
          <>
            Даты: {preview.map(formatDateShort).join(", ")}
            {more > 0 && <span className="font-semibold opacity-90">и ещё {more}</span>}
          </>
        )}
      </button>

      {open && (
        <ul className="mt-2.5 space-y-2.5">
          {departures.map((d) => {
            const free = left(d)
            const isOpen = openId === d.id
            return (
              <li key={d.id} className="rounded-md bg-(--c-bg) p-3">
                <div className="mb-2 flex items-baseline justify-between gap-2">
                  <b className="text-[15.5px] text-(--c-ink) first-letter:uppercase">{formatDateRu(d.date)}</b>
                  {d.priceUsd !== null && <span className="text-[13px] font-bold text-(--c-primary)">от ${d.priceUsd}</span>}
                </div>
                <Seats d={d} />
                {free > 0 ? (
                  <button
                    type="button"
                    onClick={() => setOpenId((id) => (id === d.id ? null : d.id))}
                    aria-expanded={isOpen}
                    className={`mt-2.5 h-11 w-full rounded-md text-[14.5px] font-extrabold transition active:scale-[0.99] ${
                      isOpen ? "border-2 border-(--c-border) bg-white text-(--c-primary)" : "bg-(--c-primary) text-white"
                    }`}
                  >
                    {isOpen ? "Свернуть" : "Записаться на эту дату"}
                  </button>
                ) : (
                  <a
                    href={waTextLink(PARK_WHATSAPP.display, `Здравствуйте! Группа ${formatDateRu(d.date)} «${d.tourTitle}» собрана. Можно в лист ожидания или на другую дату?`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2.5 flex h-11 w-full items-center justify-center rounded-md border-2 border-(--c-border) bg-white text-[14px] font-bold text-(--c-primary)"
                  >
                    В лист ожидания через WhatsApp
                  </a>
                )}
                {isOpen && free > 0 && <SignupForm d={d} free={free} />}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

function Seats({ d }: { d: GroupDeparture }) {
  const free = left(d)
  const pct = Math.round((d.seatsBooked / d.seatsTotal) * 100)
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2 text-[13px]">
        <b className={free === 0 ? "text-(--c-muted)" : free <= 3 ? "text-(--c-accent)" : "text-(--c-primary)"}>
          {free === 0 ? "Группа собрана" : `Свободно ${free} ${plural(free, "место", "места", "мест")}`}
        </b>
        <span className="text-(--c-muted) tabular-nums">
          записано {d.seatsBooked} из {d.seatsTotal}
        </span>
      </div>
      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-(--c-bg-2)" aria-hidden>
        <div className="h-full rounded-full bg-(--c-primary-2)" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

type Status = "idle" | "sending" | "done" | "failed" | "rate_limited" | "full"

function SignupForm({ d, free }: { d: GroupDeparture; free: number }) {
  const [people, setPeople] = useState(Math.min(2, free))
  const [name, setName] = useState("")
  const [channel, setChannel] = useState<"whatsapp" | "telegram">("whatsapp")
  const [contact, setContact] = useState("")
  const [comment, setComment] = useState("")
  const [website, setWebsite] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [status, setStatus] = useState<Status>("idle")
  const [summary, setSummary] = useState("")
  const fid = (k: string) => `gs-${d.id}-${k}`

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setStatus("sending")
    setErrors({})
    try {
      const res = await fetch("/api/group-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ departureId: d.id, people, name, contactChannel: channel, contact, comment, website }),
      })
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string; errors?: Record<string, string>; summary?: string }
      if (data.ok) {
        setSummary(data.summary ?? "")
        setStatus("done")
      } else if (data.error === "validation" && data.errors) {
        setErrors(data.errors)
        setStatus("idle")
      } else if (data.error === "full" || data.error === "departure_gone") setStatus("full")
      else setStatus(data.error === "rate_limited" ? "rate_limited" : "failed")
    } catch {
      setStatus("failed")
    }
  }

  if (status === "done") {
    return (
      <div className="mt-3.5 space-y-3 rounded-md bg-(--c-primary) p-4 text-white">
        <p className="text-[18px] font-extrabold">✅ Заявка у Виктора</p>
        <p className="text-[14.5px] leading-snug opacity-95">
          Напишем вам в {channel === "whatsapp" ? "WhatsApp" : "Telegram"}, подтвердим место и расскажем, откуда забираем.
        </p>
        <a
          href={waTextLink(PARK_WHATSAPP.display, summary)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-12 items-center justify-center gap-2 rounded-md bg-[#25d366] text-[15px] font-extrabold text-white"
        >
          <WhatsAppIcon className="size-5 fill-white" /> Продублировать в WhatsApp
        </a>
      </div>
    )
  }

  return (
    <form onSubmit={submit} noValidate className="mt-3.5 space-y-3.5 rounded-md bg-(--c-bg-2) p-3.5">
      <input type="text" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} className="hidden" aria-hidden />

      <div className="flex items-center justify-between gap-3 rounded-md border-2 border-(--c-border) bg-white px-4 py-2">
        <span className="text-[15px] font-bold text-(--c-primary)">
          Сколько вас
          {d.priceUsd !== null && (
            <span className="block text-[12px] font-normal text-(--c-muted)">
              итого ${d.priceUsd * people}
            </span>
          )}
        </span>
        <span className="flex items-center gap-3">
          <StepBtn label="Меньше" onClick={() => setPeople((n) => Math.max(1, n - 1))} disabled={people <= 1}>
            −
          </StepBtn>
          <b className="w-7 text-center text-[20px] tabular-nums">{people}</b>
          <StepBtn label="Больше" onClick={() => setPeople((n) => Math.min(free, n + 1))} disabled={people >= free}>
            +
          </StepBtn>
        </span>
      </div>
      <Err text={errors.people} />

      <div>
        <label className={LABEL} htmlFor={fid("name")}>Как к вам обращаться</label>
        <input id={fid("name")} value={name} onChange={(e) => setName(e.target.value)} placeholder="Имя" autoComplete="given-name" className={FIELD} />
        <Err text={errors.name} />
      </div>

      <div>
        <span className={LABEL}>Куда вам написать</span>
        <div className="mb-2 grid grid-cols-2 gap-2">
          {(["whatsapp", "telegram"] as const).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setChannel(c)}
              aria-pressed={channel === c}
              className={`h-11 rounded-md border-2 text-[14px] font-bold ${
                channel === c ? "border-(--c-primary) bg-(--c-primary) text-white" : "border-(--c-border) bg-white text-(--c-ink)"
              }`}
            >
              {c === "whatsapp" ? "WhatsApp" : "Telegram"}
            </button>
          ))}
        </div>
        <input
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          placeholder={channel === "whatsapp" ? "+7 999 123-45-67" : "@ник или номер"}
          inputMode={channel === "whatsapp" ? "tel" : "text"}
          autoComplete={channel === "whatsapp" ? "tel" : "off"}
          className={FIELD}
          aria-label="Контакт"
        />
        <Err text={errors.contact} />
      </div>

      <div>
        <label className={LABEL} htmlFor={fid("comment")}>
          Комментарий <span className="font-normal text-(--c-muted)">если нужно</span>
        </label>
        <input id={fid("comment")} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Отель, дети, вопросы" className={FIELD} />
      </div>

      {status === "failed" && <Problem text="Не получилось отправить. Напишите Виктору в WhatsApp, запишем вручную." />}
      {status === "rate_limited" && <Problem text="Слишком много заявок подряд. Попробуйте позже или напишите в WhatsApp." />}
      {status === "full" && <Problem text="Пока вы заполняли, места закончились. Обновите страницу или напишите в WhatsApp." />}

      <button
        type="submit"
        disabled={status === "sending"}
        className="h-13 w-full rounded-md bg-(--c-accent) text-[16px] font-extrabold text-white shadow-[0_8px_20px_rgb(0_0_0/0.18)] transition active:scale-[0.99] disabled:opacity-60"
      >
        {status === "sending" ? "Отправляем…" : `Записаться: ${people} ${plural(people, "человек", "человека", "человек")}`}
      </button>
      <p className="text-center text-[12px] leading-snug text-(--c-muted)">
        Виктор напишет и подтвердит место. Групповые туры - по 100% предоплате, при неявке или отказе в день выезда деньги не
        возвращаются.
      </p>
    </form>
  )
}

function StepBtn({ label, onClick, disabled, children }: { label: string; onClick: () => void; disabled?: boolean; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className="flex size-10 items-center justify-center rounded-full border-2 border-(--c-primary) text-[20px] font-bold text-(--c-primary) disabled:opacity-35"
    >
      {children}
    </button>
  )
}

function Err({ text }: { text?: string }) {
  return text ? <p className="mt-1 text-[13px] font-semibold text-[#b3261e]">{text}</p> : null
}

function Problem({ text }: { text: string }) {
  return <p className="rounded-md bg-[#fde8e6] px-4 py-3 text-[14px] leading-snug text-[#8c1d18]">{text}</p>
}
