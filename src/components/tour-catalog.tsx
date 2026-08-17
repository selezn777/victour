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
    <section id="catalog" className="mx-auto max-w-6xl px-4 pt-6 pb-10 sm:px-6 sm:pt-8 sm:pb-14">
      <h2 className="font-heading text-xl font-semibold sm:text-2xl">Наши туры</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Пять авторских программ. Дата и гид — на странице каждого тура.
      </p>

      <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center">
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
          className="w-fit gap-1.5"
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
        <p className="mt-10 text-sm text-muted-foreground">{emptyMessage}</p>
      ) : (
        // Виктор попросил ту же поэтапную "блоковую" пролистку, что на
        // главной (переплёт слева, ровно один блок за раз, без обычного
        // скролла) — вместо сетки карточек здесь одна карточка на весь
        // блок, свайп/колесо переключает на следующий тур. Высота
        // фиксированная (не formula "вся высота вьюпорта минус хедер" —
        // дека здесь встроена НЕ первым блоком под хедером, а ниже
        // заголовка и поиска).
        <div className="mt-6 mx-auto w-full max-w-sm sm:max-w-md">
          <SlideDeck
            className="h-[72svh] min-h-[420px] w-full sm:h-[76svh]"
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
