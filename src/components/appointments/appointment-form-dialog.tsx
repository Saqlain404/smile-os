"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  appointmentSchema,
  type AppointmentFormData,
} from "@/lib/validations";
import {
  createAppointment,
  updateAppointment,
  getDoctors,
  getChairs,
  getTreatments,
} from "@/server/actions/appointment";
import { getPatients } from "@/server/actions/patient";
import { DURATIONS, TIME_SLOTS } from "@/lib/constants";

interface AppointmentFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment?: Record<string, unknown> | null;
  defaultDate?: string;
  defaultTime?: string;
  onSuccess: () => void;
}

interface Doctor {
  id: string;
  user: { name: string };
  department: { name: string } | null;
}

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
}

interface Chair {
  id: string;
  name: string;
}

interface Treatment {
  id: string;
  name: string;
  duration: number;
  price: number;
  color: string;
}

export function AppointmentFormDialog({
  open,
  onOpenChange,
  appointment,
  defaultDate,
  defaultTime,
  onSuccess,
}: AppointmentFormDialogProps) {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [chairs, setChairs] = useState<Chair[]>([]);
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [patientSearch, setPatientSearch] = useState("");
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { isSubmitting },
  } = useForm({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      patientId: "",
      doctorId: "",
      treatmentId: "",
      chairId: "",
      title: "",
      description: "",
      date: defaultDate ?? new Date().toISOString().split("T")[0],
      startTime: defaultTime ?? "09:00",
      endTime: defaultTime ? calculateEndTime(defaultTime, 30) : "09:30",
      duration: 30,
      notes: "",
      status: "BOOKED",
      isRecurring: false,
    },
  });

  const watchDoctorId = watch("doctorId");
  const watchTreatmentId = watch("treatmentId");
  const watchStartTime = watch("startTime");
  const watchDuration = watch("duration");

  useEffect(() => {
    if (watchStartTime && watchDuration) {
      const end = calculateEndTime(watchStartTime, watchDuration);
      setValue("endTime", end);
    }
  }, [watchStartTime, watchDuration, setValue]);

  useEffect(() => {
    async function loadData() {
      try {
        const [doctorResult, patientResult, chairResult] = await Promise.all([
          getDoctors(),
          getPatients({ pageSize: 100 }),
          getChairs(),
        ]);
        setDoctors(doctorResult as Doctor[]);
        setPatients(patientResult.data as Patient[]);
        setChairs(chairResult as Chair[]);
      } catch (err) {
        console.error("Failed to load form data:", err);
      }
    }
    if (open) loadData();
  }, [open]);

  useEffect(() => {
    async function loadTreatments() {
      try {
        const raw = await getTreatments();
        const data = raw.map((t) => ({ ...t, price: Number(t.price) }));
        setTreatments(data as Treatment[]);
      } catch (err) {
        console.error("Failed to load treatments:", err);
      }
    }
    if (open) loadTreatments();
  }, [open]);

  useEffect(() => {
    if (watchTreatmentId) {
      const treatment = treatments.find((t) => t.id === watchTreatmentId);
      if (treatment) {
        setValue("duration", treatment.duration);
        if (!appointment) {
          setValue("title", treatment.name);
        }
      }
    }
  }, [watchTreatmentId, treatments, setValue, appointment]);

  useEffect(() => {
    if (appointment) {
      reset({
        patientId: appointment.patientId as string,
        doctorId: appointment.doctorId as string,
        treatmentId: (appointment.treatmentId as string) ?? "",
        chairId: (appointment.chairId as string) ?? "",
        title: appointment.title as string,
        description: (appointment.description as string) ?? "",
        date: new Date(appointment.date as string).toISOString().split("T")[0],
        startTime: appointment.startTime as string,
        endTime: appointment.endTime as string,
        duration: appointment.duration as number,
        notes: (appointment.notes as string) ?? "",
        status: ((appointment.status as string) ?? "BOOKED") as AppointmentFormData["status"],
        isRecurring: false,
      });
    } else {
      reset({
        patientId: "",
        doctorId: "",
        treatmentId: "",
        chairId: "",
        title: "",
        description: "",
        date: defaultDate ?? new Date().toISOString().split("T")[0],
        startTime: defaultTime ?? "09:00",
        endTime: defaultTime ? calculateEndTime(defaultTime, 30) : "09:30",
        duration: 30,
        notes: "",
        status: "BOOKED",
        isRecurring: false,
      });
    }
  }, [appointment, reset, defaultDate, defaultTime]);

  const onSubmit = async (data: Record<string, unknown>) => {
    setError("");
    try {
      if (appointment) {
        await updateAppointment(appointment.id as string, data as Partial<AppointmentFormData>);
      } else {
        await createAppointment(data as AppointmentFormData);
      }
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save appointment");
    }
  };

  const filteredPatients = patients.filter((p) => {
    const search = patientSearch.toLowerCase();
    return (
      p.firstName.toLowerCase().includes(search) ||
      p.lastName.toLowerCase().includes(search) ||
      p.phone.includes(search)
    );
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {appointment ? "Edit Appointment" : "New Appointment"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Patient & Doctor */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-muted-foreground">
              Appointment Details
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Patient *</Label>
                <Select
                  value={watch("patientId") ?? ""}
                  onValueChange={(v) => v && setValue("patientId", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select patient" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredPatients.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.firstName} {p.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Doctor *</Label>
                <Select
                  value={watch("doctorId") ?? ""}
                  onValueChange={(v) => v && setValue("doctorId", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select doctor" />
                  </SelectTrigger>
                  <SelectContent>
                    {doctors.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.user.name}
                        {d.department && (
                          <span className="text-muted-foreground ml-1">
                            ({d.department.name})
                          </span>
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Treatment */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-muted-foreground">
              Treatment & Chair
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Treatment</Label>
                <Select
                  value={watch("treatmentId") ?? ""}
                  onValueChange={(v) => v && setValue("treatmentId", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select treatment" />
                  </SelectTrigger>
                  <SelectContent>
                    {treatments.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name} (${t.price})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Chair</Label>
                <Select
                  value={watch("chairId") ?? ""}
                  onValueChange={(v) => v && setValue("chairId", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select chair" />
                  </SelectTrigger>
                  <SelectContent>
                    {chairs.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Date & Time */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-muted-foreground">
              Schedule
            </h4>
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input id="title" {...register("title")} placeholder="Appointment title" />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date *</Label>
                <Input id="date" type="date" {...register("date")} />
              </div>
              <div className="space-y-2">
                <Label>Start Time *</Label>
                <Select
                  value={watch("startTime") ?? "09:00"}
                  onValueChange={(v) => v && setValue("startTime", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_SLOTS.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Duration</Label>
                <Select
                  value={String(watchDuration)}
                  onValueChange={(v) => setValue("duration", Number(v))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DURATIONS.map((d) => (
                      <SelectItem key={d} value={String(d)}>
                        {d} min
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" {...register("notes")} rows={2} placeholder="Additional notes..." />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : appointment ? (
                "Save Changes"
              ) : (
                "Book Appointment"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function calculateEndTime(startTime: string, durationMinutes: number): string {
  const [hours, minutes] = startTime.split(":").map(Number);
  const totalMinutes = hours * 60 + minutes + durationMinutes;
  const endHours = Math.floor(totalMinutes / 60) % 24;
  const endMinutes = totalMinutes % 60;
  return `${endHours.toString().padStart(2, "0")}:${endMinutes.toString().padStart(2, "0")}`;
}
