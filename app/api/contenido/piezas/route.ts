/** BFF del banco de contenido: listar y guardar piezas.
 *
 * Antes el banco vivía en el estado del navegador y se perdía al refrescar —
 * una pieza que costó una llamada al LLM y que la persona aprobó no puede
 * depender de que no cierre la pestaña.
 */
import { getTenantCredentials } from "@/lib/kore/tenant";
import { koreFetch, KoreError } from "@/lib/kore/client";

function fail(err: unknown) {
  const status = err instanceof KoreError ? err.status : 500;
  return Response.json(
    { error: err instanceof Error ? err.message : String(err) },
    { status }
  );
}

export async function GET() {
  const creds = await getTenantCredentials();
  if (!creds) return Response.json({ error: "no_session" }, { status: 401 });
  try {
    return Response.json(await koreFetch("/content", { apiKey: creds.apiKey }));
  } catch (err) {
    return fail(err);
  }
}

export async function POST(request: Request) {
  const creds = await getTenantCredentials();
  if (!creds) return Response.json({ error: "no_session" }, { status: 401 });
  try {
    const body = await request.json();
    const data = await koreFetch("/content", {
      apiKey: creds.apiKey,
      method: "POST",
      body,
    });
    return Response.json(data, { status: 201 });
  } catch (err) {
    return fail(err);
  }
}
