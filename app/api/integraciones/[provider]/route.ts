/** BFF genérico: leer/guardar la config por-tenant de una integración →
 *  GET/PUT /integrations/{provider}. (smtp y whatsapp tienen sus propias rutas.) */
import { koreTenantFetch, bffError } from "@/lib/kore/server";

const ALLOWED = new Set(["calendar", "elevenlabs", "whatsapp-agent"]);

async function forward(
  provider: string,
  method: "GET" | "PUT",
  body?: unknown,
) {
  try {
    const data = await koreTenantFetch(`/integrations/${provider}`, {
      method,
      body,
    });
    return Response.json(data);
  } catch (err) {
    return bffError(err);
  }
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ provider: string }> },
) {
  const { provider } = await params;
  if (!ALLOWED.has(provider))
    return Response.json({ error: "not_found" }, { status: 404 });
  return forward(provider, "GET");
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ provider: string }> },
) {
  const { provider } = await params;
  if (!ALLOWED.has(provider))
    return Response.json({ error: "not_found" }, { status: 404 });
  return forward(provider, "PUT", await request.json());
}
