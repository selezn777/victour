import Link from "next/link"
import { Reveal } from "@/components/motion/reveal"
import { Glow } from "@/components/glow"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function DiscountsSection({ packageDiscounts }: { packageDiscounts: Record<string, number> }) {
  const tiers = Object.entries(packageDiscounts).sort(([a], [b]) => Number(a) - Number(b))

  return (
    <section className="relative overflow-hidden border-b border-border bg-muted/30">
      <Glow side="right" className="opacity-70" />
      <div className="relative mx-auto max-w-6xl px-4 py-8 text-center sm:px-6 sm:py-10">
        <h2 className="font-heading text-lg font-semibold sm:text-xl">
          Больше туров в пакете — больше скидка
        </h2>
        <p className="mx-auto mt-1 max-w-xl text-sm text-muted-foreground">
          Скидка считается автоматически при бронировании нескольких программ. Далат — одна экскурсия, хоть и на два дня.
        </p>

        <div className="mt-5 grid grid-cols-3 gap-3 sm:mx-auto sm:max-w-lg">
          {tiers.map(([count, pct], i) => (
            <Reveal key={count} delay={i * 0.08} y={12}>
              <div className="rounded-xl border border-border bg-card px-4 py-5 text-center shadow-sm transition-transform hover:scale-105">
                <div className="font-heading text-2xl font-semibold text-primary sm:text-3xl">
                  −{pct}%
                </div>
                <div className="mt-1 text-xs text-muted-foreground sm:text-sm">{count} тура</div>
              </div>
            </Reveal>
          ))}
        </div>

        <Link href="/tours" className={cn(buttonVariants({ size: "lg" }), "mt-6 w-full sm:w-auto")}>
          Выбрать тур
        </Link>
      </div>
    </section>
  )
}
