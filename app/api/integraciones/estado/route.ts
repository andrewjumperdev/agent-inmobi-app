/**
 * Estado de todas las integraciones en una sola lectura, para la barra de
 * progreso de Integraciones.
 *
 * Cada consulta degrada por separado: si el estado de WhatsApp falla, la barra
 * lo cuenta como no conectado en vez de romper la pantalla entera.
 */
import { getTenantCredentials } from "@/lib/kore/tenant";
import { koreFetch } from "@/lib/kore/client";

export interface EstadoIntegracion {
  id: string;
  conectado: boolean;
}

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

  const [whatsapp, smtp, calendar, voz] = await Promise.all([
    safe<{ connected?: boolean; state?: string }>(
      "/integrations/whatsapp/status",
      creds.apiKey,
      {}
    ),
    safe<{ configured?: boolean }>("/integrations/smtp", creds.apiKey, {}),
    safe<{ configured?: boolean }>("/integrations/calendar", creds.apiKey, {}),
    safe<{ configured?: boolean }>("/integrations/elevenlabs", creds.apiKey, {}),
  ]);

  const estados: EstadoIntegracion[] = [
    { id: "whatsapp", conectado: Boolean(whatsapp.connected || whatsapp.state === "open") },
    { id: "email", conectado: Boolean(smtp.configured) },
    { id: "calendar", conectado: Boolean(calendar.configured) },
    { id: "voz", conectado: Boolean(voz.configured) },
  ];

  return Response.json({ estados });
}
