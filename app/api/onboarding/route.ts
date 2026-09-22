/** BFF: info del onboarding del tenant (preguntas del nicho + estado). */
import { koreTenantFetch, bffError } from "@/lib/kore/server";

export async function GET() {
  try {
    return Response.json(await koreTenantFetch("/onboarding"));
  } catch (err) {
    return bffError(err);
  }
}
