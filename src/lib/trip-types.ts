// Ответ /api/my-trips — общий тип для API и страницы /trips.

export type TripItem = {
  title: string
  slug: string | null
  date: string // YYYY-MM-DD
  dateEnd: string | null
  guests: number | null
  priceUsd: number | null
  priceNote?: string | null // билеты парка: цена из прайса («от 850K ₫»)
  pickup: string | null
  boat?: string | null
  cableCar?: string | null
  guide: string | null
  guideComment: string | null
  bring: string[]
  summary?: string
}

export type Trip = {
  kind: "booking" | "park"
  ref: string // id заявки или токен билета — по нему же запрос изменения
  date: string
  status: string
  paid: boolean
  name: string
  hotel: string
  totalUsd: number | null
  prepaymentUsd: number | null
  items: TripItem[]
}
