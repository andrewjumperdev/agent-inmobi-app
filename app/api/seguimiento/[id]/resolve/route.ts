/** BFF: resolver/descartar una escalación → POST /escalations/{id}/resolve. */
import { getTenantCredentials } from "@/lib/kore/tenant";
import { koreFetch, KoreError } from "@/lib/kore/client";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const creds = await getTenantCredentials();
  if (!creds) return Response.json({ error: "no_session" }, { status: 401 });
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const data = await koreFetch(`/escalations/${id}/resolve`, {
      apiKey: creds.apiKey,
      method: "POST",
      body: { status: body.status ?? "resolved", note: body.note ?? null },
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
