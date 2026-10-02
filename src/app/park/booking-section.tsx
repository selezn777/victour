"use client"

import { useEffect, useRef, useState, useSyncExternalStore } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import PhoneNumberInput from "react-phone-number-input/input"
import type { Country } from "react-phone-number-input"
import { HotelPicker, type HotelValue } from "./hotel-picker"
import {
  CONTACT_CHANNELS,
  DESTINATIONS,
  GUEST_MAX,
  PARK_WHATSAPP,
  PHONE_COUNTRIES,
  PROMO_TOURS,
  REDIRECT_SECONDS,
  todayInNhaTrang,
  validateParkBooking,
  waTextLink,
  type BookingField,
  type ContactChannel,
  type DestinationId,
  type ExtraOption,
  normalizeTime,
} from "./park-config"
import { bookingSummaryRu } from "./park-texts"
import { ADD_EXTRA_EVENT } from "./seawalking-cta"
import { WhatsAppIcon } from "./whatsapp-icon"

type Status = "idle" | "sending" | "success" | "failed" | "rate_limited"

const INPUT =
  "h-12 w-full rounded-2xl border border-(--c-border) bg-white px-3.5 text-[16px] text-(--c-ink) outline-none placeholder:text-(--c-muted)/60 focus:border-(--c-primary-2) focus:ring-2 focus:ring-(--c-primary-2)/25"
const LABEL = "mb-1.5 block text-[13px] font-bold text-(--c-primary)"

const noopSubscribe = () => () => {}

// Черновик формы: турист отвлёкся, свернул браузер, страница перезагрузилась —
// заполненное не пропадает. Живёт 12 часов, после отправки стирается.
const DRAFT_KEY = "victour:park-draft"
const DRAFT_TTL_MS = 12 * 60 * 60 * 1000

type Draft = {
  savedAt: number
  date: string
  packageByDest: Partial<Record<DestinationId, string>>
  departureByDest: Partial<Record<DestinationId, string>>
  guests: Record<string, number>
  hotel: HotelValue
  name: string
  contactChannel: ContactChannel
  phoneCountry: Country | null
  phone: string
  telegramHandle: string
  extras: Record<string, number>
}

function readDraft(): Draft | null {
  try {
    const d = JSON.parse(localStorage.getItem(DRAFT_KEY) ?? "null") as Draft | null
    if (d && Date.now() - d.savedAt < DRAFT_TTL_MS) return d
    localStorage.removeItem(DRAFT_KEY)
  } catch {}
  return null
}

const clearDraft = () => {
  try {
    localStorage.removeItem(DRAFT_KEY)
  } catch {}
}

export function BookingSection({ destination }: { destination: DestinationId }) {
  // Страница статическая: сервер рендерит пустую форму, на клиенте она
  // пересоздаётся уже с черновиком из localStorage
  const hydrated = useSyncExternalStore(noopSubscribe, () => true, () => false)
  return (
    <BookingForm
      key={hydrated ? "client" : "server"}
      destination={destination}
      draft={hydrated ? readDraft() : null}
      persist={hydrated}
    />
  )
}

