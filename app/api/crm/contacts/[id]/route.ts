/** BFF: actualiza la etapa/temperatura de un contacto → PATCH /contacts/{id}. */
import { getTenantCredentials } from "@/lib/kore/tenant";
import { koreFetch, KoreError } from "@/lib/kore/client";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const creds = await getTenantCredentials();
  if (!creds) return Response.json({ error: "no_session" }, { status: 401 });
  try {
    const { id } = await params;
    const body = await request.json();
    const data = await koreFetch(`/contacts/${id}`, {
      apiKey: creds.apiKey,
      method: "PATCH",
      body,
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
