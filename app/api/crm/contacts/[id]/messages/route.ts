/** BFF: historial de conversación de un contacto → GET /contacts/{id}/messages. */
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
    const data = await koreFetch(`/contacts/${id}/messages`, { apiKey: creds.apiKey });
    return Response.json(data);
  } catch (err) {
    const status = err instanceof KoreError ? err.status : 500;
    return Response.json({ error: err instanceof Error ? err.message : String(err) }, { status });
  }
}
