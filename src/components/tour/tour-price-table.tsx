import { formatRubFromUsd, formatUsd, formatVndFromUsd } from "@/lib/format"
import type { SiteSettings, TourPricingTier } from "@/lib/site-data"
import { cn } from "@/lib/utils"

export function TourPriceTable({
  tiers,
  settings,
  selectedGuestCount,
}: {
  tiers: TourPricingTier[]
  settings: SiteSettings
  selectedGuestCount?: number
}) {
  const hasChildPrice = tiers.some((t) => t.priceChildUsd != null)

  return (
    <section>
      <h2 className="font-heading text-xl font-semibold sm:text-2xl">Цена</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Чем больше гостей в компании — тем ниже цена с человека. Группа платит один раз, сумма делится на всех.
      </p>

      <div className="mt-5 overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[420px] text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-left text-xs text-muted-foreground uppercase">
              <th className="px-4 py-3 font-medium">Гостей</th>
              <th className="px-4 py-3 font-medium">Взрослый</th>
              {hasChildPrice && <th className="px-4 py-3 font-medium">Ребёнок</th>}
              <th className="px-4 py-3 font-medium">Группа</th>
              <th className="px-4 py-3 font-medium">В рублях / чел</th>
            </tr>
          </thead>
          <tbody>
            {tiers.map((tier) => (
              <tr
                key={tier.guestCount}
                className={cn(
                  "border-b border-border last:border-0",
                  tier.guestCount === selectedGuestCount && "bg-primary/5",
                )}
              >
                <td className="px-4 py-3 font-medium">{tier.guestCount}</td>
                <td className="px-4 py-3">{formatUsd(tier.priceAdultUsd)}</td>
                {hasChildPrice && (
                  <td className="px-4 py-3">
                    {tier.priceChildUsd != null ? formatUsd(tier.priceChildUsd) : "—"}
                  </td>
                )}
                <td className="px-4 py-3">{formatUsd(tier.priceAdultUsd * tier.guestCount)}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {formatRubFromUsd(tier.priceAdultUsd, settings.usdRubRate, settings.rubMarkupPct)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        Ориентир в VND: {formatVndFromUsd(tiers[0]?.priceAdultUsd ?? 0, settings.usdVndRate)} за человека при {tiers[0]?.guestCount} гостях.
      </p>
    </section>
  )
}
