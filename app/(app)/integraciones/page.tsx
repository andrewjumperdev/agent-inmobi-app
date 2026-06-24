import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { WhatsAppConnect } from "@/components/integraciones/whatsapp-connect";

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
        <WhatsAppConnect />
      </div>
    </div>
  );
}
