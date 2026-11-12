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

// park/hontam — Нячанг (/park), pq_* — Фукуок (/phuquoc). Форма, заявка,
// напоминания и подтверждение общие, отличаются только данные направления.
export type DestinationId = "park" | "hontam" | "pq_vin" | "pq_honthom"
export type ParkRegion = "nyachang" | "phuquoc"

/** Район отеля → цена индивидуального трансфера туда-обратно за машину (Фукуок). */
export type TransferDistrict = { id: string; label: string; priceUsd: number }

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

// Слот выезда от отеля. Хон Там — к катеру (boat), парк — к канатке (cableCar).
export type DepartureSlot = { pickup: string; boat?: string; cableCar?: string }

// Что лежит в departureTime заявки: у Хон Тама — время катера, у парка — выезд от отеля
export const slotKey = (s: DepartureSlot) => s.boat ?? s.pickup

// "07:05" / "7:05" → "7:05"; всё остальное → null
export function normalizeTime(v: string): string | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(v)
  if (!m || Number(m[1]) > 23 || Number(m[2]) > 59) return null
  return `${Number(m[1])}:${m[2]}`
}

/** departureTime заявки → слот выезда. Только текущее расписание (для проверки новых заявок). */
export function findCurrentSlot(dest: DestinationId, departureTime: string | null): DepartureSlot | undefined {
  if (!departureTime) return undefined
  // Индивидуальный трансфер (Фукуок): гость сам пишет удобное время
  if (DESTINATIONS[dest].departureMode === "free") {
    const t = normalizeTime(departureTime)
    return t ? { pickup: t } : undefined
  }
  return DESTINATIONS[dest].departureTimes.find((s) => slotKey(s) === departureTime)
}

export function findDistrict(dest: DestinationId, id: string | null): TransferDistrict | undefined {
  return id ? DESTINATIONS[dest].districts?.find((d) => d.id === id) : undefined
}

/**
 * departureTime заявки → слот выезда для показа. Понимает и заявки, созданные
 * до расписания с 04.10.2026: катер 8:00 у Хон Тама и любое время у парка.
 */
export function findSlot(dest: DestinationId, departureTime: string | null): DepartureSlot | undefined {
  const current = findCurrentSlot(dest, departureTime)
  if (current || !departureTime) return current
  if (dest === "hontam") return departureTime === "8:00" ? { boat: "8:00", pickup: "7:20" } : undefined
  const t = normalizeTime(departureTime)
  return t ? { pickup: t } : undefined
}

/** «🚐 Выезд от отеля в 8:15 (±10 мин), катер в 9:00» */
export function slotLineRu(s: DepartureSlot): string {
  const to = s.boat ? `, катер в ${s.boat}` : s.cableCar ? `, на канатку в ${s.cableCar}` : ""
  return `🚐 Выезд от отеля в ${s.pickup} (±10 мин)${to}`
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
  // Расписание выездов от отеля (всегда ±10 минут) — турист выбирает один из слотов
  departureTimes: DepartureSlot[]
  extras: ExtraOption[]
  region: ParkRegion
  placeRu: string // название в заявке и напоминаниях
  emoji: string
  bookingTitle: string
  bookingIntro: string
  submitLabel: string
  /** slots — общие выезды по расписанию; free — индивидуальный трансфер, время пишет гость */
  departureMode: "slots" | "free"
  /** Платный трансфер по районам; нет — трансфер бесплатный */
  districts?: TransferDistrict[]
  mapCenter: { lat: number; lng: number }
}

const NHA_TRANG_CENTER = { lat: 12.2388, lng: 109.1967 }
const PHU_QUOC_CENTER = { lat: 10.227, lng: 103.967 }

// Цены трансфера на Фукуоке — за машину туда-обратно.
// Виктор 2026-11-09: старые цены были за одну сторону, поэтому удвоены.
const PQ_NORTH = { id: "north", label: "Бай Дай, Гань Дау (Grand World, Vinpearl)" }
const PQ_ONG_LANG = { id: "ong_lang", label: "Онг Ланг" }
const PQ_CENTER = { id: "center", label: "Дуонг Донг (центр)" }
const PQ_LONG_BEACH = { id: "long_beach", label: "Лонг Бич" }
const PQ_SOUTH = { id: "south", label: "Юг: Ан Тхой, Sunset Town, Бай Кем, Бай Сао" }

// ---------- Фукуок ----------
// Официальные цены сезона 2026 (vinwonders.com, Sun World); билеты выкупаем
// мы, трансфер индивидуальный и платный — по району отеля.
const PQ_GUESTS_VIN: GuestOption[] = [
  { key: "infants", emoji: "👶", title: "Дети ниже 100 см", note: "Вход БЕСПЛАТНО!", free: true, formLabel: "Дети ниже 100 см (бесплатно)", english: "Kids under 100 cm (free)" },
  { key: "children", emoji: "🧒", title: "Детский билет", note: "Рост 100–139 см", formLabel: "Дети 100–139 см", english: "Children 100–139 cm" },
  { key: "adults", emoji: "🧑", title: "Взрослый билет", note: "Рост от 140 см", formLabel: "Взрослые", english: "Adults" },
  { key: "seniors", emoji: "👵", title: "Пенсионеры 60+", note: "Обязательно взять паспорт", formLabel: "Пенсионеры 60+", english: "Seniors 60+ (passport required)" },
]

