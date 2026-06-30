/** BFF genérico: leer/guardar la config por-tenant de una integración →
 *  GET/PUT /integrations/{provider}. (smtp y whatsapp tienen sus propias rutas.) */
import { getTenantCredentials } from "@/lib/kore/tenant";
import { koreFetch, KoreError } from "@/lib/kore/client";

const ALLOWED = new Set(["calendar", "elevenlabs", "whatsapp-agent"]);

async function forward(provider: string, method: "GET" | "PUT", body?: unknown) {
  const creds = await getTenantCredentials();
  if (!creds) return Response.json({ error: "no_session" }, { status: 401 });
  try {
    const data = await koreFetch(`/integrations/${provider}`, {
      apiKey: creds.apiKey,
      method,
      body,
    });
    return Response.json(data);
  } catch (err) {
    const status = err instanceof KoreError ? err.status : 500;
    return Response.json({ error: err instanceof Error ? err.message : String(err) }, { status });
  }
}

export async function GET(_req: Request, { params }: { params: Promise<{ provider: string }> }) {
  const { provider } = await params;
  if (!ALLOWED.has(provider)) return Response.json({ error: "not_found" }, { status: 404 });
  return forward(provider, "GET");
}

export async function PUT(request: Request, { params }: { params: Promise<{ provider: string }> }) {
  const { provider } = await params;
  if (!ALLOWED.has(provider)) return Response.json({ error: "not_found" }, { status: 404 });
  return forward(provider, "PUT", await request.json());
}
