import { PageHeader } from "@/components/page-header";
import { createClient } from "@/lib/supabase/server";
import { AtencionPanel } from "@/components/atencion/panel";

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
    <div className="flex min-h-svh flex-1 flex-col bg-app-canvas text-foreground">
      <PageHeader
        title="Atención al cliente"
        subtitle="Tu agente y sus canales"
        icon="headset_mic"
      />

      <AtencionPanel userName={name} />
    </div>
  );
}
