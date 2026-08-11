import { cn } from "@/lib/utils"

export function Glow({ side = "left", className }: { side?: "left" | "right"; className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute top-1/2 -z-10 size-[30rem] -translate-y-1/2 rounded-full bg-primary/25 blur-[90px]",
        side === "left" ? "left-0 -translate-x-1/2" : "right-0 translate-x-1/2",
        className,
      )}
    />
  )
}
