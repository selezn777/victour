import { CARD } from "../park/ui"

// Общие блоки страниц Фукуока: путеводитель-гармошка и подпись авторов фото.

export function GuideItem({
  emoji,
  title,
  children,
  open,
}: {
  emoji: string
  title: string
  children: React.ReactNode
  open?: boolean
}) {
  return (
    <details className={`${CARD} group`} open={open}>
      <summary className="flex min-h-13 cursor-pointer list-none items-center gap-3 px-4 py-3 [&::-webkit-details-marker]:hidden">
        <span className="text-[22px] leading-none">{emoji}</span>
        <b className="flex-1 text-[15px] leading-tight text-(--c-primary)">{title}</b>
        <span className="text-[18px] text-(--c-primary) transition-transform group-open:rotate-90">›</span>
      </summary>
      <div className="space-y-2 px-4 pb-4 text-[13.5px] leading-snug">{children}</div>
    </details>
  )
}

export function InfoTile({ emoji, title, note }: { emoji: string; title: string; note: string }) {
  return (
    <div className="flex items-center gap-2.5 rounded-lg bg-(--c-bg-2) p-3.5">
      <span className="text-[24px] leading-none">{emoji}</span>
      <div>
        <b className="block text-[13.5px] leading-tight font-extrabold text-(--c-primary)">{title}</b>
        <span className="block text-[12px] leading-tight text-(--c-muted)">{note}</span>
      </div>
    </div>
  )
}

export function PhotoCredits({ children }: { children: React.ReactNode }) {
  return <p className="px-1 text-[11px] leading-snug text-(--c-muted)">{children}</p>
}
