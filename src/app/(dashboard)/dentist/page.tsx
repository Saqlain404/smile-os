"use client";

import { motion } from "framer-motion";
import {
  Calendar,
  FileText,
  Stethoscope,
  ClipboardList,
  Upload,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import { Skeleton } from "@/components/shared/loading-skeleton";
import { EmptyState } from "@/components/shared/empty-state";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

const todaySchedule = [
  { time: "09:00", patient: "Sarah Johnson", type: "Checkup", status: "Completed", chair: "Chair 1" },
  { time: "09:30", patient: "Mike Chen", type: "Filling", status: "In Progress", chair: "Chair 2" },
  { time: "10:00", patient: "Emma Davis", type: "Crown Prep", status: "Confirmed", chair: "Chair 1" },
  { time: "10:30", patient: "James Wilson", type: "Root Canal", status: "Confirmed", chair: "Chair 3" },
  { time: "11:00", patient: "Lisa Brown", type: "Cleaning", status: "Booked", chair: "Chair 1" },
];

const statusColors: Record<string, string> = {
  Completed: "bg-emerald-100 text-emerald-800",
  "In Progress": "bg-yellow-100 text-yellow-800",
  Confirmed: "bg-blue-100 text-blue-800",
  Booked: "bg-gray-100 text-gray-800",
};

export default function DentistPage() {
  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item}>
        <PageHeader
          title="Dentist Dashboard"
          description="Your schedule, clinical notes, and patient records."
        />
      </motion.div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Today's Schedule */}
        <motion.div variants={item} className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Today&apos;s Schedule</CardTitle>
              <Badge variant="secondary">{todaySchedule.length} appointments</Badge>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {todaySchedule.map((apt, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                  >
                    <div className="text-center min-w-[48px]">
                      <p className="text-sm font-medium">{apt.time}</p>
                      <p className="text-[11px] text-muted-foreground">{apt.chair}</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{apt.patient}</p>
                      <p className="text-xs text-muted-foreground">{apt.type}</p>
                    </div>
                    <Badge variant="secondary" className={`text-xs ${statusColors[apt.status] ?? ""}`}>
                      {apt.status}
                    </Badge>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost">
                        <FileText className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="sm" variant="ghost">
                        <Upload className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={item}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-base">Clinical Tools</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start gap-3">
                <Stethoscope className="h-4 w-4" />
                New Consultation
              </Button>
              <Button variant="outline" className="w-full justify-start gap-3">
                <ClipboardList className="h-4 w-4" />
                Clinical Notes
              </Button>
              <Button variant="outline" className="w-full justify-start gap-3">
                <FileText className="h-4 w-4" />
                Treatment Plan
              </Button>
              <Button variant="outline" className="w-full justify-start gap-3">
                <Upload className="h-4 w-4" />
                Upload X-Ray
              </Button>
              <Button variant="outline" className="w-full justify-start gap-3">
                <ClipboardList className="h-4 w-4" />
                Prescription
              </Button>
              <Button variant="outline" className="w-full justify-start gap-3">
                <Clock className="h-4 w-4" />
                Follow-up Reminders
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
