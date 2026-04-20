import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CuentaView } from "@/components/cuenta/cuenta-view";

export default async function CuentaPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "full_name, email, avatar_url, company_name, phone, subscription_plan, subscription_status, trial_ends_at, created_at"
    )
    .eq("id", user.id)
    .single();

  return (
    <CuentaView
      profile={profile ?? {
        full_name: null,
        email: null,
        avatar_url: null,
        company_name: null,
        phone: null,
        subscription_plan: null,
        subscription_status: null,
        trial_ends_at: null,
        created_at: null,
      }}
      authEmail={user.email ?? ""}
    />
  );
}
