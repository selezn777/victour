// Пять "комет"-стрелок, ведущих взгляд сверху вниз к кнопке под ними
// (Виктор: "не 1 стрелочка, а штук 5, у каждой свой хвостик, чтобы прямо
// вели к кнопке"). Общий компонент — используется над кнопкой "Выбрать тур"
// на последнем слайде героя и в конце страницы, где блок отзывов
// заканчивается тем же CTA.
const HINT_ARROWS = [
  { top: -112, width: 16, opacity: 0.45, delay: 0 },
  { top: -90, width: 18.5, opacity: 0.58, delay: 0.22 },
  { top: -68, width: 21, opacity: 0.72, delay: 0.44 },
  { top: -46, width: 23.5, opacity: 0.86, delay: 0.66 },
  { top: -24, width: 26, opacity: 1, delay: 0.88 },
]

export function ScrollHintArrows() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 top-0 flex justify-center text-primary"
    >
      <div className="relative h-28 w-8">
        {HINT_ARROWS.map((arrow, i) => (
          <svg
            key={i}
            viewBox="0 0 24 34"
            className="hint-arrow absolute left-1/2 -translate-x-1/2"
            style={{
              top: arrow.top,
              width: arrow.width,
              height: (arrow.width * 34) / 24,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any -- CSS custom property
              ["--hint-opacity" as any]: arrow.opacity,
              animationDelay: `${arrow.delay}s`,
            }}
          >
            <defs>
              <linearGradient id={`hint-tail-${i}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="currentColor" stopOpacity="0" />
                <stop offset="100%" stopColor="currentColor" stopOpacity="1" />
              </linearGradient>
            </defs>
            <path d="M12 0 L12 19" stroke={`url(#hint-tail-${i})`} strokeWidth="2" strokeLinecap="round" fill="none" />
            <path
              d="M5 15 L12 23 L19 15"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
        ))}
      </div>
    </div>
  )
}
