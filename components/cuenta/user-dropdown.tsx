"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Menu } from "@base-ui/react/menu";
import { LogOut, User, Loader2, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

/* ── Types ──────────────────────────────────────────────────── */
export interface SidebarUser {
  name?: string;
  email?: string;
  avatarUrl?: string;
  plan?: string;
  status?: string;
}

/* ── Plan badge ─────────────────────────────────────────────── */
const PLAN_STYLES: Record<string, { label: string; color: string; bg: string }> = {
  pro:   { label: "Pro",   color: "#bcff5f", bg: "rgba(188,255,95,0.12)" },
  trial: { label: "Trial", color: "#facc15", bg: "rgba(250,204,21,0.12)" },
  free:  { label: "Free",  color: "#94a3b8", bg: "rgba(148,163,184,0.12)" },
};

function getPlan(plan?: string, status?: string) {
  const key = plan?.toLowerCase() ?? (status === "trialing" ? "trial" : "free");
  return PLAN_STYLES[key] ?? PLAN_STYLES.free;
}

function getInitials(name?: string, email?: string) {
  if (name) return name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  if (email) return email[0].toUpperCase();
  return "U";
}

/* ── Avatar atom ────────────────────────────────────────────── */
function AvatarCircle({
  avatarUrl,
  initials,
  displayName,
  size,
}: {
  avatarUrl?: string;
  initials: string;
  displayName: string;
  size: "sm" | "md";
}) {
  const dim = size === "sm" ? "size-8" : "size-9";
  const text = size === "sm" ? "text-sm" : "text-sm";
  const radius = size === "sm" ? "rounded-full" : "rounded-xl";
  return (
    <div
      className={cn(dim, radius, "flex items-center justify-center font-bold shrink-0 overflow-hidden")}
      style={{ backgroundColor: "rgba(188,255,95,0.12)", color: "#bcff5f" }}
    >
      {avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={avatarUrl} alt={displayName} className={cn("size-full object-cover", radius)} />
      ) : (
        <span className={text}>{initials}</span>
      )}
    </div>
  );
}

/* ── Main component ─────────────────────────────────────────── */
export function UserDropdown({
  user,
  variant = "sidebar",
}: {
  user: SidebarUser;
  variant?: "sidebar" | "navbar";
}) {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  const plan = getPlan(user.plan, user.status);
  const initials = getInitials(user.name, user.email);
  const displayName = user.name ?? user.email?.split("@")[0] ?? "Usuario";

  async function handleSignOut() {
    setSigningOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  /* Trigger style varies by context */
  const triggerClass =
    variant === "navbar"
      ? cn(
          "flex items-center justify-center outline-none cursor-pointer",
          "rounded-full transition-opacity hover:opacity-80",
          "border",
        )
      : cn(
          "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-none",
          "transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
          "text-muted-foreground cursor-pointer",
        );

  return (
    <Menu.Root>
      <Menu.Trigger
        className={triggerClass}
        style={
          variant === "navbar"
            ? { borderColor: "rgba(188,255,95,0.3)" }
            : undefined
        }
      >
        <AvatarCircle
          avatarUrl={user.avatarUrl}
          initials={initials}
          displayName={displayName}
          size="sm"
        />
        {variant === "sidebar" && (
          <span className="truncate flex-1 text-left text-sm">{displayName}</span>
        )}
      </Menu.Trigger>

      <Menu.Portal>
        <Menu.Positioner
          side={variant === "navbar" ? "bottom" : "top"}
          align={variant === "navbar" ? "end" : "start"}
          sideOffset={8}
        >
          <Menu.Popup
            className={cn(
              "z-50 min-w-[230px] rounded-xl border border-border p-1 shadow-2xl",
              "origin-(--transform-origin)",
              "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
              "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
            )}
            style={{ backgroundColor: "#171f33", borderColor: "rgba(69,70,77,0.5)" }}
          >
            {/* User info header */}
            <div className="flex items-center gap-3 px-3 py-3 mb-1">
              <AvatarCircle
                avatarUrl={user.avatarUrl}
                initials={initials}
                displayName={displayName}
                size="md"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold truncate" style={{ color: "#dae2fd" }}>
                    {displayName}
                  </span>
                  <span
                    className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full shrink-0"
                    style={{ color: plan.color, backgroundColor: plan.bg }}
                  >
                    {plan.label}
                  </span>
                </div>
                {user.email && (
                  <p className="text-xs truncate mt-0.5" style={{ color: "#909097" }}>
                    {user.email}
                  </p>
                )}
              </div>
            </div>

            <div className="h-px mx-1 mb-1" style={{ backgroundColor: "rgba(69,70,77,0.5)" }} />

            {/* Mi cuenta */}
            <Menu.Item
              render={<Link href="/cuenta" />}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm outline-none",
                "cursor-pointer transition-colors",
              )}
              style={{ color: "#dae2fd" }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(188,255,95,0.07)")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              <div
                className="size-6 rounded-md flex items-center justify-center shrink-0"
                style={{ backgroundColor: "rgba(188,198,224,0.08)" }}
              >
                <User size={12} style={{ color: "#c6c6cd" }} />
              </div>
              <span className="flex-1">Mi cuenta</span>
              <ChevronRight size={13} style={{ color: "#45464d" }} />
            </Menu.Item>

            <div className="h-px mx-1 my-1" style={{ backgroundColor: "rgba(69,70,77,0.5)" }} />

            {/* Cerrar sesión */}
            <Menu.Item
              onClick={handleSignOut}
              disabled={signingOut}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm outline-none",
                "cursor-pointer transition-colors",
                "disabled:opacity-50 disabled:pointer-events-none",
              )}
              style={{ color: "#ff6b6b" }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(255,107,107,0.08)")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              <div
                className="size-6 rounded-md flex items-center justify-center shrink-0"
                style={{ backgroundColor: "rgba(255,107,107,0.1)" }}
              >
                {signingOut
                  ? <Loader2 size={12} className="animate-spin" style={{ color: "#ff6b6b" }} />
                  : <LogOut size={12} style={{ color: "#ff6b6b" }} />
                }
              </div>
              <span>{signingOut ? "Cerrando sesión…" : "Cerrar sesión"}</span>
            </Menu.Item>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}
