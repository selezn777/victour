// Всё, что Виктор может захотеть поменять на лендинге /park, — здесь.
// Файл импортируется и клиентом (форма), и сервером (/api/park-booking),
// поэтому никаких секретов сюда не класть.

import { isValidPhoneNumber } from "libphonenumber-js/min"

export const PARK_TIMEZONE = "Asia/Ho_Chi_Minh"

export const PARK_WHATSAPP = {
  display: "+84 383 714 638",
  href: "https://wa.me/84383714638",
  name: "Виктор",
}

/**
 * Ссылка «открыть чат с готовым текстом». Не wa.me: его редирект на части
 * телефонов ломает кодировку, и эмодзи в тексте приходят знаками «�».
 */
export function waTextLink(phone: string, text: string): string {
  return `https://api.whatsapp.com/send?phone=${phone.replace(/\D/g, "")}&text=${encodeURIComponent(text)}`
}

// ---------- Направления: парк (канатка) и остров Хон Там ----------

export type DestinationId = "park" | "hontam"

export type PackageOption = {
  id: string
  title: string // в форме
  price: string // в форме, под названием (взрослый)
  childPrice?: string // ребёнок/пенсионер, если отличается
  formNotes?: string[] // мелкие пояснения в карточке билета в форме
  english: string // в сообщении для Telegram
}

export type GuestOption = {
  key: string
  emoji: string
  title: string // карточка категории на странице
  note: string
  price?: string // цена на карточке категории (за стандартный билет)
  free?: boolean
  formLabel: string
  english: string
}

export type ExtraOption = {
  key: string
  group?: string
  label: string
  price?: string // за 1 человека
  english: string
}

export type DepartureSlot = { pickup: string; boat?: string }

// "07:05" / "7:05" → "7:05"; всё остальное → null
export function normalizeTime(v: string): string | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(v)
  if (!m || Number(m[1]) > 23 || Number(m[2]) > 59) return null
  return `${Number(m[1])}:${m[2]}`
}

const minutes = (t: string) => {
  const [h, m] = t.split(":").map(Number)
  return h * 60 + m
}

/** departureTime заявки → слот выезда (у Хон Тама — катер, у парка — выбранное время). */
export function findSlot(dest: DestinationId, departureTime: string | null): DepartureSlot | undefined {
  if (!departureTime) return undefined
  const d = DESTINATIONS[dest]
  if (d.departureTimes) return d.departureTimes.find((t) => t.boat === departureTime)
  const t = normalizeTime(departureTime)
  if (!t || !d.pickupRange) return undefined
  const m = minutes(t)
  return m >= minutes(d.pickupRange.min) && m <= minutes(d.pickupRange.max) ? { pickup: t } : undefined
}

export type Destination = {
  id: DestinationId
  tabLabel: string
  tabNote: string // подпись под названием в переключателе
  english: string
  childPriceLabel: string // подпись к childPrice: у парка скидка и детям, и 60+
  packages: PackageOption[]
  guests: GuestOption[]
  // хотя бы один из этих гостей должен быть в заявке (дети до 1 м одни не едут)
  payingGuests: string[]
  // Катер → во сколько выезжаем от отеля (всегда ±10 минут)
  departureTimes?: Required<DepartureSlot>[]
  // Без катера: турист сам выбирает время выезда от отеля в этих границах
  pickupRange?: { min: string; max: string }
  extras: ExtraOption[]
}

