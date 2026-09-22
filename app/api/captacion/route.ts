/**
 * BFF de Captación: de dónde vienen los leads y cómo conectar más fuentes.
 *
 * Junta cuatro lecturas del backend en una sola respuesta para que la página no
 * dispare cuatro round-trips desde el navegador. Cada una degrada por separado:
 * si el estado de WhatsApp falla, la pantalla sigue mostrando las fuentes.
 */
import { koreTenantFetch, NoSessionError, bffError } from "@/lib/kore/server";

export interface SourceStat {
  source: string;
  total: number;
  last_at: string | null;
  unqualified: number;
}

/** Lectura que no rompe la página: ante cualquier fallo devuelve el fallback. */
/** Lectura que no rompe la página: ante un fallo del backend devuelve el
 *  fallback, PERO deja pasar el "sin sesión". Tragarse ese caso le mostraría
 *  ceros a alguien deslogueado en vez de mandarlo a entrar — y los ceros se
 *  leen como "tu negocio no tiene datos", que es una mentira distinta. */
async function safe<T>(path: string, fallback: T): Promise<T> {
  try {
    return await koreTenantFetch<T>(path);
  } catch (err) {
    if (err instanceof NoSessionError) throw err;
    return fallback;
  }
}

export async function GET() {
  try {
    const [sources, capture, whatsapp, smtp] = await Promise.all([
      safe<SourceStat[]>("/leads/sources", []),
      safe<{ url: string; example_payload: Record<string, unknown> }>(
        "/leads/capture-url",
        { url: "", example_payload: {} },
      ),
      safe<{ connected?: boolean; state?: string }>(
        "/integrations/whatsapp/status",
        {},
      ),
      safe<{ configured?: boolean }>("/integrations/smtp", {}),
    ]);

    return Response.json({
      sources,
      capture,
      whatsappConnected: Boolean(
        whatsapp.connected || whatsapp.state === "open",
      ),
      emailConfigured: Boolean(smtp.configured),
    });
  } catch (err) {
    return bffError(err);
  }
}
