"use client";

import { useRef, useEffect, useState } from "react";
import { useInView } from "framer-motion";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { RevealOnScroll, StaggerContainer, StaggerItem, fadeUp } from "./motion";

function CountUp({ target, suffix = "" }: { target: string; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [displayed, setDisplayed] = useState("0");

  useEffect(() => {
    if (!inView) return;
    const numeric = parseFloat(target.replace(/[^0-9.]/g, ""));
    if (isNaN(numeric)) { setDisplayed(target); return; }
    const prefix = target.match(/^[^0-9]*/)?.[0] ?? "";
    const duration = 1400;
    const steps = 40;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = eased * numeric;
      setDisplayed(
        `${prefix}${current % 1 === 0 ? current.toFixed(0) : current.toFixed(1)}${suffix}`
      );
      if (step >= steps) clearInterval(timer);
    }, duration / steps);
    return () => clearInterval(timer);
  }, [inView, target, suffix]);

  return <span ref={ref}>{displayed}</span>;
}

export function SocialProofBar({ dict }: { dict: Dictionary }) {
  const stats = [
    { value: dict.social_proof.leads_value, label: dict.social_proof.leads_label },
    { value: dict.social_proof.portfolio_value, label: dict.social_proof.portfolio_label },
    { value: dict.social_proof.reliability_value, label: dict.social_proof.reliability_label, suffix: "/5" as string | undefined },
    { value: dict.social_proof.automation_value, label: dict.social_proof.automation_label },
  ];

  return (
    <section className="border-y border-lp-border/10 bg-lp-surface-low py-12">
      <div className="mx-auto max-w-7xl overflow-hidden px-6">
        <StaggerContainer
          staggerDelay={0.12}
          className="flex flex-wrap items-center justify-center gap-12 md:justify-between"
        >
          {stats.map((stat) => (
            <StaggerItem
              key={stat.label}
              variants={fadeUp}
              className="flex items-center gap-3"
            >
              <span className="font-headline text-2xl font-black text-lp-accent">
                <CountUp target={stat.value} />
              </span>
              <span className="font-label text-[10px] uppercase tracking-widest text-lp-muted">
                {stat.label}
              </span>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
