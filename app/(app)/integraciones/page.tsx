import { PageHeader } from "@/components/page-header";
import { CalendarDays, Mic } from "lucide-react";
import { WhatsAppConnect } from "@/components/integraciones/whatsapp-connect";
import { AgentConfig } from "@/components/integraciones/agent-config";
import { ColdEmail } from "@/components/integraciones/cold-email";
import { SettingsCard } from "@/components/integraciones/settings-card";

export default function IntegracionesPage() {
  return (
    <div className="flex min-h-svh flex-1 flex-col bg-app-canvas text-foreground">
      <PageHeader title="Integraciones" subtitle="Canales y credenciales" icon="power" />

      <div className="flex-1 p-4 md:p-8">
        <h1 className="mb-1 text-lg font-bold" style={{ color: "var(--foreground)" }}>
          Canales
        </h1>
        <p className="mb-6 text-sm" style={{ color: "var(--muted-foreground)" }}>
          Conectá tus canales para que los agentes operen por ellos.
        </p>
        <div className="flex flex-col gap-6">
          <WhatsAppConnect />
          <AgentConfig />
          <ColdEmail />

          <SettingsCard
            title="Google Calendar"
            subtitle="Para que el agente agende reuniones y proponga horarios reales."
            icon={<CalendarDays size={20} style={{ color: "var(--info)" }} />}
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
            icon={<Mic size={20} style={{ color: "var(--info)" }} />}
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
