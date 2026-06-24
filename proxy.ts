import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createProxyClient } from "@/lib/supabase/proxy";

/** Locales soportados — landing page pública en /{lang} */
const LOCALES = ["en", "es", "fr"] as const;

/** Rutas de landing por locale — accesibles sin sesión, match exacto */
const LANDING_ROUTES = new Set(["/", ...LOCALES.map((l) => `/${l}`)]);

/**
 * Rutas públicas: accesibles sin sesión (match por prefijo).
 * Si el usuario YA tiene sesión, lo redirigimos al dashboard.
 */
const PUBLIC_ROUTES = ["/login", "/register"];

/**
 * Rutas de onboarding: requieren sesión pero no onboarding completado.
 */
const ONBOARDING_ROUTES = ["/onboarding"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Pasar siempre: archivos estáticos, rutas de API, y el callback de auth
  // (el callback llega sin sesión — Supabase la crea dentro del route handler)
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/auth/") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createProxyClient(request, response);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isLandingRoute = LANDING_ROUTES.has(pathname);
  const isPublicRoute = PUBLIC_ROUTES.some((r) => pathname.startsWith(r));
  const isOnboardingRoute = ONBOARDING_ROUTES.some((r) =>
    pathname.startsWith(r)
  );

  // Landing pages siempre accesibles, incluso con sesión activa
  if (isLandingRoute) return response;

  // ─── Usuario NO autenticado ────────────────────────────────
  if (!user) {
    // Intentó entrar a una ruta protegida → /login
    if (!isPublicRoute && !isOnboardingRoute) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return response;
  }

  // ─── Usuario autenticado ───────────────────────────────────

  // Si está en login/register → redirigir al dashboard (ya entró)
  if (isPublicRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Leer el perfil para saber si completó el onboarding
  const { data: profileData } = await supabase
    .from("profiles")
    .select("onboarding_completed")
    .eq("id", user.id)
    .single();

  const profile = profileData as { onboarding_completed: boolean } | null;
  const onboardingCompleted = profile?.onboarding_completed ?? false;

  // Si no completó el onboarding y no está en /onboarding → forzarlo
  if (!onboardingCompleted && !isOnboardingRoute) {
    return NextResponse.redirect(new URL("/onboarding", request.url));
  }

  // Si ya completó el onboarding y quiere volver a /onboarding → dashboard
  if (onboardingCompleted && isOnboardingRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
