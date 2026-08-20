import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { CalendarDays, Mic } from "lucide-react";
import { BarraProgreso } from "@/components/integraciones/barra-progreso";
import { WhatsAppConnect } from "@/components/integraciones/whatsapp-connect";
import { CanalesPendientes } from "@/components/integraciones/canales-pendientes";
import { ColdEmail } from "@/components/integraciones/cold-email";
import { SettingsCard } from "@/components/integraciones/settings-card";

export default function IntegracionesPage() {
  return (
    <div className="flex min-h-svh flex-1 flex-col bg-app-canvas text-foreground">
      <PageHeader title="Integraciones" subtitle="Canales y credenciales" icon="power" />

      <div className="flex-1 space-y-5 p-4 md:p-7">
        {/* Arriba de todo: responde "¿me falta algo?" sin obligar a recorrer la
            página entera ni a abrir cada tarjeta para ver su estado. */}
        <BarraProgreso />

        <div>
          <h2 className="font-headline text-[21px] font-extrabold tracking-[-0.02em] text-foreground">
            Canales de conversación
          </h2>
          <p className="mt-[3px] font-headline text-[13px] text-muted-foreground">
            Por acá atiende tu agente. Cómo se comporta al responder se define en{" "}
            <Link href="/atencion" className="font-semibold text-info hover:opacity-80">
              Atención
            </Link>
            .
          </p>
        </div>

        <div className="flex flex-col gap-5">
          <WhatsAppConnect />
          <ColdEmail />
          <CanalesPendientes />
        </div>

        <div className="pt-1">
          <h2 className="font-headline text-[21px] font-extrabold tracking-[-0.02em] text-foreground">
            Servicios
          </h2>
          <p className="mt-[3px] font-headline text-[13px] text-muted-foreground">
            Credenciales que le suman capacidades al agente. Sin ellas conversa
            igual, pero no puede agendar ni mandar audios.
          </p>
        </div>

        <div className="flex flex-col gap-5">
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
