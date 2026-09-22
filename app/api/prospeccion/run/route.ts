/** BFF: disparar un batch de cold email ahora → POST /prospecting/run. */
import { koreTenantFetch, bffError } from "@/lib/kore/server";

export async function POST() {
  try {
    const data = await koreTenantFetch("/prospecting/run", { method: "POST" });
    return Response.json(data);
  } catch (err) {
    return bffError(err);
  }
}
