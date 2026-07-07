/** BFF: corre el diagnóstico del Coach con las respuestas del onboarding. */
import { getTenantCredentials } from "@/lib/kore/tenant";
import { koreFetch, KoreError } from "@/lib/kore/client";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// El Coach llama a gpt-4o (puede tardar >10s). Vercel corta las funciones a 10s
// por defecto → subimos el límite para que el diagnóstico no falle por timeout.
export const maxDuration = 60;

export async function POST(request: Request) {
  const creds = await getTenantCredentials();
  if (!creds) return Response.json({ error: "no_session" }, { status: 401 });
  try {
    const body = await request.json();
    const data = await koreFetch("/onboarding/diagnose", {
      apiKey: creds.apiKey,
      method: "POST",
      body,
    });

    // Marcar onboarding_completed server-side con service role: el middleware
    // (proxy.ts) gatea /dashboard con esta columna, y un write desde el browser
    // con el cliente RLS puede fallar en silencio (sin chequeo de error) y dejar
    // al usuario en un loop dashboard↔onboarding aunque el diagnóstico ya cerró.
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const admin = createAdminClient();
      const { error } = await admin
        .from("profiles")
        .update({ onboarding_completed: true })
        .eq("id", user.id);
      if (error) {
        console.error("[/api/onboarding/diagnose] no se pudo marcar onboarding_completed:", error);
      }
    }

    return Response.json(data);
  } catch (err) {
    const status = err instanceof KoreError ? err.status : 500;
    return Response.json({ error: err instanceof Error ? err.message : String(err) }, { status });
  }
}
