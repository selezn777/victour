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
  durationDays,
  selectedDate,
  onSelectDate,
  large = false,
}: {
  bookedDates: Set<string>
  durationDays: number
  selectedDate: string | null
  onSelectDate: (date: string) => void
  /** Крупнее тач-таргеты (кнопки дат/пред.-след.) — на странице тура
   * Виктор увидел стандартный размер на телефоне и попросил кнопки даты
   * покрупнее, "удобнее". Остальные места (форма заявки) остаются как были. */
  large?: boolean
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
    <div className={cn("rounded-xl border border-border p-4", large && "sm:p-5")}>
      <div className="flex items-center justify-between">
        <span className={cn("text-sm font-medium", large && "sm:text-base")}>
          {MONTH_NAMES[cursor.getMonth()]} {cursor.getFullYear()}
        </span>
        <div className="flex gap-1.5">
          <Button
            type="button"
            variant="outline"
            size={large ? "default" : "sm"}
            disabled={isPastMonth}
            onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
          >
            Пред.
          </Button>
          <Button
            type="button"
            variant="outline"
            size={large ? "default" : "sm"}
            onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
          >
            След.
          </Button>
        </div>
      </div>

      <div className={cn("mt-3 grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground", large && "sm:text-sm")}>
        {WEEKDAYS.map((w) => (
          <div key={w}>{w}</div>
        ))}
      </div>

      <div className={cn("mt-1 grid grid-cols-7", large ? "gap-1.5" : "gap-1")}>
        {weeks.flatMap((week, wi) =>
          week.map((date, di) => {
            if (!date) return <div key={`${wi}-${di}`} />
            const disabled = isDisabled(date)
            const selected = isSelected(date)
            return (
              <button
                key={`${wi}-${di}`}
                type="button"
                disabled={disabled}
                aria-pressed={selected}
                onClick={() => onSelectDate(toIsoDate(date))}
                className={cn(
                  "flex items-center justify-center rounded-lg text-sm transition-colors",
                  large ? "h-11 text-base sm:h-12" : "h-9",
                  disabled && "cursor-not-allowed text-muted-foreground/40 line-through",
                  !disabled && !selected && "hover:bg-muted",
                  selected && "bg-primary text-primary-foreground",
                )}
              >
                {date.getDate()}
              </button>
            )
          }),
        )}
      </div>

      {durationDays === 2 && (
        <p className="mt-3 text-xs text-muted-foreground">
          Тур на два дня — вторая дата бронируется автоматически следующим днём.
        </p>
      )}
    </div>
  )
}
