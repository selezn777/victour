// Виктор: "везде и всегда два пункта — что входит, и что с собой взять,
// разделены на два экрана". Второй, ВСЕГДА непустой (в отличие от "Не
// входит") раздел — свой отдельный слайд колоды, тот же стиль, что и
// TourIncludesSlide.
export function TourPackingSlide({ items }: { items: string[] }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-[safe_center] overflow-y-auto px-4 py-6 sm:px-11">
      <div className="w-full max-w-xl">
        <h2 className="text-center font-heading text-2xl font-semibold sm:text-3xl">Что взять с собой</h2>
        <ul className="mt-6 flex flex-col gap-3 text-sm sm:text-base">
          {items.map((item) => (
            <li key={item} className="flex gap-2">
              <span className="text-primary">+</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
