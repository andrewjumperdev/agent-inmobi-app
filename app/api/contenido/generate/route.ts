/**
 * /api/contenido/generate — Streaming SSE para generación de contenido inmobiliario
 *
 * Provider seleccionado via env:
 *   AI_PROVIDER=mock      → respuestas simuladas, sin API (default)
 *   AI_PROVIDER=groq      → Groq free tier (llama-3.3-70b)
 *   AI_PROVIDER=anthropic → Claude Sonnet
 */

export const runtime = "edge";

const PROVIDER = process.env.AI_PROVIDER ?? "mock";

/* ── Types ─────────────────────────────────────────────────── */
export type ContentFormat = "reel" | "carrusel" | "historia" | "post";
export type ContentPillar = "autoridad" | "conversion" | "confianza" | "atraccion";

/* ── System prompt ─────────────────────────────────────────── */
function buildSystemPrompt(
  format: ContentFormat,
  pillar: ContentPillar,
  context: string,
  zona: string
): string {
  const formatInstructions: Record<ContentFormat, string> = {
    reel: `Generá un guión para REEL de Instagram/TikTok (60-90 segundos).
Estructura OBLIGATORIA:
🎬 HOOK (primeros 3 segundos): Una frase que detenga el scroll. Directo, sorpresivo.
📱 DESARROLLO (cuerpo): 3-4 bloques cortos de texto/narración. Ritmo rápido.
🎯 CTA (llamada a acción): Una acción clara al cierre.
Indicá las transiciones visuales entre escenas entre [corchetes].`,

    carrusel: `Generá contenido para CARRUSEL de 6 slides de Instagram.
Estructura OBLIGATORIA:
📌 SLIDE 1 — PORTADA: Título impactante + subtítulo. Debe generar click.
📌 SLIDE 2-5 — CONTENIDO: Un punto fuerte por slide. Título + 2-3 líneas de texto.
📌 SLIDE 6 — CTA: Acción clara + frase de cierre memorable.
Separar cada slide con "---".`,

    historia: `Generá contenido para HISTORIA de Instagram (15 segundos).
Estructura OBLIGATORIA:
👁 VISUAL: Descripción de la imagen/video de fondo.
💬 TEXTO: Mensaje corto (máx 2 líneas). Con emojis.
🔗 CTA: Sticker o texto de acción ("Swipe up", "Respondé", "Guardá esto").`,

    post: `Generá un POST de feed para Instagram/Facebook.
Estructura OBLIGATORIA:
🪝 HOOK (primera línea): Frase que aparece antes del "ver más". Crucial.
📝 DESARROLLO: 3-5 párrafos cortos, con espacio entre ellos.
🎯 CTA: Pregunta o acción al final.
#️⃣ HASHTAGS: 10-15 hashtags relevantes al sector inmobiliario latinoamericano.`,
  };

  const pillarContext: Record<ContentPillar, string> = {
    autoridad: "Pilar AUTORIDAD — Posicionar al agente como experto del mercado. Educativo, datos concretos, tips profesionales.",
    conversion: "Pilar CONVERSIÓN — Objetivo directo: generar leads o consultas. Mostrar propiedades, ofertas, oportunidades de inversión.",
    confianza: "Pilar CONFIANZA — Testimonios, casos de éxito, proceso de trabajo transparente. Humanizar la marca.",
    atraccion: "Pilar ATRACCIÓN — Tendencias del mercado, curiosidades, noticias del sector. Generar alcance orgánico.",
  };

  return `Sos un especialista en marketing inmobiliario para Latinoamérica. Generás contenido para redes sociales de agentes y equipos inmobiliarios.

${pillarContext[pillar]}

Zona de operación: ${zona || "Latinoamérica"}
${context ? `Contexto adicional: ${context}` : ""}

${formatInstructions[format]}

REGLAS:
- Lenguaje informal latinoamericano (tuteo o vos según el tono)
- Directo al punto, sin relleno
- Orientado a resultados (captaciones y ventas)
- No uses emojis en exceso
- Respondé ÚNICAMENTE con el contenido, sin explicaciones previas ni cierre`;
}

