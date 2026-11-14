"use client"

import { useEffect, useRef, useState } from "react"
import {
  FT_CAR_MAX_PEOPLE,
  FT_FILE_TYPES,
  FT_MAX_FILE_BYTES,
  FT_MAX_PASSPORTS,
  FT_MAX_PEOPLE,
  FT_MAX_VOUCHERS,
  FT_PRICE_USD,
  FT_SBP,
  FT_STEPS,
  FT_ZONES,
  ftDateRu,
  guessZone,
  normalizeFt,
  quote,
  toPassportLatin,
  validateFtStep,
  type FtPay,
  type FtStepId,
} from "@/lib/fasttrack"
import { PARK_WHATSAPP } from "../park/park-config"
import { WhatsAppIcon } from "../park/whatsapp-icon"

// Мастер заявки на фаст-трек (Виктор 2026-11-14: «чуть-чуть инфы и сразу форма, пошагово,
// тык-тык-тык»). Шаг 0 - короткое описание (приходит с сервера в intro), дальше 5 шагов,
// по одному экрану. Кнопка «назад» телефона возвращает на прошлый шаг (history.pushState).
// Текстовые поля живут в sessionStorage: обновление страницы ничего не стирает.

type Passenger = { ru: string; en: string; enTouched: boolean }
type Draft = {
  people: number
  passengers: Passenger[]
  whatsapp: string
  date: string
  time: string
  flight: string
  fromCity: string
  transfer: boolean
  zone: string | null
  zoneTouched: boolean
  hotel: string
  depDate: string
  depTime: string
  depFlight: string
  pay: FtPay
  comment: string
}
type Doc = { id: string; file: File; preview: string | null }
type Status = "idle" | "sending" | "uploading" | "failed" | "rate_limited"
type Result = { ref: string; delivered: boolean; summary: string; filesSent: number; filesFailed: number; filesTotal: number }

const EMPTY: Draft = {
  people: 1,
  passengers: [{ ru: "", en: "", enTouched: false }],
  whatsapp: "",
  date: "",
  time: "",
  flight: "",
  fromCity: "",
  transfer: true,
  zone: null,
  zoneTouched: false,
  hotel: "",
  depDate: "",
  depTime: "",
  depFlight: "",
  pay: "prepay",
  comment: "",
}
const DRAFT_KEY = "ft-draft-v2"
const DONE = FT_STEPS.length + 1

const INPUT =
  "h-13 w-full rounded-[6px] border border-[#b6c4d6] bg-white px-3.5 text-[17px] text-(--c-ink) outline-none transition-[border-color,box-shadow] placeholder:text-[#98a4b3] focus:border-(--c-primary) focus:shadow-[0_0_0_3px_rgb(22_64_107/0.14)] aria-invalid:border-[#c0492d]"

/** Фото уменьшаем до 2200px по длинной стороне (JPEG ~0.6 МБ, текст паспорта читается) */
async function compress(file: File): Promise<File> {
  if (!file.type.startsWith("image/") || (file.size < 1_200_000 && FT_FILE_TYPES.includes(file.type))) return file
  try {
    const bmp = await createImageBitmap(file)
    const scale = Math.min(1, 2200 / Math.max(bmp.width, bmp.height))
    const canvas = document.createElement("canvas")
    canvas.width = Math.round(bmp.width * scale)
    canvas.height = Math.round(bmp.height * scale)
    canvas.getContext("2d")!.drawImage(bmp, 0, 0, canvas.width, canvas.height)
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", 0.86))
    return blob ? new File([blob], file.name.replace(/\.\w+$/, "") + ".jpg", { type: "image/jpeg" }) : file
  } catch {
    return file
  }
}

const toPayload = (d: Draft) => ({ ...d, passengers: d.passengers.map((p) => ({ ru: p.ru, en: p.en })) })

