/**
 * BFF: freno de emergencia por conversación.
 *
 *   POST   → el agente deja de responderle a este contacto
 *   DELETE → se lo devuelve al agente
 *
 * El backend aplica el corte en su capa de política, así que la pausa vale para
 * todos los caminos (WhatsApp, cadenas por evento, disparo manual) y no solo
 * para lo que muestre esta pantalla.
 */
import { getTenantCredentials } from "@/lib/kore/tenant";
import { koreFetch, KoreError } from "@/lib/kore/client";

/** Cuántas horas dura la pausa por defecto. Con vencimiento a propósito: una
 *  pausa que hay que acordarse de levantar deja al contacto abandonado. */
const DEFAULT_HOURS = 24;

async function forward(
  path: string,
  params: Promise<{ id: string }>
): Promise<Response> {
  const creds = await getTenantCredentials();
  if (!creds) return Response.json({ error: "no_session" }, { status: 401 });
  try {
    const { id } = await params;
    const data = await koreFetch(`/contacts/${id}${path}`, {
      apiKey: creds.apiKey,
      method: "POST",
    });
    return Response.json(data);
  } catch (err) {
    const status = err instanceof KoreError ? err.status : 500;
    return Response.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const hours =
    Number(new URL(request.url).searchParams.get("hours")) || DEFAULT_HOURS;
  return forward(`/pause?hours=${hours}`, params);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return forward("/resume", params);
}
