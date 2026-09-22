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
import { koreTenantFetch, bffError } from "@/lib/kore/server";

/** Cuántas horas dura la pausa por defecto. Con vencimiento a propósito: una
 *  pausa que hay que acordarse de levantar deja al contacto abandonado. */
const DEFAULT_HOURS = 24;

async function forward(
  path: string,
  params: Promise<{ id: string }>,
): Promise<Response> {
  try {
    const { id } = await params;
    const data = await koreTenantFetch(`/contacts/${id}${path}`, {
      method: "POST",
    });
    return Response.json(data);
  } catch (err) {
    return bffError(err);
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const hours =
    Number(new URL(request.url).searchParams.get("hours")) || DEFAULT_HOURS;
  return forward(`/pause?hours=${hours}`, params);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return forward("/resume", params);
}
