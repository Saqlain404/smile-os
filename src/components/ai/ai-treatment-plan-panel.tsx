"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  ClipboardList,
  AlertCircle,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { getAITreatmentPlan } from "@/server/actions/ai";

interface Recommendation {
  treatment: string;
  reason: string;
  estimatedCost: number;
  estimatedDuration: number;
  urgency: "routine" | "soon" | "urgent";
  phase: number;
}

const urgencyColors: Record<string, string> = {
  routine: "bg-blue-100 text-blue-800",
  soon: "bg-yellow-100 text-yellow-800",
  urgent: "bg-red-100 text-red-800",
};

export function AITreatmentPlanPanel() {
  const [patientId, setPatientId] = useState("");
  const [result, setResult] = useState<{
    patient: { name: string; diagnoses: string[] };
    recommendations: Recommendation[];
    summary: {
      totalProcedures: number;
      totalEstimatedCost: number;
      totalEstimatedDuration: number;
      urgencyBreakdown: { urgent: number; soon: number; routine: number };
    };
  } | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSearch() {
    if (!patientId.trim()) return;
    setLoading(true);
    try {
      const data = await getAITreatmentPlan(patientId);
      if (data) {
        setResult({
          ...data,
          patient: {
            ...data.patient,
            diagnoses: data.patient.diagnoses.filter((d): d is string => d !== null),
          },
        });
      } else {
        setResult(null);
      }
    } catch {
      setResult(null);
    }
    setLoading(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <ClipboardList className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">AI Treatment Planning</h2>
          <p className="text-sm text-muted-foreground">
            Smart treatment recommendations
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="Enter Patient ID..."
          value={patientId}
          onChange={(e) => setPatientId(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
        <Button onClick={handleSearch} disabled={!patientId.trim() || loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Generate Plan"}
        </Button>
      </div>

      {result && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border bg-card p-4">
              <h3 className="font-medium text-sm mb-1">Patient</h3>
              <p className="text-lg font-semibold">{result.patient.name}</p>
              {result.patient.diagnoses.length > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  Diagnoses: {result.patient.diagnoses.join(", ")}
                </p>
              )}
            </div>
            <div className="rounded-lg border bg-card p-4 space-y-2">
              <h3 className="font-medium text-sm">Plan Summary</h3>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-lg font-bold">{result.summary.totalProcedures}</p>
                  <p className="text-[10px] text-muted-foreground">Procedures</p>
                </div>
                <div>
                  <p className="text-lg font-bold">
                    ${result.summary.totalEstimatedCost.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-muted-foreground">Est. Cost</p>
                </div>
                <div>
                  <p className="text-lg font-bold">
                    {result.summary.totalEstimatedDuration}min
                  </p>
                  <p className="text-[10px] text-muted-foreground">Duration</p>
                </div>
              </div>
              <div className="flex gap-1 justify-center">
                {result.summary.urgencyBreakdown.urgent > 0 && (
                  <Badge className="text-[10px] bg-red-100 text-red-800">
                    {result.summary.urgencyBreakdown.urgent} Urgent
                  </Badge>
                )}
                {result.summary.urgencyBreakdown.soon > 0 && (
                  <Badge className="text-[10px] bg-yellow-100 text-yellow-800">
                    {result.summary.urgencyBreakdown.soon} Soon
                  </Badge>
                )}
                {result.summary.urgencyBreakdown.routine > 0 && (
                  <Badge className="text-[10px] bg-blue-100 text-blue-800">
                    {result.summary.urgencyBreakdown.routine} Routine
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            {result.recommendations.map((rec, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="rounded-lg border bg-card p-4"
              >
                <div className="flex items-start gap-3">
                  {rec.urgency === "urgent" ? (
                    <AlertCircle className="h-5 w-5 shrink-0 text-red-500" />
                  ) : (
                    <CheckCircle className="h-5 w-5 shrink-0 text-primary" />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-semibold">{rec.treatment}</h4>
                      <Badge
                        className={`text-[10px] ${urgencyColors[rec.urgency]}`}
                      >
                        {rec.urgency}
                      </Badge>
                      <Badge variant="outline" className="text-[10px]">
                        Phase {rec.phase}
                      </Badge>
                    </div>
                    <p className="text-sm mt-1 text-muted-foreground">{rec.reason}</p>
                    <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                      <span>Cost: ${rec.estimatedCost.toLocaleString()}</span>
                      <span>Duration: {rec.estimatedDuration} min</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {!result && !loading && (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <ClipboardList className="h-10 w-10 text-muted-foreground/50 mb-2" />
          <p className="text-sm text-muted-foreground">
            Enter a patient ID to generate an AI-powered treatment plan.
          </p>
        </div>
      )}
    </div>
  );
}
