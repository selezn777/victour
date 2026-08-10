import type { ItineraryItem } from "@/lib/site-data"

export function TourItinerary({ itinerary, isTwoDay }: { itinerary: ItineraryItem[]; isTwoDay: boolean }) {
  const days = Array.from(new Set(itinerary.map((i) => i.day))).sort((a, b) => a - b)

  return (
    <section>
      <h2 className="font-heading text-xl font-semibold sm:text-2xl">Маршрут</h2>

      <div className="mt-5 flex flex-col gap-8">
        {days.map((day) => (
          <div key={day}>
            {isTwoDay && (
              <h3 className="mb-3 text-sm font-medium text-primary uppercase">День {day}</h3>
            )}
            <ol className="flex flex-col gap-4">
              {itinerary
                .filter((i) => i.day === day)
                .map((item, index) => (
                  <li key={item.title} className="flex gap-3">
                    <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-medium">{item.title}</p>
                      {item.description && (
                        <p className="mt-0.5 text-sm text-muted-foreground">{item.description}</p>
                      )}
                    </div>
                  </li>
                ))}
            </ol>
          </div>
        ))}
      </div>
    </section>
  )
}
