/**
 * Cliente del backend KORE IA (FastAPI).
 *
 * ⚠️ SOLO server-side. Toma la API key del tenant (kore_…) y la inyecta como
 * `Authorization: Bearer …`. Nunca debe importarse desde un Client Component:
 * usa `KORE_BACKEND_URL` (sin prefijo NEXT_PUBLIC_), así que en el bundle del
 * cliente la URL sería `undefined` y el fetch fallaría de inmediato.
 *
 * Este es el ÚNICO módulo del frontend que habla con el FastAPI.
 */

const BASE_URL = process.env.KORE_BACKEND_URL ?? "http://localhost:8000/api/v1";

export class KoreError extends Error {
  constructor(
    public status: number,
    message: string,
    public body?: unknown
  ) {
    super(message);
    this.name = "KoreError";
  }
}

type FetchOpts = {
  /** API key del tenant (kore_…). Omitir para endpoints sin auth (ej. POST /tenants). */
  apiKey?: string;
  method?: string;
  body?: unknown;
  signal?: AbortSignal;
};

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export async function koreFetch<T>(path: string, opts: FetchOpts = {}): Promise<T> {
  const { apiKey, method = "GET", body, signal } = opts;

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (apiKey) headers.Authorization = `Bearer ${apiKey}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
    signal,
    cache: "no-store",
  });

  const text = await res.text();
  const data = text ? safeJson(text) : null;

  if (!res.ok) {
    const detail =
      (data as { detail?: unknown } | null)?.detail ?? res.statusText;
    throw new KoreError(
      res.status,
      `KORE ${method} ${path} → ${res.status}: ${String(detail)}`,
      data
    );
  }

  return data as T;
}

/* ── Tipos espejo de los schemas del backend ───────────────────────────────── */

/** Respuesta de POST /agents/run (app/schemas/agent.py::AgentRunOut).
 *  `output` = AgentResult.to_dict(): { output, reply, temperature, … }. */
export interface AgentRunOut {
  id: string;
  agent: string;
  status: string;
  output: AgentResultDict;
  input_tokens: number;
  output_tokens: number;
  latency_ms: number;
}

export interface AgentResultDict {
  agent?: string;
  /** JSON crudo del LLM. Para el Coach: { industry, icp, value_props, strategy, summary, … }. */
  output?: Record<string, unknown>;
  /** Texto conversacional listo para mostrar (Coach: = output.summary). */
  reply?: string | null;
  temperature?: string | null;
  needs_qualification?: boolean;
  modules_to_enable?: string[];
  facts?: Record<string, unknown>;
  [key: string]: unknown;
}

/** Respuesta de POST /tenants (app/schemas/tenant.py::TenantCreated). */
export interface TenantCreated {
  id: string;
  name: string;
  slug: string;
  niche_id: string;
  is_active: boolean;
  enabled_modules: string[];
  diagnosis_completed_at: string | null;
  activated_at: string | null;
  business_profile: Record<string, unknown>;
  /** kore_… — se muestra UNA sola vez. Guardar server-side. */
  api_key: string;
}

/* ── Helpers tipados ───────────────────────────────────────────────────────── */

/** Corre cualquier agente de la cadena. `mode=sync` ejecuta inline y devuelve el
 *  output estructurado; `mode=async` lo encola en el worker. */
export function runAgent(
  apiKey: string,
  agent: string,
  payload: Record<string, unknown>,
  opts: { mode?: "sync" | "async"; signal?: AbortSignal } = {}
): Promise<AgentRunOut> {
  return koreFetch<AgentRunOut>("/agents/run", {
    apiKey,
    method: "POST",
    body: { agent, payload, mode: opts.mode ?? "sync" },
    signal: opts.signal,
  });
}

/** Provisiona un cliente como instancia de un nicho (P2). Devuelve su API key
 *  (mostrada una sola vez). Endpoint sin auth en esta etapa. */
export function createTenant(input: {
  name: string;
  slug: string;
  niche_slug: string;
}): Promise<TenantCreated> {
  return koreFetch<TenantCreated>("/tenants", { method: "POST", body: input });
}

/** Contacto del CRM (GET /contacts). */
export interface ContactOut {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  lifecycle_stage: string; // lead | qualified | in_proposal | customer | lost
  temperature: string; // unset | cold | warm | hot
  attributes: Record<string, string>; // role, company, pain, … capturados por el agente
  last_activity_at: string | null;
  created_at: string;
}

/** Mensaje de la conversación de un contacto (GET /contacts/{id}/messages). */
export interface MessageOut {
  id: string;
  direction: string; // inbound | outbound | system
  role: string;
  author_agent: string | null;
  body: string;
  created_at: string;
}

/** Snapshot de métricas del orquestador (GET /metrics, §08). */
export interface MetricsSnapshot {
  leads_new_7d: number;
  temperature_distribution: Record<string, number>;
  auto_classification_rate: number;
  cold_share: number;
  plaud_leads: number;
  open_escalations: number;
  mrr_cents: number;
  subscription_status: string;
  alerts: { metric: string; issue: string; action: string }[];
}

/** Escalación / cola humana (GET /escalations, P3). */
export interface EscalationOut {
  id: string;
  reason: string;
  status: string;
  source_agent: string | null;
  contact_id: string | null;
  title: string;
  executive_summary: string;
  payload: Record<string, unknown>;
  created_at: string;
  resolved_at: string | null;
}

/** Extrae el texto conversacional de un AgentRunOut, robusto a la forma del agente. */
export function agentReplyText(run: AgentRunOut): string {
  const out = run.output ?? {};
  const inner = (out.output ?? {}) as Record<string, unknown>;
  return (
    (out.reply as string | undefined) ||
    (inner.summary as string | undefined) ||
    (inner.strategy as string | undefined) ||
    ""
  );
}
