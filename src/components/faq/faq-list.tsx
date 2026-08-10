import type { FaqItem } from "@/lib/faq-data"

export function FaqList({
  items,
  showTourTitle,
  emptyMessage,
}: {
  items: FaqItem[]
  showTourTitle?: boolean
  emptyMessage: string
}) {
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyMessage}</p>
  }

  return (
    <div className="flex flex-col gap-2">
      {items.map((item) => (
        <details key={item.id} className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <summary className="cursor-pointer text-sm font-medium">
            {item.question}
            {showTourTitle && item.tourTitle && (
              <span className="ml-2 text-xs font-normal text-muted-foreground">
                · {item.tourTitle}
              </span>
            )}
          </summary>
          <p className="mt-2 text-sm text-muted-foreground">{item.answer}</p>
        </details>
      ))}
    </div>
  )
}
