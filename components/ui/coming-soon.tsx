import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Hammer } from "lucide-react";

export function ComingSoon({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col flex-1 min-h-svh" style={{ backgroundColor: "#060609" }}>
      <header
        className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b px-4 md:px-6"
        style={{ backgroundColor: "#080812", borderColor: "rgba(255,255,255,0.08)" }}
      >
        <SidebarTrigger className="-ml-1" style={{ color: "#94a3b8" }} />
        <Separator orientation="vertical" className="h-4 opacity-30" />
        <span className="font-headline text-sm font-bold uppercase tracking-tighter" style={{ color: "#3b82f6" }}>
          {title}
        </span>
      </header>

      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4 text-center">
        <div
          className="flex h-14 w-14 items-center justify-center rounded-2xl"
          style={{ backgroundColor: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)" }}
        >
          <Hammer size={24} style={{ color: "#3b82f6" }} />
        </div>
        <div>
          <span
            className="rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest"
            style={{ backgroundColor: "rgba(234,179,8,0.12)", color: "#eab308" }}
          >
            Próximamente
          </span>
        </div>
        <h1 className="text-xl font-bold" style={{ color: "#f1f5f9" }}>{title}</h1>
        <p className="max-w-md text-sm leading-relaxed" style={{ color: "#64748b" }}>
          {description}
        </p>
      </div>
    </div>
  );
}
