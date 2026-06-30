/**
 * /api/atencion — Agente de Atención al Cliente (FAUSTO) por el canal web.
 *
 * Mismo patrón BFF que /api/chat: el browser (sesión Supabase) habla acá, y este
 * route handler inyecta la API key del tenant y llama al backend KORE
 * (POST /customer-service/message), que corre el agente, propone/agenda y
 * devuelve la respuesta. La reemitimos como SSE para reusar <AIChat/>.
 */

import { getTenantCredentials } from "@/lib/kore/tenant";
import { koreFetch, KoreError } from "@/lib/kore/client";

export const maxDuration = 60; // gpt-4o + reserva; evita el timeout de 10s de Vercel

const GREETING = (name?: string) =>
  `¡Hola${name ? `, ${name}` : ""}! Soy el asistente de atención al cliente. Contame qué estás buscando y, si querés, coordinamos una demo o llamada. ¿En qué te puedo ayudar?`;

const MSG_NO_SESSION = "Necesitás iniciar sesión para usar el agente de atención.";
const MSG_BACKEND_DOWN =
  "No pude conectar con el sistema KORE en este momento. Verificá que el backend esté corriendo e intentá de nuevo.";

interface CSMessageOut {
  reply: string;
  intent?: string | null;
  booking?: Record<string, unknown>;
  booking_result?: Record<string, unknown> | null;
  run_id: string;
}

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
        await new Promise((r) => setTimeout(r, 24 + Math.random() * 20));
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

function streamText(text: string): Response {
  return new Response(textToStream(text), { headers: SSE_HEADERS });
}

export async function POST(request: Request) {
  try {
    const { messages, userProfile } = (await request.json()) as {
      messages: Array<{ role: "user" | "assistant"; content: string }>;
      userProfile?: { name?: string; first_time?: boolean };
    };

    const isInit = messages.some((m) => m.content.startsWith("__SYSTEM_INIT"));
    if (isInit) return streamText(GREETING(userProfile?.name));

    const lastUser = [...messages]
      .reverse()
      .find((m) => m.role === "user" && !m.content.startsWith("__SYSTEM_INIT"));
    const userText = lastUser?.content?.trim() ?? "";
    if (!userText) return streamText(GREETING(userProfile?.name));

    const creds = await getTenantCredentials();
    if (!creds) return streamText(MSG_NO_SESSION);

    const out = await koreFetch<CSMessageOut>("/customer-service/message", {
      apiKey: creds.apiKey,
      method: "POST",
      body: { message: userText, name: userProfile?.name },
    });

    return streamText(out.reply || "¿Podés contarme un poco más?");
  } catch (err) {
    if (err instanceof KoreError) {
      console.error("[/api/atencion] KORE backend:", err.status, err.message);
    } else {
      console.error("[/api/atencion]", err);
    }
    return streamText(MSG_BACKEND_DOWN);
  }
}
