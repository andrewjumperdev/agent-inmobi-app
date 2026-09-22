/** BFF: corre el diagnóstico del Coach con las respuestas del onboarding. */
import { koreTenantFetch, bffError } from "@/lib/kore/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// El Coach llama a gpt-4o (puede tardar >10s). Vercel corta las funciones a 10s
// por defecto → subimos el límite para que el diagnóstico no falle por timeout.
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = await koreTenantFetch("/onboarding/diagnose", {
      method: "POST",
      body,
    });

    // Marcar onboarding_completed server-side con service role: el middleware
    // (proxy.ts) gatea /dashboard con esta columna, y un write desde el browser
    // con el cliente RLS puede fallar en silencio (sin chequeo de error) y dejar
    // al usuario en un loop dashboard↔onboarding aunque el diagnóstico ya cerró.
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const admin = createAdminClient();
      const { error } = await admin
        .from("profiles")
        .update({ onboarding_completed: true })
        .eq("id", user.id);
      if (error) {
        console.error(
          "[/api/onboarding/diagnose] no se pudo marcar onboarding_completed:",
          error,
        );
      }
    }

    return Response.json(data);
  } catch (err) {
    return bffError(err);
  }
}
