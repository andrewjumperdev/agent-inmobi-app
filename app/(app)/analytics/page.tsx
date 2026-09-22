import { PageHeader } from "@/components/page-header";
import { AnalyticsReal } from "@/components/analytics/analytics-real";

export default function AnalyticsPage() {
  return (
    <div className="flex min-h-svh flex-1 flex-col bg-app-canvas text-foreground">
      <PageHeader title="Analytics" subtitle="Embudo y rendimiento" icon="bar_chart" />
      <AnalyticsReal />
    </div>
  );
}
