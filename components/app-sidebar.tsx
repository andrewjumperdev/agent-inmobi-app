"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  FileText,
  LayoutDashboard,
  Magnet,
  MessageSquareMore,
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
  { label: "Contenido",   href: "/contenido",    icon: FileText },
  { label: "Seguimiento", href: "/seguimiento",  icon: MessageSquareMore },
  { label: "Analytics",   href: "/analytics",    icon: BarChart3 },
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
        <span style={{ color: "#f1f5f9" }}>KORE </span>
        <span
          style={{
            background: "linear-gradient(135deg, #93c5fd 0%, #2563eb 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          AI
        </span>
      </span>
      <span className="font-label text-[7px] uppercase tracking-[0.18em]" style={{ color: "#1e293b" }}>
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
    <Sidebar
      collapsible="icon"
      style={{ backgroundColor: "#08080f", borderRight: "1px solid rgba(255,255,255,0.05)" }}
    >
      {/* Logo */}
      <SidebarHeader
        className="h-16 flex flex-row items-center justify-between px-4"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
      >
        <Link href="/dashboard" className="flex items-center gap-3 group-data-[collapsible=icon]:hidden">
          <KoreLogo size={26} />
          <KoreWordmark />
        </Link>
        <Link href="/dashboard" className="hidden group-data-[collapsible=icon]:flex items-center justify-center">
          <KoreLogo size={22} />
        </Link>
        <SidebarTrigger className="-mr-1 group-data-[collapsible=icon]:hidden" style={{ color: "#334155" }} />
      </SidebarHeader>

      {/* Nav */}
      <SidebarContent style={{ backgroundColor: "#08080f" }}>
        <SidebarGroup>
          <SidebarGroupLabel
            className="font-label text-[9px] uppercase tracking-[0.22em] px-4"
            style={{ color: "#1e293b" }}
          >
            Módulos
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ITEMS.map((item) => {
                const active = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      render={<Link href={item.href} />}
                      isActive={active}
                      tooltip={item.label}
                      className="mx-2 rounded-lg"
                      style={
                        active
                          ? {
                              backgroundColor: "rgba(59,130,246,0.1)",
                              color: "#93c5fd",
                              border: "1px solid rgba(59,130,246,0.15)",
                            }
                          : { color: "#475569" }
                      }
                    >
                      <item.icon style={{ width: 15, height: 15 }} />
                      <span className="font-medium text-sm">{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter
        className="p-3"
        style={{ borderTop: "1px solid rgba(255,255,255,0.05)", backgroundColor: "#08080f" }}
      >
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              render={<Link href="/cuenta" />}
              isActive={pathname === "/cuenta"}
              tooltip="Mi cuenta"
              style={{ color: "#475569" }}
            >
              <div
                className="size-6 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0"
                style={{
                  background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                  color: "#ffffff",
                }}
              >
                {userName ? userName[0].toUpperCase() : "U"}
              </div>
              <span className="group-data-[collapsible=icon]:hidden truncate text-sm font-medium" style={{ color: "#475569" }}>
                {userName ?? "Mi cuenta"}
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