export function FasttrackWizard({ intro }: { intro: React.ReactNode }) {
  const [step, setStep] = useState(0)
  const [d, setD] = useState<Draft>(EMPTY)
  const [passports, setPassports] = useState<Doc[]>([])
  const [vouchers, setVouchers] = useState<Doc[]>([])
  const [fileError, setFileError] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [status, setStatus] = useState<Status>("idle")
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<Result | null>(null)
  const [website, setWebsite] = useState("")
  const doneRef = useRef(false)

  // черновик в sessionStorage: читаем при старте мастера, пишем на каждом шаге
  useEffect(() => {
    if (step < 1 || step === DONE) return
    try {
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify(d))
    } catch {}
  }, [d, step])

  function start() {
    try {
      const raw = sessionStorage.getItem(DRAFT_KEY)
      const saved = raw ? { ...EMPTY, ...(JSON.parse(raw) as Partial<Draft>) } : null
      if (saved && Array.isArray(saved.passengers) && saved.passengers.length === saved.people) setD(saved)
    } catch {}
    go(1)
  }

  useEffect(() => {
    if (status === "failed" || status === "rate_limited")
      document.getElementById("ft-problem")?.scrollIntoView({ behavior: "smooth", block: "center" })
  }, [status])

  // шаги в истории браузера: «назад» на телефоне = прошлый шаг
  useEffect(() => {
    window.history.replaceState({ ...window.history.state, ftStep: 0 }, "")
    const onPop = (e: PopStateEvent) => {
      // заявка уже ушла: назад на форму не пускаем, чтобы не отправили второй раз
      if (doneRef.current) {
        window.history.pushState({ ...window.history.state, ftStep: DONE }, "")
        return
      }
      const s = (e.state as { ftStep?: number } | null)?.ftStep
      setStep(typeof s === "number" ? s : 0)
      setErrors({})
      window.scrollTo(0, 0)
    }
    window.addEventListener("popstate", onPop)
    return () => window.removeEventListener("popstate", onPop)
  }, [])

  function go(n: number, replace = false) {
    setErrors({})
    setStep(n)
    const state = { ...window.history.state, ftStep: n }
    if (replace) window.history.replaceState(state, "")
    else window.history.pushState(state, "")
    window.scrollTo(0, 0)
  }

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => {
    setD((p) => ({ ...p, [k]: v }))
    setErrors((e) => (e[k as string] ? { ...e, [k as string]: "" } : e))
  }

  function setPeople(n: number) {
    const people = Math.max(1, Math.min(FT_MAX_PEOPLE, n))
    setD((p) => ({
      ...p,
      people,
      passengers: Array.from({ length: people }, (_, i) => p.passengers[i] ?? { ru: "", en: "", enTouched: false }),
    }))
  }

  function setPassenger(i: number, field: "ru" | "en", value: string) {
    setD((p) => ({
      ...p,
      passengers: p.passengers.map((x, j) => {
        if (j !== i) return x
        if (field === "ru") return { ...x, ru: value, en: x.enTouched ? x.en : toPassportLatin(value) }
        return { ...x, en: value.toUpperCase(), enTouched: value.trim() !== "" }
      }),
    }))
    setErrors((e) => ({ ...e, [`p${i}-${field}`]: "", [`p${i}-en`]: "" }))
  }

  function setHotel(hotel: string) {
    setD((p) => ({ ...p, hotel, zone: p.zoneTouched ? p.zone : (guessZone(hotel) ?? p.zone) }))
    setErrors((e) => ({ ...e, hotel: "", zone: "" }))
  }

  const today = typeof window === "undefined" ? "" : new Date().toLocaleDateString("sv-SE")
  const stepId: FtStepId | null = step >= 1 && step <= FT_STEPS.length ? FT_STEPS[step - 1].id : null
  const q = quote(d.people, d.transfer, d.zone, d.pay)

  function next() {
    if (!stepId) return
    const e = validateFtStep(stepId, normalizeFt(toPayload(d)), today)
    if (Object.keys(e).length) {
      setErrors(e)
      document.getElementById(`ft-${Object.keys(e)[0]}`)?.scrollIntoView({ behavior: "smooth", block: "center" })
      return
    }
    if (stepId === "check") void submit()
    else go(step + 1)
  }

  async function addFiles(kind: "passport" | "voucher", list: FileList | null) {
    if (!list) return
    setFileError("")
    const current = kind === "passport" ? passports : vouchers
    const room = (kind === "passport" ? FT_MAX_PASSPORTS : FT_MAX_VOUCHERS) - current.length
    const added: Doc[] = []
    for (const f of Array.from(list).slice(0, room)) {
      const file = await compress(f)
      if (!FT_FILE_TYPES.includes(file.type) || file.size > FT_MAX_FILE_BYTES) {
        setFileError(`«${f.name}» не подходит: нужно фото или PDF до 4 МБ. Можно прислать его в WhatsApp.`)
        continue
      }
      added.push({ id: `${Date.now()}-${Math.random()}`, file, preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : null })
    }
    if (kind === "passport") setPassports((p) => [...p, ...added])
    else setVouchers((p) => [...p, ...added])
  }

  async function submit() {
    setStatus("sending")
    let res: Response
    try {
      res = await fetch("/api/fasttrack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...toPayload(d), passportCount: passports.length, voucherCount: vouchers.length, website }),
      })
    } catch {
      setStatus("failed")
      return
    }
    const data = (await res.json().catch(() => ({}))) as {
      ok?: boolean
      error?: string
      errors?: Record<string, string>
      step?: FtStepId
      ref?: string
      delivered?: boolean
      uploadToken?: string | null
      summary?: string
    }
    if (!data.ok) {
      if (data.error === "validation" && data.errors) {
        setStatus("idle")
        go(Math.max(1, FT_STEPS.findIndex((s) => s.id === data.step) + 1))
        setErrors(data.errors)
      } else setStatus(data.error === "rate_limited" ? "rate_limited" : "failed")
      return
    }
    const files = [
      ...passports.map((p, i) => ({ kind: "passport", index: i + 1, file: p.file })),
      ...vouchers.map((p, i) => ({ kind: "voucher", index: i + 1, file: p.file })),
    ]
    let sent = 0
    let failed = 0
    if (files.length && data.uploadToken) {
      setStatus("uploading")
      for (const f of files) {
        const fd = new FormData()
        fd.set("token", data.uploadToken)
        fd.set("kind", f.kind)
        fd.set("index", String(f.index))
        fd.set("file", f.file)
        const ok = await fetch("/api/fasttrack/file", { method: "POST", body: fd })
          .then((r) => r.ok)
          .catch(() => false)
        if (ok) sent++
        else failed++
        setProgress(sent + failed)
      }
    } else failed = files.length
    try {
      sessionStorage.removeItem(DRAFT_KEY)
    } catch {}
    doneRef.current = true
    setResult({ ref: data.ref ?? "", delivered: !!data.delivered, summary: data.summary ?? "", filesSent: sent, filesFailed: failed, filesTotal: files.length })
    setStatus("idle")
    go(DONE, true)
  }

  // ---------- экраны ----------

  if (step === 0) {
    return (
      <>
        {intro}
        <Footer>
          <button type="button" onClick={start} className={PRIMARY_BTN}>
            Приступить к заполнению
          </button>
        </Footer>
      </>
    )
  }

  if (step === DONE && result) {
    const wa = `${PARK_WHATSAPP.href}?text=${encodeURIComponent(result.summary)}`
    const filesOk = result.filesTotal > 0 && result.filesFailed === 0
    return (
      <div className="px-4 pt-6 pb-10">
        <div className="rounded-[8px] border border-(--c-border) bg-white p-5">
          <span className="flex size-12 items-center justify-center rounded-full bg-[#e3f4e8] text-[24px]">✓</span>
          <h2 className="mt-3 text-[22px] leading-tight font-extrabold text-(--c-primary)">Заявка отправлена</h2>
          <p className="mt-1 text-[13px] text-(--c-muted)">Номер заявки {result.ref}</p>
          <p className="mt-3 text-[16px] leading-snug">
            Виктор напишет вам в WhatsApp и подтвердит встречу.
          </p>
          {d.pay === "prepay" && (
            <p className="mt-3 rounded-[6px] border border-(--c-border) px-3.5 py-3 text-[15px] leading-snug">
              Предоплата <b>${q.prepayUsd}</b> по СБП: <b className="tabular-nums">{FT_SBP.phone}</b>, {FT_SBP.bank}, {FT_SBP.name}{" "}
              Или по QR-коду ниже. Остальное{q.cashUsd !== null ? ` $${q.cashUsd}` : ""} наличными при встрече.
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/fasttrack/sbp-qr-v1.png" alt="QR-код для предоплаты" width={200} height={200} className="mx-auto mt-3 block size-[200px]" />
            </p>
          )}
          {filesOk && <p className="mt-2 text-[15px] text-[#2d7a45]">Документы получены: {result.filesSent}.</p>}
          {result.filesTotal === 0 && <p className="mt-2 text-[15px] text-(--c-muted)">Паспорта и ваучер пришлите в WhatsApp, когда будет удобно.</p>}
          {result.filesFailed > 0 && (
            <p className="mt-3 rounded-[6px] bg-(--c-tint) px-3.5 py-3 text-[14px] leading-snug text-(--c-tint-ink)">
              {result.filesSent > 0 ? `Дошло ${result.filesSent} из ${result.filesTotal} файлов. ` : "Файлы не загрузились. "}
              Пришлите, пожалуйста, паспорта и ваучер в WhatsApp.
            </p>
          )}
          <a href={wa} target="_blank" rel="noopener noreferrer" className={`${WA_BTN} mt-5`}>
            <WhatsAppIcon className="size-5 fill-white" />
            {result.filesFailed > 0 || result.filesTotal === 0 ? "Отправить документы в WhatsApp" : "Написать в WhatsApp"}
          </a>
        </div>
      </div>
    )
  }

  if (!stepId) return null
  const err = (k: string) => errors[k] || undefined
  const busy = status === "sending" || status === "uploading"
  const filesTotal = passports.length + vouchers.length

  return (
    <div className="flex flex-1 flex-col">
      <div className="sticky top-[calc(3.25rem+env(safe-area-inset-top))] z-20 border-b border-(--c-border) bg-(--c-bg)/95 px-4 pt-3 pb-3 backdrop-blur">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="text-[19px] font-extrabold text-(--c-primary)">{FT_STEPS[step - 1].title}</h2>
          <span className="shrink-0 text-[13px] font-semibold text-(--c-muted)">
            Шаг {step} из {FT_STEPS.length}
          </span>
        </div>
        <div className="mt-2.5 grid grid-cols-5 gap-1.5" aria-hidden>
          {FT_STEPS.map((s, i) => (
            <span key={s.id} className={`h-1.5 rounded-full ${i < step ? "bg-(--c-accent)" : "bg-(--c-bg-2)"}`} />
          ))}
        </div>
      </div>

      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault()
          next()
        }}
        className="flex flex-1 flex-col"
      >
        <input type="text" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} className="hidden" aria-hidden />
        <div className="flex-1 space-y-5 px-4 pt-5 pb-8">
          {stepId === "who" && (
            <>
              <div className="flex items-center justify-between gap-3 rounded-[6px] border border-[#b6c4d6] bg-white px-4 py-3">
                <span className="text-[16px] font-bold">
                  Сколько человек летит
                  <span className="block text-[13px] font-normal text-(--c-muted)">включая детей, ${FT_PRICE_USD} за каждого</span>
                </span>
                <span className="flex shrink-0 items-center gap-2.5">
                  <StepBtn label="Меньше" disabled={d.people <= 1} onClick={() => setPeople(d.people - 1)}>−</StepBtn>
                  <b className="w-7 text-center text-[21px] tabular-nums">{d.people}</b>
                  <StepBtn label="Больше" disabled={d.people >= FT_MAX_PEOPLE} onClick={() => setPeople(d.people + 1)}>+</StepBtn>
                </span>
              </div>

              <fieldset className="space-y-4">
                <legend className="mb-3 text-[13px] font-bold tracking-[0.1em] text-(--c-primary-2) uppercase">
                  {d.people > 1 ? "Пассажир 1 (вы)" : "Ваши данные"}
                </legend>
                <Field id="p0-ru" label="Имя и фамилия" error={err("p0-ru")}>
                  <input
                    id="ft-p0-ru-in"
                    value={d.passengers[0].ru}
                    onChange={(e) => setPassenger(0, "ru", e.target.value)}
                    placeholder="Иван Иванов"
                    autoComplete="name"
                    aria-invalid={!!err("p0-ru")}
                    className={INPUT}
                  />
                </Field>
                <Field id="p0-en" label="Как в загранпаспорте" hint="латиницей, заполнили сами, проверьте" error={err("p0-en")}>
                  <input
                    id="ft-p0-en-in"
                    value={d.passengers[0].en}
                    onChange={(e) => setPassenger(0, "en", e.target.value)}
                    placeholder="IVAN IVANOV"
                    autoCapitalize="characters"
                    autoComplete="off"
                    aria-invalid={!!err("p0-en")}
                    className={`${INPUT} uppercase`}
                  />
                </Field>
                <Field id="whatsapp" label="WhatsApp старшего группы" hint="один номер для связи, с кодом страны" error={err("whatsapp")}>
                  <input
                    id="ft-whatsapp-in"
                    value={d.whatsapp}
                    onChange={(e) => set("whatsapp", e.target.value)}
                    placeholder="+7 999 123-45-67"
                    inputMode="tel"
                    autoComplete="tel"
                    aria-invalid={!!err("whatsapp")}
                    className={INPUT}
                  />
                </Field>
              </fieldset>

              {d.people > 1 && (
                <fieldset className="space-y-3">
                  <legend className="mb-1 text-[13px] font-bold tracking-[0.1em] text-(--c-primary-2) uppercase">Остальные пассажиры</legend>
                  <p className="text-[14px] leading-snug text-(--c-muted)">Можно не заполнять, если прикрепите паспорта на шаге 4.</p>
                  {d.passengers.slice(1).map((p, j) => {
                    const i = j + 1
                    return (
                      <div key={i} className="rounded-[6px] border border-(--c-border) bg-white/60 p-3">
                        <span className="mb-2 block text-[14px] font-bold">Пассажир {i + 1}</span>
                        <div className="grid gap-2.5 sm:grid-cols-2">
                          <input
                            value={p.ru}
                            onChange={(e) => setPassenger(i, "ru", e.target.value)}
                            placeholder="Имя и фамилия"
                            aria-label={`Пассажир ${i + 1}: имя и фамилия`}
                            className={INPUT}
                          />
                          <div id={`ft-p${i}-en`}>
                            <input
                              value={p.en}
                              onChange={(e) => setPassenger(i, "en", e.target.value)}
                              placeholder="КАК В ЗАГРАНПАСПОРТЕ"
                              aria-label={`Пассажир ${i + 1}: латиницей`}
                              aria-invalid={!!err(`p${i}-en`)}
                              autoCapitalize="characters"
                              className={`${INPUT} uppercase`}
                            />
                            <Err text={err(`p${i}-en`)} />
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </fieldset>
              )}
            </>
          )}

          {stepId === "arrival" && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <Field id="date" label="Дата прилёта" error={err("date")}>
                  <input id="ft-date-in" type="date" min={today} value={d.date} onChange={(e) => set("date", e.target.value)} aria-invalid={!!err("date")} className={INPUT} />
                </Field>
                <Field id="time" label="Время" hint="по билету" error={err("time")}>
                  <input id="ft-time-in" type="time" value={d.time} onChange={(e) => set("time", e.target.value)} aria-invalid={!!err("time")} className={INPUT} />
                </Field>
              </div>
              <Field id="flight" label="Номер рейса" hint="есть в билете" error={err("flight")}>
                <input
                  id="ft-flight-in"
                  value={d.flight}
                  onChange={(e) => set("flight", e.target.value.toUpperCase())}
                  placeholder="VJ 975"
                  autoCapitalize="characters"
                  autoComplete="off"
                  aria-invalid={!!err("flight")}
                  className={`${INPUT} uppercase`}
                />
              </Field>
              <Field id="fromCity" label="Откуда летите" error={err("fromCity")}>
                <input
                  id="ft-fromCity-in"
                  value={d.fromCity}
                  onChange={(e) => set("fromCity", e.target.value)}
                  placeholder="Москва"
                  aria-invalid={!!err("fromCity")}
                  className={INPUT}
                />
              </Field>
              <p className="rounded-[6px] bg-white/70 px-3.5 py-3 text-[14px] leading-snug text-(--c-muted)">
                По номеру рейса встречаем у выхода из самолёта. Если рейс перенесут, просто напишите в WhatsApp.
              </p>
            </>
          )}

          {stepId === "hotel" && (
            <>
              <Field id="hotel" label="Отель" error={err("hotel")}>
                <input id="ft-hotel-in" value={d.hotel} onChange={(e) => setHotel(e.target.value)} placeholder="Название отеля" aria-invalid={!!err("hotel")} className={INPUT} />
              </Field>

              <div>
                <Label>Машина до отеля</Label>
                <div className="grid gap-2.5 sm:grid-cols-2">
                  <Choice active={d.transfer} onClick={() => set("transfer", true)} title="Нужна" note="по себестоимости, с заездом в обменник" />
                  <Choice active={!d.transfer} onClick={() => set("transfer", false)} title="Только фаст-трек" note="до отеля доберёмся сами" />
                </div>
              </div>

              {d.transfer && (
                <div id="ft-zone">
                  <Label>Где отель</Label>
                  <div className="grid gap-2.5 sm:grid-cols-2">
                    {FT_ZONES.map((z) => (
                      <Choice
                        key={z.id}
                        active={d.zone === z.id}
                        onClick={() => {
                          setD((p) => ({ ...p, zone: z.id, zoneTouched: true }))
                          setErrors((e) => ({ ...e, zone: "" }))
                        }}
                        title={z.label}
                        note={z.note}
                        price={d.people > FT_CAR_MAX_PEOPLE ? "уточним" : `$${z.carUsd}`}
                      />
                    ))}
                  </div>
                  <Err text={err("zone")} />
                </div>
              )}

              <fieldset className="space-y-3 border-t border-(--c-border) pt-5">
                <legend className="sr-only">Вылет</legend>
                <p className="text-[16px] font-bold">
                  Вылет домой <span className="font-normal text-(--c-muted)">если уже знаете</span>
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <Field id="depDate" label="Дата" error={err("depDate")}>
                    <input id="ft-depDate-in" type="date" min={d.date || today} value={d.depDate} onChange={(e) => set("depDate", e.target.value)} aria-invalid={!!err("depDate")} className={INPUT} />
                  </Field>
                  <Field id="depTime" label="Время" error={err("depTime")}>
                    <input id="ft-depTime-in" type="time" value={d.depTime} onChange={(e) => set("depTime", e.target.value)} aria-invalid={!!err("depTime")} className={INPUT} />
                  </Field>
                </div>
                <Field id="depFlight" label="Рейс" error={err("depFlight")}>
                  <input
                    id="ft-depFlight-in"
                    value={d.depFlight}
                    onChange={(e) => set("depFlight", e.target.value.toUpperCase())}
                    placeholder="VJ 976"
                    autoCapitalize="characters"
                    autoComplete="off"
                    aria-invalid={!!err("depFlight")}
                    className={`${INPUT} uppercase`}
                  />
                </Field>
              </fieldset>
            </>
          )}

          {stepId === "docs" && (
            <>
              <p className="text-[15px] leading-snug text-(--c-muted)">
                Фаст-трек оформляется на каждого, поэтому нужны паспорта. Нет под рукой? Пропустите и пришлите позже в WhatsApp.
              </p>
              <Uploader
                title="Загранпаспорта"
                note={`разворот с фото, ${d.people > 1 ? `все ${d.people} пассажира` : "1 пассажир"}`}
                docs={passports}
                max={FT_MAX_PASSPORTS}
                addLabel="Прикрепить паспорта"
                onAdd={(l) => addFiles("passport", l)}
                onRemove={(id) => setPassports((p) => p.filter((x) => x.id !== id))}
              />
              <Uploader
                title="Ваучер отеля"
                note="бронь: скрин или PDF"
                docs={vouchers}
                max={FT_MAX_VOUCHERS}
                addLabel="Прикрепить ваучер"
                onAdd={(l) => addFiles("voucher", l)}
                onRemove={(id) => setVouchers((p) => p.filter((x) => x.id !== id))}
              />
              {fileError && <Problem text={fileError} />}
              <p className="text-[13px] leading-snug text-(--c-muted)">🔒 Файлы уходят напрямую Виктору и не хранятся на сайте.</p>
            </>
          )}

          {stepId === "check" && (
            <>
              <div className="divide-y divide-(--c-border) rounded-[8px] border border-(--c-border) bg-white">
                <Summary title="Кто летит" onEdit={() => go(1)}>
                  {d.passengers[0].ru} · {d.passengers[0].en}
                  <br />
                  {d.people} чел. · WhatsApp {d.whatsapp}
                </Summary>
                <Summary title="Прилёт" onEdit={() => go(2)}>
                  {d.date && ftDateRu(d.date)}, {d.time} · рейс {d.flight}
                  {d.fromCity ? ` из ${d.fromCity}` : ""}
                </Summary>
                <Summary title="Отель и вылет" onEdit={() => go(3)}>
                  {d.hotel}
                  {d.transfer ? " · с машиной" : " · без машины"}
                  <br />
                  {d.depDate || d.depFlight
                    ? `Вылет: ${[d.depDate && ftDateRu(d.depDate), d.depTime, d.depFlight].filter(Boolean).join(", ")}`
                    : "Вылет: не указан"}
                </Summary>
                <Summary title="Документы" onEdit={() => go(4)}>
                  {filesTotal ? `Паспортов ${passports.length}, ваучер ${vouchers.length}` : "Пришлю позже в WhatsApp"}
                </Summary>
              </div>

              <div className="rounded-[8px] border border-(--c-border) bg-white px-4 py-3.5 text-[15px]" aria-live="polite">
                <Row label={`Фаст-трек × ${d.people}`} value={`$${q.fasttrackUsd}`} />
                {d.transfer && <Row label={`Машина до отеля${d.zone === "north" ? " (север)" : ""}`} value={q.carUsd === null ? "уточним" : `$${q.carUsd}`} />}
                <div className="mt-2 flex items-baseline justify-between gap-3 border-t border-(--c-border) pt-2.5 text-[19px] font-extrabold">
                  <span>Итого</span>
                  <span className="tabular-nums">{q.totalUsd !== null ? `$${q.totalUsd}` : `$${q.fasttrackUsd} + машина`}</span>
                </div>
              </div>

              <div>
                <Label>Как удобнее оплатить</Label>
                <div className="space-y-2.5">
                  <Choice
                    active={d.pay === "prepay"}
                    onClick={() => set("pay", "prepay")}
                    title={`Предоплата $${q.prepayUsd} на российскую карту`}
                    note={q.cashUsd !== null ? `остальное $${q.cashUsd} наличными при встрече, одной купюрой` : "остальное наличными при встрече"}
                  />
                  <Choice
                    active={d.pay === "on_site"}
                    onClick={() => set("pay", "on_site")}
                    title="Всё на месте"
                    note={`если нет российской карты: ${q.totalUsd !== null ? `$${q.totalUsd} ` : ""}наличными при встрече`}
                  />
                </div>
                <p className="mt-2 text-[13px] leading-snug text-(--c-muted)">
                  Реквизиты для предоплаты (СБП на Т-Банк или QR-код) покажем сразу после отправки заявки. Наличные в долларах.
                  {d.pay === "on_site" &&
                    " Мы заранее передаём ваши данные в аэропорт, и по прилёте вас уже точно встретят, поэтому оплатить услугу при встрече нужно в любом случае."}
                </p>
              </div>

              <Field id="comment" label="Комментарий" hint="если нужно">
                <textarea
                  id="ft-comment-in"
                  value={d.comment}
                  onChange={(e) => set("comment", e.target.value)}
                  rows={2}
                  placeholder="Дети, коляска, много багажа"
                  className="w-full rounded-[6px] border border-[#b6c4d6] bg-white px-3.5 py-3 text-[17px] outline-none focus:border-(--c-primary) focus:shadow-[0_0_0_3px_rgb(22_64_107/0.14)]"
                />
              </Field>

              {status === "failed" && <Problem text="Не получилось отправить. Попробуйте ещё раз или напишите Виктору в WhatsApp." />}
              {status === "rate_limited" && <Problem text="Слишком много заявок подряд. Попробуйте позже или напишите в WhatsApp." />}
            </>
          )}
        </div>

        <Footer>
          <button type="button" onClick={() => window.history.back()} disabled={busy} className={BACK_BTN} aria-label="Назад">
            ←
          </button>
          <button type="submit" disabled={busy} className={PRIMARY_BTN}>
            {status === "sending"
              ? "Отправляем…"
              : status === "uploading"
                ? `Документы ${Math.min(progress + 1, filesTotal)} из ${filesTotal}…`
                : stepId === "check"
                  ? "Отправить заявку"
                  : stepId === "docs" && filesTotal === 0
                    ? "Пропустить"
                    : "Далее"}
          </button>
        </Footer>
      </form>
    </div>
  )
}

// ---------- мелкие части ----------

const PRIMARY_BTN =
  "h-14 flex-1 rounded-[6px] bg-(--c-accent) px-5 text-[17px] font-extrabold text-white shadow-[0_6px_16px_rgb(232_137_43/0.35)] transition active:scale-[0.99] disabled:opacity-60"
const BACK_BTN =
  "h-14 w-14 shrink-0 rounded-[6px] border border-[#b6c4d6] bg-white text-[22px] font-bold text-(--c-primary) active:bg-(--c-bg-2) disabled:opacity-50"
const WA_BTN = "flex h-13 w-full items-center justify-center gap-2 rounded-[6px] bg-[#25d366] text-[16px] font-extrabold text-white"

function Footer({ children }: { children: React.ReactNode }) {
  return (
    <div className="sticky bottom-0 z-20 mt-auto border-t border-(--c-border) bg-(--c-bg)/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur">
      <div className="flex gap-2.5">{children}</div>
    </div>
  )
}

function Label({ children }: { children: React.ReactNode }) {
  return <span className="mb-2 block text-[15px] font-bold">{children}</span>
}

function Field({ id, label, hint, error, children }: { id: string; label: string; hint?: string; error?: string; children: React.ReactNode }) {
  return (
    <div id={`ft-${id}`}>
      <label htmlFor={`ft-${id}-in`} className="mb-1.5 block text-[15px] font-bold">
        {label} {hint && <span className="font-normal text-(--c-muted)">{hint}</span>}
      </label>
      {children}
      <Err text={error} />
    </div>
  )
}

function Choice({ active, onClick, title, note, price }: { active: boolean; onClick: () => void; title: string; note?: string; price?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex w-full items-start gap-3 rounded-[6px] border px-3.5 py-3 text-left transition-colors ${
        active ? "border-(--c-primary) bg-[#eef3f9] shadow-[inset_0_0_0_1px_var(--c-primary)]" : "border-[#b6c4d6] bg-white"
      }`}
    >
      <span
        className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border-2 ${active ? "border-(--c-primary)" : "border-[#9fb0c4]"}`}
      >
        {active && <span className="size-2.5 rounded-full bg-(--c-primary)" />}
      </span>
      <span className="min-w-0 flex-1">
        <b className="block text-[16px] leading-tight">{title}</b>
        {note && <span className="mt-0.5 block text-[13.5px] leading-snug text-(--c-muted)">{note}</span>}
      </span>
      {price && <b className="shrink-0 text-[17px] text-(--c-primary) tabular-nums">{price}</b>}
    </button>
  )
}

