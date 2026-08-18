"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Calendar,
  CreditCard,
  ClipboardList,
  FileText,
  Clock,
  ArrowUpRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import {
  getPatientByUserId,
  getPatientAppointments,
  getPatientStats,
} from "@/server/actions/patient-portal";
import { APPOINTMENT_STATUS_COLORS } from "@/lib/constants";

const DEMO_USER_ID = "current-user";

interface PortalAppointment {
  id: string;
  title: string;
  date: Date;
  startTime: string;
  endTime: string;
  duration: number;
  status: string;
  notes: string | null;
  color: string | null;
  doctorName: string;
  treatmentName: string;
  chairName: string;
  createdAt: Date;
}

interface PortalClinic {
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
}

interface PortalPatient {
  firstName: string;
  lastName: string;
  id: string;
  clinic: PortalClinic | null;
  [key: string]: unknown;
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};
const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

export default function PatientPortalDashboard() {
  const [patient, setPatient] = useState<PortalPatient | null>(null);
  const [appointments, setAppointments] = useState<PortalAppointment[]>([]);
  const [stats, setStats] = useState({
    totalAppointments: 0,
    upcomingAppointments: 0,
    totalInvoices: 0,
    unpaidInvoices: 0,
    totalDocuments: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [patientData, apptData, statsData] = await Promise.all([
          getPatientByUserId(DEMO_USER_ID),
          getPatientAppointments(DEMO_USER_ID, { pageSize: 5 }),
          getPatientStats(DEMO_USER_ID),
        ]);
        if (patientData) setPatient(patientData as unknown as PortalPatient);
        setAppointments(apptData.data as unknown as PortalAppointment[]);
        setStats(statsData);
      } catch {
        // Demo mode — use empty data
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const statCards = [
    {
      title: "Upcoming Appointments",
      value: stats.upcomingAppointments,
      icon: Calendar,
      color: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
      href: "/portal/appointments",
    },
    {
      title: "Unpaid Invoices",
      value: stats.unpaidInvoices,
      icon: CreditCard,
      color: "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400",
      href: "/portal/invoices",
    },
    {
      title: "Total Visits",
      value: stats.totalAppointments,
      icon: ClipboardList,
      color: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400",
      href: "/portal/treatments",
    },
    {
      title: "Documents",
      value: stats.totalDocuments,
      icon: FileText,
      color: "bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400",
      href: "/portal/profile",
    },
  ];

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <motion.div variants={item}>
        <PageHeader
          title={`Welcome, ${patient?.firstName ?? "Patient"}`}
          description="Here's an overview of your dental care."
        />
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <motion.div key={stat.title} variants={item}>
            <Link href={stat.href}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer group">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">{stat.title}</p>
                      <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
                    </div>
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.color}`}>
                      <stat.icon className="h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Upcoming Appointments */}
      <motion.div variants={item}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Upcoming Appointments</CardTitle>
            <Link href="/portal/appointments" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1.5">
              View all
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </CardHeader>
          <CardContent>
            {appointments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Calendar className="h-10 w-10 text-muted-foreground/30 mb-3" />
                <p className="text-sm font-medium">No upcoming appointments</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Contact your clinic to schedule a visit.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {appointments.map((apt) => (
                  <div
                    key={apt.id}
                    className="flex items-center gap-4 rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted shrink-0">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {apt.treatmentName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {apt.doctorName} · {apt.chairName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(apt.startTime).toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <Badge
                      variant="secondary"
                      className={`text-xs ${APPOINTMENT_STATUS_COLORS[apt.status] ?? ""}`}
                    >
                      {apt.status?.replace("_", " ")}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Clinic Info */}
      {patient && patient.clinic && (
        <motion.div variants={item}>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Clinic Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm font-medium">Name</p>
                  <p className="text-sm text-muted-foreground">
                    {patient.clinic?.name ?? "SmileOS Dental"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Phone</p>
                  <p className="text-sm text-muted-foreground">
                    {patient.clinic?.phone ?? "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">
                    {patient.clinic?.email ?? "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Address</p>
                  <p className="text-sm text-muted-foreground">
                    {patient.clinic?.address ?? "N/A"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}
