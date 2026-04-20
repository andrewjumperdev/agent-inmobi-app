export type Channel = "whatsapp" | "email";
export type SequenceStatus = "active" | "paused" | "completed" | "stopped";
export type LeadScore = "hot" | "warm" | "cold";
export type StepOutcome = "sent" | "pending" | "skipped";

export interface SequenceStep {
  day: 1 | 2 | 3 | 5 | 7;
  channel: Channel;
  type: "respuesta" | "seguimiento" | "valor" | "reactivacion" | "cierre";
  label: string;
  template: string; // has {{nombre}}, {{propiedad}}, {{zona}} placeholders
}

export interface ActiveSequence {
  id: string;
  lead_name: string;
  lead_score: LeadScore;
  property_interest: string;
  zona: string;
  phone?: string;
  email?: string;
  started_at: Date;
  last_contact: Date;
  current_step: number; // index 0-4 in SEQUENCE_STEPS
  steps_done: StepOutcome[];
  status: SequenceStatus;
  notes?: string;
}

export interface HistorialEntry {
  id: string;
  lead_name: string;
  lead_score: LeadScore;
  property_interest: string;
  steps_completed: number;
  total_steps: number;
  outcome: "cita_coordinada" | "sin_respuesta" | "descalificado" | "cerrado";
  started_at: Date;
  ended_at: Date;
}

export const SCORE_COLORS: Record<LeadScore, string> = {
  hot: "#ef4444",
  warm: "#f59e0b",
  cold: "#6366f1",
};

export const SCORE_LABELS: Record<LeadScore, string> = {
  hot: "Caliente",
  warm: "Tibio",
  cold: "Frío",
};

export const OUTCOME_LABELS: Record<HistorialEntry["outcome"], string> = {
  cita_coordinada: "Cita coordinada",
  sin_respuesta: "Sin respuesta",
  descalificado: "Descalificado",
  cerrado: "Cerrado",
};

export const OUTCOME_COLORS: Record<HistorialEntry["outcome"], string> = {
  cita_coordinada: "#22c55e",
  sin_respuesta: "#6366f1",
  descalificado: "#ef4444",
  cerrado: "#bcff5f",
};