export const DESTINATIONS: Record<DestinationId, Destination> = {
  park: {
    id: "park",
    tabLabel: "🚡 VinWonders",
    tabNote: "парк + канатка",
    english: "VINWONDERS (cable car)",
    childPriceLabel: "дети и 60+",
    // price — взрослый, childPrice — ребёнок 100–139 см и пенсионер 60+
    packages: [
      {
        id: "1day",
        title: "Весь день",
        price: "1 050K ₫",
        childPrice: "800K ₫",
        english: "Full day (adult 1,050K / child & senior 800K VND, + food voucher)",
        formNotes: ["🍽 Ваучер на еду 150K", "детям и 60+ — 100K"],
      },
      {
        id: "2days",
        title: "2 дня",
        price: "1 350K ₫",
        childPrice: "1 050K ₫",
        english: "2 days unlimited (adult 1,350K / child & senior 1,050K VND)",
        formNotes: [
          "Без ваучера на еду",
          "Второй день — любой в течение 14 дней",
          "🚐 Трансфер в подарок — только в первый день",
        ],
      },
    ],
    guests: [
      {
        key: "infants",
        emoji: "👶",
        title: "Дети ниже 100 см",
        note: "Вход БЕСПЛАТНО!",
        free: true,
        formLabel: "Дети ниже 100 см (бесплатно)",
        english: "Kids under 100 cm (free)",
      },
      {
        key: "children",
        emoji: "🧒",
        title: "Детский билет",
        note: "Рост 100–139 см",
        price: "800K ₫",
        formLabel: "Дети 100–139 см",
        english: "Children 100–139 cm",
      },
      {
        key: "adults",
        emoji: "🧑",
        title: "Взрослый билет",
        note: "Рост от 140 см",
        price: "1 050K ₫",
        formLabel: "Взрослые",
        english: "Adults",
      },
      {
        key: "seniors",
        emoji: "👵",
        title: "Пенсионеры 60+",
        note: "Обязательно взять паспорт",
        price: "800K ₫",
        formLabel: "Пенсионеры 60+",
        english: "Seniors 60+ (passport required)",
      },
    ],
    payingGuests: ["adults", "children", "seniors"],
    pickupRange: { min: "6:00", max: "18:00" },
    // Доп. услуги — цена за 1 человека; в форме счётчик «на сколько человек»
    extras: [
      { key: "fp_thunder", group: "🚀 Fast Pass — без очереди", label: "Tilt of Thunder («Опрокидывание грома»)", price: "250K ₫", english: "Fast Pass: Tilt of Thunder" },
      { key: "fp_river", group: "🚀 Fast Pass — без очереди", label: "Сплав по реке Tata River", price: "250K ₫", english: "Fast Pass: Tata River" },
      { key: "fp_cinema", group: "🚀 Fast Pass — без очереди", label: "Летающий кинотеатр 5D", price: "250K ₫", english: "Fast Pass: Flying Cinema 5D" },
      { key: "fp_coaster", group: "🚀 Fast Pass — без очереди", label: "Горные сани (Alpine Coaster)", price: "250K ₫", english: "Fast Pass: Alpine Coaster" },
      { key: "fp_wheel", group: "🚀 Fast Pass — без очереди", label: "Колесо обозрения", price: "150K ₫", english: "Fast Pass: Ferris wheel" },
      { key: "fp_cable", group: "🚀 Fast Pass — без очереди", label: "Канатная дорога в одну сторону, берег → остров", price: "150K ₫", english: "Fast Pass: cable car one way (shore → island)" },
      { key: "combo3", group: "🎯 Выгодные комбо Fast Pass", label: "Горные сани + Tata River + кинотеатр 5D", price: "360K ₫", english: "Combo: Alpine Coaster + Tata River + Flying Cinema" },
      { key: "combo3_car", group: "🎯 Выгодные комбо Fast Pass", label: "Те же 3 аттракциона + электрокар по парку", price: "510K ₫", english: "Combo: 3 rides + park e-car" },
      { key: "zipline", group: "🪂 Зиплайн (в общей очереди)", label: "Зиплайн", price: "360K ₫", english: "Zipline" },
      { key: "zipline_car", group: "🪂 Зиплайн (в общей очереди)", label: "Зиплайн + электрокар по парку", price: "510K ₫", english: "Zipline + park e-car" },
      { key: "tata_premium", group: "✨ Tata Show", label: "Premium-место с лучшим обзором", price: "200K ₫", english: "Tata Show Premium seat" },
    ],
  },
  hontam: {
    id: "hontam",
    tabLabel: "🏝 Остров Хон Там",
    tabNote: "пляж + катер",
    english: "HON TAM ISLAND",
    childPriceLabel: "дети",
    packages: [
      {
        id: "basic",
        title: "Базовый",
        price: "430K ₫",
        childPrice: "340K ₫",
        english: "Basic: speedboat + beach (adult 430K / child 340K VND)",
      },
      {
        id: "mud",
        title: "С грязевыми ваннами",
        price: "540K ₫",
        childPrice: "430K ₫",
        english: "Speedboat + mud bath + beach (adult 540K / child 430K VND)",
      },
      {
        id: "lunch",
        title: "С обедом",
        price: "740K ₫",
        childPrice: "560K ₫",
        english: "Speedboat + beach + buffet lunch (adult 740K / child 560K VND)",
      },
      {
        id: "lunch_mud",
        title: "Обед + грязевые ванны",
        price: "855K ₫",
        childPrice: "585K ₫",
        english: "Speedboat + mud bath + beach + lunch (adult 855K / child 585K VND)",
      },
    ],
    guests: [
      {
        key: "infants",
        emoji: "👶",
        title: "Дети до 1 метра",
        note: "Бесплатно!",
        free: true,
        formLabel: "Дети до 1 м (бесплатно)",
        english: "Kids under 1 m (free)",
      },
      {
        key: "children",
        emoji: "🧒",
        title: "Дети 1–1,39 м",
        note: "от 340K ₫",
        formLabel: "Дети 100–139 см",
        english: "Children 1–1.39 m",
      },
      {
        key: "adults",
        emoji: "🧑",
        title: "Взрослые (от 1,4 м)",
        note: "от 430K ₫",
        formLabel: "Взрослые",
        english: "Adults",
      },
    ],
    payingGuests: ["adults", "children"],
    departureTimes: [
      { boat: "8:00", pickup: "7:20" },
      { boat: "9:00", pickup: "8:20" },
      { boat: "10:00", pickup: "9:20" },
      { boat: "12:00", pickup: "11:20" },
    ],
    extras: [
      {
        key: "seawalking",
        group: "🤿 Акция",
        label: "Seawalking — прогулка по дну моря",
        price: "$42 вместо $50",
        english: "SEAWALKING promo ($42)",
      },
      {
        key: "activities",
        group: "🌊 Активные развлечения",
        label: "Гидроскутер, парашют, дайвинг — подберём на месте",
        english: "Water activities (jet ski / parasailing / diving)",
      },
    ],
  },
}

