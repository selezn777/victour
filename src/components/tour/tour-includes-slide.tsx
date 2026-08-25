export function TourIncludesSlide({ includes, excludes }: { includes: string[]; excludes: string[] }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-[safe_center] overflow-y-auto px-4 py-6 sm:px-11">
      <div className="grid w-full max-w-2xl grid-cols-1 gap-8 sm:grid-cols-2">
        <div>
          <h2 className="font-heading text-xl font-semibold sm:text-2xl">Что входит</h2>
          <ul className="mt-4 flex flex-col gap-2.5 text-sm sm:text-base">
            {includes.map((item) => (
              <li key={item} className="flex gap-2">
                <span className="text-primary">+</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {excludes.length > 0 && (
          <div>
            <h2 className="font-heading text-xl font-semibold sm:text-2xl">Не входит</h2>
            <ul className="mt-4 flex flex-col gap-2.5 text-sm text-muted-foreground sm:text-base">
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
