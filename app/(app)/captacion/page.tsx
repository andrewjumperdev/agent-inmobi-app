import { PageHeader } from "@/components/page-header";
import { Fuentes } from "@/components/captacion/fuentes";

export default function CaptacionPage() {
  return (
    <div className="flex min-h-svh flex-1 flex-col bg-app-canvas text-foreground">
      <PageHeader title="Captación" subtitle="Fuentes de leads" icon="campaign" />
      <Fuentes />
    </div>
  );
}
