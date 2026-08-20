import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { CalendarDays, Mic } from "lucide-react";
import { ColdEmail } from "@/components/integraciones/cold-email";
import { SettingsCard } from "@/components/integraciones/settings-card";

export default function IntegracionesPage() {
  return (
    <div className="flex min-h-svh flex-1 flex-col bg-app-canvas text-foreground">
      <PageHeader title="Integraciones" subtitle="Servicios y credenciales" icon="power" />

      <div className="flex-1 p-4 md:p-7">
        <h2 className="font-headline text-[21px] font-extrabold tracking-[-0.02em] text-foreground">
          Servicios conectados
        </h2>
        {/* Los canales de conversación se configuran en Atención, junto al
            agente que los usa. Acá quedan las credenciales de servicios que
            varios módulos comparten: el SMTP lo usan el cold email y el agente,
            el calendario lo usa el agendado. */}
        <p className="mb-6 mt-[3px] font-headline text-[13px] text-muted-foreground">
          Credenciales que usan varios módulos. Los canales por los que atiende
          tu agente se configuran en{" "}
          <Link href="/atencion" className="font-semibold text-info hover:opacity-80">
            Atención
          </Link>
          .
        </p>
        <div className="flex flex-col gap-6">
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
