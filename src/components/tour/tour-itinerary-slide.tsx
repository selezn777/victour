import type { ItineraryItem } from "@/lib/site-data"

// Слайд "Маршрут" в колоде тура. Для двухдневных туров (Далат) — экран
// делится пополам по вертикали: день 1 слева, день 2 справа, каждая
// колонка скроллится независимо, если пунктов больше, чем влезает по
// высоте (Виктор: "делим экран пополам", "если не помещается — как-то
// разбиваем"). Для однодневных — один список на весь слайд.
export function TourItinerarySlide({
  itinerary,
  isTwoDay,
}: {
  itinerary: ItineraryItem[]
  isTwoDay: boolean
}) {
  const days = Array.from(new Set(itinerary.map((i) => i.day))).sort((a, b) => a - b)

  return (
    <div className="flex h-full w-full flex-col overflow-hidden px-4 pt-6 pb-5 sm:px-11 sm:pt-9">
      <h2 className="text-center font-heading text-2xl leading-[1.15] font-semibold sm:text-4xl">
        Маршрут
      </h2>

      {isTwoDay ? (
        <div className="mt-5 grid min-h-0 flex-1 grid-cols-2 divide-x divide-border">
          {days.map((day) => (
            <div key={day} className="flex min-h-0 flex-col overflow-y-auto px-2 first:pl-0 last:pr-0 sm:px-4">
              <h3 className="sticky top-0 mb-3 bg-background pb-2 text-center text-xs font-medium text-primary uppercase sm:text-sm">
                День {day}
              </h3>
              <DayList itinerary={itinerary} day={day} />
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-5 min-h-0 flex-1 overflow-y-auto sm:mx-auto sm:max-w-xl sm:px-4">
          <DayList itinerary={itinerary} day={days[0]} />
        </div>
      )}
    </div>
  )
}

function DayList({ itinerary, day }: { itinerary: ItineraryItem[]; day: number }) {
  return (
    <ol className="flex flex-col gap-3 pb-4 sm:gap-4">
      {itinerary
        .filter((i) => i.day === day)
        .map((item, index) => (
          <li key={item.title} className="flex gap-2.5 text-left sm:gap-3">
            <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
              {index + 1}
            </span>
            <div>
              <p className="text-sm font-medium sm:text-base">{item.title}</p>
              {item.description && (
                <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">{item.description}</p>
              )}
            </div>
          </li>
        ))}
    </ol>
  )
}
