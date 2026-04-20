import type { ActiveSequence, HistorialEntry, SequenceStep } from "./types";

export const SEQUENCE_STEPS: SequenceStep[] = [
  {
    day: 1,
    channel: "whatsapp",
    type: "respuesta",
    label: "Respuesta inmediata",
    template: `¡Hola {{nombre}}! 👋 Vi tu consulta sobre {{propiedad}} en {{zona}}.

Me llamo [Tu nombre] y trabajo con propiedades en esa zona.

¿Tenés 5 minutos para contarme un poco más sobre lo que buscás? Así puedo ayudarte mejor.`,
  },
  {
    day: 2,
    channel: "whatsapp",
    type: "seguimiento",
    label: "Seguimiento día 2",
    template: `Hola {{nombre}}, ¿pudiste ver la información que te mandé sobre {{propiedad}}?

Quería saber si tenés alguna pregunta o si te puedo mostrar opciones similares en {{zona}}.`,
  },
  {
    day: 3,
    channel: "whatsapp",
    type: "valor",
    label: "Contenido de valor",
    template: `{{nombre}}, te comparto algo que puede ser útil:

📍 El mercado en {{zona}} está activo ahora mismo — hay pocas unidades como {{propiedad}} disponibles en este rango de precio.

¿Querés que coordinemos una visita esta semana? Los horarios más pedidos se van rápido.`,
  },
  {
    day: 5,
    channel: "whatsapp",
    type: "reactivacion",
    label: "Reactivación",
    template: `Hola {{nombre}}, ¿seguís buscando en {{zona}}?

Tuve algunas novedades que podrían interesarte. Si querés te cuento en 5 minutos.`,
  },
  {
    day: 7,
    channel: "whatsapp",
    type: "cierre",
    label: "Cierre de secuencia",
    template: `{{nombre}}, te dejo este mensaje final por ahora.

Si en algún momento retomás la búsqueda en {{zona}}, acá estoy para ayudarte.

Mucha suerte con lo que estés buscando. 🤝`,
  },
];

const now = new Date();

function daysAgo(n: number) {
  return new Date(now.getTime() - n * 24 * 60 * 60 * 1000);
}

export const MOCK_ACTIVE: ActiveSequence[] = [
  {
    id: "seq-1",
    lead_name: "Martín García",
    lead_score: "hot",
    property_interest: "Departamento 3 amb",
    zona: "Palermo",
    phone: "+54 9 11 4123 5678",
    started_at: daysAgo(1),
    last_contact: daysAgo(1),
    current_step: 0,
    steps_done: ["sent"],
    status: "active",
    notes: "Busca para vivir, tiene pre-aprobación hipotecaria",
  },
  {
    id: "seq-2",
    lead_name: "Laura Méndez",
    lead_score: "warm",
    property_interest: "Casa con jardín",
    zona: "San Isidro",
    phone: "+54 9 11 5234 6789",
    started_at: daysAgo(2),
    last_contact: daysAgo(2),
    current_step: 1,
    steps_done: ["sent", "pending"],
    status: "active",
  },
  {
    id: "seq-3",
    lead_name: "Roberto Silva",
    lead_score: "hot",
    property_interest: "Local comercial",
    zona: "Microcentro",
    phone: "+54 9 11 6345 7890",
    started_at: daysAgo(3),
    last_contact: daysAgo(3),
    current_step: 2,
    steps_done: ["sent", "sent", "pending"],
    status: "active",
    notes: "Inversor, busca rendimiento",
  },
  {
    id: "seq-4",
    lead_name: "Ana Torres",
    lead_score: "warm",
    property_interest: "Departamento 2 amb",
    zona: "Belgrano",
    phone: "+54 9 11 7456 8901",
    started_at: daysAgo(5),
    last_contact: daysAgo(5),
    current_step: 3,
    steps_done: ["sent", "sent", "sent", "pending"],
    status: "active",
  },
  {
    id: "seq-5",
    lead_name: "Diego Fernández",
    lead_score: "cold",
    property_interest: "Terreno",
    zona: "Pilar",
    phone: "+54 9 11 8567 9012",
    started_at: daysAgo(7),
    last_contact: daysAgo(5),
    current_step: 4,
    steps_done: ["sent", "sent", "skipped", "sent", "pending"],
    status: "active",
  },
];

export const MOCK_HISTORIAL: HistorialEntry[] = [
  {
    id: "hist-1",
    lead_name: "Carolina Ramírez",
    lead_score: "hot",
    property_interest: "Penthouse",
    steps_completed: 3,
    total_steps: 5,
    outcome: "cita_coordinada",
    started_at: daysAgo(21),
    ended_at: daysAgo(18),
  },
  {
    id: "hist-2",
    lead_name: "Pablo Moreno",
    lead_score: "warm",
    property_interest: "Departamento 1 amb",
    steps_completed: 5,
    total_steps: 5,
    outcome: "sin_respuesta",
    started_at: daysAgo(14),
    ended_at: daysAgo(7),
  },
  {
    id: "hist-3",
    lead_name: "Valentina López",
    lead_score: "hot",
    property_interest: "Casa 4 amb",
    steps_completed: 2,
    total_steps: 5,
    outcome: "cerrado",
    started_at: daysAgo(30),
    ended_at: daysAgo(28),
  },
  {
    id: "hist-4",
    lead_name: "Juan Pérez",
    lead_score: "cold",
    property_interest: "Departamento 2 amb",
    steps_completed: 5,
    total_steps: 5,
    outcome: "descalificado",
    started_at: daysAgo(20),
    ended_at: daysAgo(13),
  },
  {
    id: "hist-5",
    lead_name: "Sofía Castillo",
    lead_score: "warm",
    property_interest: "PH con terraza",
    steps_completed: 4,
    total_steps: 5,
    outcome: "cita_coordinada",
    started_at: daysAgo(10),
    ended_at: daysAgo(3),
  },
];
