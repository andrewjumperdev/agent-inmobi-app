"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  FileText,
  Headset,
  LayoutDashboard,
  Magnet,
  MessageSquareMore,
  Plug,
  Users,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar";

/** Contadores en el nav.
 *
 * `count` es informativo (cuántos hay) y `badge` es demanda de atención. La
 * distinción es del diseño y vale la pena respetarla: un número gris dice
 * "esto tiene 47 cosas"; un badge ámbar dice "esto te está esperando". Si
 * ambos se vieran igual, el que importa se perdería entre los que no. */
type NavCounts = { crm?: number; seguimiento?: number };

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "CRM", href: "/crm", icon: Users, count: "crm" },
  { label: "Captación", href: "/captacion", icon: Magnet },
  { label: "Atención", href: "/atencion", icon: Headset },
  { label: "Contenido", href: "/contenido", icon: FileText },
  { label: "Seguimiento", href: "/seguimiento", icon: MessageSquareMore, badge: "seguimiento" },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
  { label: "Integraciones", href: "/integraciones", icon: Plug },
] as const;

/* ── KR logomark ─────────────────────────────────────────────── */
function KoreLogo({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-label="KORE AI"
      className="text-sidebar-foreground"
    >
      <defs>
        <linearGradient id="kr-blue" x1="16" y1="2" x2="30" y2="30" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#93c5fd" />
          <stop offset="100%" stopColor="#2563eb" />
        </linearGradient>
      </defs>
      {/* La K sigue al texto del sidebar. Estaba fija en blanco, lo que la hacía
          invisible sobre el rail claro; el degradado azul de la R sí funciona en
          ambos modos y se deja como está. */}
      <path d="M2 4h4v9.5L13.5 4h5.2L11 14l8 14h-5l-5.5-9.8L6 20v8H2V4Z" fill="currentColor" />
      <path
        d="M20 4h7c3 0 5 1.8 5 4.8 0 2.2-1.1 3.8-2.9 4.6L33 20h-4.5l-2.7-6H24v6h-4V4Zm4 3.2v4.2h2.5c1.2 0 2-.8 2-2.1s-.8-2.1-2-2.1H24Z"
        fill="url(#kr-blue)"
      />
    </svg>
  );
}

function KoreWordmark() {
  return (
    <div className="flex flex-col leading-none group-data-[collapsible=icon]:hidden">
      <span className="font-headline text-[14px] font-extrabold uppercase tracking-[0.1em]">
        <span className="text-sidebar-foreground">KORE </span>
        <span
          style={{
            background: "linear-gradient(135deg, #60a5fa 0%, #2563eb 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          AI
        </span>
      </span>
      <span className="font-label text-[7px] font-semibold uppercase tracking-[0.18em] text-app-label">
        OS for Growth
      </span>
    </div>
  );
}

/** Número informativo: se apaga en cero — un "0" gris al lado de CRM ocupa
 *  espacio para decir que no hay nada que ver. */
function Count({ value }: { value?: number }) {
  if (!value) return null;
  return (
    <span className="font-label text-[10px] font-semibold text-app-label group-data-[collapsible=icon]:hidden">
      {value}
    </span>
  );
}

/** Badge de atención: ámbar, el mismo tono que la cola humana usa en todo el
 *  producto. Lleva texto para lector de pantalla porque el color no se lee. */
function Badge({ value }: { value?: number }) {
  if (!value) return null;
  return (
    <span
      className="flex h-[17px] min-w-[17px] items-center justify-center rounded-[9px] px-1 font-label text-[10px] font-bold group-data-[collapsible=icon]:hidden"
      style={{ backgroundColor: "var(--temp-warm)", color: "#1a1305" }}
    >
      {value}
      <span className="sr-only"> pendientes de revisión</span>
    </span>
  );
}

export function AppSidebar({
  userName,
  counts = {},
}: {
  userName?: string;
  counts?: NavCounts;
}) {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" className="border-r border-app-border bg-app-rail">
      {/* UN solo logo. Antes había dos —uno para expandido y otro para
          colapsado— y en móvil se veían los dos: el Sheet del sidebar no lleva
          el `group` ni `data-collapsible`, así que ahí ninguna de esas clases
          aplica. El wordmark ya se oculta solo, con lo cual el segundo logo
          nunca hizo falta.
          El padding cae a cero al colapsar: con px-4 sobre los 48px del modo
          icono, el contenido no entra y queda descentrado. */}
      <SidebarHeader className="flex h-[60px] flex-row items-center justify-between gap-2 border-b border-app-border px-4 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
        <Link href="/dashboard" className="flex min-w-0 items-center gap-3">
          <KoreLogo size={26} />
          <KoreWordmark />
        </Link>
        <SidebarTrigger className="-mr-1 shrink-0 text-muted-foreground group-data-[collapsible=icon]:hidden" />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 pb-2 pt-4 font-label text-[9px] font-semibold uppercase tracking-[0.22em] text-app-label">
            Módulos
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5 px-2">
              {NAV_ITEMS.map((item) => {
                const active =
                  pathname === item.href || pathname.startsWith(item.href + "/");
                const count = "count" in item ? counts[item.count] : undefined;
                const badge = "badge" in item ? counts[item.badge] : undefined;

                return (
                  <SidebarMenuItem key={item.href}>
                    {/* La ruta activa se marca por fondo, anillo Y peso de texto.
                        Con solo color, el resalte se pierde en modo claro. */}
                    <SidebarMenuButton
                      render={<Link href={item.href} />}
                      isActive={active}
                      tooltip={item.label}
                      aria-current={active ? "page" : undefined}
                      className={`h-auto rounded-lg px-2.5 py-2 font-headline text-[13px] transition-colors group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0 ${
                        active
                          ? "bg-info/10 font-bold text-info ring-1 ring-info/20"
                          : "font-medium text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
                      }`}
                    >
                      <item.icon className="shrink-0" style={{ width: 17, height: 17 }} />
                      <span className="flex-1 group-data-[collapsible=icon]:hidden">{item.label}</span>
                      <Count value={count} />
                      <Badge value={badge} />
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-app-border p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              render={<Link href="/cuenta" />}
              isActive={pathname === "/cuenta"}
              tooltip="Mi cuenta"
              className="h-auto px-2.5 py-2 font-headline text-[13px] font-semibold text-muted-foreground transition-colors group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0 hover:bg-sidebar-accent hover:text-sidebar-foreground"
            >
              <span
                className="flex size-6 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold text-white"
                style={{ background: "linear-gradient(135deg, #3b82f6, #1d4ed8)" }}
              >
                {userName ? userName[0].toUpperCase() : "U"}
              </span>
              <span className="truncate group-data-[collapsible=icon]:hidden">
                {userName ?? "Mi cuenta"}
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
