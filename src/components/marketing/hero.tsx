"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Play,
  Brain,
  Bell,
  Star,
  Users,
  Calendar,
  DollarSign,
} from "lucide-react";
import { GradientText } from "./gradient-text";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.12 } },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } },
};

const floatingCards = [
  {
    icon: Bell,
    title: "New appointment booked",
    sub: "2 min ago",
    className: "absolute -top-4 -right-4 md:right-8 lg:right-16 animate-float-delayed",
  },
  {
    icon: Brain,
    title: "AI: Consider crown for #2847",
    sub: "Based on X-ray analysis",
    className: "absolute bottom-12 -left-4 md:left-4 lg:left-8 animate-float",
  },
  {
    icon: Star,
    title: "Patient rating: 4.9★",
    sub: "Based on 1,247 reviews",
    className: "absolute -top-2 left-4 md:left-12 lg:left-24 animate-float-slow",
  },
];

const stats = [
  { icon: Users, label: "Patients", value: "2,847" },
  { icon: DollarSign, label: "Revenue", value: "$142K" },
  { icon: Calendar, label: "Appointments", value: "156" },
];

export function Hero() {
  const [mounted] = useState(true);

  return (
    <section className="relative min-h-screen overflow-hidden bg-[#0a0f1e]">
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 h-[500px] w-[500px] rounded-full bg-blue-600/10 blur-[120px] animate-glow-pulse" />
        <div className="absolute bottom-1/4 right-1/4 h-[400px] w-[400px] rounded-full bg-cyan-500/8 blur-[100px] animate-glow-pulse" style={{ animationDelay: "2s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[300px] w-[300px] rounded-full bg-indigo-500/6 blur-[80px] animate-glow-pulse" style={{ animationDelay: "4s" }} />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 pt-32 pb-20">
        <motion.div variants={container} initial="hidden" animate={mounted ? "show" : "hidden"}>
          <motion.div variants={item} className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-white/70 mb-8">
              <span className="text-amber-400">✦</span>
              Powered by AI · Trusted by 500+ clinics
            </div>
          </motion.div>

          <motion.h1
            variants={item}
            className="text-center text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] text-white"
          >
            The AI Operating System for
            <br />
            <GradientText className="mt-2 block">Modern Dental Practices</GradientText>
          </motion.h1>

          <motion.p
            variants={item}
            className="mx-auto mt-6 max-w-2xl text-center text-lg text-white/50 leading-relaxed"
          >
            Manage patients, schedule appointments, handle billing, and unlock
            AI-powered insights — all from one intelligent dashboard.
          </motion.p>

          <motion.div variants={item} className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="flex items-center gap-2 bg-white text-[#0a0f1e] px-8 py-3.5 rounded-xl font-semibold text-sm hover:bg-white/90 transition-colors"
            >
              Start Free Trial
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="#features"
              className="flex items-center gap-2 border border-white/20 text-white px-8 py-3.5 rounded-xl text-sm hover:bg-white/5 transition-colors"
            >
              <Play className="h-4 w-4" />
              Watch Demo
            </Link>
          </motion.div>

          <motion.p variants={item} className="mt-5 text-center text-xs text-white/30">
            No credit card required · Free 14-day trial · Cancel anytime
          </motion.p>

          <motion.div variants={item} className="relative mt-20 mx-auto max-w-4xl">
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-sm shadow-2xl shadow-black/40 overflow-hidden">
              <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-red-400" />
                  <div className="h-3 w-3 rounded-full bg-amber-400" />
                  <div className="h-3 w-3 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 mx-8">
                  <div className="mx-auto h-6 w-64 rounded-md bg-white/5" />
                </div>
              </div>
              <div className="grid grid-cols-5 h-80">
                <div className="col-span-1 border-r border-white/10 bg-white/[0.02] p-3 space-y-2 hidden sm:block">
                  {["Dashboard", "Patients", "Calendar", "Billing", "AI"].map((n, i) => (
                    <div
                      key={n}
                      className={`h-8 rounded-lg flex items-center px-3 text-xs ${
                        i === 0 ? "bg-primary/20 text-primary" : "bg-white/5 text-white/30"
                      }`}
                    >
                      {n}
                    </div>
                  ))}
                </div>
                <div className="col-span-5 sm:col-span-4 p-4 space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    {stats.map((s) => (
                      <motion.div
                        key={s.label}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6, duration: 0.5 }}
                        className="rounded-xl border border-white/10 bg-white/[0.03] p-4"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <s.icon className="h-3.5 w-3.5 text-white/40" />
                          <span className="text-xs text-white/40">{s.label}</span>
                        </div>
                        <div className="text-xl font-bold text-white">{s.value}</div>
                      </motion.div>
                    ))}
                  </div>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9, duration: 0.5 }}
                    className="rounded-xl border border-white/10 bg-white/[0.03] p-4"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <Brain className="h-3.5 w-3.5 text-indigo-400" />
                      <span className="text-xs font-medium text-white/60">AI Insights</span>
                    </div>
                    <div className="space-y-2">
                      {[
                        "Revenue up 12% this month — schedule optimization contributed 8%",
                        "3 patients need follow-up calls for outstanding treatment plans",
                        "Tomorrow's schedule has 2 gaps — consider sending rebooking reminders",
                      ].map((t, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-white/40">
                          <div className="mt-1 h-1.5 w-1.5 rounded-full bg-indigo-400 shrink-0" />
                          {t}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>

            {floatingCards.map((card, i) => (
              <div key={i} className={card.className}>
                <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.06] backdrop-blur-md p-3 shadow-xl">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20 text-primary">
                    <card.icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-white">{card.title}</p>
                    <p className="text-[10px] text-white/40">{card.sub}</p>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