const PQ_VIN: Destination = {
  id: "pq_vin",
  region: "phuquoc",
  placeRu: "VinWonders и Сафари, Фукуок",
  emoji: "🦒",
  tabLabel: "🦒 VinWonders",
  tabNote: "парк + сафари",
  english: "PHU QUOC: VINWONDERS / SAFARI",
  childPriceLabel: "дети и 60+",
  bookingTitle: "Бронь билетов и трансфера",
  bookingIntro: "Заполните заявку — это минута. Билеты выкупим заранее, трансфер по цене вашего района:",
  submitLabel: "Забронировать",
  departureMode: "free",
  mapCenter: PHU_QUOC_CENTER,
  packages: [
    { id: "vin", title: "VinWonders", price: "1 050K ₫", childPrice: "800K ₫", english: "VinWonders (adult 1,050K / child & senior 800K VND)" },
    { id: "safari", title: "Сафари днём", price: "950K ₫", childPrice: "710K ₫", english: "Vinpearl Safari day (adult 950K / child & senior 710K VND)", formNotes: ["Билеты только на дневное сафари. Ночное сафари есть в нашем туре «Вечерний Фукуок»"] },
    { id: "combo", title: "VinWonders + Сафари", price: "1 700K ₫", childPrice: "1 300K ₫", english: "Combo VinWonders + Safari (adult 1,700K / child & senior 1,300K VND)", formNotes: ["Оба парка в один день: утром сафари, после обеда VinWonders"] },
  ],
  guests: PQ_GUESTS_VIN,
  payingGuests: ["adults", "children", "seniors"],
  departureTimes: [],
  districts: [
    { ...PQ_NORTH, priceUsd: 16 },
    { ...PQ_ONG_LANG, priceUsd: 24 },
    { ...PQ_CENTER, priceUsd: 30 },
    { ...PQ_LONG_BEACH, priceUsd: 36 },
    { ...PQ_SOUTH, priceUsd: 50 },
  ],
  extras: [],
}

const PQ_HONTHOM: Destination = {
  id: "pq_honthom",
  region: "phuquoc",
  placeRu: "Канатка на Хон Тхом, Фукуок",
  emoji: "🚡",
  tabLabel: "🚡 Хон Тхом",
  tabNote: "канатка на остров",
  english: "PHU QUOC: HON THOM CABLE CAR",
  childPriceLabel: "дети",
  bookingTitle: "Бронь билетов и трансфера",
  bookingIntro: "Заполните заявку — это минута. Билеты выкупим заранее, трансфер по цене вашего района:",
  submitLabel: "Забронировать",
  departureMode: "free",
  mapCenter: PHU_QUOC_CENTER,
  packages: [
    { id: "cable", title: "Канатка туда-обратно", price: "850K ₫", childPrice: "700K ₫", english: "Cable car round trip (adult 850K / child 700K VND)" },
    { id: "cable_lunch", title: "С обедом", price: "1 150K ₫", childPrice: "900K ₫", english: "Cable car + buffet lunch (adult 1,150K / child 900K VND)" },
    { id: "oneway_lunch", title: "В одну сторону + обед", price: "1 070K ₫", childPrice: "800K ₫", english: "Cable car one way + buffet lunch (adult 1,070K / child 800K VND)" },
  ],
  guests: [
    { key: "infants", emoji: "👶", title: "Дети до 1 метра", note: "Бесплатно!", free: true, formLabel: "Дети до 1 м (бесплатно)", english: "Kids under 1 m (free)" },
    { key: "children", emoji: "🧒", title: "Дети 1–1,39 м", note: "от 700K ₫", formLabel: "Дети 100–139 см", english: "Children 1–1.39 m" },
    { key: "adults", emoji: "🧑", title: "Взрослые (от 1,4 м)", note: "от 850K ₫", formLabel: "Взрослые", english: "Adults" },
  ],
  payingGuests: ["adults", "children"],
  departureTimes: [],
  districts: [
    { ...PQ_SOUTH, priceUsd: 16 },
    { ...PQ_LONG_BEACH, priceUsd: 24 },
    { ...PQ_CENTER, priceUsd: 30 },
    { ...PQ_ONG_LANG, priceUsd: 36 },
    { ...PQ_NORTH, priceUsd: 50 },
  ],
  extras: [
    { key: "kiss_show", group: "🌅 Шоу в Sunset Town", label: "Kiss of the Sea 21:00–21:30, главная трибуна", price: "800K ₫", english: "Kiss of the Sea 21:00, main stand (800K VND)" },
    { key: "symphony_std", group: "🌅 Шоу в Sunset Town", label: "Symphony of the Sea 19:30, стандарт", price: "700K ₫", english: "Symphony of the Sea standard (700K VND)" },
    { key: "symphony_chill", group: "🌅 Шоу в Sunset Town", label: "Symphony of the Sea 19:30, chill + фуршет", price: "800K ₫", english: "Symphony of the Sea chill + snacks (800K VND)" },
    { key: "symphony_dinner", group: "🌅 Шоу в Sunset Town", label: "Symphony of the Sea 19:30, ужин + шоу", price: "1 200K ₫ (сб-вс 1 300K)", english: "Symphony of the Sea dinner + show (1,200K Sun–Fri / 1,300K Sat-Sun VND)" },
  ],
}

