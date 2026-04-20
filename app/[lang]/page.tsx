import { getDictionary, type Locale } from "@/lib/i18n/get-dictionary";
import { LandingNav } from "@/components/landing/nav";
import { HeroSection } from "@/components/landing/hero";
import { SocialProofBar } from "@/components/landing/social-proof";
import { ComparisonSection } from "@/components/landing/comparison";
import { PhasesSection } from "@/components/landing/phases";
import { DoneWithYouSection } from "@/components/landing/done-with-you";
import { CTASection } from "@/components/landing/cta";
import { LandingFooter } from "@/components/landing/footer";

export default async function LandingPage({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "#0b1326", color: "#dae2fd" }}
    >
      <LandingNav dict={dict} lang={lang} />
      <main>
        <HeroSection dict={dict} />
        <SocialProofBar dict={dict} />
        <ComparisonSection dict={dict} />
        <PhasesSection dict={dict} />
        <DoneWithYouSection dict={dict} />
        <CTASection dict={dict} />
      </main>
      <LandingFooter dict={dict} />
    </div>
  );
}
