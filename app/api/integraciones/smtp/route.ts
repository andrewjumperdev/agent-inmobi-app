/** BFF: leer/guardar la config SMTP + persona del tenant (cold email). */
import { koreTenantFetch, bffError } from "@/lib/kore/server";

export async function GET() {
  try {
    const data = await koreTenantFetch("/integrations/smtp");
    return Response.json(data);
  } catch (err) {
    return bffError(err);
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const data = await koreTenantFetch("/integrations/smtp", {
      method: "PUT",
      body,
    });
    return Response.json(data);
  } catch (err) {
    return bffError(err);
  }
}
