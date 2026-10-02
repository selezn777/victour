import { resolveLinkParam } from "@/lib/park-confirm"

// Короткая ссылка «подтвердить выезд» из WhatsApp-заявки
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const token = await resolveLinkParam(id)
  const url = new URL(token ? `/park/confirm/${token}` : "/park", request.url)
  return Response.redirect(url, 302)
}
