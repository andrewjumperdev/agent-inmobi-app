/**
 * /api/chat — Streaming chat endpoint para ARIA
 *
 * Provider seleccionado via env:
 *   AI_PROVIDER=mock      → respuestas simuladas, sin API (default para dev)
 *   AI_PROVIDER=groq      → Groq free tier (llama-3.3-70b) — gratis, requiere GROQ_API_KEY
 *   AI_PROVIDER=anthropic → Claude Sonnet — requiere ANTHROPIC_API_KEY
 */

const PROVIDER = process.env.AI_PROVIDER ?? "mock";

/* ── System prompt compartido ──────────────────────────────── */
const BASE_SYSTEM = `Eres ARIA, la inteligencia artificial del sistema InMobi AI OS — un sistema operativo diseñado exclusivamente para agentes y equipos inmobiliarios en Latinoamérica.

Tu rol es ser la primera interfaz que recibe al usuario cuando entra al sistema. Eres cálida, directa y altamente profesional. Tu objetivo es:

1. Saludar al usuario usando su nombre si está disponible.
2. Entender rápidamente su contexto: ¿qué tipo de propiedades maneja? ¿en qué ciudad/país opera? ¿trabaja solo o tiene equipo?
3. Guiarlo hacia el primer paso más relevante según su situación.

Módulos disponibles:
- Dashboard: Vista general (estás aquí).
- CRM: Gestión de leads y pipeline de ventas.
- Captación: Automatización de captación de propiedades.
- Contenido: Generación de publicaciones y campañas con IA.
- Analytics: Métricas, ROI y predicciones.

Reglas: Responde siempre en el idioma del usuario. Máximo 3-4 oraciones. Lenguaje profesional pero cercano.`;

/* ── Respuestas mock para testing ──────────────────────────── */
const MOCK_GREETING_FIRST = (name?: string) =>
  `¡Hola${name ? `, ${name}` : ""}! Soy ARIA, tu asistente de inteligencia artificial dentro del InMobi AI OS. Estoy aquí para ayudarte a automatizar tu negocio inmobiliario desde la captación hasta el cierre. Para empezar, ¿en qué ciudad operás y qué tipo de propiedades manejás principalmente?`;

const MOCK_GREETING_RETURNING = (name?: string) =>
  `Bienvenido de vuelta${name ? `, ${name}` : ""}. ¿En qué puedo ayudarte hoy? Podés preguntarme sobre leads, contenido, captación o cualquier módulo del sistema.`;

const MOCK_REPLIES = [
  "Entendido. Con esa información puedo personalizar el sistema para tu mercado. Te recomiendo empezar por el módulo de **Captación** para automatizar la prospección de propietarios en tu zona.",
  "Perfecto. El CRM te va a ayudar a organizar esos leads y hacer seguimiento automático. ¿Ya tenés una base de contactos o arrancamos desde cero?",
  "Eso es exactamente para lo que está diseñado el sistema. El módulo de **Contenido** puede generar publicaciones para tus propiedades automáticamente usando IA. ¿Querés que te explique cómo funciona?",
  "Buena pregunta. Los **Analytics** te muestran el ROI de cada acción en tiempo real. Una vez que tengas algunos leads en el sistema, vas a poder ver exactamente qué está funcionando.",
  "Claro, con gusto te explico. ¿Preferís que empecemos con una visión general o hay algún módulo específico que te interese más?",
];

let mockReplyIndex = 0;

/* ── Streaming helper: convierte texto en SSE ──────────────── */
function textToStream(text: string, chunkSize = 4): ReadableStream {
  const encoder = new TextEncoder();
  const words = text.split(" ");

  return new ReadableStream({
    async start(controller) {
      for (let i = 0; i < words.length; i += chunkSize) {
        const chunk = words.slice(i, i + chunkSize).join(" ") + (i + chunkSize < words.length ? " " : "");
        const data = JSON.stringify({ text: chunk });
        controller.enqueue(encoder.encode(`data: ${data}\n\n`));
        // Simulate realistic typing speed
        await new Promise((r) => setTimeout(r, 60 + Math.random() * 40));
      }
      controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      controller.close();
    },
  });
}

