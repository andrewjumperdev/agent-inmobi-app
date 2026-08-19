import { PageHeader } from "@/components/page-header";
import { Hammer } from "lucide-react";

export function ComingSoon({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex min-h-svh flex-1 flex-col bg-app-canvas text-foreground">
      <PageHeader title={title} icon="construction" />

      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4 text-center">
        <div className="flex size-14 items-center justify-center rounded-2xl border border-info/20 bg-info/10">
          <Hammer size={24} className="text-info" />
        </div>
        <span className="rounded-full bg-warning/12 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-warning">
          Próximamente
        </span>
        {/* El h1 de la página ya lo pone PageHeader; acá va un p destacado para
            no tener dos h1 compitiendo en el árbol de accesibilidad. */}
        <p className="text-xl font-bold text-foreground">{title}</p>
        <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  );
}
