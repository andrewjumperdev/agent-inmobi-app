/** BFF: rastro del agente sobre un contacto → GET /contacts/{id}/trail.
 *
 * Devuelve las corridas del agente y los hechos que registró, cada uno con su
 * procedencia. Es lo que permite responder "¿de dónde sacó eso?" sin leer logs.
 */
import { koreTenantFetch, bffError } from "@/lib/kore/server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const data = await koreTenantFetch(`/contacts/${id}/trail`);
    return Response.json(data);
  } catch (err) {
    return bffError(err);
  }
}
