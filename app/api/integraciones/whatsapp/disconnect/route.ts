/** BFF: desvincula el número de WhatsApp del tenant (logout de la instancia). */
import { koreTenantFetch, bffError } from "@/lib/kore/server";

export async function POST() {
  try {
    const data = await koreTenantFetch("/integrations/whatsapp/disconnect", {
      method: "POST",
    });
    return Response.json(data);
  } catch (err) {
    return bffError(err);
  }
}