/* ── Mock responses ────────────────────────────────────────── */
const MOCK_CONTENT: Record<ContentFormat, Record<ContentPillar, string>> = {
  reel: {
    autoridad: `🎬 HOOK
"¿Sabés cuánto vale realmente tu propiedad en este momento?"
[Corte rápido — texto en pantalla con cifras del mercado]

📱 DESARROLLO
"El mercado cambió. Lo que valía hace 6 meses hoy puede valer un 15% más — o menos."
[B-roll de barrio / fachada de propiedad]

"La diferencia entre vender bien y vender mal está en una sola cosa: el precio inicial."
[Agente revisando tablet con datos]

"Un precio alto = meses sin vender. Un precio bajo = plata que te quedás afuera."
[Texto animado comparando escenarios]

"La valuación profesional existe exactamente para evitar eso."
[Primer plano del agente hablando a cámara]

🎯 CTA
"¿Querés saber cuánto vale tu propiedad hoy? Escribime y te doy la valuación gratis. Link en bio."`,

    conversion: `🎬 HOOK
"Esta propiedad lleva 3 días publicada y ya tiene 12 consultas. ¿Querés saber por qué?"
[Imagen de la propiedad — luz natural, bien fotografiada]

📱 DESARROLLO
"Ubicación: [zona]. Superficie: [m²]. Precio: [monto]."
[Fotos de interiores con texto superpuesto]

"Tiene [característica 1], [característica 2] y [característica 3]."
[Detalle de ambientes clave]

"Zona con alta demanda y pocas unidades disponibles en este rango."
[Mapa de la zona]

🎯 CTA
"Si te interesa, respondé este video con 'INFO' y te mando los detalles completos antes de que se vaya."`,

    confianza: `🎬 HOOK
"[Nombre del cliente] tardó 4 meses buscando sola. Con nosotros encontró su casa en 3 semanas."
[Foto o video del cliente en la propiedad]

📱 DESARROLLO
"Cuando llegó a nosotros ya estaba agotada. Había visto 20 propiedades y nada cerraba."
[Agente conversando con el cliente — natural]

"Lo primero que hicimos fue entender qué necesitaba realmente, no lo que había buscado hasta entonces."
[Reunión de trabajo]

"En 21 días encontramos la propiedad. En 35 días firmó la escritura."
[Firma del contrato / entrega de llaves]

🎯 CTA
"¿Estás buscando y no encontrás? Contame tu caso y te ayudo a destrabar la búsqueda."`,

    atraccion: `🎬 HOOK
"El mercado inmobiliario en [zona] va a cambiar en los próximos 6 meses. Esto es lo que nadie te está diciendo."
[Mapa de la zona con indicadores]

📱 DESARROLLO
"Primero: la oferta bajó un 18% respecto al año pasado en este segmento."
[Gráfico animado]

"Segundo: la demanda de propiedades de 2-3 ambientes aumentó. Más personas buscando, menos propiedades disponibles."
[Estadística en pantalla]

"Tercero: los tiempos de venta se acortaron. Las propiedades bien valuadas se venden en menos de 45 días."
[Timeline comparativo]

🎯 CTA
"Guardá este video. En los próximos meses va a ser útil ya sea que quieras comprar, vender o invertir."`,
  },

  carrusel: {
    autoridad: `📌 SLIDE 1 — PORTADA
5 errores que cometen los propietarios al vender
(y cómo evitarlos antes de que te cuesten plata)

---
📌 SLIDE 2
❌ Error 1: Poner un precio por encima del mercado
El 70% de las propiedades sobrepreciadas no se venden en los primeros 90 días.
Empezar alto y bajar después destruye el interés inicial.

---
📌 SLIDE 3
❌ Error 2: Malas fotos
El 80% de los compradores decide si visita una propiedad por las fotos.
Con fotos amateur, perdés consultas antes de empezar.

---
📌 SLIDE 4
❌ Error 3: No tener la documentación lista
Si aparece un comprador serio y los papeles no están en orden, se pierde la operación.
Tené todo listo antes de publicar.

---
📌 SLIDE 5
❌ Error 4: Vender sin estrategia de marketing
Publicar en 1 portal no es una estrategia.
Hoy se necesita presencia en redes, anuncios y seguimiento activo de cada consulta.

---
📌 SLIDE 6 — CTA
¿Estás pensando en vender?
Hablemos antes de que cometas alguno de estos errores.
Escribime: [contacto]`,

    conversion: `📌 SLIDE 1 — PORTADA
Oportunidad de inversión en [zona]
Rendimiento estimado: 8% anual
Últimas unidades disponibles

---
📌 SLIDE 2
📍 Ubicación estratégica
A [X] minutos del centro
Acceso a [transporte/autopista]
Zona con valorización sostenida los últimos 3 años

---
📌 SLIDE 3
🏠 Características
[M²] cubiertos / [M²] totales
[N] ambientes — [N] dormitorios — [N] baños
[Característica diferencial: cochera, terraza, amenities]

---
📌 SLIDE 4
💰 Números que importan
Precio: [monto]
Expensas estimadas: [monto]
Alquiler potencial: [monto]/mes
ROI proyectado: [%] anual

---
📌 SLIDE 5
✅ Por qué ahora
Stock limitado en esta zona
Precio de preventa vigente hasta [fecha]
Financiación disponible en cuotas

---
📌 SLIDE 6 — CTA
¿Querés más información?
Respondé con "INVERSIÓN" o escribime al [contacto]
Te mando el brochure completo y coordinamos una visita`,

    confianza: `📌 SLIDE 1 — PORTADA
Así es cómo trabajamos con cada cliente
Transparencia total, de principio a fin

---
📌 SLIDE 2
🔍 Paso 1: Escuchamos
Antes de mostrar una sola propiedad, entendemos qué necesitás realmente.
Necesidades, presupuesto, prioridades.

---
📌 SLIDE 3
📊 Paso 2: Analizamos el mercado
Te mostramos datos reales: qué se está vendiendo, a qué precio, en cuánto tiempo.
Sin especulaciones.

---
📌 SLIDE 4
🏡 Paso 3: Selección filtrada
No te hacemos perder tiempo con propiedades que no cumplen tus criterios.
Solo te mostramos opciones que valen la visita.

---
📌 SLIDE 5
🤝 Paso 4: Acompañamiento hasta el final
Negociación, documentación, escritura.
Estamos en cada etapa, no solo en la firma.

---
📌 SLIDE 6 — CTA
¿Querés trabajar así?
Escribinos y contanos qué estás buscando.
La primera consulta es gratis y sin compromiso.`,

    atraccion: `📌 SLIDE 1 — PORTADA
Lo que está pasando en el mercado inmobiliario ahora mismo
Datos que todo propietario o inversor debería saber

---
📌 SLIDE 2
📈 El precio promedio subió
En [zona], el valor del m² aumentó un [X]% en los últimos 12 meses.
Quienes compraron hace 2 años ya tienen una ganancia real sobre el papel.

---
📌 SLIDE 3
⏱ Los tiempos de venta bajaron
Las propiedades bien valuadas se están vendiendo en menos de [X] días.
El mercado está activo — quienes tienen stock en orden lo están aprovechando.

---
📌 SLIDE 4
🏘 Los barrios que están creciendo
[Barrio 1]: nuevo polo gastronómico y comercial.
[Barrio 2]: obra de infraestructura terminada, acceso mejorado.
[Barrio 3]: demanda de familias en aumento.

---
📌 SLIDE 5
🔍 Lo que busca el comprador hoy
Espacios de trabajo en casa ✓
Exteriores (terraza, jardín, balcón) ✓
Precio por m² competitivo ✓

---
📌 SLIDE 6 — CTA
¿Tenés propiedades en alguna de estas zonas?
O, ¿estás buscando invertir?
Escribinos y te asesoramos sin costo.`,
  },

  historia: {
    autoridad: `👁 VISUAL
Fondo degradado oscuro con texto animado

💬 TEXTO
¿Sabés cuánto vale tu propiedad HOY? 🏠
El mercado cambió. Tu valuación, también.

🔗 CTA
→ Respondé "VALUACIÓN" para saberlo gratis`,

    conversion: `👁 VISUAL
Video corto (15s) recorriendo los ambientes principales de la propiedad

💬 TEXTO
Nueva propiedad disponible 🔑
[Zona] · [M²] · [Precio]

🔗 CTA
→ Deslizá o escribinos para más info`,

    confianza: `👁 VISUAL
Foto del momento de la entrega de llaves con el cliente (si hay permiso) o el "antes y después" de la búsqueda

💬 TEXTO
[Nombre] encontró su depto en 18 días 🎉
Así se trabaja cuando hay un sistema real detrás.

🔗 CTA
→ Contanos qué buscás — te ayudamos`,

    atraccion: `👁 VISUAL
Gráfico animado simple mostrando la tendencia del mercado en la zona

💬 TEXTO
El mercado en [zona] está en movimiento 📊
¿Sabés qué significa para vos?

🔗 CTA
→ Respondé este story y te explicamos`,
  },

  post: {
    autoridad: `🪝 ¿Por qué algunas propiedades se venden en 2 semanas y otras tardan más de 6 meses?

📝 No es suerte. No es magia. Es estrategia.

En 10 años trabajando en el mercado inmobiliario vi exactamente qué separa a las propiedades que vuelan de las que se quedan.

Y casi siempre se reduce a estos 3 factores:

1. Precio correcto desde el día uno
Entrar al mercado con el precio justo genera urgencia. Bajar el precio después de semanas sin consultas destruye la percepción de valor.

2. Presentación profesional
Fotos de calidad, descripción precisa, visibilidad en los canales correctos. No es opcional.

3. Respuesta rápida a cada consulta
El 70% de los compradores que no reciben respuesta en las primeras horas desaparece. El seguimiento es la diferencia entre cerrar y no cerrar.

🎯 Si estás pensando en vender, empezá por el principio: una valuación honesta y una estrategia clara.

¿Querés que revisemos juntos tu situación? Escribime o dejá tu comentario abajo.

#bienesinmuebles #ventadepropiedades #marketinginmobiliario #agenteinmobiliario #consejosinmobiliarios #inversióninmobiliaria #propiedades #realestate #inmobiliaria #mercadoinmobiliario #compraventa #asesoriainmobiliaria #inversión #propiedadesventa #bienes`,

    conversion: `🪝 Esta propiedad no va a durar. Y no lo digo para presionar — lo digo porque los números lo confirman.

📝 📍 [Zona] — Una de las áreas con mayor demanda activa en este momento.

Lo que ofrece:
→ [M²] cubiertos bien distribuidos
→ [N] dormitorios + [N] baños
→ [Característica diferencial]
→ [Amenity o detalle extra]
→ Precio: [monto]

El edificio tiene [años] y se nota en cada detalle. No es una propiedad que necesite trabajo — es una que necesita dueño.

Las consultas en los primeros 48 horas siempre son las más serias. Las que terminan en operación.

🎯 Si te interesa, escribime hoy. Te paso toda la información, coordino una visita y te explico el proceso sin letra chica.

No hay compromisos por preguntar.

#propiedadesventa #[zona]inmobiliaria #departamentoventa #oportunidadinmobiliaria #inmuebles #realestate #inversióninmobiliaria #propiedades #bienesinmuebles #mercadoinmobiliario #departamentos #casasventa #agenteinmobiliario #compraventa #nuevapropiedad`,

    confianza: `🪝 Me escribió [Nombre] hace 3 meses. Estaba frustrada. Llevaba 6 meses buscando y nada cerraba.

📝 No era un problema de presupuesto. Era un problema de estrategia.

Lo primero que hicimos fue parar la búsqueda activa y entender qué necesitaba realmente. No lo que había estado buscando hasta entonces.

En 4 conversaciones quedó claro: buscaba en el rango equivocado, en la zona equivocada, con criterios que en realidad no eran prioritarios para ella.

Reenfocamos. Filtramos. Priorizamos lo que importaba.

En 3 semanas encontramos 2 opciones que cumplían todo. Visitó las 2. Eligió una. En 35 días firmó la escritura.

No fue magia. Fue método.

🎯 Si estás buscando y sentís que algo no está funcionando, escribime. A veces lo que hace falta no es buscar más — es buscar diferente.

#testimonios #compradepropiedad #asesoriainmobiliaria #agenteinmobiliario #experienciainmobiliaria #bienesinmuebles #inmobiliaria #comprardepartamento #realestate #casos #éxito #comprarcasa #asesoramiento #mercadoinmobiliario #propiedades`,

    atraccion: `🪝 El mercado inmobiliario en [zona] está enviando señales que muy pocos están leyendo bien.

📝 No soy de los que venden urgencia artificial. Pero lo que está pasando merece atención.

En los últimos 90 días:

→ El stock disponible bajó un [X]%
→ Las consultas activas subieron
→ Los tiempos de venta se acortaron en propiedades correctamente valuadas

¿Qué significa esto en términos concretos?

Para quien quiere vender: probablemente este sea un buen momento. La demanda existe, la oferta se achicó.

Para quien quiere comprar: la ventana de negociación se está cerrando. No es el momento de esperar indefinidamente.

Para quien quiere invertir: los números de [zona] siguen siendo interesantes comparados con el resto del mercado.

Esto no es una predicción. Es lo que estoy viendo en el día a día.

🎯 ¿Tenés una propiedad en [zona] o estás pensando en moverte? Dejá tu consulta abajo o escribime. Te cuento cómo aplica a tu caso específico.

#mercadoinmobiliario #tendencias #análisisdelmercado #[zona]inmobiliaria #inversióninmobiliaria #realestate #propiedades #bienesinmuebles #agenteinmobiliario #oportunidad #compraventa #inmobiliaria #estrategiainmobiliaria #datos #noticias`,
  },
};

