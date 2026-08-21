"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Sparkles, Users, Calendar, DollarSign, TrendingUp, FileText } from "lucide-react";
import { GradientText } from "./gradient-text";

const views = [
  {
    key: "dashboard",
    label: "Dashboard",
    content: (
      <div className="p-5 space-y-4">
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Patients", value: "2,847", icon: Users, change: "+12%" },
            { label: "Revenue", value: "$142K", icon: DollarSign, change: "+8%" },
            { label: "Appointments", value: "156", icon: Calendar, change: "+23%" },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <div className="flex items-center gap-2 mb-2">
                <s.icon className="h-3.5 w-3.5 text-white/40" />
                <span className="text-[11px] text-white/40">{s.label}</span>
              </div>
              <div className="text-lg font-bold text-white">{s.value}</div>
              <span className="text-[10px] text-emerald-400">{s.change}</span>
            </div>
          ))}
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="h-3.5 w-3.5 text-white/40" />
            <span className="text-[11px] text-white/60">Revenue Trend</span>
          </div>
          <div className="flex items-end gap-1 h-20">
            {[40, 55, 45, 70, 65, 80, 75, 90, 85, 95, 88, 100].map((h, i) => (
              <div key={i} className="flex-1 rounded-t bg-primary/40" style={{ height: `${h}%` }} />
            ))}
          </div>
        </div>
      </div>
    ),
  },
  {
    key: "patients",
    label: "Patients",
    content: (
      <div className="p-5">
        <div className="space-y-3">
          {[
            { name: "Sarah Johnson", email: "sarah@example.com", status: "Active" },
            { name: "Michael Chen", email: "michael@example.com", status: "Active" },
            { name: "Emily Rodriguez", email: "emily@example.com", status: "Needs Follow-up" },
            { name: "David Kim", email: "david@example.com", status: "Active" },
          ].map((p) => (
            <div key={p.name} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/20 text-primary text-xs font-medium">
                {p.name.split(" ").map((n) => n[0]).join("")}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{p.name}</p>
                <p className="text-[11px] text-white/40 truncate">{p.email}</p>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                p.status === "Active" ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"
              }`}>
                {p.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    key: "calendar",
    label: "Calendar",
    content: (
      <div className="p-5">
        <div className="grid grid-cols-5 gap-2 mb-2">
          {["Mon", "Tue", "Wed", "Thu", "Fri"].map((d) => (
            <div key={d} className="text-[10px] text-white/40 text-center pb-2">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-5 gap-2">
          {Array.from({ length: 15 }).map((_, i) => {
            const hasAppt = [1, 3, 5, 7, 9, 11, 13].includes(i);
            const colors = ["bg-blue-500/30", "bg-emerald-500/30", "bg-violet-500/30", "bg-amber-500/30"];
            return (
              <div key={i} className="h-12 rounded-lg border border-white/5 bg-white/[0.02] p-1">
                {hasAppt && (
                  <div className={`h-full rounded ${colors[i % colors.length]}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>
    ),
  },
  {
    key: "insights",
    label: "AI Insights",
    content: (
      <div className="p-5 space-y-3">
        {[
          { title: "Revenue Opportunity", desc: "3 patients have pending treatment plans worth $4,200", color: "from-emerald-500 to-teal-500" },
          { title: "Schedule Optimization", desc: "Tomorrow has 2 gaps — send rebooking reminders to 8 patients", color: "from-blue-500 to-cyan-500" },
          { title: "Patient Retention", desc: "Sarah Johnson hasn't visited in 6 months — schedule check-up", color: "from-violet-500 to-purple-500" },
        ].map((insight) => (
          <div key={insight.title} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              <span className="text-[11px] font-medium text-white/70">{insight.title}</span>
            </div>
            <p className="text-xs text-white/40">{insight.desc}</p>
          </div>
        ))}
      </div>
    ),
  },
  {
    key: "billing",
    label: "Billing",
    content: (
      <div className="p-5">
        <div className="space-y-2">
          {[
            { id: "INV-2847", patient: "Sarah Johnson", amount: "$1,250", status: "Paid" },
            { id: "INV-2848", patient: "Michael Chen", amount: "$890", status: "Pending" },
            { id: "INV-2849", patient: "Emily Rodriguez", amount: "$2,100", status: "Paid" },
            { id: "INV-2850", patient: "David Kim", amount: "$450", status: "Overdue" },
          ].map((inv) => (
            <div key={inv.id} className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.03] p-3">
              <FileText className="h-4 w-4 text-white/30" />
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-medium text-white">{inv.id} — {inv.patient}</p>
              </div>
              <span className="text-xs font-medium text-white">{inv.amount}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                inv.status === "Paid" ? "bg-emerald-500/20 text-emerald-400" :
                inv.status === "Pending" ? "bg-amber-500/20 text-amber-400" :
                "bg-red-500/20 text-red-400"
              }`}>
                {inv.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
];

export function DashboardShowcase() {
  const [active, setActive] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += 2.5;
      if (progress >= 100) {
        setActive((a) => (a + 1) % views.length);
        progress = 0;
      }
      setProgress(progress);
    }, 100);
    return () => clearInterval(interval);
  }, [active]);

  return (
    <section className="py-24 sm:py-32 bg-[#0a0f1e] text-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            See SmileOS <GradientText>in action</GradientText>
          </h2>
          <p className="mt-4 text-white/50">
            Experience the platform transforming dental practice management.
          </p>
        </div>

        <div className="mx-auto max-w-5xl">
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-sm shadow-2xl shadow-black/40 overflow-hidden">
            <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
              <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full bg-red-400" />
                <div className="h-3 w-3 rounded-full bg-amber-400" />
                <div className="h-3 w-3 rounded-full bg-green-400" />
              </div>
              <div className="flex-1 mx-8">
                <div className="mx-auto h-6 w-48 rounded-md bg-white/5 flex items-center justify-center text-[10px] text-white/30">
                  smileos.app/{views[active].key}
                </div>
              </div>
            </div>

            <div className="h-1 bg-white/5">
              <motion.div
                className="h-full bg-primary"
                style={{ width: `${progress}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>

            <div className="h-80 relative overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={active}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.3 }}
                >
                  {views[active].content}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 mt-6">
            {views.map((v, i) => (
              <button
                key={v.key}
                onClick={() => { setActive(i); setProgress(0); }}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === active ? "w-8 bg-white" : "w-2 bg-white/20 hover:bg-white/30"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
