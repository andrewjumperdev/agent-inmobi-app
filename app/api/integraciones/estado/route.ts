/**
 * Estado de todas las integraciones en una sola lectura, para la barra de
 * progreso de Integraciones.
 *
 * Cada consulta degrada por separado: si el estado de WhatsApp falla, la barra
 * lo cuenta como no conectado en vez de romper la pantalla entera.
 */
import { koreTenantFetch, NoSessionError, bffError } from "@/lib/kore/server";

export interface EstadoIntegracion {
  id: string;
  conectado: boolean;
}

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
    const [whatsapp, smtp, calendar, voz] = await Promise.all([
      safe<{ connected?: boolean; state?: string }>(
        "/integrations/whatsapp/status",
        {},
      ),
      safe<{ configured?: boolean }>("/integrations/smtp", {}),
      safe<{ configured?: boolean }>("/integrations/calendar", {}),
      safe<{ configured?: boolean }>("/integrations/elevenlabs", {}),
    ]);

    const estados: EstadoIntegracion[] = [
      {
        id: "whatsapp",
        conectado: Boolean(whatsapp.connected || whatsapp.state === "open"),
      },
      { id: "email", conectado: Boolean(smtp.configured) },
      { id: "calendar", conectado: Boolean(calendar.configured) },
      { id: "voz", conectado: Boolean(voz.configured) },
    ];

    return Response.json({ estados });
  } catch (err) {
    return bffError(err);
  }
}
