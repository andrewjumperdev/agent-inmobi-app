/** BFF: alta manual de lead → POST /leads (dispara la cadena SDR en el backend). */
import { getTenantCredentials } from "@/lib/kore/tenant";
import { koreFetch, KoreError } from "@/lib/kore/client";

export async function POST(request: Request) {
  const creds = await getTenantCredentials();
  if (!creds) return Response.json({ error: "no_session" }, { status: 401 });
  try {
    const body = await request.json();
    const data = await koreFetch("/leads", { apiKey: creds.apiKey, method: "POST", body });
    return Response.json(data, { status: 201 });
  } catch (err) {
    const status = err instanceof KoreError ? err.status : 500;
    return Response.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status }
    );
  }
}
