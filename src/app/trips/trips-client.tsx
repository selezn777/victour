"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useSavedTrips } from "@/lib/my-trips"
import { formatUsd } from "@/lib/format"
import type { Trip, TripItem } from "@/lib/trip-types"
import { PARK_WHATSAPP } from "@/app/park/park-config"

const STATUS: Record<string, { label: string; tone: string }> = {
  pending: { label: "Заявка принята, гид подтверждает", tone: "bg-amber-100 text-amber-900" },
  confirmed: { label: "Подтверждено", tone: "bg-emerald-100 text-emerald-900" },
  alt_proposed: { label: "Гид предложил другую дату", tone: "bg-sky-100 text-sky-900" },
  cancelled: { label: "Отменено", tone: "bg-zinc-200 text-zinc-700" },
  completed: { label: "Поездка состоялась", tone: "bg-zinc-200 text-zinc-700" },
}

function fmtDate(iso: string) {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("ru-RU", {
    timeZone: "UTC",
    weekday: "short",
    day: "numeric",
    month: "long",
  })
}

// Сегодня по Вьетнаму (UTC+7): поездка «сегодня» ещё в предстоящих
const todayVn = () => new Date(Date.now() + 7 * 3600_000).toISOString().slice(0, 10)

function daysLeft(iso: string) {
  const d = Math.round((Date.parse(`${iso}T00:00:00Z`) - Date.parse(`${todayVn()}T00:00:00Z`)) / 86400_000)
  if (d === 0) return "сегодня"
  if (d === 1) return "завтра"
  if (d > 1 && d < 60) return `через ${d} ${plural(d, "день", "дня", "дней")}`
  return null
}

function plural(n: number, one: string, few: string, many: string) {
  const m10 = n % 10
  const m100 = n % 100
  if (m10 === 1 && m100 !== 11) return one
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few
  return many
}

export function TripsClient() {
  const saved = useSavedTrips()
  const [trips, setTrips] = useState<Trip[] | null>(null)
  const [failed, setFailed] = useState(false)
  const key = JSON.stringify(saved)

  useEffect(() => {
    if (saved === null) return
    let alive = true
    fetch("/api/my-trips", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bookings: saved.flatMap((t) => (t.kind === "booking" ? [t.id] : [])),
        park: saved.flatMap((t) => (t.kind === "park" ? [t.token] : [])),
      }),
    })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d: { trips: Trip[] }) => alive && setTrips(d.trips))
      .catch(() => alive && setFailed(true))
    return () => {
      alive = false
    }
    // saved пересоздаётся только при изменении хранилища; key — его содержимое
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  if (failed) {
    return <p className="mt-6 text-muted-foreground">Не получилось загрузить поездки. Обновите страницу.</p>
  }
  if (!trips) {
    return (
      <div className="mt-6 flex flex-col gap-4" aria-busy>
        {[0, 1].map((i) => (
          <div key={i} className="h-44 animate-pulse rounded-2xl bg-muted" />
        ))}
      </div>
    )
  }

  const today = todayVn()
  const lastDay = (t: Trip) => t.items.reduce((m, i) => ((i.dateEnd ?? i.date) > m ? (i.dateEnd ?? i.date) : m), t.date)
  const upcoming = trips.filter((t) => lastDay(t) >= today && t.status !== "cancelled")
  const past = trips.filter((t) => !upcoming.includes(t)).reverse()

  if (trips.length === 0) {
    return (
      <div className="mt-6 rounded-2xl border border-border bg-card p-6 text-center">
        <p className="text-lg font-semibold">Здесь появятся ваши поездки</p>
        <p className="mt-2 text-sm text-muted-foreground">
          После бронирования на этом устройстве здесь будет видно дату, маршрут, стоимость и время выезда. Бронировали
          через WhatsApp или Трипстер? Напишите нам, пришлём всё в чат.
        </p>
        <div className="mt-5 flex flex-col justify-center gap-2 sm:flex-row">
          <Link
            href="/tours"
            className="rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground hover:opacity-90"
          >
            Выбрать тур
          </Link>
          <a
            href={PARK_WHATSAPP.href}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-border px-6 py-3 font-semibold hover:bg-muted"
          >
            WhatsApp {PARK_WHATSAPP.display}
          </a>
        </div>
      </div>
    )
  }

  return (
    <>
      {upcoming.length > 0 && (
        <section className="mt-6 flex flex-col gap-4">
          {upcoming.map((t) => (
            <TripCard key={t.ref} trip={t} />
          ))}
        </section>
      )}
      {upcoming.length === 0 && (
        <p className="mt-6 text-muted-foreground">
          Предстоящих поездок нет.{" "}
          <Link href="/tours" className="underline">
            Выбрать новый тур
          </Link>
        </p>
      )}
      {past.length > 0 && (
        <section className="mt-10">
          <h2 className="font-heading text-lg font-semibold">Прошедшие и отменённые</h2>
          <div className="mt-3 flex flex-col gap-3 opacity-75">
            {past.map((t) => (
              <TripCard key={t.ref} trip={t} compact />
            ))}
          </div>
        </section>
      )}
    </>
  )
}

