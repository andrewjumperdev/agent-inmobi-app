import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/theme-toggle";

/**
 * Barra superior compartida por todas las pestañas.
 *
 * Antes cada página tenía su propia copia casi idéntica, con los colores
 * clavados. El costo real de eso no era la duplicación sino la deriva: el
 * selector de tema vivía solo en el dashboard, así que en el resto de la app no
 * había forma de cambiar de modo. Un único componente garantiza que todo lo que
 * se agregue acá (toggle, notificaciones, buscador) aparezca en todas.
 */
export function PageHeader({
  title,
  subtitle,
  icon,
  children,
}: {
  title: string;
  /** Contexto corto a la derecha del título (ej. "Cola humana"). */
  subtitle?: string;
  /** Nombre del Material Symbol que identifica la sección. */
  icon?: string;
  /** Acciones extra, antes del toggle. */
  children?: React.ReactNode;
}) {
  return (
    <header className="sticky top-0 z-30 flex h-[60px] shrink-0 items-center gap-3 border-b border-app-border bg-app-topbar px-4 backdrop-blur-md md:px-6">
      <SidebarTrigger className="-ml-1 text-muted-foreground" />
      <Separator orientation="vertical" className="h-4 opacity-40" />

      {icon && (
        <span
          className="material-symbols-outlined -mr-1 text-lg text-info"
          style={{ fontVariationSettings: "'FILL' 1" }}
          aria-hidden
        >
          {icon}
        </span>
      )}
      <h1 className="font-headline text-[13px] font-extrabold uppercase tracking-[0.02em] text-foreground">
        {title}
      </h1>
      {subtitle && (
        <span className="hidden font-label text-[9.5px] font-semibold uppercase tracking-[0.18em] text-app-label sm:inline">
          {subtitle}
        </span>
      )}

      {/* ml-auto empuja las acciones a la derecha sin necesidad de un wrapper
          vacío que ocupe el espacio del medio. */}
      <div className="ml-auto flex items-center gap-1">
        {children}
        <ThemeToggle />
      </div>
    </header>
  );
}
