import { PageHeader } from "@/components/page-header";
import { CrmBoard } from "@/components/crm/crm-board";
import { koreGet } from "@/lib/kore/server";
import type { ContactOut } from "@/lib/kore/client";

export default async function CrmPage() {
  const contacts = await koreGet<ContactOut[]>("/contacts", []);

  return (
    <div className="flex min-h-svh flex-1 flex-col bg-app-canvas text-foreground">
      <PageHeader title="CRM" subtitle="Pipeline de ventas" icon="group" />

      <CrmBoard contacts={contacts} />
    </div>
  );
}
