import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

/**
 * Cliente de Supabase con la SERVICE ROLE key — bypassa RLS.
 *
 * ⚠️ SOLO server-side. Nunca importar desde un Client Component. Lo usamos para
 * leer/escribir columnas sensibles del perfil (ej. la API key del tenant KORE),
 * que el cliente del navegador no debe poder tocar.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "Falta NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en el entorno."
    );
  }

  return createSupabaseClient<Database>(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
