import { getTenantCredentials } from "@/lib/kore/tenant";
import { koreFetch } from "@/lib/kore/client";

/**
 * GET server-side al backend KORE con las credenciales del tenant actual.
 * Devuelve `fallback` ante cualquier problema (sin sesión, backend caído) para
 * que las páginas rendericen sin romper. Solo para Server Components.
 */
export async function koreGet<T>(path: string, fallback: T): Promise<T> {
  try {
    const creds = await getTenantCredentials();
    if (!creds) return fallback;
    return await koreFetch<T>(path, { apiKey: creds.apiKey });
  } catch (err) {
    console.error("[koreGet]", path, err);
    return fallback;
  }
}
