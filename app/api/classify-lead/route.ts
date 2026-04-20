/**
 * /api/classify-lead — AI-powered lead classification
 *
 * Provider: same AI_PROVIDER env flag as /api/chat
 *   AI_PROVIDER=mock      → instant mock classification (default)
 *   AI_PROVIDER=groq      → Groq llama-3.3-70b
 *   AI_PROVIDER=anthropic → Claude Sonnet
 *
 * Returns JSON: { operation_type, urgency, score, zone_interest }
 */

const PROVIDER = process.env.AI_PROVIDER ?? "mock";

const CLASSIFY_SYSTEM = `Eres un clasificador de leads inmobiliarios experto en el mercado latinoamericano.
Dado los datos de un lead, devolvé ÚNICAMENTE un JSON válido con estos campos exactos:
{
  "operation_type": "compra" | "venta" | "inversion",
  "urgency": "hot" | "warm" | "cold",
  "score": "qualified" | "unqualified" | "pending",
  "zone_interest": "<zona si se puede inferir, sino vacío>"
}

Criterios:
- urgency "hot": tiene presupuesto definido, zona específica, llegó por WhatsApp o referido
- urgency "warm": tiene algunos datos pero incompleto
- urgency "cold": poco contexto, sin presupuesto, sin zona
- score "qualified": tiene presupuesto > 50000 USD y operación clara
- score "unqualified": datos muy vagos o incoherentes
- score "pending": datos parciales que requieren seguimiento

Devolvé SOLO el JSON, sin texto adicional, sin markdown.`;

/* ── Mock classification ──────────────────────────────────── */
function mockClassify(data: {
  source?: string;
  budget_min?: number | null;
  budget_max?: number | null;
  zone_interest?: string | null;
}) {
  const hasSource = data.source === "whatsapp" || data.source === "referido";
  const hasBudget = (data.budget_min ?? 0) > 0;
  const hasZone = !!data.zone_interest;

  const urgency =
    hasSource && hasBudget && hasZone ? "hot" :
    hasBudget || hasZone ? "warm" : "cold";

  const score =
    hasBudget && (data.budget_min ?? 0) >= 50000 ? "qualified" :
    hasBudget ? "pending" : "unqualified";

  const operation_type = "compra"; // default without more context

  return {
    operation_type,
    urgency,
    score,
    zone_interest: data.zone_interest ?? "",
  };
}

/* ── POST ─────────────────────────────────────────────────── */
export async function POST(request: Request) {
  try {
    const body = await request.json() as {
      name?: string;
      phone?: string;
      source?: string;
      zone_interest?: string | null;
      budget_min?: number | null;
      budget_max?: number | null;
      notes?: string;
    };

    /* Mock */
    if (PROVIDER === "mock") {
      await new Promise((r) => setTimeout(r, 800 + Math.random() * 400));
      const result = mockClassify(body);
      return Response.json(result);
    }

    const userPrompt = `Lead a clasificar:
- Nombre: ${body.name ?? "desconocido"}
- Fuente: ${body.source ?? "desconocida"}
- Zona de interés: ${body.zone_interest ?? "no especificada"}
- Presupuesto: ${body.budget_min ? `$${body.budget_min}` : "no especificado"} – ${body.budget_max ? `$${body.budget_max}` : ""}
- Notas adicionales: ${body.notes || "ninguna"}

Clasificá este lead.`;

    /* Groq */
    if (PROVIDER === "groq") {
      const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: CLASSIFY_SYSTEM },
            { role: "user", content: userPrompt },
          ],
          max_tokens: 200,
          temperature: 0.1,
        }),
      });

      if (!groqRes.ok) throw new Error(`Groq error: ${groqRes.status}`);
      const groqData = await groqRes.json() as { choices: { message: { content: string } }[] };
      const raw = groqData.choices?.[0]?.message?.content ?? "{}";
      const parsed = JSON.parse(raw.trim());
      return Response.json(parsed);
    }

    /* Anthropic */
    if (PROVIDER === "anthropic") {
      const { default: Anthropic } = await import("@anthropic-ai/sdk");
      const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

      const msg = await anthropic.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 200,
        system: CLASSIFY_SYSTEM,
        messages: [{ role: "user", content: userPrompt }],
      });

      const raw = msg.content[0]?.type === "text" ? msg.content[0].text : "{}";
      const parsed = JSON.parse(raw.trim());
      return Response.json(parsed);
    }

    throw new Error(`Unknown AI_PROVIDER: ${PROVIDER}`);
  } catch (err) {
    console.error("[/api/classify-lead]", err);
    return Response.json(
      { operation_type: "compra", urgency: "cold", score: "pending", zone_interest: "" },
      { status: 200 }
    );
  }
}
