/** BFF: rastro del agente sobre un contacto → GET /contacts/{id}/trail.
 *
 * Devuelve las corridas del agente y los hechos que registró, cada uno con su
 * procedencia. Es lo que permite responder "¿de dónde sacó eso?" sin leer logs.
 */
import { getTenantCredentials } from "@/lib/kore/tenant";
import { koreFetch, KoreError } from "@/lib/kore/client";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const creds = await getTenantCredentials();
  if (!creds) return Response.json({ error: "no_session" }, { status: 401 });
  try {
    const { id } = await params;
    const data = await koreFetch(`/contacts/${id}/trail`, { apiKey: creds.apiKey });
    return Response.json(data);
  } catch (err) {
    const status = err instanceof KoreError ? err.status : 500;
    return Response.json({ error: err instanceof Error ? err.message : String(err) }, { status });
  }
}
