import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { EscalationsQueue } from "@/components/seguimiento/escalations-queue";
import { koreGet } from "@/lib/kore/server";
import type { EscalationOut } from "@/lib/kore/client";

export default async function SeguimientoPage() {
  const items = await koreGet<EscalationOut[]>("/escalations?status=open", []);

  return (
    <div className="flex flex-col flex-1 min-h-svh" style={{ backgroundColor: "#060609" }}>
      <header
        className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b px-4 md:px-6"
        style={{ backgroundColor: "#080812", borderColor: "rgba(255,255,255,0.08)" }}
      >
        <SidebarTrigger className="-ml-1" style={{ color: "#94a3b8" }} />
        <Separator orientation="vertical" className="h-4 opacity-30" />
        <span className="font-headline text-sm font-bold uppercase tracking-tighter" style={{ color: "#3b82f6" }}>
          Seguimiento
        </span>
        <span className="text-[10px] uppercase tracking-widest" style={{ color: "#334155" }}>
          Cola humana
        </span>
      </header>

      <EscalationsQueue items={items} />
    </div>
  );
}