function Uploader(props: {
  title: string
  note: string
  docs: Doc[]
  max: number
  addLabel: string
  onAdd: (l: FileList | null) => void
  onRemove: (id: string) => void
}) {
  const ref = useRef<HTMLInputElement>(null)
  return (
    <div className="rounded-[8px] border border-(--c-border) bg-white p-3.5">
      <div className="mb-2.5 flex items-baseline justify-between gap-3">
        <b className="text-[16px]">
          {props.title} <span className="font-normal text-(--c-muted)">{props.note}</span>
        </b>
        {props.docs.length > 0 && <span className="shrink-0 text-[14px] font-bold text-[#2d7a45]">✓ {props.docs.length}</span>}
      </div>
      {props.docs.length > 0 && (
        <div className="mb-2.5 grid grid-cols-4 gap-2 sm:grid-cols-5">
          {props.docs.map((p, i) => (
            <div key={p.id} className="relative aspect-[3/4] overflow-hidden rounded-[6px] border border-(--c-border) bg-(--c-bg)">
              {p.preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.preview} alt={`${props.title} ${i + 1}`} className="size-full object-cover" />
              ) : (
                <span className="flex size-full items-center justify-center text-[12px] font-bold text-(--c-muted)">PDF</span>
              )}
              <button
                type="button"
                onClick={() => props.onRemove(p.id)}
                aria-label={`Убрать файл ${i + 1}`}
                className="absolute top-1 right-1 flex size-7 items-center justify-center rounded-full bg-black/60 text-[15px] text-white"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
      {props.docs.length < props.max && (
        <button
          type="button"
          onClick={() => ref.current?.click()}
          className="flex h-13 w-full items-center justify-center gap-2 rounded-[6px] border border-dashed border-(--c-primary) bg-[#f5f8fc] text-[16px] font-bold text-(--c-primary) active:bg-(--c-bg-2)"
        >
          📎 {props.docs.length ? "Добавить ещё" : props.addLabel}
        </button>
      )}
      <input
        ref={ref}
        type="file"
        accept="image/*,application/pdf"
        multiple
        className="hidden"
        onChange={(e) => {
          props.onAdd(e.target.files)
          e.target.value = ""
        }}
      />
    </div>
  )
}

function Summary({ title, onEdit, children }: { title: string; onEdit: () => void; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 px-4 py-3">
      <div className="min-w-0 flex-1">
        <span className="block text-[12px] font-bold tracking-[0.1em] text-(--c-primary-2) uppercase">{title}</span>
        <p className="mt-0.5 text-[15px] leading-snug break-words">{children}</p>
      </div>
      <button type="button" onClick={onEdit} className="shrink-0 text-[14px] font-bold text-(--c-primary) underline underline-offset-2">
        Изменить
      </button>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="mt-1 flex items-baseline justify-between gap-3 first:mt-0">
      <span>{label}</span>
      <span className="tabular-nums">{value}</span>
    </div>
  )
}

function StepBtn({ label, onClick, disabled, children }: { label: string; onClick: () => void; disabled?: boolean; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="flex size-11 items-center justify-center rounded-[6px] bg-(--c-primary) text-[22px] leading-none font-bold text-white active:scale-95 disabled:opacity-35"
    >
      {children}
    </button>
  )
}

function Err({ text }: { text?: string }) {
  return text ? <p className="mt-1.5 text-[14px] font-semibold text-[#b3402a]">{text}</p> : null
}

function Problem({ text }: { text: string }) {
  return <p id="ft-problem" className="rounded-[6px] bg-[#fbe4dc] px-4 py-3 text-[14px] font-semibold text-[#8a2f16]">{text}</p>
}
