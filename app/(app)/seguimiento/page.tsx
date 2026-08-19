import { PageHeader } from "@/components/page-header";
import { EscalationsQueue } from "@/components/seguimiento/escalations-queue";
import { koreGet } from "@/lib/kore/server";
import type { EscalationOut } from "@/lib/kore/client";

export default async function SeguimientoPage() {
  const items = await koreGet<EscalationOut[]>("/escalations?status=open", []);

  return (
    <div className="flex min-h-svh flex-1 flex-col bg-app-canvas text-foreground">
      <PageHeader
        title="Seguimiento"
        subtitle="Cola humana"
        icon="forum"
      />

      <EscalationsQueue items={items} />
    </div>
  );
}
