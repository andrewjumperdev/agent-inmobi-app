/**
 * Binding usuario Supabase ↔ tenant del backend KORE IA.
 *
 * El backend autentica por API key de tenant (kore_…); el frontend autentica al
 * humano por sesión Supabase. El puente: cada `profiles` guarda su `kore_tenant_id`
 * + `kore_api_key`. La key es un secreto y vive SOLO en el servidor (se lee con la
 * service-role key; ver migración 0003 que revoca su SELECT al rol del cliente).
 *
 * Provisioning lazy: si el perfil todavía no tiene tenant, lo creamos en el backend
 * la primera vez que se necesita y guardamos la key emitida.
 */
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createTenant, KoreError } from "@/lib/kore/client";

// .trim() defensivo: una env con espacios/tabs (al copiar) rompía la búsqueda de nicho.
const DEFAULT_NICHE = (process.env.KORE_DEFAULT_NICHE || "real-estate").trim();

export interface TenantCredentials {
  tenantId: string;
  apiKey: string;
}

type ProfileRow = {
  kore_tenant_id: string | null;
  kore_api_key: string | null;
  full_name: string | null;
  email: string | null;
};

/**
 * Devuelve las credenciales del tenant del usuario logueado, provisionándolo en
 * el backend si hace falta. Devuelve `null` si no hay sesión.
 *
 * @throws KoreError si el backend está caído / no responde al provisionar.
 */
export async function getTenantCredentials(): Promise<TenantCredentials | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const admin = createAdminClient();
  // Las columnas kore_* todavía no están en los tipos generados → cast acotado.
  const db = admin as unknown as {
    from: (t: string) => {
      select: (c: string) => {
        eq: (col: string, val: string) => {
          maybeSingle: () => Promise<{ data: ProfileRow | null; error: { message?: string } | null }>;
        };
      };
      update: (v: Record<string, unknown>) => {
        eq: (col: string, val: string) => Promise<{ error: { message?: string } | null }>;
      };
    };
  };

  const read = async (): Promise<ProfileRow | null> => {
    const { data, error } = await db
      .from("profiles")
      .select("kore_tenant_id, kore_api_key, full_name, email")
      .eq("id", user.id)
      .maybeSingle();
    // Falla rápido ante key inválida / migración faltante, ANTES de crear un
    // tenant que quedaría huérfano (su key se muestra una sola vez).
    if (error) {
      console.error("[getTenantCredentials] no se pudo leer profiles:", error);
      throw new Error(
        `No se pudo leer el perfil (${error.message ?? "error"}). ` +
          "Revisá SUPABASE_SERVICE_ROLE_KEY (debe ser la 'secret key' sb_secret_…) " +
          "y que la migración 0003 esté aplicada. Reiniciá el dev server tras editar .env.local."
      );
    }
    return data;
  };

  const profile = await read();
  if (profile?.kore_tenant_id && profile?.kore_api_key) {
    return { tenantId: profile.kore_tenant_id, apiKey: profile.kore_api_key };
  }

  // ── Provisionar tenant nuevo como instancia del nicho (P2) ──────────────────
  const name = profile?.full_name || user.email || "Cliente KORE";
  const baseSlug = `t-${user.id.slice(0, 8)}`;

  let tenant;
  try {
    tenant = await createTenant({ name, slug: baseSlug, niche_slug: DEFAULT_NICHE });
  } catch (err) {
    if (!(err instanceof KoreError)) throw err;
    // 1) Carrera: otra request pudo haber provisionado en paralelo → releer.
    const again = await read();
    if (again?.kore_tenant_id && again?.kore_api_key) {
      return { tenantId: again.kore_tenant_id, apiKey: again.kore_api_key };
    }
    // 2) Slug ocupado por un tenant huérfano (la key no quedó guardada en su
    //    momento). Reintentamos con un slug único para no quedar colgados.
    const uniqueSlug = `${baseSlug}-${Math.random().toString(36).slice(2, 8)}`;
    tenant = await createTenant({ name, slug: uniqueSlug, niche_slug: DEFAULT_NICHE });
  }

  // Persistir la key es crítico: si falla, el próximo intento re-provisiona y
  // deja un huérfano. Verificamos el error y lo surfaceamos.
  const { error: upErr } = await db
    .from("profiles")
    .update({ kore_tenant_id: tenant.id, kore_api_key: tenant.api_key })
    .eq("id", user.id);
  if (upErr) {
    console.error("[getTenantCredentials] no se pudo guardar la API key en profiles:", upErr);
    throw new Error(
      "No se pudo guardar la credencial del tenant. ¿Aplicaste la migración 0003 y la service-role key?"
    );
  }

  return { tenantId: tenant.id, apiKey: tenant.api_key };
}
