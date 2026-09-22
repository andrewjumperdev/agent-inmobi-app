/** BFF: crea/asegura la instancia de WhatsApp del tenant y devuelve el QR. */
import { koreTenantFetch, bffError } from "@/lib/kore/server";

export async function POST() {
  try {
    const data = await koreTenantFetch("/integrations/whatsapp/connect", {
      method: "POST",
    });
    return Response.json(data);
  } catch (err) {
    return bffError(err);
  }
}
