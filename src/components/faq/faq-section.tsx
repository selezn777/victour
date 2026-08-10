"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { FaqList } from "@/components/faq/faq-list"
import { FaqQuestionForm } from "@/components/faq/faq-question-form"
import type { FaqItem } from "@/lib/faq-data"
import type { TourOption } from "@/lib/reviews-data"

export function FaqSection({
  title,
  items,
  tours,
  lockedTourId,
  showTourTitle,
  emptyMessage,
  className,
}: {
  title: string
  items: FaqItem[]
  tours: TourOption[]
  lockedTourId?: string
  showTourTitle?: boolean
  emptyMessage: string
  className?: string
}) {
  const [showForm, setShowForm] = useState(false)

  return (
    <section className={className}>
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-heading text-lg font-semibold sm:text-xl">{title}</h2>
        <Button variant="outline" size="sm" onClick={() => setShowForm((v) => !v)}>
          {showForm ? "Отмена" : "Задать вопрос"}
        </Button>
      </div>

      {showForm && (
        <div className="mt-4">
          <FaqQuestionForm tours={tours} lockedTourId={lockedTourId} />
        </div>
      )}

      <div className="mt-4">
        <FaqList items={items} showTourTitle={showTourTitle} emptyMessage={emptyMessage} />
      </div>
    </section>
  )
}
