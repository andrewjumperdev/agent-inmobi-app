import type { NextConfig } from "next";

/**
 * Cabeceras de seguridad aplicadas a todas las respuestas.
 *
 * No hay CSP acá a propósito: Next inyecta scripts inline con hashes/nonces
 * propios y una CSP mal calibrada rompe la hidratación de forma intermitente y
 * difícil de diagnosticar. Conviene agregarla como paso aparte, midiendo con
 * `Content-Security-Policy-Report-Only` antes de hacerla efectiva.
 */
const securityHeaders = [
  // Fuerza HTTPS en visitas siguientes (Vercel ya sirve TLS).
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  // El navegador no debe adivinar el tipo de contenido: evita que un archivo
  // subido por un usuario se interprete como script.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Anti clickjacking del dashboard.
  { key: "X-Frame-Options", value: "DENY" },
  // No filtrar la ruta interna del dashboard al navegar a sitios externos.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // El producto no usa cámara, micrófono ni geolocalización.
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
];

const nextConfig: NextConfig = {
  // Oculta la versión de Next: es información gratis para quien busque un CVE.
  poweredByHeader: false,

  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