function BookingForm({
  destination,
  draft,
  persist,
}: {
  destination: DestinationId
  draft: Draft | null
  persist: boolean
}) {
  const dest = DESTINATIONS[destination]

  // "Сегодня" считаем по Нячангу и только на клиенте — страница статическая,
  // дата сборки тут не годится.
  const minDate = useSyncExternalStore(noopSubscribe, todayInNhaTrang, () => "")

  const [date, setDate] = useState(draft?.date ?? "")
  const [packageByDest, setPackageByDest] = useState<Partial<Record<DestinationId, string>>>(
    draft?.packageByDest ?? {},
  )
  const [departureByDest, setDepartureByDest] = useState<Partial<Record<DestinationId, string>>>(
    draft?.departureByDest ?? {},
  )
  const [guests, setGuests] = useState<Record<string, number>>(draft?.guests ?? { adults: 2 })
  const [hotel, setHotel] = useState<HotelValue>(draft?.hotel ?? { name: "", place: null })
  const [name, setName] = useState(draft?.name ?? "")
  const [contactChannel, setContactChannel] = useState<ContactChannel>(
    draft?.contactChannel ?? "whatsapp",
  )
  const [phoneCountry, setPhoneCountry] = useState<Country | undefined>(
    draft ? (draft.phoneCountry ?? undefined) : "RU",
  )
  const [phone, setPhone] = useState(draft?.phone ?? "")
  const [telegramHandle, setTelegramHandle] = useState(draft?.telegramHandle ?? "")
  const [extras, setExtras] = useState<Record<string, number>>(draft?.extras ?? {})

  // Черновик сохраняем только в клиентском экземпляре формы — серверный
  // (до гидрации) иначе затёр бы его пустыми полями
  useEffect(() => {
    if (!persist) return
    const next: Draft = {
      savedAt: Date.now(),
      date,
      packageByDest,
      departureByDest,
      guests,
      hotel,
      name,
      contactChannel,
      phoneCountry: phoneCountry ?? null,
      phone,
      telegramHandle,
      extras,
    }
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(next))
    } catch {}
  }, [
    persist,
    date,
    packageByDest,
    departureByDest,
    guests,
    hotel,
    name,
    contactChannel,
    phoneCountry,
    phone,
    telegramHandle,
    extras,
  ])

  const guestsRef = useRef(guests)
  useEffect(() => {
    guestsRef.current = guests
  }, [guests])

  // «Забронировать с Seawalking» из блока акции: отмечаем его на всех гостей с билетом
  useEffect(() => {
    const onAdd = (e: Event) => {
      const key = (e as CustomEvent<string>).detail
      if (!dest.extras.some((x) => x.key === key)) return
      const people = dest.payingGuests.reduce((n, k) => n + (guestsRef.current[k] ?? 0), 0)
      setExtras((x) => ({ ...x, [key]: Math.max(x[key] ?? 0, people, 1) }))
    }
    window.addEventListener(ADD_EXTRA_EVENT, onAdd)
    return () => window.removeEventListener(ADD_EXTRA_EVENT, onAdd)
  }, [dest])
  const [website, setWebsite] = useState("") // honeypot
  const [errors, setErrors] = useState<Partial<Record<BookingField, string>>>({})
  const [status, setStatus] = useState<Status>("idle")
  const [success, setSuccess] = useState<{ waText: string; token: string | null } | null>(null)

  const packageId = packageByDest[destination] ?? null
  const departureTime = departureByDest[destination] ?? null
  const setDepartureTime = (t: string) => setDepartureByDest((s) => ({ ...s, [destination]: t }))
  const contact = contactChannel === "telegram" && telegramHandle ? telegramHandle : phone

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (status === "sending") return

    const payload = {
      destination,
      date,
      packageId,
      departureTime,
      guests: Object.fromEntries(dest.guests.map((g) => [g.key, guests[g.key] ?? 0])),
      hotel: hotel.name,
      hotelPlace: hotel.place,
      name,
      contactChannel,
      contact,
      extras: Object.fromEntries(dest.extras.map((x) => [x.key, extras[x.key] ?? 0])),
      comment: "",
    }
    const check = validateParkBooking(payload)
    if (!check.ok) {
      setErrors(check.errors)
      const first = Object.keys(check.errors)[0]
      document
        .getElementById(`park-field-${first}`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" })
      return
    }
    setErrors({})
    setStatus("sending")

    try {
      const res = await fetch("/api/park-booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, website }),
      })
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean
        error?: string
        errors?: Partial<Record<BookingField, string>>
        confirmToken?: string | null
        confirmUrl?: string | null
      }
      if (res.ok && data.ok) {
        const token = data.confirmToken ?? null
        setSuccess({
          waText: bookingSummaryRu(
            check.data,
            data.confirmUrl ?? null,
          ),
          token,
        })
        clearDraft()
        setStatus("success")
      } else if (data.error === "validation" && data.errors) {
        setErrors(data.errors)
        setStatus("idle")
      } else if (data.error === "rate_limited") {
        setStatus("rate_limited")
      } else {
        setStatus("failed")
      }
    } catch {
      setStatus("failed")
    }
  }

  const changeGuests = (key: string, delta: number) =>
    setGuests((g) => ({ ...g, [key]: Math.min(GUEST_MAX, Math.max(0, (g[key] ?? 0) + delta)) }))
  const changeExtra = (key: string, delta: number) =>
    setExtras((x) => ({ ...x, [key]: Math.min(GUEST_MAX, Math.max(0, (x[key] ?? 0) + delta)) }))

  const extraGroups = dest.extras.reduce<Record<string, ExtraOption[]>>((acc, x) => {
    ;(acc[x.group ?? ""] ??= []).push(x)
    return acc
  }, {})
  const extrasChosen = dest.extras.filter((x) => extras[x.key]).length
  // Если хоть одно название билета в 2 строки — резервируем 2 строки у всех, цены встают в линию
  const longTitles = dest.packages.some((p) => p.title.length > 12)

  return (
    <section
      id="booking"
      className="scroll-mt-16 rounded-[28px] bg-(--c-primary) p-4 text-white shadow-(--c-shadow-primary) transition-colors duration-500"
    >
      <h2 className="px-1 font-(family-name:--font-park-serif) text-[24px] font-bold text-(--c-on-primary)">
        {destination === "hontam" ? "Бронь на Хон Там" : "Как заказать акцию"}
      </h2>
      <p className="mt-1 mb-3.5 px-1 text-[14px] opacity-90">
        Для бесплатного трансфера заполните заявку — это минута:
      </p>

      <form
        onSubmit={handleSubmit}
        noValidate
        className="relative space-y-5 rounded-[22px] bg-(--c-bg) p-4 text-(--c-ink) transition-colors duration-500"
      >
        {/* Honeypot: скрыто от людей, боты заполняют */}
        <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
          <label>
            Website
            <input
              tabIndex={-1}
              autoComplete="off"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              name="website"
            />
          </label>
        </div>

        <div id="park-field-packageId">
          <span className={LABEL}>Билет</span>
          <div className="grid grid-cols-2 gap-2">
            {dest.packages.map((p) => {
              const active = packageId === p.id
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPackageByDest((s) => ({ ...s, [destination]: p.id }))}
                  aria-pressed={active}
                  className={`rounded-2xl border-2 px-3 py-2.5 text-left transition-colors ${
                    active
                      ? "border-(--c-primary) bg-(--c-primary) text-white"
                      : "border-(--c-border) bg-white text-(--c-ink)"
                  }`}
                >
                  <span
                    className={`block text-[14px] leading-[1.2] font-bold text-balance ${longTitles ? "min-h-[2.4em]" : ""}`}
                  >
                    {p.title}
                  </span>
                  <span
                    className={`mt-0.5 block text-[13px] font-semibold whitespace-nowrap ${active ? "text-(--c-on-primary)" : "text-(--c-primary)"}`}
                  >
                    {p.price}
                  </span>
                  {p.childPrice && (
                    <span
                      className={`block text-[11.5px] whitespace-nowrap ${active ? "text-white/80" : "text-(--c-muted)"}`}
                    >
                      {dest.childPriceLabel} — {p.childPrice}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
          <FieldError text={errors.packageId} />
        </div>

        <div id="park-field-date">
          <label htmlFor="park-date" className={LABEL}>
            Дата поездки
          </label>
          <input
            id="park-date"
            type="date"
            min={minDate || undefined}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={`${INPUT} appearance-none`}
          />
          <FieldError text={errors.date} />
        </div>

        {dest.departureTimes && (
          <div id="park-field-departureTime">
            <span className={LABEL}>Во сколько катер</span>
            <div className="grid grid-cols-2 gap-2">
              {dest.departureTimes.map((t) => {
                const active = departureTime === t.boat
                return (
                  <button
                    key={t.boat}
                    type="button"
                    onClick={() => setDepartureTime(t.boat)}
                    aria-pressed={active}
                    className={`rounded-2xl border-2 px-3 py-2 text-left transition-colors ${
                      active
                        ? "border-(--c-primary) bg-(--c-primary) text-white"
                        : "border-(--c-border) bg-white"
                    }`}
                  >
                    <span className="block text-[17px] leading-tight font-bold">🚤 {t.boat}</span>
                    <span
                      className={`block text-[12.5px] ${active ? "text-(--c-on-primary)" : "text-(--c-muted)"}`}
                    >
                      выезд от отеля {t.pickup}
                    </span>
                  </button>
                )
              })}
            </div>
            <p className="mt-1.5 text-[12px] text-(--c-muted)">
              Время выезда указываем всегда ±10 минут.
            </p>
            <FieldError text={errors.departureTime} />
          </div>
        )}

        {dest.pickupRange && (
          <div id="park-field-departureTime">
            <label htmlFor="park-pickup" className={LABEL}>
              Во сколько забрать из отеля
            </label>
            {/* Нативное поле времени прозрачно лежит поверх: тап открывает системные
                часы (Android — циферблат как в Google Календаре, iPhone — барабан) */}
            <div className="relative">
              <div
                aria-hidden
                className={`${INPUT} flex items-center justify-between ${departureTime ? "" : "text-(--c-muted)/60"}`}
              >
                <span className={departureTime ? "text-[17px] font-bold tabular-nums" : ""}>
                  {departureTime ?? "Выберите время"}
                </span>
                <span className="text-[18px]">🕗</span>
              </div>
              <input
                id="park-pickup"
                type="time"
                step={300}
                min={dest.pickupRange.min.padStart(5, "0")}
                max={dest.pickupRange.max.padStart(5, "0")}
                value={departureTime ? departureTime.padStart(5, "0") : ""}
                onChange={(e) => {
                  const t = normalizeTime(e.target.value)
                  if (t) setDepartureTime(t)
                }}
                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
              />
            </div>
            <p className="mt-1.5 text-[12px] text-(--c-muted)">
              Время выезда указываем всегда ±10 минут.
            </p>
            <FieldError text={errors.departureTime} />
          </div>
        )}

        <div id="park-field-guests">
          <span className={LABEL}>Сколько вас</span>
          <div className="divide-y divide-(--c-bg-2) rounded-2xl bg-white">
            {dest.guests.map((g) => (
              <div key={g.key} className="flex items-center justify-between gap-2 px-3 py-2">
                <span className="text-[14px] leading-tight">
                  {g.emoji} {g.formLabel}
                </span>
                <Stepper
                  label={g.formLabel}
                  value={guests[g.key] ?? 0}
                  onChange={(d) => changeGuests(g.key, d)}
                />
              </div>
            ))}
          </div>
          <FieldError text={errors.guests} />
        </div>

        <div id="park-field-hotel">
          <label htmlFor="park-hotel" className={LABEL}>
            Отель, откуда забрать
          </label>
          <HotelPicker value={hotel} onChange={setHotel} inputClassName={INPUT} />
          <FieldError text={errors.hotel} />
        </div>

        <div id="park-field-name">
          <label htmlFor="park-name" className={LABEL}>
            Как к вам обращаться
          </label>
          <input
            id="park-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="given-name"
            placeholder="Имя"
            maxLength={100}
            className={INPUT}
          />
          <FieldError text={errors.name} />
        </div>

        <div id="park-field-contact">
          <span className={LABEL}>Куда вам написать</span>
          <div className="mb-2 grid grid-cols-3 gap-1.5">
            {(Object.keys(CONTACT_CHANNELS) as ContactChannel[]).map((ch) => (
              <button
                key={ch}
                type="button"
                onClick={() => setContactChannel(ch)}
                aria-pressed={contactChannel === ch}
                className={`h-10 rounded-xl text-[13px] font-bold transition-colors ${
                  contactChannel === ch
                    ? "bg-(--c-primary) text-white"
                    : "border border-(--c-border) bg-white text-(--c-ink)"
                }`}
              >
                {CONTACT_CHANNELS[ch].label}
              </button>
            ))}
          </div>

          {contactChannel === "telegram" && (
            <input
              aria-label="Ник в Telegram"
              value={telegramHandle}
              onChange={(e) => setTelegramHandle(e.target.value.trim())}
              placeholder="@ник — или номер ниже"
              autoComplete="off"
              autoCapitalize="none"
              maxLength={33}
              className={`${INPUT} mb-2`}
            />
          )}

          {!(contactChannel === "telegram" && telegramHandle) && (
            <>
              <div className="mb-2 grid grid-cols-4 gap-1.5" role="group" aria-label="Код страны">
                {PHONE_COUNTRIES.map((c) => (
                  <CountryChip
                    key={c.code}
                    active={phoneCountry === c.code}
                    onClick={() => {
                      setPhoneCountry(c.code)
                      setPhone("")
                    }}
                  >
                    {c.flag} {c.dial}
                  </CountryChip>
                ))}
                <CountryChip
                  active={phoneCountry === undefined}
                  onClick={() => {
                    setPhoneCountry(undefined)
                    setPhone("")
                  }}
                >
                  🌍 Ещё
                </CountryChip>
              </div>
              <PhoneNumberInput
                key={phoneCountry ?? "intl"}
                id="park-contact"
                aria-label="Номер телефона"
                country={phoneCountry}
                international
                withCountryCallingCode
                value={phone}
                onChange={(v) => setPhone(v ?? "")}
                placeholder={phoneCountry ? undefined : "+ код страны и номер"}
                autoComplete="tel"
                className={`${INPUT} text-[17px] tracking-wide tabular-nums`}
              />
            </>
          )}
          <FieldError text={errors.contact} />
        </div>

        {dest.extras.length > 0 && (
          <details className="group rounded-2xl bg-white" open={destination === "hontam"}>
            <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-2 px-3.5 py-2.5 text-[14px] font-bold text-(--c-primary) [&::-webkit-details-marker]:hidden">
              <span>
                ➕ Доп. услуги{" "}
                <span className="font-normal text-(--c-muted)">
                  {extrasChosen > 0 ? `— выбрано ${extrasChosen}` : "по желанию"}
                </span>
              </span>
              <span className="transition-transform group-open:rotate-180">⌄</span>
            </summary>
            <div className="space-y-3 border-t border-(--c-bg-2) px-3 pt-2 pb-3">
              {Object.entries(extraGroups).map(([group, items]) => (
                <div key={group}>
                  {group && <b className="mb-1 block text-[13px] text-(--c-primary)">{group}</b>}
                  {items.map((x) => (
                    <div key={x.key} className="flex items-center justify-between gap-2 py-1.5">
                      <span className="text-[13.5px] leading-tight">
                        {x.label}
                        {x.price && (
                          <span className="block text-[12px] text-(--c-muted)">
                            <span className="whitespace-nowrap">{x.price}</span> / чел.
                          </span>
                        )}
                      </span>
                      <Stepper
                        label={x.label}
                        value={extras[x.key] ?? 0}
                        onChange={(d) => changeExtra(x.key, d)}
                      />
                    </div>
                  ))}
                </div>
              ))}
              <p className="text-[12px] text-(--c-muted)">Укажите, на сколько человек.</p>
            </div>
          </details>
        )}


        {status === "failed" && (
          <SendProblem text="Не получилось отправить заявку. Напишите нам в WhatsApp — забронируем вручную." />
        )}
        {status === "rate_limited" && (
          <SendProblem text="Слишком много заявок подряд. Попробуйте позже или напишите нам в WhatsApp." />
        )}

        <button
          type="submit"
          disabled={status === "sending"}
          className="h-14 w-full rounded-full bg-(--c-accent) text-[16px] font-extrabold text-white shadow-[0_8px_20px_rgb(0_0_0/0.18)] transition active:scale-[0.99] disabled:opacity-60"
        >
          {status === "sending" ? "Отправляем…" : "Забронировать трансфер"}
        </button>
      </form>

      <div className="mt-3.5 rounded-2xl bg-white/12 px-4 py-3 text-[14px]">
        ☀️ Утром <b className="text-(--c-on-primary)">за час до выезда</b> подтвердите бронь
      </div>

      {status === "success" && success && <SuccessScreen {...success} />}
    </section>
  )
}

function FieldError({ text }: { text?: string }) {
  if (!text) return null
  return <p className="mt-1 text-[13px] font-semibold text-[#b3402a]">{text}</p>
}

function CountryChip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`h-10 rounded-full px-1 text-[13.5px] font-bold whitespace-nowrap transition-colors ${
        active
          ? "bg-(--c-primary-2) text-white"
          : "border border-(--c-border) bg-white text-(--c-ink)"
      }`}
    >
      {children}
    </button>
  )
}