export const DESTINATION_ORDER: DestinationId[] = ["park", "hontam"]
export const GUEST_MAX = 20

// ---------- Контакт ----------

export type ContactChannel = "whatsapp" | "telegram" | "phone"

export const CONTACT_CHANNELS: Record<ContactChannel, { label: string; english: string }> = {
  whatsapp: { label: "WhatsApp", english: "WhatsApp" },
  telegram: { label: "Telegram", english: "Telegram" },
  phone: { label: "Телефон", english: "Phone" },
}

// Быстрый выбор кода страны у телефона. undefined — «другая страна», номер целиком с +.
export const PHONE_COUNTRIES = [
  { code: "RU", flag: "🇷🇺", dial: "+7" },
  { code: "BY", flag: "🇧🇾", dial: "+375" },
  { code: "VN", flag: "🇻🇳", dial: "+84" },
] as const

// ---------- Экран успеха ----------

// Реклама после отправки заявки. Фото — те же, что в подборке туров на главной.
export const PROMO_TOURS = [
  {
    slug: "nyachang-avtorskiy",
    title: "Авторский Нячанг",
    imageSrc:
      "https://our41hywrmbsqagk.public.blob.vercel-storage.com/tours/nyachang-avtorskiy-pagoda.jpg",
  },
  {
    slug: "fanrang-avtorskiy",
    title: "Авторский Фанранг",
    imageSrc: "/images/tours/fanrang-avtorskiy-vertical.jpg",
  },
  {
    slug: "mayak-dai-lan",
    title: "Маяк Дай Лань и бухта Вунг Ро",
    imageSrc: "/images/tours/mayak-dai-lan-vertical.jpg",
  },
  {
    slug: "dalat-2-dnya",
    title: "Далат 2 дня",
    imageSrc: "/images/tours/dalat-2-dnya-vertical.jpg",
  },
]

export const REDIRECT_SECONDS = 10

// ---------- Данные формы и общая валидация (клиент + сервер) ----------

export type HotelPlace = {
  placeId: string
  address: string
  lat: number
  lng: number
}

export type ParkBooking = {
  destination: DestinationId
  date: string // YYYY-MM-DD
  packageId: string
  departureTime: string | null // Хон Там: время катера; парк: выезд от отеля
  guests: Record<string, number>
  hotel: string
  hotelPlace: HotelPlace | null
  name: string
  contactChannel: ContactChannel
  contact: string
  extras: Record<string, number> // key → на сколько человек
  comment: string
}

export type BookingField =
  | "date"
  | "packageId"
  | "departureTime"
  | "guests"
  | "hotel"
  | "name"
  | "contact"
  | "comment"

/** Сегодняшняя дата в Нячанге, YYYY-MM-DD. */
export function todayInNhaTrang(now = new Date()): string {
  // en-CA форматирует как YYYY-MM-DD
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: PARK_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now)
}

const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "")

function parseHotelPlace(v: unknown): HotelPlace | null {
  if (!v || typeof v !== "object") return null
  const p = v as Record<string, unknown>
  const placeId = str(p.placeId, 300)
  const lat = Number(p.lat)
  const lng = Number(p.lng)
  if (!/^[A-Za-z0-9_-]+$/.test(placeId)) return null
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
    return null
  }
  return { placeId, address: str(p.address, 300), lat, lng }
}

