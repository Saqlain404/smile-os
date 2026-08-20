"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ClipboardList, Pill, Stethoscope } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { getPatientTreatments } from "@/server/actions/patient-portal";
import { useSession } from "@/lib/auth-client";

interface PrescriptionItem {
  id: string;
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string | null;
}

interface Consultation {
  id: string;
  treatmentPlan: string;
  diagnosis: string | null;
  notes: string | null;
  doctorName: string;
  date: Date;
  createdAt: Date;
}

interface Prescription {
  id: string;
  doctorName: string;
  diagnosis: string;
  notes: string | null;
  date: Date;
  items: PrescriptionItem[];
  createdAt: Date;
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};
const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

export default function PatientTreatmentsPage() {
  const [data, setData] = useState<{
    consultations: Consultation[];
    prescriptions: Prescription[];
  }>({ consultations: [], prescriptions: [] });
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();
  const userId = session?.user?.id ?? "";

  useEffect(() => {
    if (!userId) return;

    async function load() {
      try {
        const result = await getPatientTreatments(userId);
        setData(result as unknown as { consultations: Consultation[]; prescriptions: Prescription[] });
      } catch {
        // empty
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [userId]);

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <motion.div variants={item}>
        <PageHeader
          title="Treatment History"
          description="Review your consultations and prescriptions."
        />
      </motion.div>

      <motion.div variants={item}>
        <Tabs defaultValue="consultations">
          <TabsList>
            <TabsTrigger value="consultations" className="gap-1.5">
              <Stethoscope className="h-3.5 w-3.5" />
              Consultations
            </TabsTrigger>
            <TabsTrigger value="prescriptions" className="gap-1.5">
              <Pill className="h-3.5 w-3.5" />
              Prescriptions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="consultations" className="mt-4">
            {loading ? (
              <Card>
                <CardContent className="flex items-center justify-center py-16">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </CardContent>
              </Card>
            ) : data.consultations.length === 0 ? (
              <Card>
                <CardContent>
                  <EmptyState
                    title="No consultations"
                    description="Your consultation history will appear here."
                  />
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {data.consultations.map((c) => (
                  <Card key={c.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                          <Stethoscope className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-semibold">{c.treatmentPlan || "Consultation"}</p>
                          </div>
                          {c.diagnosis && (
                            <p className="text-sm text-muted-foreground mb-1">
                              <span className="font-medium">Diagnosis:</span> {c.diagnosis}
                            </p>
                          )}
                          {c.notes && (
                            <p className="text-xs text-muted-foreground italic">
                              &quot;{c.notes}&quot;
                            </p>
                          )}
                          <div className="flex items-center gap-3 mt-2 text-[11px] text-muted-foreground">
                            <span>Dr. {c.doctorName}</span>
                            <span>·</span>
                            <span>
                              {new Date(c.createdAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="prescriptions" className="mt-4">
            {loading ? (
              <Card>
                <CardContent className="flex items-center justify-center py-16">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </CardContent>
              </Card>
            ) : data.prescriptions.length === 0 ? (
              <Card>
                <CardContent>
                  <EmptyState
                    title="No prescriptions"
                    description="Your prescriptions will appear here."
                  />
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {data.prescriptions.map((p) => (
                  <Card key={p.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 dark:bg-green-900/20 shrink-0">
                          <Pill className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-semibold">Prescription</p>
                            {p.diagnosis && (
                              <Badge variant="secondary" className="text-[10px]">
                                {p.diagnosis}
                              </Badge>
                            )}
                          </div>
                          {p.items && p.items.length > 0 && (
                            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-0.5">
                              {p.items.map((item, idx) => (
                                <li key={idx}>
                                  {item.medication} — {item.dosage}, {item.frequency} for {item.duration}
                                  {item.instructions ? ` (${item.instructions})` : ""}
                                </li>
                              ))}
                            </ul>
                          )}
                          {p.notes && (
                            <p className="text-xs text-muted-foreground italic mt-2">
                              &quot;{p.notes}&quot;
                            </p>
                          )}
                          <p className="text-[11px] text-muted-foreground mt-2">
                            {new Date(p.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
}
