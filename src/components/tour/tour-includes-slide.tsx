// Виктор: слайд с одним только "Что входит" (без "Не входит", он есть не
// у всех туров) выглядел наполовину пустым — пустая вторая колонка грида.
// "Не входит" по природе короткий (0-3 пункта) и не заслуживает своей
// колонки/слайда — оставляем его здесь же, мелкой сноской под списком.
// Полноценный второй ВСЕГДА-непустой раздел ("Что взять с собой") —
// теперь отдельный слайд колоды (см. TourPackingSlide), не колонка тут.
export function TourIncludesSlide({ includes, excludes }: { includes: string[]; excludes: string[] }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-[safe_center] overflow-y-auto px-4 py-6 sm:px-11">
      <div className="w-full max-w-xl">
        <h2 className="text-center font-heading text-2xl font-semibold sm:text-3xl">Что входит</h2>
        <ul className="mt-6 flex flex-col gap-3 text-sm sm:text-base">
          {includes.map((item) => (
            <li key={item} className="flex gap-2">
              <span className="text-primary">+</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>

        {excludes.length > 0 && (
          <div className="mt-8 border-t border-border pt-5">
            <h3 className="text-sm font-medium text-muted-foreground">Не входит</h3>
            <ul className="mt-2.5 flex flex-col gap-1.5 text-sm text-muted-foreground">
              {excludes.map((item) => (
                <li key={item} className="flex gap-2">
                  <span>—</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
