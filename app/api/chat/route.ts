/**
 * /api/chat — ARIA, la interfaz conversacional del dashboard.
 *
 * ARIA es el **asistente**, no el Coach. Responde dudas sobre el sistema del
 * cliente; no configura nada.
 *
 *   browser (sesión Supabase) → aquí (inyecta la API key) → FastAPI /assistant/chat
 *
 * Antes esto llamaba al Coach, que SÍ configura: cada mensaje reemplazaba el
 * perfil del negocio y los módulos habilitados por lo que devolviera el modelo,
 * así que un "hola" borraba el diagnóstico completo. Reconfigurar es un acto
 * explícito y tiene su propio camino (onboarding, y Cuenta → Rehacer diagnóstico).
 *
 * El backend responde JSON (NO streaming); lo reemitimos en el mismo formato SSE
 * (`data: {text}` … `data: [DONE]`) que ya consume el componente de chat.
 *
 * El historial NO se manda desde acá: el backend guarda cada turno en el hilo de
 * ARIA del tenant y lo relee solo. Mandar el historial completo en cada request
 * duplicaría el contexto y haría crecer el costo con cada mensaje.
 */

import { getTenantCredentials } from "@/lib/kore/tenant";
import { koreFetch, KoreError } from "@/lib/kore/client";

export const maxDuration = 60; // llama al LLM; evita el timeout de 10s de Vercel

/* ── Saludo de apertura (no consume backend; el Coach diagnostica, no saluda) ── */
const GREETING_FIRST = (name?: string) =>
  `¡Hola${name ? `, ${name}` : ""}! Soy ARIA. Te acompaño dentro de KORE: puedo explicarte qué hace cada módulo, qué significan tus métricas o qué conviene revisar. Preguntame lo que quieras.`;

const GREETING_RETURNING = (name?: string) =>
  `Bienvenido de vuelta${name ? `, ${name}` : ""}. ¿En qué te ayudo? Puedo explicarte cualquier parte del sistema o ayudarte a leer tus números.`;

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

    const run = await koreFetch<{ reply: string }>("/assistant/chat", {
      apiKey: creds.apiKey,
      method: "POST",
      body: { message: userText },
    });
    const reply =
      run.reply || "No te entendí del todo. ¿Me lo contás de otra manera?";

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
