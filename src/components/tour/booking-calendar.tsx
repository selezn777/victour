"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const WEEKDAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"]
const MONTH_NAMES = [
  "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
  "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь",
]

function toIsoDate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

function addDays(d: Date, days: number): Date {
  const next = new Date(d)
  next.setDate(next.getDate() + days)
  return next
}

function buildMonthGrid(year: number, month: number): (Date | null)[][] {
  const firstDay = new Date(year, month, 1)
  // Monday = 0 ... Sunday = 6
  const leadingBlanks = (firstDay.getDay() + 6) % 7
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const cells: (Date | null)[] = [
    ...Array.from({ length: leadingBlanks }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1)),
  ]
  while (cells.length % 7 !== 0) cells.push(null)

  const weeks: (Date | null)[][] = []
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7))
  return weeks
}

export function BookingCalendar({
  bookedDates,
  packageOwnerByDate,
  durationDays,
  selectedDate,
  onSelectDate,
  large = false,
  dense = false,
}: {
  bookedDates: Set<string>
  /** Даты, занятые ДРУГИМИ турами в текущей заявке гостя (title тура по
   * дате) — подмножество bookedDates, но помечается отдельно: это не
   * "гид занят", а "вы сами уже забронировали этот день другим туром". */
  packageOwnerByDate?: Map<string, string>
  durationDays: number
  selectedDate: string | null
  onSelectDate: (date: string) => void
  /** Крупнее тач-таргеты (кнопки дат/пред.-след.) — на странице тура
   * Виктор увидел стандартный размер на телефоне и попросил кнопки даты
   * покрупнее, "удобнее". Остальные места (форма заявки) остаются как были. */
  large?: boolean
  /** Ужать календарь по высоте — на слайде брони, когда в заявке уже есть
   * другие туры (подписи "занято туром" + подсказка 2-дневного тура), и
   * кнопка "Добавить в заявку" уезжала за экран телефона (Виктор). */
  dense?: boolean
}) {
  const today = useMemo(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  }, [])

  const [cursor, setCursor] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1))

  const weeks = useMemo(() => buildMonthGrid(cursor.getFullYear(), cursor.getMonth()), [cursor])

  const isPastMonth =
    cursor.getFullYear() === today.getFullYear() && cursor.getMonth() === today.getMonth()

  function isDisabled(date: Date): boolean {
    if (date < today) return true
    for (let i = 0; i < durationDays; i++) {
      if (bookedDates.has(toIsoDate(addDays(date, i)))) return true
    }
    return false
  }

  function packageOwner(date: Date): string | null {
    if (!packageOwnerByDate) return null
    for (let i = 0; i < durationDays; i++) {
      const owner = packageOwnerByDate.get(toIsoDate(addDays(date, i)))
      if (owner) return owner
    }
    return null
  }

  const legendEntries = useMemo(() => {
    if (!packageOwnerByDate) return []
    return [...packageOwnerByDate.entries()].sort(([a], [b]) => a.localeCompare(b))
  }, [packageOwnerByDate])

  function isSelected(date: Date): boolean {
    if (!selectedDate) return false
    const iso = toIsoDate(date)
    if (iso === selectedDate) return true
    if (durationDays === 2) {
      return iso === toIsoDate(addDays(new Date(`${selectedDate}T00:00:00`), 1))
    }
    return false
  }

  return (
    <div className={cn("rounded-xl border border-border", dense ? "p-2.5 sm:p-4" : "p-3", large && !dense && "sm:p-5")}>
      <div className="flex items-center justify-between">
        <span className={cn("text-sm font-medium", large && "sm:text-base")}>
          {MONTH_NAMES[cursor.getMonth()]} {cursor.getFullYear()}
        </span>
        <div className="flex gap-1.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isPastMonth}
            onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
          >
            Пред.
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
          >
            След.
          </Button>
        </div>
      </div>

      <div className={cn(dense ? "mt-1" : "mt-2", "grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground", large && "sm:text-sm")}>
        {WEEKDAYS.map((w) => (
          <div key={w}>{w}</div>
        ))}
      </div>

      <div className={cn("mt-1 grid grid-cols-7", dense ? "gap-0.5 sm:gap-1" : "gap-1", large && !dense && "sm:gap-1.5")}>
        {weeks.flatMap((week, wi) =>
          week.map((date, di) => {
            if (!date) return <div key={`${wi}-${di}`} />
            const disabled = isDisabled(date)
            const selected = isSelected(date)
            const owner = packageOwner(date)
            return (
              <button
                key={`${wi}-${di}`}
                type="button"
                disabled={disabled}
                aria-pressed={selected}
                aria-label={owner ? `${date.getDate()} — уже занято туром «${owner}» в вашей заявке` : undefined}
                onClick={() => onSelectDate(toIsoDate(date))}
                className={cn(
                  "relative flex items-center justify-center rounded-lg text-sm transition-colors",
                  dense ? "h-8 sm:h-10" : large ? "h-10 sm:h-12 sm:text-base" : "h-9",
                  disabled && "cursor-not-allowed text-muted-foreground/40 line-through",
                  // Занято своим же туром из заявки — отдельная пометка
                  // поверх обычного disabled-стиля, не просто "гид занят".
                  owner && "bg-primary/10 text-primary/70 line-through decoration-primary/40",
                  !disabled && !selected && "hover:bg-muted",
                  selected && "bg-primary text-primary-foreground",
                )}
              >
                {date.getDate()}
                {owner && (
                  <span className="absolute right-1 bottom-1 size-1.5 rounded-full bg-primary" aria-hidden />
                )}
              </button>
            )
          }),
        )}
      </div>

      {durationDays === 2 && (
        <p className={cn("text-xs text-muted-foreground", dense ? "mt-1.5 leading-snug" : "mt-2")}>
          Тур на два дня — вторая дата бронируется автоматически следующим днём.
        </p>
      )}

      {/* Подпись, каким туром из ЭТОЙ ЖЕ заявки занята дата — Виктор:
          "добавлять описание на какую дату какой тур уже забронирован"
          (актуально, когда в заявке уже несколько туров). */}
      {legendEntries.length > 0 && (
        <ul className={cn("space-y-0.5 text-xs leading-snug text-muted-foreground", dense ? "mt-1" : "mt-2")}>
          {legendEntries.map(([iso, title]) => (
            <li key={iso} className="flex items-center gap-1.5">
              <span className="size-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
              {formatShortDate(iso)} — занято туром «{title}»
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function formatShortDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00`)
  return `${d.getDate()} ${MONTH_NAMES[d.getMonth()].slice(0, 3).toLowerCase()}`
}
