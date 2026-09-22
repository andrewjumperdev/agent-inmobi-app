/** BFF: importar prospectos → POST /prospecting/import. */
import { koreTenantFetch, bffError } from "@/lib/kore/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = await koreTenantFetch("/prospecting/import", {
      method: "POST",
      body,
    });
    return Response.json(data);
  } catch (err) {
    return bffError(err);
  }
}
