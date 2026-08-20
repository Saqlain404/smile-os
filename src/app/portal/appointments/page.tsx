"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { getPatientAppointments } from "@/server/actions/patient-portal";
import { APPOINTMENT_STATUS_COLORS } from "@/lib/constants";
import { useSession } from "@/lib/auth-client";

interface Appointment {
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

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};
const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

export default function PatientAppointmentsPage() {
  const { data: session } = useSession();
  const userId = session?.user?.id ?? "";

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10, total: 0, totalPages: 0 });
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async (page = 1) => {
    if (!userId) return;
    setLoading(true);
    try {
      const data = await getPatientAppointments(userId, {
        status: statusFilter === "all" ? undefined : statusFilter,
        page,
        pageSize: 10,
      });
      setAppointments(data.data as unknown as Appointment[]);
      setPagination(data.pagination);
    } catch {
      // empty
    } finally {
      setLoading(false);
    }
  }, [statusFilter, userId]);

  useEffect(() => {
    if (userId) fetchData(1);
  }, [fetchData, userId]);

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <motion.div variants={item}>
        <PageHeader
          title="My Appointments"
          description="View your past and upcoming appointments."
        />
      </motion.div>

      <motion.div variants={item}>
        <div className="flex items-center gap-3 mb-4">
          <Select
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v ?? "all")}
          >
            <SelectTrigger className="h-9 w-[160px]">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="BOOKED">Booked</SelectItem>
              <SelectItem value="CONFIRMED">Confirmed</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
              <SelectItem value="NO_SHOW">No Show</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <Card>
            <CardContent className="flex items-center justify-center py-16">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </CardContent>
          </Card>
        ) : appointments.length === 0 ? (
          <Card>
            <CardContent>
              <EmptyState
                title="No appointments found"
                description="You don't have any appointments matching this filter."
              />
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {appointments.map((apt) => (
              <motion.div key={apt.id} variants={item}>
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 shrink-0">
                        <Calendar className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-semibold">
                            {apt.treatmentName}
                          </p>
                          <Badge
                            variant="secondary"
                            className={`text-[10px] ${APPOINTMENT_STATUS_COLORS[apt.status] ?? ""}`}
                          >
                            {apt.status?.replace("_", " ")}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(apt.date).toLocaleDateString("en-US", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                            {apt.startTime ? ` · ${apt.startTime}` : ""}
                          </span>
                          <span>Dr. {apt.doctorName}</span>
                          {apt.chairName && apt.chairName !== "N/A" && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {apt.chairName}
                            </span>
                          )}
                        </div>
                        {apt.notes && (
                          <p className="text-xs text-muted-foreground mt-2 italic">
                            &quot;{apt.notes}&quot;
                          </p>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                          <p className="text-sm font-medium">
                            {apt.duration} min
                          </p>
                        </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              Showing {(pagination.page - 1) * pagination.pageSize + 1}–
              {Math.min(pagination.page * pagination.pageSize, pagination.total)} of{" "}
              {pagination.total}
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page <= 1}
                onClick={() => fetchData(pagination.page - 1)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => fetchData(pagination.page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
