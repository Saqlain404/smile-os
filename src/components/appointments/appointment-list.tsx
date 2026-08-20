"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Plus, MoreHorizontal, Eye, Pencil, Trash2, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable, type Column } from "@/components/shared/data-table";
import { PageHeader } from "@/components/layout/page-header";
import {
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  getAppointments,
  deleteAppointment,
  updateAppointmentStatus,
} from "@/server/actions/appointment";
import { AppointmentFormDialog } from "./appointment-form-dialog";
import { useDebounce } from "@/hooks/use-debounce";
import {
  APPOINTMENT_STATUS_COLORS,
  TIME_SLOTS,
} from "@/lib/constants";

interface AppointmentRow {
  id: string;
  title: string;
  date: Date | string;
  startTime: string;
  endTime: string;
  duration: number;
  status: string;
  notes: string | null;
  patient: {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
  };
  doctor: {
    id: string;
    user: { name: string; image: string | null };
  };
  treatment: {
    id: string;
    name: string;
    color: string;
  } | null;
  chair: {
    id: string;
    name: string;
  } | null;
  [key: string]: unknown;
}

export function AppointmentList() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<AppointmentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 0,
  });
  const [formOpen, setFormOpen] = useState(false);
  const [editAppointment, setEditAppointment] = useState<AppointmentRow | null>(null);

  const debouncedSearch = useDebounce(search, 300);

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getAppointments({ page, pageSize: 20 });
      setAppointments(result.data as AppointmentRow[]);
      setPagination(result.pagination);
    } catch (error) {
      // silent
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const handleDelete = async (id: string) => {
    if (!confirm("Cancel this appointment?")) return;
    await deleteAppointment(id);
    fetchAppointments();
  };

  const handleStatusChange = async (id: string, status: string) => {
    await updateAppointmentStatus(id, status);
    fetchAppointments();
  };

  const columns: Column<AppointmentRow>[] = [
    {
      id: "patient",
      header: "Patient",
      accessorFn: (row) => (
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-medium shrink-0">
            {row.patient.firstName.charAt(0)}
            {row.patient.lastName.charAt(0)}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">
              {row.patient.firstName} {row.patient.lastName}
            </p>
            <p className="text-xs text-muted-foreground">{row.patient.phone}</p>
          </div>
        </div>
      ),
    },
    {
      id: "date",
      header: "Date & Time",
      sortable: true,
      accessorKey: "date",
      accessorFn: (row) => (
        <div>
          <p className="text-sm font-medium">
            {new Date(row.date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </p>
          <p className="text-xs text-muted-foreground">
            {row.startTime} - {row.endTime}
          </p>
        </div>
      ),
    },
    {
      id: "doctor",
      header: "Doctor",
      accessorFn: (row) => (
        <span className="text-sm">{row.doctor.user.name}</span>
      ),
    },
    {
      id: "treatment",
      header: "Treatment",
      accessorFn: (row) =>
        row.treatment ? (
          <Badge variant="secondary" className="text-xs" style={{ backgroundColor: row.treatment.color + "20", color: row.treatment.color }}>
            {row.treatment.name}
          </Badge>
        ) : (
          <span className="text-sm text-muted-foreground">—</span>
        ),
    },
    {
      id: "chair",
      header: "Chair",
      accessorFn: (row) => (
        <span className="text-sm">{row.chair?.name ?? "—"}</span>
      ),
    },
    {
      id: "status",
      header: "Status",
      accessorFn: (row) => (
        <Badge
          variant="secondary"
          className={`text-xs ${APPOINTMENT_STATUS_COLORS[row.status] ?? ""}`}
        >
          {row.status.replace("_", " ")}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Appointments"
        description="Manage and schedule patient appointments."
        actions={
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => router.push("/calendar")}
              className="gap-1.5"
            >
              <CalendarDays className="h-4 w-4" />
              Calendar View
            </Button>
            <Button onClick={() => { setEditAppointment(null); setFormOpen(true); }} className="gap-1.5">
              <Plus className="h-4 w-4" />
              New Appointment
            </Button>
          </div>
        }
      />

      <DataTable
        columns={columns}
        data={appointments}
        searchPlaceholder="Search by patient name..."
        onSearch={setSearch}
        pagination={pagination}
        onPageChange={setPage}
        loading={loading}
        emptyTitle="No appointments found"
        emptyDescription="Schedule your first appointment."
        getRowId={(row) => row.id}
        actions={(row) => (
          <>
            <DropdownMenuItem onClick={() => router.push(`/patients/${row.patient.id}`)}>
              <Eye className="h-4 w-4 mr-2" />
              View Patient
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => { setEditAppointment(row); setFormOpen(true); }}>
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </DropdownMenuItem>
            {row.status === "BOOKED" && (
              <DropdownMenuItem onClick={() => handleStatusChange(row.id, "CONFIRMED")}>
                Confirm
              </DropdownMenuItem>
            )}
            {["BOOKED", "CONFIRMED"].includes(row.status) && (
              <DropdownMenuItem onClick={() => handleStatusChange(row.id, "IN_PROGRESS")}>
                Start
              </DropdownMenuItem>
            )}
            {row.status === "IN_PROGRESS" && (
              <DropdownMenuItem onClick={() => handleStatusChange(row.id, "COMPLETED")}>
                Complete
              </DropdownMenuItem>
            )}
            {["BOOKED", "CONFIRMED"].includes(row.status) && (
              <DropdownMenuItem onClick={() => handleStatusChange(row.id, "NO_SHOW")}>
                No Show
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => handleDelete(row.id)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Cancel
            </DropdownMenuItem>
          </>
        )}
      />

      <AppointmentFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        appointment={editAppointment}
        onSuccess={() => {
          fetchAppointments();
          setFormOpen(false);
          setEditAppointment(null);
        }}
      />
    </div>
  );
}
