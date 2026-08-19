"use client"

import { useEffect, useRef, useState } from "react"

// true один раз, когда элемент впервые попадает в зону видимости — дальше
// не сбрасывается, даже если элемент уходит из вьюпорта и возвращается
// (нужно для CTA-кнопки, которая должна "моргнуть" ровно один раз).
export function useOnceVisible<T extends HTMLElement>(threshold = 0.6) {
  const ref = useRef<T>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold])

  return { ref, visible }
}
