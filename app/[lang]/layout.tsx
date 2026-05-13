import type { Metadata } from "next";
import { locales, type Locale } from "@/lib/i18n/get-dictionary";

export async function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export const metadata: Metadata = {
  title: "KORE AI — Predictive Real Estate Intelligence",
  description:
    "Deploy a proprietary AI infrastructure that automates property acquisition, lead nurturing, and deal closing.",
};

export default async function LandingLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  await params;
  return <>{children}</>;
}
