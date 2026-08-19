"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Brain,
  AlertTriangle,
  CheckCircle,
  Shield,
  Pill,
  User,
  Loader2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getAIDiagnosisSuggestions } from "@/server/actions/ai";

interface Suggestion {
  category: string;
  title: string;
  description: string;
  confidence: number;
  priority: "low" | "medium" | "high";
}

const priorityColors: Record<string, string> = {
  low: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  medium:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  high: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

const categoryIcons: Record<string, React.ElementType> = {
  "Safety Alert": Shield,
  "Medical Consideration": AlertTriangle,
  "Dental History": Brain,
  Behavioral: User,
  "Medication Review": Pill,
  "Preventive Care": CheckCircle,
  General: Brain,
};

export function AIDiagnosisPanel() {
  const [patientId, setPatientId] = useState("");
  const [result, setResult] = useState<{
    patient: { name: string; age: number | null; allergies: string | null; medicalHistory: string | null };
    suggestions: Suggestion[];
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  function toggleExpand(index: number) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  async function handleSearch() {
    if (!patientId.trim()) return;
    setLoading(true);
    try {
      const data = await getAIDiagnosisSuggestions(patientId);
      setResult(data);
    } catch {
      setResult(null);
    }
    setLoading(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <Brain className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">AI Diagnosis Assistant</h2>
          <p className="text-sm text-muted-foreground">
            AI-powered clinical decision support
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Enter Patient ID..."
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
            className="pl-9"
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
        </div>
        <Button onClick={handleSearch} disabled={!patientId.trim() || loading}>
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Analyze"
          )}
        </Button>
      </div>

      {/* Results */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          {/* Patient info */}
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">{result.patient.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {result.patient.age ? `${result.patient.age} years old` : "Age unknown"}
                  {result.patient.allergies && (
                    <span className="text-red-500 ml-2">
                      • Allergies: {result.patient.allergies}
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Suggestions */}
          {result.suggestions.map((suggestion, index) => {
            const Icon = categoryIcons[suggestion.category] || Brain;
            const isExpanded = expanded.has(index);

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="rounded-lg border bg-card p-4"
              >
                <div className="flex items-start gap-3">
                  <Icon className="h-5 w-5 shrink-0 mt-0.5 text-primary" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-semibold">
                        {suggestion.title}
                      </h4>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px] px-1.5 py-0",
                          priorityColors[suggestion.priority]
                        )}
                      >
                        {suggestion.priority}
                      </Badge>
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                        {suggestion.category}
                      </Badge>
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                        {Math.round(suggestion.confidence * 100)}% confidence
                      </Badge>
                    </div>
                    <p className="text-sm mt-1 text-muted-foreground">
                      {suggestion.description}
                    </p>

                    {isExpanded && (
                      <div className="mt-3 rounded-md bg-muted/50 p-3">
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div>
                            <span className="text-muted-foreground">Category:</span>{" "}
                            <span className="font-medium">{suggestion.category}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Priority:</span>{" "}
                            <span className="font-medium capitalize">{suggestion.priority}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Confidence:</span>{" "}
                            <span className="font-medium">{Math.round(suggestion.confidence * 100)}%</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 shrink-0"
                    onClick={() => toggleExpand(index)}
                  >
                    {isExpanded ? (
                      <ChevronUp className="h-3.5 w-3.5" />
                    ) : (
                      <ChevronDown className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {!result && !loading && (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Brain className="h-10 w-10 text-muted-foreground/50 mb-2" />
          <p className="text-sm text-muted-foreground">
            Enter a patient ID to get AI-powered diagnosis suggestions and risk
            assessments.
          </p>
        </div>
      )}
    </div>
  );
}
