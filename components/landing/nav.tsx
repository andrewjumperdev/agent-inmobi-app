"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useScroll, useTransform } from "framer-motion";
import type { Dictionary, Locale } from "@/lib/i18n/get-dictionary";
import { locales } from "@/lib/i18n/get-dictionary";

const LANG_LABELS: Record<Locale, string> = { en: "EN", es: "ES", fr: "FR" };

export function LandingNav({ dict, lang }: { dict: Dictionary; lang: Locale }) {
  const { scrollY } = useScroll();
  const navBg = useTransform(
    scrollY,
    [0, 80],
    ["rgba(11,19,38,0.5)", "rgba(11,19,38,0.97)"]
  );
  const borderOpacity = useTransform(scrollY, [0, 80], [0, 0.15]);

  return (
    <motion.nav
      style={{ backgroundColor: navBg }}
      className="sticky top-0 z-40 flex h-16 w-full items-center justify-between px-6 backdrop-blur-md md:px-8"
    >
      <motion.div
        style={{ borderColor: `rgba(69,70,77,${borderOpacity})` }}
        className="pointer-events-none absolute inset-x-0 bottom-0 border-b"
      />

      {/* Brand + nav links */}
      <div className="flex items-center gap-8">
        <motion.span
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="font-headline text-xl font-black uppercase tracking-tighter text-lp-accent"
        >
          {dict.nav.brand}
        </motion.span>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="hidden gap-6 md:flex"
        >
          {[
            { label: dict.nav.portfolio, href: "#comparison" },
            { label: dict.nav.insights, href: "#phases" },
            { label: dict.nav.ops, href: "#done-with-you" },
          ].map((link) => (
            <motion.a
              key={link.href}
              href={link.href}
              whileHover={{ color: "#dae2fd" }}
              className="font-headline text-sm font-bold tracking-tight text-lp-muted"
            >
              {link.label}
            </motion.a>
          ))}
        </motion.div>
      </div>

      {/* Language switcher + CTA */}
      <motion.div
        initial={{ opacity: 0, x: 16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="flex items-center gap-4"
      >
        <div className="flex items-center gap-1 rounded-full border border-lp-border/30 px-1 py-1">
          {locales.map((locale) => (
            <Link
              key={locale}
              href={`/${locale}`}
              className={`rounded-full px-3 py-1 font-label text-[10px] font-bold uppercase tracking-widest transition-all ${
                locale === lang
                  ? "bg-lp-accent text-lp-accent-on"
                  : "text-lp-muted hover:text-lp-text"
              }`}
            >
              {LANG_LABELS[locale]}
            </Link>
          ))}
        </div>
        <motion.a
          href="#cta"
          whileHover={{ scale: 1.03, boxShadow: "0 0 16px rgba(188,255,95,0.3)" }}
          whileTap={{ scale: 0.97 }}
          className="hidden rounded-md bg-lp-accent px-4 py-2 font-headline text-sm font-bold text-lp-accent-on md:block"
        >
          {dict.hero.cta_primary}
        </motion.a>
      </motion.div>
    </motion.nav>
  );
}
