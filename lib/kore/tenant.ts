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

const DEFAULT_NICHE = process.env.KORE_DEFAULT_NICHE ?? "real-estate";

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
          maybeSingle: () => Promise<{ data: ProfileRow | null }>;
        };
      };
      update: (v: Record<string, unknown>) => {
        eq: (col: string, val: string) => Promise<{ error: unknown }>;
      };
    };
  };

  const read = async (): Promise<ProfileRow | null> => {
    const { data } = await db
      .from("profiles")
      .select("kore_tenant_id, kore_api_key, full_name, email")
      .eq("id", user.id)
      .maybeSingle();
    return data;
  };

  const profile = await read();
  if (profile?.kore_tenant_id && profile?.kore_api_key) {
    return { tenantId: profile.kore_tenant_id, apiKey: profile.kore_api_key };
  }

  // ── Provisionar tenant nuevo como instancia del nicho (P2) ──────────────────
  const name = profile?.full_name || user.email || "Cliente KORE";
  const slug = `t-${user.id.slice(0, 8)}`;

  let tenant;
  try {
    tenant = await createTenant({ name, slug, niche_slug: DEFAULT_NICHE });
  } catch (err) {
    // Carrera: otra request pudo haber provisionado el tenant en paralelo
    // (slug duplicado → 4xx/5xx). Reintentamos leyendo el perfil una vez.
    if (err instanceof KoreError) {
      const again = await read();
      if (again?.kore_tenant_id && again?.kore_api_key) {
        return { tenantId: again.kore_tenant_id, apiKey: again.kore_api_key };
      }
    }
    throw err;
  }

  await db
    .from("profiles")
    .update({ kore_tenant_id: tenant.id, kore_api_key: tenant.api_key })
    .eq("id", user.id);

  return { tenantId: tenant.id, apiKey: tenant.api_key };
}
