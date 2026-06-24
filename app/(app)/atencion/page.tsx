import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/server";
import { AIChat } from "@/components/dashboard/ai-chat";

export default async function AtencionPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = user
    ? await supabase.from("profiles").select("full_name, email").eq("id", user.id).single()
    : { data: null };

  const p = profile as { full_name?: string | null; email?: string | null } | null;
  const name =
    p?.full_name ?? user?.user_metadata?.full_name ?? user?.email?.split("@")[0] ?? undefined;

  return (
    <div className="flex flex-col flex-1 min-h-svh" style={{ backgroundColor: "#060609" }}>
      <header
        className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b px-4 md:px-6"
        style={{ backgroundColor: "#080812", borderColor: "rgba(255,255,255,0.08)" }}
      >
        <SidebarTrigger className="-ml-1" style={{ color: "#94a3b8" }} />
        <Separator orientation="vertical" className="h-4 opacity-30" />
        <span
          className="font-headline text-sm font-bold uppercase tracking-tighter"
          style={{ color: "#3b82f6" }}
        >
          Atención al cliente
        </span>
      </header>

      <AIChat endpoint="/api/atencion" userProfile={{ name, first_time: false }} />
    </div>
  );
}
