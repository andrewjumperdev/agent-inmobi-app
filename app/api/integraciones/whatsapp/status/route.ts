/** BFF: estado de conexión de WhatsApp del tenant (para el polling del dashboard). */
import { getTenantCredentials } from "@/lib/kore/tenant";
import { koreFetch, KoreError } from "@/lib/kore/client";

export async function GET() {
  const creds = await getTenantCredentials();
  if (!creds) return Response.json({ error: "no_session" }, { status: 401 });
  try {
    const data = await koreFetch("/integrations/whatsapp/status", { apiKey: creds.apiKey });
    return Response.json(data);
  } catch (err) {
    const status = err instanceof KoreError ? err.status : 500;
    return Response.json(
      { error: "backend", detail: err instanceof Error ? err.message : String(err) },
      { status }
    );
  }
}
