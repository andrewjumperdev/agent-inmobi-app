/** BFF: alta manual de lead → POST /leads (dispara la cadena SDR en el backend). */
import { koreTenantFetch, bffError } from "@/lib/kore/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = await koreTenantFetch("/leads", { method: "POST", body });
    return Response.json(data, { status: 201 });
  } catch (err) {
    return bffError(err);
  }
}
