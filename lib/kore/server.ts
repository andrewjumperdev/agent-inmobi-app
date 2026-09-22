import { getTenantCredentials, clearTenantBinding } from "@/lib/kore/tenant";
import { koreFetch, KoreError } from "@/lib/kore/client";

/** No hay sesión de Supabase. Se distingue de un fallo del backend porque la
 *  respuesta correcta es un 401 al navegador, no un 500. */
export class NoSessionError extends Error {
  constructor() {
    super("no_session");
    this.name = "NoSessionError";
  }
}

type Opts = { method?: string; body?: unknown; signal?: AbortSignal };

/**
 * Reprovisionado en vuelo, compartido entre llamadas concurrentes.
 *
 * Varias rutas hacen tres o cuatro lecturas en paralelo. Si el binding está
 * roto, las cuatro reciben 401 a la vez y las cuatro intentarían reprovisionar:
 * cada una borraría el binding recién escrito por la anterior y crearía OTRO
 * tenant, dejando huérfanos con datos repartidos entre ellos. Con esto, la
 * primera hace el trabajo y las demás esperan su resultado.
 */
let reprovisionando: Promise<{
  tenantId: string;
  apiKey: string;
} | null> | null = null;

async function reprovisionar() {
  if (!reprovisionando) {
    reprovisionando = (async () => {
      await clearTenantBinding();
      return getTenantCredentials();
    })().finally(() => {
      // Se libera en el siguiente tick: las llamadas que ya están esperando
      // comparten esta promesa, y una falla futura debe poder reintentar.
      setTimeout(() => {
        reprovisionando = null;
      }, 0);
    });
  }
  return reprovisionando;
}

/**
 * Llama al backend con las credenciales del tenant actual, recuperándose de una
 * credencial vencida.
 *
 * El binding guardado en `profiles` puede quedar apuntando a un tenant que ya
 * no existe: se recreó la base del backend, se cambió de entorno, se borró un
 * volumen de Docker. La key sigue siendo sintácticamente válida, así que nada
 * la rechaza hasta que el backend responde 401 — y como el binding se lee sin
 * validarse nunca, el error NO se cura solo: cada request repite el mismo 401
 * para siempre.
 *
 * Esta recuperación vivía solo en `koreGet`, que es para Server Components. Las
 * 25 rutas BFF resolvían credenciales por su cuenta y no la tenían, así que una
 * vez roto el binding, páginas como el onboarding quedaban muertas de forma
 * permanente mientras el dashboard se curaba solo. Ahora el camino es uno y la
 * recuperación está en él.
 */
export async function koreTenantFetch<T>(
  path: string,
  opts: Opts = {},
): Promise<T> {
  const creds = await getTenantCredentials();
  if (!creds) throw new NoSessionError();

  try {
    return await koreFetch<T>(path, { ...opts, apiKey: creds.apiKey });
  } catch (err) {
    if (!(err instanceof KoreError) || err.status !== 401) throw err;

    // Una sola vez: si la credencial recién emitida también da 401, el problema
    // no es el binding y reintentar en bucle solo esconde la causa real.
    console.warn(`[kore] ${path}: credencial rechazada, reprovisionando`);
    const fresh = await reprovisionar();
    if (!fresh) throw new NoSessionError();
    return await koreFetch<T>(path, { ...opts, apiKey: fresh.apiKey });
  }
}

/**
 * Traduce el error de una ruta BFF a una respuesta HTTP con el status correcto.
 *
 * Sin esto cada ruta repetía el mismo mapeo, y las diferencias entre copias
 * eran silenciosas: una devolvía 500 donde otra devolvía 401 para la misma
 * causa, y el frontend no podía distinguir "no estás logueado" de "el backend
 * se cayó".
 */
export function bffError(err: unknown): Response {
  if (err instanceof NoSessionError) {
    return Response.json({ error: "no_session" }, { status: 401 });
  }
  const status = err instanceof KoreError ? err.status : 500;
  console.error("[bff]", err);
  return Response.json(
    { error: err instanceof Error ? err.message : String(err) },
    { status },
  );
}

/**
 * GET server-side al backend KORE con las credenciales del tenant actual.
 * Devuelve `fallback` ante cualquier problema (sin sesión, backend caído) para
 * que las páginas rendericen sin romper. Solo para Server Components.
 */
export async function koreGet<T>(path: string, fallback: T): Promise<T> {
  try {
    return await koreTenantFetch<T>(path);
  } catch (err) {
    if (err instanceof NoSessionError) return fallback;
    console.error("[koreGet]", path, err);
    return fallback;
  }
}
