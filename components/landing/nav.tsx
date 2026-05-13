"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import type { Dictionary, Locale } from "@/lib/i18n/get-dictionary";
import { locales } from "@/lib/i18n/get-dictionary";

const LANG_LABELS: Record<Locale, string> = { en: "EN", es: "ES", fr: "FR" };

export function LandingNav({ dict, lang }: { dict: Dictionary; lang: Locale }) {
  const { scrollY } = useScroll();
  const navBg = useTransform(
    scrollY,
    [0, 80],
    ["rgba(6,6,9,0)", "rgba(6,6,9,0.95)"]
  );
  const borderOpacity = useTransform(scrollY, [0, 80], [0, 0.08]);

  const NAV_LINKS = [
    { label: dict.nav.how, href: "#solution" },
    { label: dict.nav.features, href: "#features" },
    { label: dict.nav.results, href: "#results" },
  ];

  return (
    <motion.nav
      style={{ backgroundColor: navBg }}
      className="sticky top-0 z-40 flex h-16 w-full items-center justify-between px-6 backdrop-blur-md md:px-8"
    >
      <motion.div
        style={{ borderColor: `rgba(255,255,255,${borderOpacity})` }}
        className="pointer-events-none absolute inset-x-0 bottom-0 border-b"
      />

      {/* Logo */}
      <div className="flex items-center gap-8">
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <img
            src="/LogoKoreAi.png"
            alt="KORE AI Logo"
            className="h-6 w-auto"
            loading="eager"
          />
        </motion.div>

        {/* Desktop nav links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="hidden gap-6 md:flex"
        >
          {NAV_LINKS.map((link) => (
            <motion.a
              key={link.href}
              href={link.href}
              whileHover={{ color: "#f1f5f9" }}
              className="font-headline text-sm font-semibold tracking-tight transition-colors"
              style={{ color: "#475569" }}
            >
              {link.label}
            </motion.a>
          ))}
        </motion.div>
      </div>

      {/* Right: lang switcher + CTA */}
      <motion.div
        initial={{ opacity: 0, x: 16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="flex items-center gap-3"
      >
        {/* Language switcher */}
        <div
          className="hidden items-center gap-1 rounded-full px-1 py-1 md:flex"
          style={{ border: "1px solid rgba(255,255,255,0.06)" }}
        >
          {locales.map((locale) => (
            <Link
              key={locale}
              href={`/${locale}`}
              className={`rounded-full px-3 py-1 font-label text-[10px] font-bold uppercase tracking-widest transition-all ${
                locale === lang
                  ? "bg-lp-accent text-white"
                  : "text-lp-muted hover:text-lp-text"
              }`}
            >
              {LANG_LABELS[locale]}
            </Link>
          ))}
        </div>

        {/* CTA */}
        <motion.a
          href="#cta"
          whileHover={{ scale: 1.03, boxShadow: "0 0 20px rgba(59,130,246,0.3)" }}
          whileTap={{ scale: 0.97 }}
          className="rounded-xl px-5 py-2 font-headline text-sm font-bold"
          style={{
            background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
            color: "#fff",
          }}
        >
          {dict.nav.cta}
        </motion.a>
      </motion.div>
    </motion.nav>
  );
}
