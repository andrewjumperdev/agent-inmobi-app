import { PageHeader } from "@/components/page-header";
import { ContenidoView } from "@/components/contenido/contenido-view";

export default function ContenidoPage() {
  return (
    <div className="flex min-h-svh flex-1 flex-col bg-app-canvas text-foreground">
      <PageHeader title="Contenido" icon="auto_awesome">
        {/* Badge de agente activo: el punto que late es decorativo, el texto es
            lo que comunica el estado. */}
        <span className="mr-1 hidden items-center gap-1.5 rounded-full border border-info/25 bg-info/6 px-3 py-1 sm:flex">
          <span className="relative flex size-1.5" aria-hidden>
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-info opacity-75" />
            <span className="relative inline-flex size-1.5 rounded-full bg-info" />
          </span>
          <span className="font-label text-[10px] uppercase tracking-widest text-info">
            Agente activo
          </span>
        </span>
      </PageHeader>

      <ContenidoView />
    </div>
  );
}
