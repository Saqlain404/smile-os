"use client";

import { motion } from "framer-motion";
import {
  Bot,
  CalendarCheck,
  Stethoscope,
  ClipboardList,
  FileText,
  TrendingUp,
  MessageSquare,
  BarChart3,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { GlowCard } from "@/components/marketing/glow-card";
import { SectionHeader } from "@/components/marketing/section-header";

interface Feature {
  icon: LucideIcon;
  title: string;
  desc: string;
  color: string;
}

const features: Feature[] = [
  {
    icon: Bot,
    title: "AI Receptionist",
    desc: "Handles patient calls, scheduling, and FAQs 24/7",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: CalendarCheck,
    title: "Smart Scheduling",
    desc: "AI optimizes chair utilization and workloads",
    color: "from-violet-500 to-purple-500",
  },
  {
    icon: Stethoscope,
    title: "Diagnosis Support",
    desc: "Evidence-based suggestions from patient history",
    color: "from-indigo-500 to-blue-500",
  },
  {
    icon: ClipboardList,
    title: "Treatment Planning",
    desc: "Auto-generated plans with cost estimates",
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: FileText,
    title: "Clinical Notes",
    desc: "Voice-to-text notes with smart categorization",
    color: "from-emerald-500 to-teal-500",
  },
  {
    icon: TrendingUp,
    title: "Revenue Insights",
    desc: "Predict trends and identify growth opportunities",
    color: "from-amber-500 to-orange-500",
  },
  {
    icon: MessageSquare,
    title: "Patient Communication",
    desc: "Automated reminders and health tips",
    color: "from-cyan-500 to-blue-500",
  },
  {
    icon: BarChart3,
    title: "Smart Analytics",
    desc: "Real-time dashboards with actionable insights",
    color: "from-rose-500 to-pink-500",
  },
];

export function FeatureShowcase() {
  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          badge="AI-Powered"
          title="Intelligence at every step"
          titleGradient
          subtitle="SmileOS embeds AI into every workflow, from patient intake to revenue optimization."
        />

        <div className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
            >
              <GlowCard className="rounded-2xl p-6">
                <div
                  className={cn(
                    "mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br p-2.5 text-white",
                    feature.color
                  )}
                >
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3 className="mb-2 text-base font-semibold">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {feature.desc}
                </p>
                <span className="mt-4 inline-block text-xs text-primary opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  Learn more →
                </span>
              </GlowCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