/* ── SSE helpers ───────────────────────────────────────────── */
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
      const chunkSize = 3;
      for (let i = 0; i < words.length; i += chunkSize) {
        const chunk =
          words.slice(i, i + chunkSize).join(" ") +
          (i + chunkSize < words.length ? " " : "");
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ text: chunk })}\n\n`)
        );
        await new Promise((r) => setTimeout(r, 50 + Math.random() * 30));
      }
      controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      controller.close();
    },
  });
}

/* ── POST handler ──────────────────────────────────────────── */
export async function POST(request: Request) {
  try {
    const { format, pillar, context, zona } = (await request.json()) as {
      format: ContentFormat;
      pillar: ContentPillar;
      context?: string;
      zona?: string;
    };

    /* ── MOCK ───────────────────────────────────────────────── */
    if (PROVIDER === "mock") {
      const content = MOCK_CONTENT[format]?.[pillar] ?? "Contenido generado.";
      return new Response(textToStream(content), { headers: SSE_HEADERS });
    }

    const system = buildSystemPrompt(format, pillar, context ?? "", zona ?? "");
    const userMessage = `Generá el contenido de tipo ${format} con pilar ${pillar}.${context ? ` Contexto: ${context}` : ""}`;

    /* ── GROQ ───────────────────────────────────────────────── */
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
              { role: "user", content: userMessage },
            ],
            max_tokens: 1024,
            stream: true,
          }),
        }
      );

      if (!groqRes.ok || !groqRes.body) {
        throw new Error(`Groq error: ${groqRes.status}`);
      }

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
                    encoder.encode(
                      `data: ${JSON.stringify({ text })}\n\n`
                    )
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

    /* ── ANTHROPIC ──────────────────────────────────────────── */
    if (PROVIDER === "anthropic") {
      const { default: Anthropic } = await import("@anthropic-ai/sdk");
      const anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
      });

      const stream = await anthropic.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 1024,
        system,
        messages: [{ role: "user", content: userMessage }],
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
                encoder.encode(
                  `data: ${JSON.stringify({ text: event.delta.text })}\n\n`
                )
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
    console.error("[/api/contenido/generate]", err);
    return new Response(
      JSON.stringify({ error: "Error al generar el contenido." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
