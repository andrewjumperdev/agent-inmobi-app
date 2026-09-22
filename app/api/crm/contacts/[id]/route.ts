/** BFF: actualiza la etapa/temperatura de un contacto → PATCH /contacts/{id}. */
import { koreTenantFetch, bffError } from "@/lib/kore/server";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const data = await koreTenantFetch(`/contacts/${id}`, {
      method: "PATCH",
      body,
    });
    return Response.json(data);
  } catch (err) {
    return bffError(err);
  }
}
