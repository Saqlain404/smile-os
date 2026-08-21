"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { ScrollReveal } from "./scroll-reveal";

const faqs = [
  {
    q: "How long does setup take?",
    a: "Most clinics are up and running in under 30 minutes. Our onboarding team helps migrate your existing data and provides personalized training for your staff.",
  },
  {
    q: "Is my patient data secure?",
    a: "Absolutely. SmileOS is HIPAA compliant with SOC 2 certification, 256-bit encryption, and regular third-party security audits. Your data is hosted on enterprise-grade infrastructure.",
  },
  {
    q: "Can I import from my current software?",
    a: "Yes. We support imports from Dentrix, Eaglesoft, Open Dental, and most other major practice management systems. Our migration team handles the entire process.",
  },
  {
    q: "Do you offer training?",
    a: "All plans include access to our knowledge base and video tutorials. Professional and Enterprise plans include live onboarding sessions with our dedicated support team.",
  },
  {
    q: "What about existing appointments?",
    a: "Our migration team ensures zero disruption. We transfer all appointments, patient records, and billing history seamlessly so you can continue operations without interruption.",
  },
  {
    q: "Can patients access their records?",
    a: "Yes. SmileOS includes a patient portal where patients can view appointments, treatment plans, invoices, and communicate directly with your team through secure messaging.",
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <ScrollReveal>
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Frequently asked questions
            </h2>
            <p className="mt-3 text-muted-foreground">
              Everything you need to know about SmileOS.
            </p>
          </div>
        </ScrollReveal>

        <div className="max-w-3xl mx-auto">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="border-b border-border"
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="flex w-full items-center justify-between py-5 text-left font-medium text-foreground hover:text-primary transition-colors"
              >
                <span className="text-base pr-4">{faq.q}</span>
                <ChevronDown
                  className={`h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200 ${
                    openIndex === i ? "rotate-180" : ""
                  }`}
                />
              </button>
              <AnimatePresence>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <p className="pb-5 text-sm text-muted-foreground leading-relaxed">
                      {faq.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
