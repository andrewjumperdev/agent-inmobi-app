/** BFF: historial de conversación de un contacto → GET /contacts/{id}/messages. */
import { koreTenantFetch, bffError } from "@/lib/kore/server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const data = await koreTenantFetch(`/contacts/${id}/messages`);
    return Response.json(data);
  } catch (err) {
    return bffError(err);
  }
}
