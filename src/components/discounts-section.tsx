export function DiscountsSection({ packageDiscounts }: { packageDiscounts: Record<string, number> }) {
  const tiers = Object.entries(packageDiscounts).sort(([a], [b]) => Number(a) - Number(b))

  return (
    <section className="border-b border-border bg-muted/30">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <h2 className="font-heading text-lg font-semibold sm:text-xl">
          Больше туров в пакете — больше скидка
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Скидка считается автоматически при бронировании нескольких программ. Далат — одна экскурсия, хоть и на два дня.
        </p>

        <div className="mt-5 grid grid-cols-3 gap-3 sm:max-w-lg">
          {tiers.map(([count, pct]) => (
            <div
              key={count}
              className="rounded-xl border border-border bg-card px-4 py-5 text-center shadow-sm"
            >
              <div className="font-heading text-2xl font-semibold text-primary sm:text-3xl">
                −{pct}%
              </div>
              <div className="mt-1 text-xs text-muted-foreground sm:text-sm">{count} тура</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