export const DESTINATIONS: Record<DestinationId, Destination> = {
  park: {
    id: "park",
    region: "nyachang",
    placeRu: "VinWonders",
    emoji: "🎟",
    bookingTitle: "Как заказать акцию",
    bookingIntro: "Для бесплатного трансфера заполните заявку — это минута:",
    submitLabel: "Забронировать трансфер",
    departureMode: "slots",
    mapCenter: NHA_TRANG_CENTER,
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
    departureTimes: [
      { pickup: "8:15", cableCar: "8:45" },
      { pickup: "9:15", cableCar: "9:45" },
    ],
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
    region: "nyachang",
    placeRu: "Остров Хон Там",
    emoji: "🏝",
    bookingTitle: "Бронь на Хон Там",
    bookingIntro: "Для бесплатного трансфера заполните заявку — это минута:",
    submitLabel: "Забронировать трансфер",
    departureMode: "slots",
    mapCenter: NHA_TRANG_CENTER,
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
      { boat: "9:00", pickup: "8:15" },
      { boat: "10:00", pickup: "9:15" },
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
  pq_vin: PQ_VIN,
  pq_honthom: PQ_HONTHOM,
}

export const REGION_ORDER: Record<ParkRegion, DestinationId[]> = {
  nyachang: ["park", "hontam"],
  phuquoc: ["pq_vin", "pq_honthom"],
}

export const DESTINATION_ORDER: DestinationId[] = REGION_ORDER.nyachang

export const isDestinationId = (v: unknown): v is DestinationId =>
  typeof v === "string" && Object.prototype.hasOwnProperty.call(DESTINATIONS, v)
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
      "https://vocavnmriasslbxmpccw.supabase.co/storage/v1/object/public/media/tours/nyachang-avtorskiy-pagoda.jpg",
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

// Реклама после заявки на Фукуоке — туры Фукуока (только с фото)
export const PROMO_TOURS_PQ = [
  {
    slug: "phuquoc-hoian-danang",
    title: "Хойан + Дананг, 3 дня",
    imageSrc: "https://vocavnmriasslbxmpccw.supabase.co/storage/v1/object/public/media/tours/phuquoc-hoian-danang/01.webp",
  },
  {
    slug: "phuquoc-dikiy",
    title: "Дикий Фукуок",
    imageSrc: "https://vocavnmriasslbxmpccw.supabase.co/storage/v1/object/public/media/tours/phuquoc-dikiy/v1-07.webp",
  },
  {
    slug: "phuquoc-utro",
    title: "Морские звёзды и рыба на сваях",
    imageSrc: "https://vocavnmriasslbxmpccw.supabase.co/storage/v1/object/public/media/tours/phuquoc-utro/v2-24.webp",
  },
  {
    slug: "phuquoc-nastoyashchiy",
    title: "Настоящий Фукуок",
    imageSrc: "https://vocavnmriasslbxmpccw.supabase.co/storage/v1/object/public/media/tours/phuquoc-nastoyashchiy/11.webp",
  },
  {
    slug: "phuquoc-vecher-safari",
    title: "Вечерний Фукуок + ночное сафари",
    imageSrc:
      "https://vocavnmriasslbxmpccw.supabase.co/storage/v1/object/public/media/tours/phuquoc-vecher-safari/v3/06.webp",
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
  district: string | null // район отеля (Фукуок, платный трансфер)
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
  | "district"
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

  const destination: DestinationId = isDestinationId(input.destination) ? input.destination : "park"
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

  const departureTime = str(input.departureTime, 10) || null
  if (!findCurrentSlot(destination, departureTime)) errors.departureTime =
      dest.departureMode === "free" ? "Укажите, во сколько вас забрать" : "Выберите время выезда"

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

  const district = dest.districts ? str(input.district, 30) || null : null
  if (dest.districts && !findDistrict(destination, district)) errors.district = "Выберите район отеля"

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
      district,
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
  videoSrc: "https://vocavnmriasslbxmpccw.supabase.co/storage/v1/object/public/media/park/seawalking.mp4",
  posterSrc: "https://vocavnmriasslbxmpccw.supabase.co/storage/v1/object/public/media/park/seawalking-poster.jpg",
  title: "Seawalking — прогулка по дну моря",
  oldPrice: "$50",
  price: "$42",
  text: "Везде Seawalking стоит $50. Скидку до $42 даём только мы — больше ни у кого её нет!",
}
