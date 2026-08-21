"use client";

import Link from "next/link";
import { ScrollReveal } from "./scroll-reveal";
import { GradientText } from "./gradient-text";

export function FinalCTA() {
  return (
    <section className="py-24 sm:py-32 relative overflow-hidden bg-[#0a0f1e]">
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-blue-600/10 blur-[120px] animate-glow-pulse" />
        <div className="absolute top-1/3 right-1/4 h-[300px] w-[300px] rounded-full bg-cyan-500/8 blur-[100px] animate-glow-pulse" style={{ animationDelay: "2s" }} />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-3xl px-4 sm:px-6 text-center">
        <ScrollReveal>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-white/70 mb-8">
            <span className="text-amber-400">✦</span>
            Ready to transform your practice?
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.1]">
            The future of{" "}
            <GradientText>dental care</GradientText>{" "}
            is here
          </h2>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <p className="mt-6 text-lg text-white/50 max-w-xl mx-auto leading-relaxed">
            Join 500+ dental practices using SmileOS to deliver better patient
            care with AI-powered automation.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.3}>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="flex items-center gap-2 bg-white text-[#0a0f1e] px-8 py-3.5 rounded-xl font-semibold text-sm hover:bg-white/90 transition-colors"
            >
              Start Free Trial
            </Link>
            <Link
              href="/login"
              className="flex items-center gap-2 border border-white/20 text-white px-8 py-3.5 rounded-xl text-sm hover:bg-white/5 transition-colors"
            >
              Book a Demo
            </Link>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.4}>
          <p className="mt-8 text-xs text-white/30">
            HIPAA Compliant · SOC 2 · 256-bit Encryption · 99.9% Uptime
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
}
