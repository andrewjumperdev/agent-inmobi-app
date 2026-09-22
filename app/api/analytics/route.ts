/**
 * BFF de Analytics: el embudo, el valor del pipeline y de dónde viene todo.
 *
 * Tres lecturas en una sola respuesta. Cada una degrada por separado: si el
 * pipeline falla, la pantalla igual muestra las fuentes y la serie de leads.
 *
 * Lo que NO está acá, y es a propósito: costo por lead y rendimiento de
 * campañas. Requieren la inversión publicitaria de Meta/Google, que no
 * integramos. Inventar esos números sería mostrarle a un cliente que paga
 * métricas fabricadas sobre su propio negocio.
 */
import { getTenantCredentials } from "@/lib/kore/tenant";
import { koreFetch } from "@/lib/kore/client";

export interface StageSummary {
  stage: string;
  count: number;
  amount_cents: number;
  with_amount: number;
}

export interface Pipeline {
  stages: StageSummary[];
  open_amount_cents: number;
  won_amount_cents: number;
  currency: string;
  avg_days_to_close: number | null;
}

export interface SourceStat {
  source: string;
  total: number;
  last_at: string | null;
  unqualified: number;
}

export interface Metrics {
  leads_daily: { date: string; count: number }[];
  temperature_distribution: Record<string, number>;
  auto_classification_rate: number;
  cold_share: number;
  open_escalations: number;
  alerts: { metric: string; issue: string; action: string }[];
}

async function safe<T>(path: string, apiKey: string, fallback: T): Promise<T> {
  try {
    return await koreFetch<T>(path, { apiKey });
  } catch {
    return fallback;
  }
}

export async function GET() {
  const creds = await getTenantCredentials();
  if (!creds) return Response.json({ error: "no_session" }, { status: 401 });

  const [pipeline, sources, metrics] = await Promise.all([
    safe<Pipeline>("/deals/pipeline", creds.apiKey, {
      stages: [],
      open_amount_cents: 0,
      won_amount_cents: 0,
      currency: "USD",
      avg_days_to_close: null,
    }),
    safe<SourceStat[]>("/leads/sources", creds.apiKey, []),
    safe<Metrics>("/metrics", creds.apiKey, {
      leads_daily: [],
      temperature_distribution: {},
      auto_classification_rate: 0,
      cold_share: 0,
      open_escalations: 0,
      alerts: [],
    }),
  ]);

  return Response.json({ pipeline, sources, metrics });
}
