"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { ScrollReveal } from "./scroll-reveal";

const testimonials = [
  {
    name: "Dr. Sarah Mitchell",
    role: "Owner, Bright Smile Dental",
    initials: "SM",
    content:
      "SmileOS transformed our practice overnight. We cut administrative time by 60% and our patients love the digital experience.",
    rating: 5,
  },
  {
    name: "Dr. James Park",
    role: "Partner, Park & Associates",
    initials: "JP",
    content:
      "The AI diagnosis assistant alone is worth the price. It catches things I might miss and saves hours of research.",
    rating: 5,
  },
  {
    name: "Maria Rodriguez",
    role: "Office Manager, Happy Teeth Clinic",
    initials: "MR",
    content:
      "Finally, dental software that doesn't feel outdated. Our staff actually enjoys using it every day.",
    rating: 5,
  },
];

export function Testimonials() {
  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <ScrollReveal>
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Trusted by dental practices worldwide
            </h2>
            <p className="mt-3 text-muted-foreground">
              See what professionals are saying about SmileOS.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 max-w-5xl mx-auto">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              className="group rounded-2xl border bg-card p-8 flex flex-col hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
            >
              <div className="flex gap-0.5 mb-5">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-base text-muted-foreground leading-relaxed flex-1">
                &ldquo;{t.content}&rdquo;
              </p>
              <div className="mt-6 pt-5 border-t flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-semibold">
                  {t.initials}
                </div>
                <div>
                  <p className="text-sm font-medium">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
