import { getDictionary, type Locale } from "@/lib/i18n/get-dictionary";
import { LandingNav } from "@/components/landing/nav";
import { HeroSection } from "@/components/landing/hero";
import { SocialProofBar } from "@/components/landing/social-proof";
import { ProblemSection } from "@/components/landing/problem";
import { HowItWorksSection } from "@/components/landing/how-it-works";
import { FeaturesSection } from "@/components/landing/features";
import { ResultsSection } from "@/components/landing/results";
import { ComparisonSection } from "@/components/landing/comparison";
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
    <div className="min-h-screen" style={{ backgroundColor: "#060609", color: "#f1f5f9" }}>
      <LandingNav dict={dict} lang={lang} />
      <main>
        <HeroSection dict={dict} />
        <SocialProofBar dict={dict} />
        <ProblemSection dict={dict} />
        <HowItWorksSection dict={dict} />
        <FeaturesSection dict={dict} />
        <ResultsSection dict={dict} />
        <ComparisonSection dict={dict} />
        <DoneWithYouSection dict={dict} />
        <CTASection dict={dict} />
      </main>
      <LandingFooter dict={dict} />
    </div>
  );
}
