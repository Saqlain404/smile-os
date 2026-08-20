"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Sparkles,
  Brain,
  ClipboardList,
  Calendar,
  MessageSquare,
  Users,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Loader2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/layout/page-header";
import { AIInsightsPanel } from "@/components/ai/ai-insights-panel";
import { AIDiagnosisPanel } from "@/components/ai/ai-diagnosis-panel";
import { AITreatmentPlanPanel } from "@/components/ai/ai-treatment-plan-panel";
import { AISchedulePanel } from "@/components/ai/ai-schedule-panel";
import { getAIGlobalStats } from "@/server/actions/ai";

interface Stats {
  patients: { total: number; newThisMonth: number };
  appointments: {
    total: number;
    thisMonth: {
      completed: number;
      cancelled: number;
      noShow: number;
      completionRate: number;
    };
  };
  revenue: { total: number; thisMonth: number; pending: number };
  ai: { insights: number; conversations: number };
}

const sections = [
  { id: "overview", label: "Overview", icon: Sparkles },
  { id: "diagnosis", label: "Diagnosis", icon: Brain },
  { id: "treatment", label: "Treatment", icon: ClipboardList },
  { id: "schedule", label: "Schedule", icon: Calendar },
] as const;

export default function AIPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<string>("overview");
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(
    new Set(["diagnosis", "treatment", "schedule"]),
  );

  useEffect(() => {
    loadStats();
    const hash = window.location.hash.replace("#", "");
    if (hash && sections.some((s) => s.id === hash)) {
      setActiveSection(hash);
      setCollapsedSections((prev) => {
        const next = new Set(prev);
        next.delete(hash);
        return next;
      });
    }
  }, []);

  async function loadStats() {
    const data = await getAIGlobalStats();
    setStats(data as Stats | null);
    setLoading(false);
  }

  function toggleSection(id: string) {
    setActiveSection(id);
    setCollapsedSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const statCards = stats
    ? [
        {
          label: "Total Patients",
          value: stats.patients.total,
          sub: `+${stats.patients.newThisMonth} this month`,
          icon: Users,
          color: "text-blue-600 bg-blue-50 dark:bg-blue-900/20",
        },
        {
          label: "Completion Rate",
          value: `${stats.appointments.thisMonth.completionRate}%`,
          sub: `${stats.appointments.thisMonth.completed} completed`,
          icon: TrendingUp,
          color: "text-green-600 bg-green-50 dark:bg-green-900/20",
        },
        {
          label: "Revenue",
          value: `$${stats.revenue.total.toLocaleString()}`,
          sub: `$${stats.revenue.thisMonth.toLocaleString()} this month`,
          icon: DollarSign,
          color: "text-purple-600 bg-purple-50 dark:bg-purple-900/20",
        },
        {
          label: "Pending Amount",
          value: `$${stats.revenue.pending.toLocaleString()}`,
          sub: `${stats.appointments.total} total appointments`,
          icon: AlertTriangle,
          color:
            stats.revenue.pending > 0
              ? "text-orange-600 bg-orange-50 dark:bg-orange-900/20"
              : "text-green-600 bg-green-50 dark:bg-green-900/20",
        },
      ]
    : [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Assistant"
        description="AI-powered insights and tools for your dental practice"
      />

      {/* Stats cards */}
      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-xl border bg-card p-4">
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="rounded-xl border bg-card p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{card.label}</p>
                  <p className="text-2xl font-bold mt-1">{card.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {card.sub}
                  </p>
                </div>
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${card.color}`}
                >
                  <card.icon className="h-5 w-5" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Section tabs */}
      <div className="flex gap-1 rounded-lg border bg-muted p-1">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => {
              setActiveSection(section.id);
              setCollapsedSections((prev) => {
                const next = new Set(prev);
                next.delete(section.id);
                return next;
              });
            }}
            className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all ${
              activeSection === section.id
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <section.icon className="h-4 w-4" />
            {section.label}
          </button>
        ))}
      </div>

      {/* Overview section */}
      {activeSection === "overview" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          {/* Quick actions grid */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 items-stretch">
            <Link
              href="#diagnosis"
              onClick={() => {
                setActiveSection("diagnosis");
                setCollapsedSections((prev) => {
                  const next = new Set(prev);
                  next.delete("diagnosis");
                  return next;
                });
              }}
            >
              <div className="h-full rounded-xl border bg-card p-5 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between">
                <div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500 text-white mb-3">
                    <Brain className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold group-hover:text-primary transition-colors">
                    AI Diagnosis Assistant
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Clinical decision support based on patient history,
                    allergies, and medical records.
                  </p>
                </div>
              </div>
            </Link>
            <Link
              href="#treatment"
              onClick={() => {
                setActiveSection("treatment");
                setCollapsedSections((prev) => {
                  const next = new Set(prev);
                  next.delete("treatment");
                  return next;
                });
              }}
            >
              <div className="h-full rounded-xl border bg-card p-5 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between">
                <div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500 text-white mb-3">
                    <ClipboardList className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold group-hover:text-primary transition-colors">
                    Treatment Planning
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    AI-generated treatment plans with cost estimates, urgency
                    levels, and phased recommendations.
                  </p>
                </div>
              </div>
            </Link>
            <Link
              href="#schedule"
              onClick={() => {
                setActiveSection("schedule");
                setCollapsedSections((prev) => {
                  const next = new Set(prev);
                  next.delete("schedule");
                  return next;
                });
              }}
            >
              <div className="h-full rounded-xl border bg-card p-5 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between">
                <div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500 text-white mb-3">
                    <Calendar className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold group-hover:text-primary transition-colors">
                    Smart Scheduling
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Optimize chair utilization, identify scheduling gaps, and
                    balance doctor workloads.
                  </p>
                </div>
              </div>
            </Link>
          </div>

          {/* Insights */}
          <div className="rounded-xl border bg-card p-6">
            <AIInsightsPanel />
          </div>
        </motion.div>
      )}

      {/* Diagnosis section */}
      {activeSection === "diagnosis" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-xl border bg-card p-6"
        >
          <AIDiagnosisPanel />
        </motion.div>
      )}

      {/* Treatment section */}
      {activeSection === "treatment" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-xl border bg-card p-6"
        >
          <AITreatmentPlanPanel />
        </motion.div>
      )}

      {/* Schedule section */}
      {activeSection === "schedule" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-xl border bg-card p-6"
        >
          <AISchedulePanel />
        </motion.div>
      )}

      <AutoGenerateInsights />
    </div>
  );
}

function AutoGenerateInsights() {
  const [generated, setGenerated] = useState(false);

  useEffect(() => {
    if (!generated) {
      import("@/server/actions/ai").then(({ generateInsights }) => {
        generateInsights().then(() => setGenerated(true));
      });
    }
  }, [generated]);

  return null;
}
