import { CheckCircle2Icon, LuggageIcon } from "lucide-react"

// Виктор: "Что входит" и "Что взять с собой" — обратно на один слайд
// (были разнесены на два), но стилизовать по-разному, чтобы не сливались
// в один список. "Что входит" — обычный текстовый список. "Что взять с
// собой" — отдельная карточка с пунктирной рамкой и своими иконками,
// читается как отдельная заметка-чеклист внутри того же экрана.
export function TourIncludesSlide({
  includes,
  excludes,
  packingItems,
}: {
  includes: string[]
  excludes: string[]
  packingItems: string[]
}) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-[safe_center] overflow-y-auto px-4 py-6 sm:px-11">
      <div className="grid w-full max-w-3xl gap-10 sm:grid-cols-2 sm:gap-8">
        <div>
          <h2 className="text-center font-heading text-2xl font-semibold sm:text-left sm:text-3xl">Что входит</h2>
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

        <div className="rounded-2xl border border-dashed border-primary/40 bg-primary/5 p-5 sm:p-6">
          <h2 className="flex items-center justify-center gap-2 text-center font-heading text-xl font-semibold sm:justify-start sm:text-left sm:text-2xl">
            <LuggageIcon className="size-5 text-primary sm:size-6" />
            Что взять с собой
          </h2>
          <ul className="mt-5 flex flex-col gap-3 text-sm sm:text-base">
            {packingItems.map((item) => (
              <li key={item} className="flex gap-2.5">
                <CheckCircle2Icon className="mt-0.5 size-4 shrink-0 text-primary" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
