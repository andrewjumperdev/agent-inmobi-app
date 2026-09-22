/** BFF: estado de conexión de WhatsApp del tenant (para el polling del dashboard). */
import { koreTenantFetch, bffError } from "@/lib/kore/server";

export async function GET() {
  try {
    const data = await koreTenantFetch("/integrations/whatsapp/status");
    return Response.json(data);
  } catch (err) {
    return bffError(err);
  }
}