export function validateParkBooking(
  raw: unknown,
):
  | { ok: true; data: ParkBooking }
  | { ok: false; errors: Partial<Record<BookingField, string>> } {
  const input = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>
  const errors: Partial<Record<BookingField, string>> = {}

  const destination: DestinationId = input.destination === "hontam" ? "hontam" : "park"
  const dest = DESTINATIONS[destination]

  const date = str(input.date, 10)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(date))) {
    errors.date = "Выберите дату поездки"
  } else if (date < todayInNhaTrang()) {
    errors.date = "Дата не может быть в прошлом"
  }

  const packageId = str(input.packageId, 30)
  if (!dest.packages.some((p) => p.id === packageId)) {
    errors.packageId = "Выберите билет"
  }

  let departureTime: string | null = null
  if (dest.departureTimes) {
    departureTime = str(input.departureTime, 10)
    if (!findSlot(destination, departureTime)) errors.departureTime = "Выберите время катера"
  } else if (dest.pickupRange) {
    departureTime = findSlot(destination, str(input.departureTime, 10))?.pickup ?? null
    if (!departureTime) {
      errors.departureTime = `Выберите время выезда с ${dest.pickupRange.min} до ${dest.pickupRange.max}`
    }
  }

  const rawGuests = (input.guests && typeof input.guests === "object" ? input.guests : {}) as Record<
    string,
    unknown
  >
  const guests: Record<string, number> = {}
  for (const { key } of dest.guests) {
    const n = Number(rawGuests[key] ?? 0)
    if (!Number.isInteger(n) || n < 0 || n > GUEST_MAX) {
      errors.guests = `От 0 до ${GUEST_MAX} в каждой категории`
      guests[key] = 0
    } else {
      guests[key] = n
    }
  }
  if (!errors.guests && dest.payingGuests.every((key) => !guests[key])) {
    errors.guests = "Укажите хотя бы одного гостя с билетом"
  }

  const hotel = str(input.hotel, 200)
  if (hotel.length < 2) errors.hotel = "Укажите отель, откуда забрать"
  const hotelPlace = parseHotelPlace(input.hotelPlace)

  const name = str(input.name, 100)
  if (name.length < 2) errors.name = "Укажите ваше имя"

  const contactChannel = input.contactChannel
  const contact = str(input.contact, 100)
  if (contactChannel !== "whatsapp" && contactChannel !== "telegram" && contactChannel !== "phone") {
    errors.contact = "Выберите мессенджер"
  } else if (contactChannel === "telegram") {
    if (!/^@?[A-Za-z0-9_]{4,32}$/.test(contact) && !isValidPhoneNumber(contact)) {
      errors.contact = "Укажите @username или номер с кодом страны"
    }
  } else if (!isValidPhoneNumber(contact)) {
    errors.contact = "Проверьте номер — не хватает цифр или неверный код страны"
  }

  const rawExtras = (input.extras && typeof input.extras === "object" ? input.extras : {}) as Record<
    string,
    unknown
  >
  const extras: Record<string, number> = {}
  for (const { key } of dest.extras) {
    const n = Number(rawExtras[key] ?? 0)
    if (Number.isInteger(n) && n > 0 && n <= GUEST_MAX) extras[key] = n
  }

  const comment = str(input.comment, 1000)

  if (Object.keys(errors).length > 0) return { ok: false, errors }

  return {
    ok: true,
    data: {
      destination,
      date,
      packageId,
      departureTime,
      guests,
      hotel,
      hotelPlace,
      name,
      contactChannel: contactChannel as ContactChannel,
      contact,
      extras,
      comment,
    },
  }
}

// Акция Хон Тама: Seawalking (прогулка по дну моря). Блок показывается всегда,
// видео — когда задан videoSrc (файл положить в public/park/ или Vercel Blob).
export const HONTAM_PROMO: {
  videoSrc: string | null
  posterSrc: string | null
  title: string
  oldPrice: string
  price: string
  text: string
} = {
  videoSrc: "https://our41hywrmbsqagk.public.blob.vercel-storage.com/park/seawalking.mp4",
  posterSrc: "https://our41hywrmbsqagk.public.blob.vercel-storage.com/park/seawalking-poster.jpg",
  title: "Seawalking — прогулка по дну моря",
  oldPrice: "$50",
  price: "$42",
  text: "Везде Seawalking стоит $50. Скидку до $42 даём только мы — больше ни у кого её нет!",
}
