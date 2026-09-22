/** BFF del banco de contenido: listar y guardar piezas.
 *
 * Antes el banco vivía en el estado del navegador y se perdía al refrescar —
 * una pieza que costó una llamada al LLM y que la persona aprobó no puede
 * depender de que no cierre la pestaña.
 */
import { koreTenantFetch, bffError } from "@/lib/kore/server";

export async function GET() {
  try {
    return Response.json(await koreTenantFetch("/content"));
  } catch (err) {
    return bffError(err);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = await koreTenantFetch("/content", { method: "POST", body });
    return Response.json(data, { status: 201 });
  } catch (err) {
    return bffError(err);
  }
}
