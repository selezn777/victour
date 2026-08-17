import { SearchIcon, HeartIcon } from "lucide-react"
import { TourCard } from "@/components/tour-card"
import { SlideDeck } from "@/components/slide-deck"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { CatalogTour } from "@/lib/site-data"

export function TourCatalog({
  tours,
  isFavorite,
  onToggleFavorite,
  emptyMessage,
  searchQuery,
  onSearchChange,
  favoritesOnly,
  onToggleFavoritesOnly,
  favoritesCount,
}: {
  tours: CatalogTour[]
  isFavorite: (slug: string) => boolean
  onToggleFavorite: (slug: string) => void
  emptyMessage: string
  searchQuery: string
  onSearchChange: (value: string) => void
  favoritesOnly: boolean
  onToggleFavoritesOnly: () => void
  favoritesCount: number
}) {
  return (
    <section id="catalog" className="mx-auto max-w-6xl px-4 sm:px-6">
      {/* Заголовок "Наши туры" и подпись убраны — Виктор попросил открыть
          максимум места под саму карточку тура ("прям как в каталоге в
          журнале"), а не под текст сверху. Осталась только компактная
          строка поиска/избранного, той же высоты, что и хедер SiteHeader
          (h-16/sm:h-20) — симметрично, и высота деки под ней считается
          точной формулой (100svh минус хедер минус эта строка), а не
          приблизительной svh-долей, как раньше. */}
      <div className="flex h-16 items-center gap-2 sm:h-20 sm:gap-4">
        <div className="relative flex-1 sm:max-w-xs">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Найти тур"
            aria-label="Поиск по турам"
            className="h-10 pl-9"
          />
        </div>

        <Button
          variant={favoritesOnly ? "secondary" : "outline"}
          size="sm"
          aria-pressed={favoritesOnly}
          onClick={onToggleFavoritesOnly}
          className="w-fit shrink-0 gap-1.5"
        >
          <HeartIcon className={cn("size-3.5", favoritesOnly && "fill-current")} />
          Избранное
          {favoritesCount > 0 && (
            <Badge variant="secondary" className="h-4 min-w-4 justify-center px-1 text-[10px]">
              {favoritesCount}
            </Badge>
          )}
        </Button>
      </div>

      {tours.length === 0 ? (
        <p className="pb-10 text-sm text-muted-foreground">{emptyMessage}</p>
      ) : (
        // Поэтапная "блоковая" пролистка, как на главной (переплёт слева,
        // ровно один блок за раз, без обычного скролла) — одна карточка на
        // весь экран (минус хедер и строка поиска сверху), свайп/колесо
        // переключает на следующий тур.
        <div className="mx-auto w-full max-w-sm sm:max-w-md">
          <SlideDeck
            className="h-[calc(100svh-8rem)] w-full sm:h-[calc(100svh-10rem)]"
            slides={tours.map((tour) => (
              <TourCard
                key={tour.slug}
                tour={tour}
                fill
                isFavorite={isFavorite(tour.slug)}
                onToggleFavorite={() => onToggleFavorite(tour.slug)}
              />
            ))}
          />
        </div>
      )}
    </section>
  )
}
