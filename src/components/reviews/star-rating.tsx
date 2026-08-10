"use client"

import { StarIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export function StarRatingDisplay({ rating, className }: { rating: number; className?: string }) {
  return (
    <div className={cn("flex items-center gap-0.5", className)} aria-label={`${rating} из 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <StarIcon
          key={n}
          className={cn(
            "size-4",
            n <= rating ? "fill-primary text-primary" : "fill-none text-muted-foreground/40",
          )}
        />
      ))}
    </div>
  )
}

export function StarRatingInput({
  value,
  onChange,
}: {
  value: number
  onChange: (rating: number) => void
}) {
  return (
    <div className="flex items-center gap-1" role="radiogroup" aria-label="Оценка">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={n === value}
          aria-label={`${n} из 5`}
          onClick={() => onChange(n)}
          className="p-0.5"
        >
          <StarIcon
            className={cn(
              "size-7 transition-colors",
              n <= value ? "fill-primary text-primary" : "fill-none text-muted-foreground/40",
            )}
          />
        </button>
      ))}
    </div>
  )
}
