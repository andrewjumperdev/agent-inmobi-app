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

const NAV_ITEMS = [
  { label: "Dashboard",   href: "/dashboard",   icon: LayoutDashboard },
  { label: "CRM",         href: "/crm",          icon: Users },
  { label: "Captación",   href: "/captacion",    icon: Magnet },
  { label: "Atención",    href: "/atencion",     icon: Headset },
  { label: "Contenido",   href: "/contenido",    icon: FileText },
  { label: "Seguimiento", href: "/seguimiento",  icon: MessageSquareMore },
  { label: "Analytics",   href: "/analytics",    icon: BarChart3 },
  { label: "Integraciones", href: "/integraciones", icon: Plug },
];

/* ── KR logomark ─────────────────────────────────────────────── */
function KoreLogo({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-label="KORE AI">
      <defs>
        <linearGradient id="kr-blue" x1="16" y1="2" x2="30" y2="30" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#93c5fd" />
          <stop offset="100%" stopColor="#2563eb" />
        </linearGradient>
      </defs>
      {/* K — white */}
      <path d="M2 4h4v9.5L13.5 4h5.2L11 14l8 14h-5l-5.5-9.8L6 20v8H2V4Z" fill="white" />
      {/* R — blue gradient */}
      <path d="M20 4h7c3 0 5 1.8 5 4.8 0 2.2-1.1 3.8-2.9 4.6L33 20h-4.5l-2.7-6H24v6h-4V4Zm4 3.2v4.2h2.5c1.2 0 2-.8 2-2.1s-.8-2.1-2-2.1H24Z" fill="url(#kr-blue)" />
    </svg>
  );
}

/* ── Wordmark ────────────────────────────────────────────────── */
function KoreWordmark() {
  return (
    <div className="flex flex-col leading-none group-data-[collapsible=icon]:hidden">
      <span className="font-headline text-[15px] font-black uppercase tracking-[0.1em]">
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
      {/* Antes iba en #1e293b sobre un fondo #08080f: contraste ~1.3:1, o sea
          prácticamente invisible. Ahora usa el token muted del sidebar. */}
      <span className="font-label text-[7px] uppercase tracking-[0.18em] text-muted-foreground">
        OS for Growth
      </span>
    </div>
  );
}

interface AppSidebarProps {
  userName?: string;
}

export function AppSidebar({ userName }: AppSidebarProps = {}) {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" className="border-r border-app-border">
      {/* Logo */}
      <SidebarHeader className="flex h-16 flex-row items-center justify-between border-b border-app-border px-4">
        <Link href="/dashboard" className="flex items-center gap-3 group-data-[collapsible=icon]:hidden">
          <KoreLogo size={26} />
          <KoreWordmark />
        </Link>
        <Link href="/dashboard" className="hidden group-data-[collapsible=icon]:flex items-center justify-center">
          <KoreLogo size={22} />
        </Link>
        <SidebarTrigger className="-mr-1 text-muted-foreground group-data-[collapsible=icon]:hidden" />
      </SidebarHeader>

      {/* Nav */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 font-label text-[9px] uppercase tracking-[0.22em] text-muted-foreground">
            Módulos
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ITEMS.map((item) => {
                const active = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <SidebarMenuItem key={item.href}>
                    {/* La ruta activa se marca por color de fondo Y por peso de
                        texto: el color solo no alcanza si el contraste del tema
                        claro atenúa el resalte. */}
                    <SidebarMenuButton
                      render={<Link href={item.href} />}
                      isActive={active}
                      tooltip={item.label}
                      aria-current={active ? "page" : undefined}
                      className={`mx-2 rounded-lg transition-colors ${
                        active
                          ? "bg-info/10 font-semibold text-info ring-1 ring-info/20"
                          : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
                      }`}
                    >
                      <item.icon style={{ width: 15, height: 15 }} />
                      <span className="text-sm">{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="border-t border-app-border p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              render={<Link href="/cuenta" />}
              isActive={pathname === "/cuenta"}
              tooltip="Mi cuenta"
              className="text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
            >
              <div
                className="flex size-6 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold text-white"
                style={{ background: "linear-gradient(135deg, #3b82f6, #1d4ed8)" }}
              >
                {userName ? userName[0].toUpperCase() : "U"}
              </div>
              <span className="truncate text-sm font-medium group-data-[collapsible=icon]:hidden">
                {userName ?? "Mi cuenta"}
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
