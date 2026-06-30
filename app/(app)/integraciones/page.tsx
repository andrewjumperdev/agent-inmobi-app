import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { CalendarDays, Mic } from "lucide-react";
import { WhatsAppConnect } from "@/components/integraciones/whatsapp-connect";
import { AgentConfig } from "@/components/integraciones/agent-config";
import { ColdEmail } from "@/components/integraciones/cold-email";
import { SettingsCard } from "@/components/integraciones/settings-card";

export default function IntegracionesPage() {
  return (
    <div className="flex flex-col flex-1 min-h-svh" style={{ backgroundColor: "#060609" }}>
      <header
        className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b px-4 md:px-6"
        style={{ backgroundColor: "#080812", borderColor: "rgba(255,255,255,0.08)" }}
      >
        <SidebarTrigger className="-ml-1" style={{ color: "#94a3b8" }} />
        <Separator orientation="vertical" className="h-4 opacity-30" />
        <span
          className="font-headline text-sm font-bold uppercase tracking-tighter"
          style={{ color: "#3b82f6" }}
        >
          Integraciones
        </span>
      </header>

      <div className="flex-1 p-4 md:p-8">
        <h1 className="mb-1 text-lg font-bold" style={{ color: "#f1f5f9" }}>
          Canales
        </h1>
        <p className="mb-6 text-sm" style={{ color: "#64748b" }}>
          Conectá tus canales para que los agentes operen por ellos.
        </p>
        <div className="flex flex-col gap-6">
          <WhatsAppConnect />
          <AgentConfig />
          <ColdEmail />

          <SettingsCard
            title="Google Calendar"
            subtitle="Para que el agente agende reuniones y proponga horarios reales."
            icon={<CalendarDays size={20} style={{ color: "#3b82f6" }} />}
            endpoint="/api/integraciones/calendar"
            fields={[
              { key: "calendar_id", label: "ID del calendario", full: true },
              { key: "client_id", label: "Client ID (OAuth)", full: true },
              { key: "client_secret", label: "Client Secret", secret: true, full: true },
              { key: "refresh_token", label: "Refresh Token", secret: true, full: true },
              { key: "timezone", label: "Zona horaria (ej: America/Argentina/Buenos_Aires)", full: true },
            ]}
            hint="El calendario debe estar compartido con la cuenta del OAuth con permiso para editar eventos."
          />

          <SettingsCard
            title="ElevenLabs (voz)"
            subtitle="Para responder con notas de voz por WhatsApp."
            icon={<Mic size={20} style={{ color: "#3b82f6" }} />}
            endpoint="/api/integraciones/elevenlabs"
            fields={[
              { key: "api_key", label: "API Key", secret: true, full: true },
              { key: "voice_id", label: "Voice ID", full: true },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
