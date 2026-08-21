"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";
import { ScrollReveal } from "./scroll-reveal";

const plans = [
  {
    name: "Starter",
    description: "For solo practitioners",
    price: 49,
    features: [
      "1 dentist",
      "Up to 500 patients",
      "Appointment scheduling",
      "Basic invoicing",
      "Email reminders",
    ],
    cta: "Start Free Trial",
    href: "/login",
    highlighted: false,
  },
  {
    name: "Professional",
    description: "For growing practices",
    price: 99,
    features: [
      "Up to 5 dentists",
      "Unlimited patients",
      "Full billing & payments",
      "SMS & WhatsApp reminders",
      "Analytics dashboard",
      "Multi-chair management",
      "Priority support",
    ],
    cta: "Start Free Trial",
    href: "/signup",
    highlighted: true,
  },
  {
    name: "Enterprise",
    description: "For dental groups",
    price: null,
    features: [
      "Unlimited dentists",
      "Multi-location",
      "Custom integrations",
      "Advanced analytics",
      "API access",
      "Dedicated account manager",
      "SLA guarantee",
    ],
    cta: "Contact Sales",
    href: "/login",
    highlighted: false,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <ScrollReveal>
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Simple, transparent pricing
            </h2>
            <p className="mt-3 text-muted-foreground">
              No hidden fees. Pick a plan that fits your practice.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              className={`relative rounded-2xl border p-8 flex flex-col transition-all duration-300 hover:translate-y-[-2px] ${
                plan.highlighted
                  ? "border-primary shadow-lg shadow-primary/10 ring-2 ring-primary/20"
                  : "bg-card hover:shadow-lg hover:shadow-primary/5"
              }`}
            >
              {plan.highlighted && (
                <>
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground flex items-center gap-1.5">
                    <Sparkles className="h-3 w-3" />
                    Most Popular
                  </div>
                  <div className="absolute -top-3 right-4 rounded-full bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-[10px] font-medium text-amber-600 dark:text-amber-400">
                    AI Recommended
                  </div>
                </>
              )}

              <div className="mb-6">
                <h3 className="text-lg font-semibold">{plan.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
              </div>

              <div className="mb-6">
                {plan.price !== null ? (
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">${plan.price}</span>
                    <span className="text-sm text-muted-foreground">/month</span>
                  </div>
                ) : (
                  <div className="text-4xl font-bold">Custom</div>
                )}
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm">
                    <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <Link
                href={plan.href}
                className={`flex items-center justify-center w-full rounded-xl px-6 py-3 text-sm font-semibold transition-colors ${
                  plan.highlighted
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "border border-border bg-card hover:bg-muted"
                }`}
              >
                {plan.cta}
              </Link>
            </motion.div>
          ))}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-8">
          All plans include 14-day free trial · No credit card required
        </p>
      </div>
    </section>
  );
}
