"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Brain,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Calendar,
  Shield,
  Sparkles,
  X,
  Eye,
  ChevronDown,
  ChevronUp,
  Lightbulb,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  getAIInsights,
  generateInsights,
  markInsightRead,
  dismissInsight,
} from "@/server/actions/ai";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

interface Insight {
  id: string;
  type: string;
  severity: string;
  title: string;
  description: string;
  metadata?: Record<string, unknown>;
  isRead: boolean;
  createdAt: Date;
}

const typeIcons: Record<string, React.ElementType> = {
  DIAGNOSIS: Brain,
  TREATMENT: Lightbulb,
  RISK: AlertTriangle,
  PREDICTION: TrendingUp,
  OPTIMIZATION: Calendar,
  REVENUE: DollarSign,
};

const severityColors: Record<string, string> = {
  LOW: "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200 dark:border-blue-800",
  MEDIUM:
    "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800",
  HIGH: "bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400 border-orange-200 dark:border-orange-800",
  CRITICAL:
    "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 border-red-200 dark:border-red-800",
};

export function AIInsightsPanel() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    unread: 0,
    critical: 0,
  });
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadInsights();
  }, []);

  async function loadInsights() {
    setLoading(true);
    const result = await getAIInsights();
    setInsights(result.insights as Insight[]);
    setStats(result.stats);
    setLoading(false);
  }

  async function handleGenerate() {
    setGenerating(true);
    await generateInsights();
    await loadInsights();
    setGenerating(false);
  }

  async function handleMarkRead(id: string) {
    await markInsightRead(id);
    setInsights((prev) =>
      prev.map((i) => (i.id === id ? { ...i, isRead: true } : i))
    );
    setStats((prev) => ({ ...prev, unread: Math.max(0, prev.unread - 1) }));
  }

  async function handleDismiss(id: string) {
    await dismissInsight(id);
    setInsights((prev) => prev.filter((i) => i.id !== id));
    setStats((prev) => ({ ...prev, total: prev.total - 1 }));
  }

  function toggleExpand(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">AI Insights</h2>
            <p className="text-sm text-muted-foreground">
              {stats.total} insights • {stats.unread} unread
              {stats.critical > 0 && (
                <span className="text-red-500">
                  {" "}
                  • {stats.critical} critical
                </span>
              )}
            </p>
          </div>
        </div>
        <Button
          onClick={handleGenerate}
          disabled={generating}
          size="sm"
          variant="outline"
        >
          {generating ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Sparkles className="h-4 w-4 mr-2" />
          )}
          {generating ? "Analyzing..." : "Refresh Insights"}
        </Button>
      </div>

      {/* Insights list */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : insights.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Brain className="h-12 w-12 text-muted-foreground/50 mb-3" />
          <p className="text-sm text-muted-foreground">
            No insights yet. Click &quot;Refresh Insights&quot; to generate
            AI-powered analysis.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {insights.map((insight, index) => {
            const Icon = typeIcons[insight.type] || Brain;
            const isExpanded = expanded.has(insight.id);

            return (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  "rounded-lg border p-4 transition-all",
                  severityColors[insight.severity] || severityColors.MEDIUM,
                  !insight.isRead && "ring-2 ring-primary/20"
                )}
              >
                <div className="flex items-start gap-3">
                  <Icon className="h-5 w-5 shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-semibold">{insight.title}</h3>
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                        {insight.type}
                      </Badge>
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                        {insight.severity}
                      </Badge>
                    </div>
                    <p className="text-sm mt-1 opacity-90">
                      {insight.description}
                    </p>

                    {isExpanded && insight.metadata && (
                      <div className="mt-3 rounded-md bg-black/5 dark:bg-white/5 p-3">
                        <p className="text-xs font-medium mb-1">
                          Raw Data:
                        </p>
                        <pre className="text-xs text-muted-foreground whitespace-pre-wrap">
                          {JSON.stringify(insight.metadata, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => toggleExpand(insight.id)}
                    >
                      {isExpanded ? (
                        <ChevronUp className="h-3.5 w-3.5" />
                      ) : (
                        <ChevronDown className="h-3.5 w-3.5" />
                      )}
                    </Button>
                    {!insight.isRead && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => handleMarkRead(insight.id)}
                        title="Mark as read"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => handleDismiss(insight.id)}
                      title="Dismiss"
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
