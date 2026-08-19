/**
 * BFF de Captación: de dónde vienen los leads y cómo conectar más fuentes.
 *
 * Junta cuatro lecturas del backend en una sola respuesta para que la página no
 * dispare cuatro round-trips desde el navegador. Cada una degrada por separado:
 * si el estado de WhatsApp falla, la pantalla sigue mostrando las fuentes.
 */
import { getTenantCredentials } from "@/lib/kore/tenant";
import { koreFetch } from "@/lib/kore/client";

export interface SourceStat {
  source: string;
  total: number;
  last_at: string | null;
  unqualified: number;
}

/** Lectura que no rompe la página: ante cualquier fallo devuelve el fallback. */
async function safe<T>(path: string, apiKey: string, fallback: T): Promise<T> {
  try {
    return await koreFetch<T>(path, { apiKey });
  } catch {
    return fallback;
  }
}

export async function GET() {
  const creds = await getTenantCredentials();
  if (!creds) return Response.json({ error: "no_session" }, { status: 401 });

  const [sources, capture, whatsapp, smtp] = await Promise.all([
    safe<SourceStat[]>("/leads/sources", creds.apiKey, []),
    safe<{ url: string; example_payload: Record<string, unknown> }>(
      "/leads/capture-url",
      creds.apiKey,
      { url: "", example_payload: {} }
    ),
    safe<{ connected?: boolean; state?: string }>(
      "/integrations/whatsapp/status",
      creds.apiKey,
      {}
    ),
    safe<{ configured?: boolean }>("/integrations/smtp", creds.apiKey, {}),
  ]);

  return Response.json({
    sources,
    capture,
    whatsappConnected: Boolean(whatsapp.connected || whatsapp.state === "open"),
    emailConfigured: Boolean(smtp.configured),
  });
}
