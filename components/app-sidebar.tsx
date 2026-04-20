"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  BotMessageSquare,
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

interface AppSidebarProps {
  userName?: string;
}

export function AppSidebar({ userName }: AppSidebarProps = {}) {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon">
      {/* Logo */}
      <SidebarHeader className="h-14 flex flex-row items-center justify-between px-3">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 group-data-[collapsible=icon]:hidden"
        >
          <BotMessageSquare
            className="size-5 shrink-0"
            style={{ color: "var(--ai)" }}
          />
          <span className="font-semibold tracking-tight text-foreground">
            InMobi
            <span className="text-muted-foreground font-normal">.ai</span>
          </span>
        </Link>
        <SidebarTrigger className="-mr-1" />
      </SidebarHeader>

      {/* Nav principal */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Módulos</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ITEMS.map((item) => {
                const active =
                  pathname === item.href ||
                  pathname.startsWith(item.href + "/");
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      render={<Link href={item.href} />}
                      isActive={active}
                      tooltip={item.label}
                    >
                      <item.icon />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer — avatar / cuenta */}
      <SidebarFooter className="p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              render={<Link href="/cuenta" />}
              isActive={pathname === "/cuenta"}
              tooltip="Mi cuenta"
              className="text-muted-foreground"
            >
              <div
                className="size-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
                style={{ backgroundColor: "rgba(188,255,95,0.15)", color: "#bcff5f" }}
              >
                {userName ? userName[0].toUpperCase() : "U"}
              </div>
              <span className="group-data-[collapsible=icon]:hidden truncate">
                {userName ?? "Mi cuenta"}
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
