"use client"

import { useRef, useState } from "react"
import {
  FT_MAX_PASSPORTS,
  FT_MAX_PEOPLE,
  FT_PRICE_USD,
  FT_ZONES,
  quote,
} from "@/lib/fasttrack"
import { PARK_WHATSAPP } from "../park/park-config"
import { WhatsAppIcon } from "../park/whatsapp-icon"

// Форма фаст-трека (Виктор 2026-11-10): туристы просили прикреплять паспорта
// прямо на сайте, а не присылать в Instagram. Паспорта сжимаем в браузере
// и отправляем по одному: каждый уходит Виктору в Telegram и не хранится.

const LABEL = "mb-1.5 block text-[14px] font-bold text-(--c-primary)"
const FIELD =
  "h-12 w-full rounded-md border-2 border-(--c-border) bg-white px-4 text-[16px] text-(--c-ink) outline-none placeholder:text-[#9aa3a8] focus:border-(--c-primary)"

type Passport = { id: string; file: File; preview: string | null }
type Status = "idle" | "sending" | "uploading" | "done" | "failed" | "rate_limited"

/** Фото паспорта уменьшаем до 2000px по длинной стороне (JPEG ~0.5 МБ, текст читается) */
async function compress(file: File): Promise<File> {
  if (!file.type.startsWith("image/") || file.size < 900_000) return file
  try {
    const bmp = await createImageBitmap(file)
    const scale = Math.min(1, 2000 / Math.max(bmp.width, bmp.height))
    const canvas = document.createElement("canvas")
    canvas.width = Math.round(bmp.width * scale)
    canvas.height = Math.round(bmp.height * scale)
    canvas.getContext("2d")!.drawImage(bmp, 0, 0, canvas.width, canvas.height)
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", 0.85))
    return blob ? new File([blob], file.name.replace(/\.\w+$/, "") + ".jpg", { type: "image/jpeg" }) : file
  } catch {
    return file
  }
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-md border-2 px-3 py-2.5 text-left text-[14px] leading-tight font-bold transition-colors ${
        active ? "border-(--c-primary) bg-(--c-primary) text-white" : "border-(--c-border) bg-white text-(--c-ink)"
      }`}
    >
      {children}
    </button>
  )
}

export function FasttrackForm() {
  const [date, setDate] = useState("")
  const [flight, setFlight] = useState("")
  const [time, setTime] = useState("")
  const [people, setPeople] = useState(2)
  const [transfer, setTransfer] = useState(true)
  const [zone, setZone] = useState<string | null>(null)
  const [hotel, setHotel] = useState("")
  const [name, setName] = useState("")
  const [channel, setChannel] = useState<"whatsapp" | "telegram">("whatsapp")
  const [contact, setContact] = useState("")
  const [comment, setComment] = useState("")
  const [website, setWebsite] = useState("")
  const [passports, setPassports] = useState<Passport[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [status, setStatus] = useState<Status>("idle")
  const [progress, setProgress] = useState({ done: 0, failed: 0 })
  const [summary, setSummary] = useState("")
  const fileRef = useRef<HTMLInputElement>(null)

  const q = quote(people, transfer, zone)
  const today = new Date().toLocaleDateString("sv-SE")

  async function addFiles(list: FileList | null) {
    if (!list) return
    const room = FT_MAX_PASSPORTS - passports.length
    const picked = Array.from(list).slice(0, room)
    const added = await Promise.all(
      picked.map(async (f) => {
        const file = await compress(f)
        return {
          id: `${Date.now()}-${Math.random()}`,
          file,
          preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : null,
        }
      }),
    )
    setPassports((p) => [...p, ...added])
    if (fileRef.current) fileRef.current.value = ""
  }

  function removePassport(id: string) {
    setPassports((p) => p.filter((x) => x.id !== id))
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setStatus("sending")
    setErrors({})
    let res: Response
    try {
      res = await fetch("/api/fasttrack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, flight, time, people, transfer, zone, hotel, name, contactChannel: channel, contact, comment, website }),
      })
    } catch {
      setStatus("failed")
      return
    }
    const data = (await res.json().catch(() => ({}))) as {
      ok?: boolean
      error?: string
      errors?: Record<string, string>
      uploadToken?: string | null
      summary?: string
    }
    if (!data.ok) {
      if (data.error === "validation" && data.errors) {
        setErrors(data.errors)
        setStatus("idle")
        document.getElementById(`ft-${Object.keys(data.errors)[0]}`)?.scrollIntoView({ behavior: "smooth", block: "center" })
      } else setStatus(data.error === "rate_limited" ? "rate_limited" : "failed")
      return
    }
    setSummary(data.summary ?? "")
    if (passports.length && data.uploadToken) {
      setStatus("uploading")
      let done = 0
      let failed = 0
      for (const p of passports) {
        const fd = new FormData()
        fd.set("token", data.uploadToken)
        fd.set("file", p.file)
        const ok = await fetch("/api/fasttrack/passport", { method: "POST", body: fd })
          .then((r) => r.ok)
          .catch(() => false)
        if (ok) done++
        else failed++
        setProgress({ done, failed })
      }
    }
    setStatus("done")
    window.scrollTo({ top: document.getElementById("ft-form")?.offsetTop ?? 0, behavior: "smooth" })
  }

  if (status === "done") {
    const wa = `${PARK_WHATSAPP.href}?text=${encodeURIComponent(summary)}`
    return (
      <div className="space-y-3 rounded-lg bg-(--c-primary) p-5 text-white">
        <p className="text-[26px] leading-none">✅</p>
        <h3 className="text-[20px] font-extrabold">Заявка у Виктора</h3>
        <p className="text-[15px] leading-snug opacity-95">
          Напишем вам в {channel === "whatsapp" ? "WhatsApp" : "Telegram"} и подтвердим фаст-трек.
          {passports.length > 0 && progress.failed === 0 && ` Паспорта получены: ${progress.done}.`}
        </p>
        {progress.failed > 0 && (
          <p className="rounded-md bg-white/15 px-4 py-3 text-[14px]">
            Не все паспорта дошли ({progress.done} из {passports.length}). Пришлите остальные в WhatsApp.
          </p>
        )}
        {summary && <pre className="rounded-md bg-white/12 px-4 py-3 font-sans text-[13.5px] leading-snug whitespace-pre-wrap">{summary}</pre>}
        <a
          href={wa}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-13 items-center justify-center gap-2 rounded-md bg-[#25d366] text-[16px] font-extrabold text-white"
        >
          <WhatsAppIcon className="size-5 fill-white" /> Продублировать в WhatsApp
        </a>
      </div>
    )
  }

  return (
    <form id="ft-form" onSubmit={submit} noValidate className="space-y-4 rounded-lg bg-(--c-bg-2) p-4 sm:p-5">
      <input
        type="text"
        tabIndex={-1}
        autoComplete="off"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        className="hidden"
        aria-hidden
      />

      <div className="grid grid-cols-1 gap-3 min-[400px]:grid-cols-2">
        <div id="ft-date">
          <label className={LABEL} htmlFor="ft-date-in">Дата прилёта</label>
          <input id="ft-date-in" type="date" min={today} value={date} onChange={(e) => setDate(e.target.value)} className={FIELD} />
          <Err text={errors.date} />
        </div>
        <div id="ft-time">
          <label className={LABEL} htmlFor="ft-time-in">
            Время <span className="font-normal text-(--c-muted)">по билету</span>
          </label>
          <input id="ft-time-in" type="time" value={time} onChange={(e) => setTime(e.target.value)} className={FIELD} />
          <Err text={errors.time} />
        </div>
      </div>

      <div id="ft-flight">
        <label className={LABEL} htmlFor="ft-flight-in">Номер рейса</label>
        <input
          id="ft-flight-in"
          value={flight}
          onChange={(e) => setFlight(e.target.value.toUpperCase())}
          placeholder="например VJ 975"
          autoCapitalize="characters"
          className={FIELD}
        />
        <Err text={errors.flight} />
      </div>

      <div id="ft-people" className="flex items-center justify-between gap-3 rounded-md border-2 border-(--c-border) bg-white px-4 py-2.5">
        <span className="text-[15px] font-bold text-(--c-primary)">
          Сколько человек
          <span className="block text-[12px] font-normal text-(--c-muted)">все, кто летит, включая детей</span>
        </span>
        <span className="flex items-center gap-3">
          <StepBtn label="Меньше" onClick={() => setPeople((n) => Math.max(1, n - 1))}>−</StepBtn>
          <b className="w-7 text-center text-[20px] tabular-nums">{people}</b>
          <StepBtn label="Больше" onClick={() => setPeople((n) => Math.min(FT_MAX_PEOPLE, n + 1))}>+</StepBtn>
        </span>
      </div>

      <div>
        <span className={LABEL}>Трансфер до отеля</span>
        <div className="grid grid-cols-2 gap-2">
          <Chip active={transfer} onClick={() => setTransfer(true)}>
            🚐 Нужен
            <span className={`mt-0.5 block text-[12px] font-semibold ${transfer ? "text-(--c-on-primary)" : "text-(--c-muted)"}`}>
              водитель ждёт на выходе
            </span>
          </Chip>
          <Chip active={!transfer} onClick={() => setTransfer(false)}>
            ✈️ Только фаст-трек
            <span className={`mt-0.5 block text-[12px] font-semibold ${!transfer ? "text-(--c-on-primary)" : "text-(--c-muted)"}`}>
              ${FT_PRICE_USD} за человека
            </span>
          </Chip>
        </div>
      </div>

      {transfer && (
        <>
          <div id="ft-zone">
            <span className={LABEL}>Район отеля</span>
            <div className="grid grid-cols-1 gap-2 min-[400px]:grid-cols-2">
              {FT_ZONES.map((z) => (
                <Chip key={z.id} active={zone === z.id} onClick={() => setZone(z.id)}>
                  {z.label}
                  <span className={`mt-0.5 block text-[12px] font-semibold ${zone === z.id ? "text-(--c-on-primary)" : "text-(--c-muted)"}`}>
                    {z.note}
                    {z.extraUsd ? ` · +$${z.extraUsd}` : ""}
                  </span>
                </Chip>
              ))}
            </div>
            <Err text={errors.zone} />
          </div>
          <div id="ft-hotel">
            <label className={LABEL} htmlFor="ft-hotel-in">Отель</label>
            <input id="ft-hotel-in" value={hotel} onChange={(e) => setHotel(e.target.value)} placeholder="Название отеля" className={FIELD} />
            <Err text={errors.hotel} />
          </div>
        </>
      )}

      <div id="ft-name">
        <label className={LABEL} htmlFor="ft-name-in">Как к вам обращаться</label>
        <input id="ft-name-in" value={name} onChange={(e) => setName(e.target.value)} placeholder="Имя" autoComplete="given-name" className={FIELD} />
        <Err text={errors.name} />
      </div>

      <div id="ft-contact">
        <span className={LABEL}>Куда вам написать</span>
        <div className="mb-2 grid grid-cols-2 gap-2">
          <Chip active={channel === "whatsapp"} onClick={() => setChannel("whatsapp")}>WhatsApp</Chip>
          <Chip active={channel === "telegram"} onClick={() => setChannel("telegram")}>Telegram</Chip>
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
        <span className={LABEL}>
          Паспорта <span className="font-normal text-(--c-muted)">можно сейчас или позже в WhatsApp</span>
        </span>
        {passports.length > 0 && (
          <div className="mb-2 grid grid-cols-3 gap-2 min-[400px]:grid-cols-4">
            {passports.map((p, i) => (
              <div key={p.id} className="relative aspect-[3/4] overflow-hidden rounded-md border-2 border-(--c-border) bg-white">
                {p.preview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.preview} alt={`Паспорт ${i + 1}`} className="size-full object-cover" />
                ) : (
                  <span className="flex size-full items-center justify-center text-[12px] font-bold text-(--c-muted)">PDF</span>
                )}
                <button
                  type="button"
                  onClick={() => removePassport(p.id)}
                  aria-label={`Убрать паспорт ${i + 1}`}
                  className="absolute top-1 right-1 flex size-7 items-center justify-center rounded-full bg-black/60 text-[15px] text-white"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
        {passports.length < FT_MAX_PASSPORTS && (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex h-14 w-full items-center justify-center gap-2 rounded-md border-2 border-dashed border-(--c-primary) bg-white text-[15px] font-bold text-(--c-primary)"
          >
            📎 {passports.length ? "Добавить ещё" : "Прикрепить фото паспортов"}
          </button>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*,application/pdf"
          multiple
          className="hidden"
          onChange={(e) => addFiles(e.target.files)}
        />
        <p className="mt-1.5 text-[12px] leading-snug text-(--c-muted)">
          🔒 Разворот с фото каждого, кто летит. Паспорта уходят напрямую Виктору и не хранятся на сайте.
        </p>
      </div>

      <div>
        <label className={LABEL} htmlFor="ft-comment">
          Комментарий <span className="font-normal text-(--c-muted)">если нужно</span>
        </label>
        <textarea
          id="ft-comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={2}
          placeholder="Дети, коляска, много багажа"
          className="w-full rounded-md border-2 border-(--c-border) bg-white px-4 py-3 text-[16px] outline-none focus:border-(--c-primary)"
        />
      </div>

      <div aria-live="polite" className="rounded-md border-2 border-(--c-border) bg-white px-4 py-3 text-[14px] leading-snug">
        <p className="text-[12px] font-bold tracking-[0.12em] text-(--c-primary)">🧾 ВАШ ЗАКАЗ · {people} ЧЕЛ.</p>
        <div className="mt-2 flex items-baseline justify-between gap-3">
          <span>Фаст-трек × {people}</span>
          <span className="tabular-nums">${q.fasttrackUsd}</span>
        </div>
        {transfer && (
          <div className="mt-1 flex items-baseline justify-between gap-3">
            <span className="min-w-0">Машина до отеля{zone ? "" : " (выберите район)"}</span>
            <span className="shrink-0 tabular-nums">
              {q.totalUsd !== null ? `+$${q.totalUsd - q.fasttrackUsd}` : "уточним"}
            </span>
          </div>
        )}
        <p className="mt-2 flex items-baseline justify-between gap-3 border-t border-(--c-border) pt-2 text-[17px] font-extrabold">
          <span>Итого</span>
          <span className="tabular-nums">{q.totalUsd !== null ? `$${q.totalUsd}` : `$${q.fasttrackUsd} + машина`}</span>
        </p>
      </div>

      {status === "failed" && <Problem text="Не получилось отправить. Напишите Виктору в WhatsApp - оформим вручную." />}
      {status === "rate_limited" && <Problem text="Слишком много заявок подряд. Попробуйте позже или напишите в WhatsApp." />}

      <button
        type="submit"
        disabled={status === "sending" || status === "uploading"}
        className="h-14 w-full rounded-md bg-(--c-accent) text-[16px] font-extrabold text-white shadow-[0_8px_20px_rgb(0_0_0/0.18)] transition active:scale-[0.99] disabled:opacity-60"
      >
        {status === "sending"
          ? "Отправляем…"
          : status === "uploading"
            ? `Отправляем паспорта ${progress.done + progress.failed + 1}/${passports.length}…`
            : "Заказать фаст-трек"}
      </button>
    </form>
  )
}

function StepBtn({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="flex size-10 items-center justify-center rounded-full bg-(--c-primary) text-[22px] leading-none font-bold text-white active:scale-95"
    >
      {children}
    </button>
  )
}

function Err({ text }: { text?: string }) {
  return text ? <p className="mt-1 text-[13px] font-semibold text-[#b3402a]">{text}</p> : null
}

function Problem({ text }: { text: string }) {
  return <p className="rounded-md bg-[#fbe4dc] px-4 py-3 text-[14px] font-semibold text-[#8a2f16]">{text}</p>
}
