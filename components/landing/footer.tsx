"use client";

import { motion } from "framer-motion";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

export function LandingFooter({ dict }: { dict: Dictionary }) {
  return (
    <footer className="border-t border-lp-border/10 bg-lp-surface-low px-8 py-12">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-8 md:flex-row">
        <div className="flex flex-col gap-2">
          <span className="font-headline text-lg font-black uppercase tracking-tighter text-lp-accent">
            <img
              src="/LogoKoreAi.png"
              alt="KORE AI Logo"
              className="h-6 w-auto"
              loading="eager"
            />
          </span>
          <p className="font-label text-xs uppercase tracking-widest text-lp-muted">
            {dict.footer.copyright}
          </p>
        </div>
        <div className="flex gap-8">
          {[
            { label: dict.footer.privacy, href: "#" },
            { label: dict.footer.terms, href: "#" },
            { label: dict.footer.security, href: "#" },
          ].map((link) => (
            <motion.a
              key={link.label}
              href={link.href}
              whileHover={{ color: "#3b82f6" }}
              className="font-label text-xs uppercase tracking-widest text-lp-muted"
            >
              {link.label}
            </motion.a>
          ))}
        </div>
      </div>
    </footer>
  );
}
