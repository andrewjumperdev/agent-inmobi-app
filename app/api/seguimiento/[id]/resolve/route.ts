/** BFF: resolver/descartar una escalación → POST /escalations/{id}/resolve. */
import { koreTenantFetch, bffError } from "@/lib/kore/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const data = await koreTenantFetch(`/escalations/${id}/resolve`, {
      method: "POST",
      body: { status: body.status ?? "resolved", note: body.note ?? null },
    });
    return Response.json(data);
  } catch (err) {
    return bffError(err);
  }
}