function TripCard({ trip, compact = false }: { trip: Trip; compact?: boolean }) {
  const st =
    compact && trip.status !== "cancelled"
      ? STATUS.completed
      : (STATUS[trip.status] ?? { label: trip.status, tone: "bg-zinc-200 text-zinc-700" })
  const left = compact ? null : daysLeft(trip.date)
  return (
    <article className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="flex flex-wrap items-center gap-2 border-b border-border px-4 py-3 sm:px-5">
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${st.tone}`}>
          {trip.kind === "park" && !compact ? "Заявка на билеты" : st.label}
        </span>
        {left && <span className="text-sm font-semibold text-primary">{left}</span>}
      </div>
      <div className="divide-y divide-border">
        {trip.items.map((it, i) => (
          <ItemBlock key={i} item={it} compact={compact} />
        ))}
      </div>
      {!compact && (
        <div className="flex flex-col gap-1 border-t border-border bg-muted/40 px-4 py-3 text-sm sm:px-5">
          <div>
            👤 {trip.name} · 🏨 {trip.hotel}
          </div>
          {trip.totalUsd !== null && (
            <div>
              💵 Итого <b>{formatUsd(trip.totalUsd)}</b>
              {trip.prepaymentUsd ? (
                <span className="text-muted-foreground">
                  {" "}
                  · предоплата {formatUsd(trip.prepaymentUsd)}{" "}
                  {trip.paid ? "получена ✅" : "- пришлём реквизиты в чат"}
                </span>
              ) : null}
            </div>
          )}
          {trip.kind === "park" && (
            <div className="text-muted-foreground">Стоимость билетов и оплату подтвердим в WhatsApp</div>
          )}
        </div>
      )}
      {!compact && trip.status !== "cancelled" && <ChangeRequest trip={trip} />}
    </article>
  )
}

function ItemBlock({ item, compact }: { item: TripItem; compact: boolean }) {
  const dates = item.dateEnd ? `${fmtDate(item.date)} - ${fmtDate(item.dateEnd)}` : fmtDate(item.date)
  return (
    <div className="px-4 py-3 sm:px-5">
      <div className="text-sm text-muted-foreground first-letter:uppercase">{dates}</div>
      <h3 className="mt-0.5 font-heading text-lg leading-snug font-semibold">
        {item.slug ? (
          <Link href={`/tours/${item.slug}`} className="hover:underline">
            {item.title}
          </Link>
        ) : (
          item.title
        )}
      </h3>
      <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm">
        {item.guests ? <span>👥 {item.guests} чел.</span> : null}
        {item.priceUsd !== null && <span>💵 {formatUsd(item.priceUsd)}</span>}
        {item.priceNote && <span>💵 {item.priceNote} / чел.</span>}
        {item.guide && <span>🧭 Гид {item.guide}</span>}
      </div>
      {!compact && (item.pickup || item.boat || item.cableCar) && (
        <div className="mt-2 rounded-xl bg-primary/10 px-3 py-2 text-sm">
          {item.pickup && (
            <div>
              🚐 Выезд от отеля в <b>{item.pickup}</b>
            </div>
          )}
          {item.boat && (
            <div>
              🚤 Катер в <b>{item.boat}</b>
            </div>
          )}
          {item.cableCar && (
            <div>
              🚡 На канатку в <b>{item.cableCar}</b>
            </div>
          )}
        </div>
      )}
      {!compact && item.guideComment && (
        <p className="mt-2 text-sm">
          💬 Гид: «{item.guideComment}»
        </p>
      )}
      {!compact && item.bring.length > 0 && (
        <details className="mt-2 text-sm">
          <summary className="cursor-pointer font-semibold">🎒 Что взять с собой</summary>
          <ul className="mt-1 list-disc pl-5 text-muted-foreground">
            {item.bring.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        </details>
      )}
    </div>
  )
}

function ChangeRequest({ trip }: { trip: Trip }) {
  const [open, setOpen] = useState(false)
  const [text, setText] = useState("")
  const [state, setState] = useState<"idle" | "sending" | "sent" | "failed">("idle")

  if (state === "sent") {
    return (
      <p className="border-t border-border px-4 py-3 text-sm font-semibold text-emerald-700 sm:px-5">
        ✅ Отправили Виктору. Ответим в вашем мессенджере, обычно в течение часа.
      </p>
    )
  }
  if (!open) {
    return (
      <div className="border-t border-border px-4 py-3 sm:px-5">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="w-full rounded-full border border-border px-4 py-2.5 text-sm font-semibold hover:bg-muted sm:w-auto"
        >
          ✏️ Изменить дату, людей или отель
        </button>
      </div>
    )
  }

  async function send() {
    if (!text.trim() || state === "sending") return
    setState("sending")
    const r = await fetch("/api/trip-change", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind: trip.kind, ref: trip.ref, message: text }),
    }).catch(() => null)
    setState(r?.ok ? "sent" : "failed")
  }

  return (
    <div className="border-t border-border px-4 py-3 sm:px-5">
      <label className="text-sm font-semibold" htmlFor={`chg-${trip.ref.slice(0, 8)}`}>
        Что поменять?
      </label>
      <textarea
        id={`chg-${trip.ref.slice(0, 8)}`}
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={3}
        maxLength={1000}
        placeholder="Например: перенести на 12 ноября, нас будет 4 человека, новый отель - ..."
        className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-base"
      />
      {state === "failed" && (
        <p className="mt-1 text-sm text-[#b3402a]">
          Не отправилось. Напишите в{" "}
          <a href={PARK_WHATSAPP.href} className="underline">
            WhatsApp
          </a>
          .
        </p>
      )}
      <div className="mt-2 flex gap-2">
        <button
          type="button"
          onClick={send}
          disabled={!text.trim() || state === "sending"}
          className="flex-1 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50 sm:flex-none"
        >
          {state === "sending" ? "Отправляем..." : "Отправить Виктору"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="rounded-full px-4 py-2.5 text-sm hover:bg-muted">
          Отмена
        </button>
      </div>
    </div>
  )
}
