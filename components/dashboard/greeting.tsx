"use client";

/**
 * Saludo según la hora — calculado en el NAVEGADOR, a propósito.
 *
 * En el servidor el contenedor corre en UTC: a las 21:00 en Argentina serían
 * las 00:00 UTC y el saludo diría "buen día" a alguien que está cerrando el día.
 * La hora local solo la sabe el cliente.
 *
 * Se resuelve durante el render (no en un efecto) y se marca con
 * `suppressHydrationWarning`, que existe justo para este caso: texto que
 * legítimamente difiere entre servidor y cliente por depender del reloj o de la
 * localización. Con un efecto habría un parpadeo "Hola" → "Buenas tardes" y el
 * warning de setState-dentro-de-effect.
 */
function greetingFor(hour: number): string {
  if (hour < 6) return "Buenas noches";
  if (hour < 13) return "Buen día";
  if (hour < 20) return "Buenas tardes";
  return "Buenas noches";
}

export function Greeting({ name }: { name: string }) {
  const greeting =
    typeof window === "undefined" ? "Hola" : greetingFor(new Date().getHours());

  return (
    <h1
      className="text-xl font-bold tracking-tight text-foreground"
      suppressHydrationWarning
    >
      {greeting}, {name}
    </h1>
  );
}
