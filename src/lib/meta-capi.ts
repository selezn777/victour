import { createHash } from "node:crypto"

// Meta Conversions API, интеграция «Квалифицированные лиды»: каждый этап
// воронки (заявка → подтверждение выезда) отправляем событием в набор данных.
// Без META_CAPI_TOKEN ничего не шлём. META_TEST_EVENT_CODE — для вкладки
// «Тестовые события» в Events Manager.

const DATASET_ID = process.env.META_DATASET_ID || "987648811050149"
const API_VERSION = "v26.0"

export type MetaLeadStage = "Lead" | "Confirmed"

const sha256 = (value: string) => createHash("sha256").update(value).digest("hex")

/** Номер для хэша: только цифры с кодом страны, без «+». */
function normalizePhone(phone: string): string | null {
  const digits = phone.replace(/\D/g, "")
  return digits.length >= 7 ? digits : null
}

export async function sendMetaLeadEvent(event: {
  stage: MetaLeadStage
  phone?: string | null
  email?: string | null
  firstName?: string | null
  fbc?: string | null // ID клика: fb.1.<ms>.<fbclid>
  eventId?: string // для дедупликации повторов
}): Promise<void> {
  const token = process.env.META_CAPI_TOKEN
  if (!token) return

  const phone = event.phone ? normalizePhone(event.phone) : null
  const email = event.email?.trim().toLowerCase()
  const firstName = event.firstName?.trim().toLowerCase().split(/\s+/)[0]
  const userData: Record<string, unknown> = {}
  if (phone) userData.ph = [sha256(phone)]
  if (email) userData.em = [sha256(email)]
  if (firstName) userData.fn = [sha256(firstName)]
  if (event.fbc) userData.fbc = event.fbc
  if (Object.keys(userData).length === 0) return

  const payload: Record<string, unknown> = {
    data: [
      {
        action_source: "system_generated",
        event_name: event.stage,
        event_time: Math.floor(Date.now() / 1000),
        ...(event.eventId ? { event_id: event.eventId } : {}),
        custom_data: { event_source: "crm", lead_event_source: "VicTour" },
        user_data: userData,
      },
    ],
  }
  if (process.env.META_TEST_EVENT_CODE) payload.test_event_code = process.env.META_TEST_EVENT_CODE

  try {
    const res = await fetch(
      `https://graph.facebook.com/${API_VERSION}/${DATASET_ID}/events?access_token=${token}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(8000),
      },
    )
    if (!res.ok) console.error("meta-capi:", event.stage, res.status, await res.text())
  } catch (err) {
    console.error("meta-capi: request error:", event.stage, err)
  }
}

/** fbc из ?fbclid= или куки _fbc; клиент присылает готовую строку. */
export function sanitizeFbc(raw: unknown): string | null {
  return typeof raw === "string" && /^fb\.\d\.\d+\.[\w-]{10,500}$/.test(raw) ? raw : null
}
