"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

/**
 * Alterna entre modo mañana (claro) y noche (oscuro).
 *
 * Los dos iconos se renderizan SIEMPRE y se muestran/ocultan con la variante
 * `dark:` de Tailwind, que depende de la clase en <html>. Eso evita el patrón
 * habitual de `useState(mounted)`: en el servidor no se sabe el tema elegido,
 * así que decidir el icono en JS obliga a un render vacío inicial y provoca el
 * warning de setState-dentro-de-effect. Resolviéndolo por CSS no hay estado, no
 * hay mismatch de hidratación y el icono correcto aparece en el primer pintado.
 *
 * `resolvedTheme` solo se usa en el click, que por definición ocurre después de
 * montar, cuando ya tiene el valor real.
 */
export function ThemeToggle({ className = "" }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      // Etiqueta neutra: la específica ("activar modo noche") dependería del
      // tema actual, que en SSR no se conoce.
      aria-label="Cambiar entre modo claro y oscuro"
      title="Cambiar tema"
      className={`relative flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-lg
        text-muted-foreground transition-colors
        hover:bg-app-surface-hover hover:text-foreground
        focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-info ${className}`}
    >
      <Sun
        size={17}
        className="absolute rotate-0 scale-100 opacity-100 transition-all duration-300 dark:rotate-90 dark:scale-0 dark:opacity-0"
        aria-hidden
      />
      <Moon
        size={17}
        className="absolute -rotate-90 scale-0 opacity-0 transition-all duration-300 dark:rotate-0 dark:scale-100 dark:opacity-100"
        aria-hidden
      />
    </button>
  );
}
