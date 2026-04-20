import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { defaultLocale, locales, type Locale } from "@/lib/i18n/get-dictionary";

function detectLocale(acceptLanguage: string): Locale {
  const lower = acceptLanguage.toLowerCase();
  for (const locale of locales) {
    if (lower.includes(locale)) return locale;
  }
  return defaultLocale;
}

export default async function RootPage() {
  const headersList = await headers();
  const acceptLanguage = headersList.get("accept-language") ?? "";
  const locale = detectLocale(acceptLanguage);
  redirect(`/${locale}`);
}
