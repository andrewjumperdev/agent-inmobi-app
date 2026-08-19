import { getTenantCredentials, clearTenantBinding } from "@/lib/kore/tenant";
import { koreFetch, KoreError } from "@/lib/kore/client";

/**
 * GET server-side al backend KORE con las credenciales del tenant actual.
 * Devuelve `fallback` ante cualquier problema (sin sesión, backend caído) para
 * que las páginas rendericen sin romper. Solo para Server Components.
 *
 * Si el backend rechaza la credencial (401), el binding guardado en `profiles`
 * quedó apuntando a un tenant que ya no existe. Lo descartamos y reprovisionamos
 * una sola vez: sin esto el 401 se repite en cada request para siempre, y como
 * acá se devuelve el fallback, la UI muestra ceros sin dar ninguna pista de que
 * está desconectada del backend.
 */
export async function koreGet<T>(path: string, fallback: T): Promise<T> {
  try {
    const creds = await getTenantCredentials();
    if (!creds) return fallback;

    try {
      return await koreFetch<T>(path, { apiKey: creds.apiKey });
    } catch (err) {
      if (!(err instanceof KoreError) || err.status !== 401) throw err;

      console.warn(`[koreGet] ${path}: credencial rechazada, reprovisionando`);
      await clearTenantBinding();
      const fresh = await getTenantCredentials();
      if (!fresh) return fallback;
      return await koreFetch<T>(path, { apiKey: fresh.apiKey });
    }
  } catch (err) {
    console.error("[koreGet]", path, err);
    return fallback;
  }
}
