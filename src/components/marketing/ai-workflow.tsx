"use client";

import { motion } from "framer-motion";
import {
  Bell,
  Brain,
  Calendar,
  ClipboardList,
  Clock,
  FileText,
  Shield,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollReveal } from "./scroll-reveal";

interface WorkflowStep {
  icon: LucideIcon;
  title: string;
  description: string;
  badge: string;
  bgClass: string;
  textClass: string;
}

const steps: WorkflowStep[] = [
  {
    icon: Calendar,
    title: "Patient Books Online",
    description: "Patient schedules via online portal or phone",
    badge: "Automated",
    bgClass: "bg-blue-500/10",
    textClass: "text-blue-500",
  },
  {
    icon: Shield,
    title: "AI Verifies Insurance",
    description: "Instant eligibility check and pre-authorization",
    badge: "AI-Powered",
    bgClass: "bg-cyan-500/10",
    textClass: "text-cyan-500",
  },
  {
    icon: Clock,
    title: "Smart Scheduling",
    description: "AI optimizes chair and doctor availability",
    badge: "Intelligent",
    bgClass: "bg-violet-500/10",
    textClass: "text-violet-500",
  },
  {
    icon: Brain,
    title: "AI Diagnosis Support",
    description: "Evidence-based clinical recommendations",
    badge: "AI-Powered",
    bgClass: "bg-indigo-500/10",
    textClass: "text-indigo-500",
  },
  {
    icon: ClipboardList,
    title: "Treatment Plan",
    description: "Auto-generated plans with cost estimates",
    badge: "Automated",
    bgClass: "bg-purple-500/10",
    textClass: "text-purple-500",
  },
  {
    icon: FileText,
    title: "Invoice & Prescription",
    description: "Instant billing and prescription generation",
    badge: "Automated",
    bgClass: "bg-emerald-500/10",
    textClass: "text-emerald-500",
  },
  {
    icon: Bell,
    title: "Follow-up Reminders",
    description: "Automated multi-channel patient reminders",
    badge: "AI-Powered",
    bgClass: "bg-amber-500/10",
    textClass: "text-amber-500",
  },
];

export function AiWorkflow() {
  return (
    <section className="relative overflow-hidden bg-white py-32 dark:bg-[#0a0f1e]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Header */}
        <div className="mb-20 text-center">
          <ScrollReveal>
            <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
              ✦ How It Works
            </span>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <h2 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
              One Platform. Every Step Automated.
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              From patient booking to follow-up reminders, SmileOS handles your
              entire clinical workflow with AI precision.
            </p>
          </ScrollReveal>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Connecting line */}
          <div
            aria-hidden
            className="absolute bottom-0 left-4 top-0 w-px -translate-x-1/2 bg-gradient-to-b from-primary/20 via-primary/40 to-primary/20 md:left-1/2"
          />
          {/* Animated gradient sweep */}
          <motion.div
            aria-hidden
            initial={{ y: "-100%" }}
            whileInView={{ y: "1200%" }}
            viewport={{ once: true }}
            transition={{ duration: 3.5, ease: "easeInOut", delay: 0.3 }}
            className="absolute left-4 top-0 h-40 w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-primary to-transparent md:left-1/2"
          />

          {steps.map((step, index) => {
            const isLeft = index % 2 === 0;
            const number = String(index + 1).padStart(2, "0");
            const Icon = step.icon;

            return (
              <div
                key={step.title}
                className="relative mb-16 flex items-center pl-16 last:mb-0 md:pl-0"
              >
                {/* Timeline node */}
                <motion.div
                  initial={{
                    opacity: 0,
                    scale: 0.5,
                    boxShadow:
                      "0 0 0 0 oklch(0.55 0.22 262 / 0), 0 0 0 0 oklch(0.55 0.22 262 / 0)",
                  }}
                  whileInView={{
                    opacity: 1,
                    scale: 1,
                    boxShadow:
                      "0 0 20px 4px oklch(0.55 0.22 262 / 0.35), 0 0 48px 12px oklch(0.55 0.22 262 / 0.15)",
                  }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.6,
                    delay: index * 0.15 + 0.25,
                    ease: "easeOut",
                  }}
                  className={cn(
                    "absolute left-4 top-1/2 z-10 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-primary bg-background shadow-sm md:left-1/2"
                  )}
                >
                  <Icon className={cn("h-4.5 w-4.5", step.textClass)} />
                </motion.div>

                {/* Step card */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.6,
                    delay: index * 0.15,
                    ease: "easeOut",
                  }}
                  className={cn(
                    "w-full rounded-2xl border bg-card p-6 shadow-sm transition-shadow hover:shadow-lg md:w-5/12",
                    isLeft ? "md:text-right" : "md:ml-auto"
                  )}
                >
                  <div
                    className={cn(
                      "flex items-center gap-3",
                      isLeft && "md:flex-row-reverse"
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                        step.bgClass,
                        step.textClass
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="font-mono text-xs font-semibold tracking-widest text-muted-foreground/70">
                      {number}
                    </span>
                  </div>

                  <h3 className="mt-4 text-lg font-semibold">{step.title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">
                    {step.description}
                  </p>

                  <div
                    className={cn("mt-3 flex", isLeft && "md:justify-end")}
                  >
                    <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                      {step.badge}
                    </span>
                  </div>
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
