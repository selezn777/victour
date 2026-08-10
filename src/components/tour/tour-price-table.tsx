import { formatUsd } from "@/lib/format"
import type { TourPricingTier } from "@/lib/site-data"
import { cn } from "@/lib/utils"

export function TourPriceTable({
  tiers,
  selectedGuestCount,
  onSelectGuestCount,
}: {
  tiers: TourPricingTier[]
  selectedGuestCount?: number
  onSelectGuestCount?: (count: number) => void
}) {
  const selectedTier = tiers.find((t) => t.guestCount === selectedGuestCount) ?? tiers[0]

  return (
    <section>
      <h2 className="font-heading text-xl font-semibold sm:text-2xl">Цена за человека</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Нажмите на число гостей — группа платит один раз, сумма делится на всех. Чем больше компания, тем дешевле с человека.
      </p>

      <div className="mt-5 grid grid-cols-3 gap-2 sm:grid-cols-4">
        {tiers.map((tier) => {
          const selected = tier.guestCount === selectedGuestCount
          return (
            <button
              key={tier.guestCount}
              type="button"
              aria-pressed={selected}
              onClick={() => onSelectGuestCount?.(tier.guestCount)}
              className={cn(
                "rounded-xl border p-3 text-center transition-colors",
                selected ? "border-primary bg-primary/5" : "border-border hover:bg-muted",
                onSelectGuestCount && "cursor-pointer",
              )}
            >
              <div className="text-xs text-muted-foreground">{tier.guestCount} гостей</div>
              <div className="mt-1 font-heading text-lg font-semibold text-primary">
                {formatUsd(tier.priceAdultUsd)}
              </div>
              <div className="text-[11px] text-muted-foreground">за человека</div>
              {tier.priceChildUsd != null && (
                <div className="mt-0.5 text-[11px] text-muted-foreground">
                  ребёнок {formatUsd(tier.priceChildUsd)}
                </div>
              )}
            </button>
          )
        })}
      </div>

      {selectedTier && (
        <p className="mt-3 text-sm text-muted-foreground">
          Группа из {selectedTier.guestCount}: {formatUsd(selectedTier.priceAdultUsd * selectedTier.guestCount)}{" "}
          — сумма и способ оплаты видны справа в блоке брони.
        </p>
      )}
    </section>
  )
}
