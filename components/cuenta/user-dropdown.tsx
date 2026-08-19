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

/* ── Plan badge ───────────────────────────────────────────────
 * Los tonos salen de tokens para que el badge siga al tema; el fondo se deriva
 * del mismo token con color-mix en vez de un rgba() paralelo que habría que
 * mantener sincronizado a mano. */
const PLAN_STYLES: Record<string, { label: string; token: string }> = {
  pro:   { label: "Pro",   token: "var(--info)" },
  trial: { label: "Trial", token: "var(--warning)" },
  free:  { label: "Free",  token: "var(--muted-foreground)" },
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
      className={cn(dim, radius, "flex shrink-0 items-center justify-center overflow-hidden bg-info/12 font-bold text-info")}
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
          "flex cursor-pointer items-center justify-center outline-none",
          "rounded-full border border-info/30 transition-opacity hover:opacity-80",
        )
      : cn(
          "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-none",
          "transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
          "text-muted-foreground cursor-pointer",
        );

  return (
    <Menu.Root>
      <Menu.Trigger className={triggerClass}>
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
              "z-50 min-w-[230px] rounded-xl border border-border bg-popover p-1 text-popover-foreground shadow-2xl",
              "origin-(--transform-origin)",
              "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
              "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
            )}
          >
            {/* Cabecera con los datos del usuario */}
            <div className="mb-1 flex items-center gap-3 px-3 py-3">
              <AvatarCircle
                avatarUrl={user.avatarUrl}
                initials={initials}
                displayName={displayName}
                size="md"
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="truncate text-sm font-semibold text-foreground">
                    {displayName}
                  </span>
                  <span
                    className="shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest"
                    style={{
                      color: plan.token,
                      backgroundColor: `color-mix(in oklab, ${plan.token} 14%, transparent)`,
                    }}
                  >
                    {plan.label}
                  </span>
                </div>
                {user.email && (
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {user.email}
                  </p>
                )}
              </div>
            </div>

            <div className="mx-1 mb-1 h-px bg-border" />

            {/* El hover va por clases, no por handlers de mouse en JS: así
                también responde al foco de teclado y no pisa el estilo cuando
                el menú se navega con flechas. */}
            <Menu.Item
              render={<Link href="/cuenta" />}
              className={cn(
                "flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-sm outline-none",
                "text-foreground transition-colors",
                "hover:bg-info/8 data-highlighted:bg-info/8",
              )}
            >
              <div className="flex size-6 shrink-0 items-center justify-center rounded-md bg-muted">
                <User size={12} className="text-muted-foreground" />
              </div>
              <span className="flex-1">Mi cuenta</span>
              <ChevronRight size={13} className="text-muted-foreground" />
            </Menu.Item>

            <div className="mx-1 my-1 h-px bg-border" />

            <Menu.Item
              onClick={handleSignOut}
              disabled={signingOut}
              className={cn(
                "flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-sm outline-none",
                "text-destructive transition-colors",
                "hover:bg-destructive/8 data-highlighted:bg-destructive/8",
                "disabled:pointer-events-none disabled:opacity-50",
              )}
            >
              <div className="flex size-6 shrink-0 items-center justify-center rounded-md bg-destructive/10">
                {signingOut ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <LogOut size={12} />
                )}
              </div>
              <span>{signingOut ? "Cerrando sesión…" : "Cerrar sesión"}</span>
            </Menu.Item>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}
