/**
 * /api/chat — ARIA, la interfaz conversacional del dashboard.
 *
 * ARIA *es* el Coach Agent (§04-01) del backend KORE IA: diagnostica el negocio
 * del cliente y habilita los módulos. Este route handler actúa como BFF:
 *
 *   browser (sesión Supabase) → aquí (inyecta la API key del tenant) → FastAPI /agents/run
 *
 * El backend responde un JSON estructurado (NO streaming); lo reemitimos en el
 * mismo formato SSE (`data: {text}` … `data: [DONE]`) que ya consume
 * components/dashboard/ai-chat.tsx, sin tocar el componente.
 */

import { getTenantCredentials } from "@/lib/kore/tenant";
import { runAgent, agentReplyText, KoreError } from "@/lib/kore/client";

/* ── Saludo de apertura (no consume backend; el Coach diagnostica, no saluda) ── */
const GREETING_FIRST = (name?: string) =>
  `¡Hola${name ? `, ${name}` : ""}! Soy ARIA, tu coach de inteligencia artificial dentro de KORE IA. Para configurar tu sistema necesito entender tu negocio: contame en qué ciudad operás, qué tipo de propiedades manejás y cómo conseguís clientes hoy.`;

const GREETING_RETURNING = (name?: string) =>
  `Bienvenido de vuelta${name ? `, ${name}` : ""}. ¿En qué puedo ayudarte hoy? Puedo seguir afinando el diagnóstico de tu negocio o explicarte cualquier módulo del sistema.`;

/* ── Mensajes de fallback ───────────────────────────────────────────────────── */
const MSG_NO_SESSION =
  "Necesitás iniciar sesión para hablar con ARIA.";
const MSG_BACKEND_DOWN =
  "No pude conectar con el sistema KORE en este momento. Verificá que el backend esté corriendo e intentá de nuevo en unos segundos.";

/* ── Streaming helper: texto → SSE con efecto de tipeo ──────────────────────── */
function textToStream(text: string, chunkSize = 4): ReadableStream {
  const encoder = new TextEncoder();
  const words = text.split(" ");

  return new ReadableStream({
    async start(controller) {
      for (let i = 0; i < words.length; i += chunkSize) {
        const chunk =
          words.slice(i, i + chunkSize).join(" ") +
          (i + chunkSize < words.length ? " " : "");
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ text: chunk })}\n\n`)
        );
        await new Promise((r) => setTimeout(r, 28 + Math.random() * 24));
      }
      controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      controller.close();
    },
  });
}

const SSE_HEADERS = {
  "Content-Type": "text/event-stream",
  "Cache-Control": "no-cache",
  Connection: "keep-alive",
};

/** Respuesta SSE de una sola pieza de texto (status 200 siempre: el cliente
 *  solo chequea `res.ok`, así mostramos errores como un mensaje del asistente). */
function streamText(text: string): Response {
  return new Response(textToStream(text), { headers: SSE_HEADERS });
}

/* ── POST ───────────────────────────────────────────────────────────────────── */
export async function POST(request: Request) {
  try {
    const { messages, userProfile } = (await request.json()) as {
      messages: Array<{ role: "user" | "assistant"; content: string }>;
      userProfile?: { name?: string; email?: string; first_time?: boolean };
    };

    // Apertura: el componente manda un token sintético al montarse. El Coach es
    // un diagnosticador, no un saludador → respondemos un saludo estático.
    const isInit = messages.some(
      (m) =>
        m.content === "__SYSTEM_INIT_FIRST_TIME__" ||
        m.content === "__SYSTEM_INIT_RETURNING__"
    );
    if (isInit) {
      return streamText(
        userProfile?.first_time
          ? GREETING_FIRST(userProfile?.name)
          : GREETING_RETURNING(userProfile?.name)
      );
    }

    // Último mensaje real del usuario → input del diagnóstico.
    const lastUser = [...messages]
      .reverse()
      .find((m) => m.role === "user" && !m.content.startsWith("__SYSTEM_INIT"));
    const userText = lastUser?.content?.trim() ?? "";
    if (!userText) {
      return streamText(GREETING_RETURNING(userProfile?.name));
    }

    // Credenciales del tenant (provisiona en el backend si es la primera vez).
    const creds = await getTenantCredentials();
    if (!creds) return streamText(MSG_NO_SESSION);

    // Coach Agent: diagnostica y, como side-effect en el runner, habilita módulos.
    const run = await runAgent(creds.apiKey, "coach", { message: userText });
    const reply =
      agentReplyText(run) ||
      "Registré eso. ¿Querés que avancemos con el diagnóstico completo de tu negocio?";

    return streamText(reply);
  } catch (err) {
    if (err instanceof KoreError) {
      console.error("[/api/chat] KORE backend:", err.status, err.message);
    } else {
      console.error("[/api/chat]", err);
    }
    return streamText(MSG_BACKEND_DOWN);
  }
}
