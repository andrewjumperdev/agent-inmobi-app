import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { ContenidoView } from "@/components/contenido/contenido-view";

export default function ContenidoPage() {
  return (
    <div
      className="flex flex-col flex-1 min-h-svh"
      style={{ backgroundColor: "#0b1326", color: "#dae2fd" }}
    >
      {/* Top bar */}
      <header
        className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between border-b px-4 md:px-6"
        style={{
          backgroundColor: "#0f172a",
          borderColor: "rgba(69,70,77,0.3)",
          boxShadow: "0 0 20px rgba(188,255,95,0.04)",
        }}
      >
        <div className="flex items-center gap-3">
          <SidebarTrigger className="-ml-1" style={{ color: "#c6c6cd" }} />
          <Separator orientation="vertical" className="h-4 opacity-30" />
          <div className="flex items-center gap-2">
            <span
              className="material-symbols-outlined text-base"
              style={{ color: "#bcff5f", fontVariationSettings: "'FILL' 1" }}
            >
              auto_awesome
            </span>
            <span
              className="font-headline text-sm font-bold uppercase tracking-tighter"
              style={{ color: "#dae2fd" }}
            >
              Contenido
            </span>
          </div>
        </div>

        {/* AI badge */}
        <div
          className="flex items-center gap-1.5 rounded-full border px-3 py-1"
          style={{
            borderColor: "rgba(188,255,95,0.25)",
            backgroundColor: "rgba(188,255,95,0.06)",
          }}
        >
          <span
            className="relative flex h-1.5 w-1.5"
          >
            <span
              className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
              style={{ backgroundColor: "#bcff5f" }}
            />
            <span
              className="relative inline-flex h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: "#bcff5f" }}
            />
          </span>
          <span
            className="font-label text-[10px] uppercase tracking-widest"
            style={{ color: "#bcff5f" }}
          >
            Agente activo
          </span>
        </div>
      </header>

      <ContenidoView />
    </div>
  );
}
