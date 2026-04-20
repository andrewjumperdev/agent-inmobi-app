export type ContentFormat = "reel" | "carrusel" | "historia" | "post";
export type ContentPillar = "autoridad" | "conversion" | "confianza" | "atraccion";

export interface PiezaGuardada {
  id: string;
  format: ContentFormat;
  pillar: ContentPillar;
  context: string;
  zona: string;
  content: string;
  createdAt: Date;
}

export const FORMAT_LABELS: Record<ContentFormat, string> = {
  reel: "Reel",
  carrusel: "Carrusel",
  historia: "Historia",
  post: "Post",
};

export const FORMAT_ICONS: Record<ContentFormat, string> = {
  reel: "play_circle",
  carrusel: "view_carousel",
  historia: "fiber_manual_record",
  post: "image",
};

export const PILLAR_LABELS: Record<ContentPillar, string> = {
  autoridad: "Autoridad",
  conversion: "Conversión",
  confianza: "Confianza",
  atraccion: "Atracción",
};

export const PILLAR_COLORS: Record<ContentPillar, string> = {
  autoridad: "#6366f1",   // indigo — expertise
  conversion: "#f59e0b",  // amber — action
  confianza: "#22c55e",   // green — trust
  atraccion: "#ec4899",   // pink — reach
};

export const PILLAR_DESCRIPTIONS: Record<ContentPillar, string> = {
  autoridad: "Posicionarte como experto del mercado",
  conversion: "Generar consultas y leads directos",
  confianza: "Testimonios y casos de éxito",
  atraccion: "Tendencias y novedades del sector",
};
