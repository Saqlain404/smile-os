"use client";

import { AnimatedCounter } from "./animated-counter";
import { ScrollReveal } from "./scroll-reveal";

const stats = [
  { value: 2400000, suffix: "+", label: "Appointments Managed" },
  { value: 99.9, suffix: "%", label: "Uptime Guarantee" },
  { value: 40, suffix: "%", label: "No-Show Reduction" },
  { value: 10000, suffix: "+", label: "Dental Professionals" },
];

export function Stats() {
  return (
    <section className="py-20 bg-[#0a0f1e] text-white overflow-hidden relative">
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/3 h-[300px] w-[300px] rounded-full bg-blue-600/8 blur-[100px]" />
        <div className="absolute bottom-0 right-1/3 h-[200px] w-[200px] rounded-full bg-cyan-500/6 blur-[80px]" />
      </div>
      <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {stats.map((s, i) => (
            <ScrollReveal key={s.label} delay={i * 0.1}>
              <div className="text-center">
                <AnimatedCounter
                  value={s.value}
                  suffix={s.suffix}
                  className="text-4xl md:text-5xl font-bold text-white"
                />
                <p className="mt-2 text-sm text-white/50">{s.label}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
