import type { TicketOption } from "@/lib/site-data"

function formatVnd(amount: number | null): string {
  if (amount == null) return "—"
  if (amount === 0) return "бесплатно"
  return `${amount.toLocaleString("ru-RU")} ₫`
}

export function TourTicketOptions({ options }: { options: TicketOption[] }) {
  return (
    <section>
      <h2 className="font-heading text-xl font-semibold sm:text-2xl">Билеты и личные опции</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Основные входные билеты уже включены в цену тура. Здесь — ориентир по стоимости на месте и
        необязательные дополнения, которые гость оплачивает сам.
      </p>

      <div className="mt-5 overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[480px] text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-left text-xs text-muted-foreground uppercase">
              <th className="px-4 py-3 font-medium">Локация</th>
              <th className="px-4 py-3 font-medium">Гость</th>
              <th className="px-4 py-3 font-medium">Гид</th>
              <th className="px-4 py-3 font-medium">Отдельно</th>
            </tr>
          </thead>
          <tbody>
            {options.map((option) => (
              <tr key={option.location} className="border-b border-border last:border-0">
                <td className="px-4 py-3 font-medium">{option.location}</td>
                <td className="px-4 py-3">{formatVnd(option.guestVnd)}</td>
                <td className="px-4 py-3 text-muted-foreground">{formatVnd(option.guideVnd)}</td>
                <td className="px-4 py-3 text-muted-foreground">{option.note ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
