"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  Users,
  Armchair,
  Clock,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getAIScheduleOptimization } from "@/server/actions/ai";

interface ScheduleData {
  summary: {
    upcomingTotal: number;
    doctorCount: number;
    chairCount: number;
  };
  peakHours: Array<{ hour: string; count: number }>;
  doctorUtilization: Array<{
    name: string;
    specialization: string;
    upcomingCount: number;
    utilization: number;
  }>;
  chairUtilization: Array<{
    name: string;
    color: string;
    upcomingCount: number;
  }>;
  recommendations: Array<{
    type: "low_bookings" | "overbooked" | "underutilized";
    message: string;
  }>;
}

export function AISchedulePanel() {
  const [data, setData] = useState<ScheduleData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const result = await getAIScheduleOptimization();
    setData(result as ScheduleData | null);
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <Calendar className="h-10 w-10 text-muted-foreground/50 mb-2" />
        <p className="text-sm text-muted-foreground">
          No schedule data available.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <Calendar className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Smart Scheduling</h2>
          <p className="text-sm text-muted-foreground">
            AI-powered schedule optimization
          </p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border bg-card p-4 text-center">
          <Calendar className="h-5 w-5 mx-auto mb-1 text-primary" />
          <p className="text-2xl font-bold">{data.summary.upcomingTotal}</p>
          <p className="text-xs text-muted-foreground">Upcoming Appointments</p>
        </div>
        <div className="rounded-lg border bg-card p-4 text-center">
          <Users className="h-5 w-5 mx-auto mb-1 text-primary" />
          <p className="text-2xl font-bold">{data.summary.doctorCount}</p>
          <p className="text-xs text-muted-foreground">Active Doctors</p>
        </div>
        <div className="rounded-lg border bg-card p-4 text-center">
          <Armchair className="h-5 w-5 mx-auto mb-1 text-primary" />
          <p className="text-2xl font-bold">{data.summary.chairCount}</p>
          <p className="text-xs text-muted-foreground">Active Chairs</p>
        </div>
      </div>

      {/* Peak hours */}
      {data.peakHours.length > 0 && (
        <div className="rounded-lg border bg-card p-4">
          <h3 className="font-medium text-sm mb-3 flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Peak Hours
          </h3>
          <div className="space-y-2">
            {data.peakHours.map((peak, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-sm font-mono w-14">{peak.hour}</span>
                <div className="flex-1 bg-muted rounded-full h-4 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width: `${(peak.count / Math.max(...data.peakHours.map((p) => p.count))) * 100}%`,
                    }}
                    transition={{ delay: i * 0.2, duration: 0.5 }}
                    className="h-full bg-primary rounded-full"
                  />
                </div>
                <span className="text-sm text-muted-foreground w-8 text-right">
                  {peak.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Doctor utilization */}
      {data.doctorUtilization.length > 0 && (
        <div className="rounded-lg border bg-card p-4">
          <h3 className="font-medium text-sm mb-3 flex items-center gap-2">
            <Users className="h-4 w-4" />
            Doctor Utilization
          </h3>
          <div className="space-y-3">
            {data.doctorUtilization.map((doc, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-1">
                  <div>
                    <span className="text-sm font-medium">{doc.name}</span>
                    {doc.specialization && (
                      <span className="text-xs text-muted-foreground ml-2">
                        {doc.specialization}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {doc.upcomingCount} appts
                    </span>
                    <Badge
                      variant="outline"
                      className={`text-[10px] ${
                        doc.utilization > 80
                          ? "bg-orange-100 text-orange-800"
                          : doc.utilization < 20
                            ? "bg-blue-100 text-blue-800"
                            : "bg-green-100 text-green-800"
                      }`}
                    >
                      {doc.utilization}%
                    </Badge>
                  </div>
                </div>
                <div className="bg-muted rounded-full h-2 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(doc.utilization, 100)}%` }}
                    transition={{ delay: i * 0.1, duration: 0.5 }}
                    className={`h-full rounded-full ${
                      doc.utilization > 80
                        ? "bg-orange-500"
                        : doc.utilization < 20
                          ? "bg-blue-500"
                          : "bg-green-500"
                    }`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Chair utilization */}
      {data.chairUtilization.length > 0 && (
        <div className="rounded-lg border bg-card p-4">
          <h3 className="font-medium text-sm mb-3 flex items-center gap-2">
            <Armchair className="h-4 w-4" />
            Chair Schedule
          </h3>
          <div className="grid gap-2 sm:grid-cols-2">
            {data.chairUtilization.map((chair, i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-md border p-3"
              >
                <div
                  className="h-3 w-3 rounded-full shrink-0"
                  style={{ backgroundColor: chair.color }}
                />
                <div className="flex-1">
                  <span className="text-sm font-medium">{chair.name}</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {chair.upcomingCount} appts
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {data.recommendations.length > 0 && (
        <div className="rounded-lg border bg-card p-4">
          <h3 className="font-medium text-sm mb-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            AI Recommendations
          </h3>
          <div className="space-y-2">
            {data.recommendations.map((rec, i) => (
              <div
                key={i}
                className="flex items-start gap-2 rounded-md bg-muted/50 p-3"
              >
                {rec.type === "overbooked" ? (
                  <AlertTriangle className="h-4 w-4 shrink-0 text-orange-500 mt-0.5" />
                ) : rec.type === "low_bookings" ? (
                  <TrendingDown className="h-4 w-4 shrink-0 text-blue-500 mt-0.5" />
                ) : (
                  <TrendingUp className="h-4 w-4 shrink-0 text-green-500 mt-0.5" />
                )}
                <p className="text-sm">{rec.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
