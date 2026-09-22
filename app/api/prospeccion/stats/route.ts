/** BFF: estado de la prospección → GET /prospecting/stats. */
import { koreTenantFetch, bffError } from "@/lib/kore/server";

export async function GET() {
  try {
    const data = await koreTenantFetch("/prospecting/stats");
    return Response.json(data);
  } catch (err) {
    return bffError(err);
  }
}
