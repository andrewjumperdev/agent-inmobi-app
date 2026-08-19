/**
 * BFF: rehacer el diagnóstico.
 *
 * Además de limpiar el perfil en el backend hay que devolver el flag de Supabase
 * a `false`: el middleware (proxy.ts) decide con esa columna si manda al
 * dashboard o al onboarding. Si se limpiara solo el backend, el cliente quedaría
 * con el sistema apagado y el middleware mandándolo igual al dashboard — sin
 * forma de llegar a la pantalla donde se rehace.
 */
import { getTenantCredentials } from "@/lib/kore/tenant";
import { koreFetch, KoreError } from "@/lib/kore/client";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST() {
  const creds = await getTenantCredentials();
  if (!creds) return Response.json({ error: "no_session" }, { status: 401 });

  try {
    const data = await koreFetch("/onboarding/reset", {
      apiKey: creds.apiKey,
      method: "POST",
    });

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const admin = createAdminClient();
      const { error } = await admin
        .from("profiles")
        .update({ onboarding_completed: false })
        .eq("id", user.id);
      // Si esto falla, el backend ya quedó limpio pero el middleware seguiría
      // mandando al dashboard: es un estado trabado, no un detalle. Se devuelve
      // error para que la UI no diga "listo" sobre algo que quedó a medias.
      if (error) {
        console.error("[/api/onboarding/reset] no se pudo reabrir el onboarding:", error);
        return Response.json(
          {
            error:
              "Se limpió la configuración pero no pudimos reabrir el onboarding. " +
              "Recargá la página; si sigue igual, escribinos.",
          },
          { status: 500 }
        );
      }
    }

    return Response.json(data);
  } catch (err) {
    const status = err instanceof KoreError ? err.status : 500;
    return Response.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status }
    );
  }
}
