/** BFF: el cliente elige su nicho → define las preguntas del Coach. */
import { koreTenantFetch, bffError } from "@/lib/kore/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = await koreTenantFetch("/onboarding/niche", {
      method: "POST",
      body,
    });
    return Response.json(data);
  } catch (err) {
    return bffError(err);
  }
}
