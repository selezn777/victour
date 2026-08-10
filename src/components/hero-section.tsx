import Image from "next/image"

export function HeroSection({ packageDiscounts }: { packageDiscounts: Record<string, number> }) {
  const tiers = Object.entries(packageDiscounts).sort(([a], [b]) => Number(a) - Number(b))

  return (
    <section className="relative flex h-[calc(100svh-3.5rem)] min-h-[520px] flex-col justify-end overflow-hidden sm:h-[calc(100svh-4rem)]">
      <Image
        src="/images/hero/premium-van-interior.jpg"
        alt="Премиальный салон лимузин-минивэна для private-туров"
        fill
        priority
        className="object-cover"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/20" />

      <div className="relative mx-auto w-full max-w-6xl px-4 pb-10 text-white sm:px-6 sm:pb-16">
        <h1 className="font-heading text-3xl leading-tight font-semibold sm:text-5xl">
          Вьетнам такой, каким вы хотите его видеть
        </h1>
        <p className="mt-3 max-w-xl text-sm text-white/80 sm:text-base">
          Индивидуальные private-туры: комфортный транспорт, личный гид и рестораны, где вы
          сами выбираете блюда по меню — без чужих компаний и спешки.
        </p>

        <div className="mt-5 flex flex-wrap gap-2 sm:mt-6">
          {tiers.map(([count, pct]) => (
            <div
              key={count}
              className="rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-xs backdrop-blur-sm sm:text-sm"
            >
              {count} тура — скидка {pct}%
            </div>
          ))}
        </div>
        <p className="mt-2 text-xs text-white/70 sm:text-sm">
          Больше гостей в компании — ниже цена на человека. Больше туров в пакете — больше скидка.
        </p>
      </div>
    </section>
  )
}