/* ── SSE response headers ──────────────────────────────────── */
const SSE_HEADERS = {
  "Content-Type": "text/event-stream",
  "Cache-Control": "no-cache",
  Connection: "keep-alive",
};

/* ── POST handler ──────────────────────────────────────────── */
export async function POST(request: Request) {
  try {
    const { messages, userProfile } = (await request.json()) as {
      messages: Array<{ role: "user" | "assistant"; content: string }>;
      userProfile?: { name?: string; email?: string; first_time?: boolean };
    };

    // Normalize init tokens
    const isInit = messages.some(
      (m) =>
        m.content === "__SYSTEM_INIT_FIRST_TIME__" ||
        m.content === "__SYSTEM_INIT_RETURNING__"
    );

    const processedMessages = messages.map((m) =>
      m.content.startsWith("__SYSTEM_INIT") ? { ...m, content: "Hola" } : m
    );

    /* ── MOCK provider ──────────────────────────────────────── */
    if (PROVIDER === "mock") {
      let reply: string;
      if (isInit) {
        reply = userProfile?.first_time
          ? MOCK_GREETING_FIRST(userProfile.name)
          : MOCK_GREETING_RETURNING(userProfile.name);
      } else {
        reply = MOCK_REPLIES[mockReplyIndex % MOCK_REPLIES.length];
        mockReplyIndex++;
      }
      return new Response(textToStream(reply), { headers: SSE_HEADERS });
    }

    /* ── Build context-aware system prompt ──────────────────── */
    let system = BASE_SYSTEM;
    if (userProfile?.name) system += `\n\nEl usuario se llama: ${userProfile.name}.`;
    system += userProfile?.first_time
      ? `\n\nEs la PRIMERA VEZ en el sistema. Presentate como ARIA y preguntale por su negocio.`
      : `\n\nUsuario recurrente. Salúdalo brevemente y preguntale qué necesita hoy.`;

    /* ── GROQ provider (free tier) ──────────────────────────── */
    if (PROVIDER === "groq") {
      const groqRes = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [
              { role: "system", content: system },
              ...processedMessages,
            ],
            max_tokens: 512,
            stream: true,
          }),
        }
      );

      if (!groqRes.ok || !groqRes.body) {
        throw new Error(`Groq error: ${groqRes.status}`);
      }

      // Proxy Groq's SSE → our SSE format
      const encoder = new TextEncoder();
      const reader = groqRes.body.getReader();
      const decoder = new TextDecoder();

      const stream = new ReadableStream({
        async start(controller) {
          let buffer = "";
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() ?? "";
            for (const line of lines) {
              if (!line.startsWith("data: ")) continue;
              const payload = line.slice(6).trim();
              if (payload === "[DONE]") {
                controller.enqueue(encoder.encode("data: [DONE]\n\n"));
                controller.close();
                return;
              }
              try {
                const json = JSON.parse(payload);
                const text: string = json.choices?.[0]?.delta?.content ?? "";
                if (text) {
                  controller.enqueue(
                    encoder.encode(`data: ${JSON.stringify({ text })}\n\n`)
                  );
                }
              } catch {}
            }
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        },
      });

      return new Response(stream, { headers: SSE_HEADERS });
    }

    /* ── ANTHROPIC provider ─────────────────────────────────── */
    if (PROVIDER === "anthropic") {
      const { default: Anthropic } = await import("@anthropic-ai/sdk");
      const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

      const stream = await anthropic.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 512,
        system,
        messages: processedMessages,
        stream: true,
      });

      const encoder = new TextEncoder();
      const readable = new ReadableStream({
        async start(controller) {
          for await (const event of stream) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`)
              );
            }
            if (event.type === "message_stop") {
              controller.enqueue(encoder.encode("data: [DONE]\n\n"));
              controller.close();
            }
          }
        },
      });

      return new Response(readable, { headers: SSE_HEADERS });
    }

    throw new Error(`Unknown AI_PROVIDER: ${PROVIDER}`);
  } catch (err) {
    console.error("[/api/chat]", err);
    return new Response(
      JSON.stringify({ error: "Error al procesar el mensaje." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