function Stepper({
  label,
  value,
  onChange,
}: {
  label: string
  value: number
  onChange: (delta: number) => void
}) {
  const btn =
    "flex size-11 items-center justify-center rounded-full bg-(--c-bg-2) text-[24px] leading-none font-bold text-(--c-primary) active:brightness-95 disabled:opacity-35"
  return (
    <div className="flex shrink-0 items-center gap-1">
      <button
        type="button"
        aria-label={`Уменьшить: ${label}`}
        disabled={value <= 0}
        onClick={() => onChange(-1)}
        className={btn}
      >
        −
      </button>
      <span className="w-7 text-center text-[18px] font-bold tabular-nums" aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        aria-label={`Увеличить: ${label}`}
        disabled={value >= GUEST_MAX}
        onClick={() => onChange(1)}
        className={btn}
      >
        +
      </button>
    </div>
  )
}

function SendProblem({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border-2 border-[#b3402a]/40 bg-white p-3.5" role="alert">
      <p className="text-[14px] leading-snug font-semibold text-[#b3402a]">{text}</p>
      <a
        href={PARK_WHATSAPP.href}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2.5 flex h-11 items-center justify-center gap-2 rounded-full bg-[#25d366] text-[15px] font-bold text-white"
      >
        <WhatsAppIcon className="size-5 fill-white" />
        Написать в WhatsApp
      </a>
    </div>
  )
}

function SuccessScreen({ waText, token }: { waText: string; token: string | null }) {
  const router = useRouter()
  const [secondsLeft, setSecondsLeft] = useState(REDIRECT_SECONDS)
  const [stayed, setStayed] = useState(false)
  // Главный шаг — турист пишет Виктору в WhatsApp. Автопереход на туры
  // запускается только после этого, иначе он уводил бы со страницы раньше.
  const [waSent, setWaSent] = useState(false)

  useEffect(() => {
    if (!waSent || stayed) return
    if (secondsLeft <= 0) {
      router.push("/tours")
      return
    }
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000)
    return () => clearTimeout(t)
  }, [secondsLeft, stayed, waSent, router])

  useEffect(() => {
    window.scrollTo({ top: 0 })
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prev
    }
  }, [])

  const waHref = waTextLink(PARK_WHATSAPP.display, waText)

  return (
    <div
      role="dialog"
      aria-modal
      aria-labelledby="park-success-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-(--c-bg) text-(--c-ink)"
    >
      <div className="mx-auto max-w-[560px] px-4 pt-[calc(env(safe-area-inset-top)+16px)] pb-10">
        <div className="rounded-[28px] bg-(--c-primary) p-5 text-white shadow-(--c-shadow-primary)">
          <p className="text-[13px] font-bold tracking-[0.14em] text-(--c-on-primary)">
            {waSent ? "✅ ГОТОВО" : "✅ ЗАЯВКА ПРИНЯТА · ШАГ 2 ИЗ 2"}
          </p>
          <h2
            id="park-success-title"
            className="mt-2 font-(family-name:--font-park-serif) text-[26px] leading-tight font-bold text-balance"
          >
            {waSent ? "Спасибо! Ждём вас в WhatsApp" : "Закрепите бронь в WhatsApp"}
          </h2>

          {!waSent && (
            <>
              <p className="mt-2 text-[14.5px] leading-snug opacity-95">
                Сайт не может написать вам первым — так устроен WhatsApp. Отправьте нам заявку одним
                нажатием, и у нас будет ваш чат:
              </p>
              <ul className="mt-3 space-y-1.5 text-[14px] leading-snug">
                <li>⏰ напомним утром — подтвердить выезд за час</li>
                <li>🚐 будем на связи в день поездки, если водитель не найдёт вас</li>
                <li>💬 быстро поможем, если планы изменятся</li>
              </ul>
            </>
          )}

          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setWaSent(true)}
            className={`mt-4 flex h-15 items-center justify-center gap-2.5 rounded-full bg-[#25d366] text-[17px] font-extrabold text-white shadow-[0_8px_20px_rgb(0_0_0/0.25)] active:scale-[0.99] ${waSent ? "" : "park-wa-pulse"}`}
          >
            <WhatsAppIcon className="size-7 fill-white" />
            {waSent ? "Открыть чат ещё раз" : "Отправить заявку в WhatsApp"}
          </a>
          <p className="mt-2 text-center text-[12px] leading-snug opacity-80">
            Текст заявки уже написан — останется нажать «Отправить» ➤
          </p>

          {waSent &&
            (!stayed ? (
              <div className="mt-3 flex items-center justify-between gap-3 text-[13px] opacity-90">
                <span aria-live="polite">
                  Переход к турам через <b className="tabular-nums">{secondsLeft}</b> с
                </span>
                <button
                  type="button"
                  onClick={() => setStayed(true)}
                  className="h-9 rounded-full bg-white/15 px-4 font-bold"
                >
                  Остаться
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="mt-3 text-[13px] font-bold underline underline-offset-4 opacity-90"
              >
                ← Вернуться на страницу
              </button>
            ))}
        </div>

        {token && (
          <a
            href={`/api/park-booking/ics?token=${encodeURIComponent(token)}`}
            onClick={() => setStayed(true)}
            className="mt-3 flex h-12 items-center justify-center gap-2 rounded-full border-2 border-(--c-primary) bg-white text-[15px] font-bold text-(--c-primary)"
          >
            🔔 Поставить напоминание в календарь
          </a>
        )}

        <h3 className="mt-5 mb-3 px-1 font-(family-name:--font-park-serif) text-[20px] leading-snug font-bold text-(--c-primary)">
          Пока ждёте — посмотрите наши авторские туры
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {PROMO_TOURS.map((tour) => (
            <Link
              key={tour.slug}
              href={`/tours/${tour.slug}`}
              className="group overflow-hidden rounded-[20px] bg-white shadow-[0_8px_24px_rgb(60_60_40/0.12)]"
            >
              <div className="relative aspect-[3/2]">
                <Image
                  src={tour.imageSrc}
                  alt={tour.title}
                  fill
                  sizes="(max-width: 560px) 50vw, 270px"
                  className="object-cover transition-transform group-hover:scale-105"
                />
              </div>
              <div className="px-3 py-2.5 text-[14px] leading-tight font-bold text-(--c-primary)">
                {tour.title}
              </div>
            </Link>
          ))}
        </div>

        <Link
          href="/tours"
          className="mt-5 flex h-14 items-center justify-center rounded-full bg-(--c-accent) text-[16px] font-extrabold text-white shadow-[0_8px_20px_rgb(0_0_0/0.18)]"
        >
          Смотреть все туры
        </Link>

      </div>
    </div>
  )
}
