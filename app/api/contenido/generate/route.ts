/**
 * /api/contenido/generate — Generación de contenido vía el Content Agent del
 * backend KORE (OpenAI). BFF: inyecta la API key del tenant, corre el agente y
 * reemite los drafts como SSE `{text}` para reusar el componente generador.
 *
 * Side-effect (P3): el Content Agent también crea una escalación CONTENT_REVIEW,
 * así el contenido generado aparece en Seguimiento para aprobación.
 */
import { getTenantCredentials } from "@/lib/kore/tenant";
import { runAgent } from "@/lib/kore/client";

export const maxDuration = 60; // Content agent (gpt-4o); evita el timeout de 10s de Vercel

export type ContentFormat = "reel" | "carrusel" | "historia" | "post";
export type ContentPillar = "autoridad" | "conversion" | "confianza" | "atraccion";

const SSE_HEADERS = {
  "Content-Type": "text/event-stream",
  "Cache-Control": "no-cache",
  Connection: "keep-alive",
};

function textToStream(text: string): ReadableStream {
  const encoder = new TextEncoder();
  const words = text.split(" ");
  return new ReadableStream({
    async start(controller) {
      for (let i = 0; i < words.length; i += 3) {
        const chunk = words.slice(i, i + 3).join(" ") + (i + 3 < words.length ? " " : "");
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: chunk })}\n\n`));
        await new Promise((r) => setTimeout(r, 18 + Math.random() * 18));
      }
      controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      controller.close();
    },
  });
}

interface Draft { channel?: string; title?: string; body?: string }

export async function POST(request: Request) {
  const { format, pillar, context, zona } = (await request.json()) as {
    format: ContentFormat;
    pillar: ContentPillar;
    context?: string;
    zona?: string;
  };

  const message =
    `Generá contenido de marketing inmobiliario. Formato: ${format}. ` +
    `Pilar: ${pillar}. Zona: ${zona || "LATAM"}.` +
    (context ? ` Contexto: ${context}.` : "");

  let text: string;
  try {
    const creds = await getTenantCredentials();
    if (!creds) throw new Error("no_session");
    const run = await runAgent(creds.apiKey, "content", { message });
    const out = (run.output?.output ?? {}) as { drafts?: Draft[]; rationale?: string };
    const drafts = out.drafts ?? [];
    text =
      drafts
        .map((d) => `${d.title ? `✍️ ${d.title}\n` : ""}${d.body ?? ""}`.trim())
        .filter(Boolean)
        .join("\n\n———\n\n") ||
      out.rationale ||
      "No se pudo generar contenido. Intentá de nuevo.";
  } catch (err) {
    console.error("[/api/contenido/generate]", err);
    text =
      "No pude conectar con el generador de contenido (¿backend activo y sesión iniciada?). Intentá de nuevo.";
  }

  return new Response(textToStream(text), { headers: SSE_HEADERS });
}
