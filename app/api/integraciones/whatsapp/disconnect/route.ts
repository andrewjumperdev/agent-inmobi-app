/** BFF: desvincula el número de WhatsApp del tenant (logout de la instancia). */
import { getTenantCredentials } from "@/lib/kore/tenant";
import { koreFetch, KoreError } from "@/lib/kore/client";

export async function POST() {
  const creds = await getTenantCredentials();
  if (!creds) return Response.json({ error: "no_session" }, { status: 401 });
  try {
    const data = await koreFetch("/integrations/whatsapp/disconnect", {
      apiKey: creds.apiKey,
      method: "POST",
    });
    return Response.json(data);
  } catch (err) {
    const status = err instanceof KoreError ? err.status : 500;
    return Response.json(
      { error: "backend", detail: err instanceof Error ? err.message : String(err) },
      { status }
    );
  }
}
