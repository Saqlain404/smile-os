"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/layout/page-header";
import {
  getCalendarAppointments,
  getDoctors,
  moveAppointment,
  updateAppointmentStatus,
} from "@/server/actions/appointment";
import { AppointmentFormDialog } from "./appointment-form-dialog";
import { APPOINTMENT_STATUS_COLORS } from "@/lib/constants";

interface Doctor {
  id: string;
  user: { name: string };
}

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  backgroundColor: string;
  extendedProps: {
    status: string;
    patient: { id: string; firstName: string; lastName: string };
    doctor: string;
    treatment: string | null;
    chair: string | null;
    notes: string | null;
  };
}

export function CalendarView() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<string>("all");
  const [formOpen, setFormOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");

  const loadEvents = useCallback(
    async (start: string, end: string) => {
      try {
        const doctorId = selectedDoctor === "all" ? undefined : selectedDoctor;
        const data = await getCalendarAppointments(start, end, doctorId);
        setEvents(data as CalendarEvent[]);
      } catch (err) {
        console.error("Failed to load events:", err);
      }
    },
    [selectedDoctor],
  );

  useEffect(() => {
    async function loadDoctors() {
      const data = await getDoctors();
      setDoctors(data as Doctor[]);
    }
    loadDoctors();
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleEventDrop = async (info: any) => {
    try {
      const date = info.newDate.toISOString().split("T")[0];
      const startTime = formatTime(info.newDate);
      const endTime = info.newEnd ? formatTime(info.newEnd) : startTime;
      await moveAppointment(info.event.id, date, startTime, endTime);
      loadEvents(
        calendarRef.current?.getApi().view.activeStart.toISOString() ?? "",
        calendarRef.current?.getApi().view.activeEnd.toISOString() ?? "",
      );
    } catch (err) {
      info.revert();
      console.error("Failed to move appointment:", err);
    }
  };

  const calendarRef = useRef<{
    getApi: () => { view: { activeStart: Date; activeEnd: Date } };
  } | null>(null);

  const handleDateClick = (info: { dateStr: string; date: Date }) => {
    setSelectedDate(info.dateStr);
    setSelectedTime(formatTime(info.date));
    setFormOpen(true);
  };

  const handleEventClick = async (info: {
    event: { id: string; extendedProps: Record<string, unknown> };
    jsEvent: MouseEvent;
  }) => {
    info.jsEvent.preventDefault();
    const status = info.event.extendedProps.status as string;
    // Simple status cycle on click
    const statusFlow: Record<string, string> = {
      BOOKED: "CONFIRMED",
      CONFIRMED: "IN_PROGRESS",
      IN_PROGRESS: "COMPLETED",
    };
    if (statusFlow[status]) {
      await updateAppointmentStatus(info.event.id, statusFlow[status]);
      loadEvents(
        calendarRef.current?.getApi().view.activeStart.toISOString() ?? "",
        calendarRef.current?.getApi().view.activeEnd.toISOString() ?? "",
      );
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Calendar"
        description="Visual appointment calendar with drag & drop."
        actions={
          <div className="flex items-center gap-3">
            <Select
              value={selectedDoctor}
              onValueChange={(v) => {
                setSelectedDoctor(v ?? "all");
              }}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Doctors" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Doctors</SelectItem>
                {doctors.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={() => {
                setSelectedDate(new Date().toISOString().split("T")[0]);
                setSelectedTime("09:00");
                setFormOpen(true);
              }}
              className="gap-1.5"
            >
              New Appointment
            </Button>
          </div>
        }
      />

      {/* Legend */}
      <div className="flex flex-wrap gap-3">
        {Object.entries(APPOINTMENT_STATUS_COLORS).map(
          ([status, colorClass]) => (
            <div key={status} className="flex items-center gap-2">
              <div
                className={`h-3 w-3 rounded-full ${colorClass.includes("bg-") ? colorClass.split(" ")[0].replace("/10", "").replace("/20", "") : "bg-gray-400"}`}
              />
              <span className="text-xs text-muted-foreground">
                {status.replace("_", " ")}
              </span>
            </div>
          ),
        )}
      </div>

      {/* Calendar */}
      <div className="rounded-xl border bg-card p-4">
        <FullCalendar
          plugins={[
            dayGridPlugin,
            timeGridPlugin,
            interactionPlugin,
            listPlugin,
          ]}
          initialView="timeGridWeek"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
          }}
          events={events}
          editable
          droppable
          selectable
          selectMirror
          dayMaxEvents
          weekends
          nowIndicator
          height="auto"
          slotMinTime="07:00:00"
          slotMaxTime="20:00:00"
          allDaySlot={false}
          eventDrop={handleEventDrop}
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          datesSet={(dateInfo: { start: Date; end: Date }) => {
            loadEvents(
              dateInfo.start.toISOString(),
              dateInfo.end.toISOString(),
            );
          }}
          eventContent={(arg: {
            event: { title: string; extendedProps: Record<string, unknown> };
          }) => (
            <div className="px-1 py-0.5 text-xs overflow-hidden cursor-pointer">
              <p className="font-medium truncate">{arg.event.title}</p>
              {(
                arg.event.extendedProps as {
                  patient: { firstName: string; lastName: string };
                }
              ).patient && (
                <p className="opacity-75 truncate">
                  {
                    (
                      arg.event.extendedProps as {
                        patient: { firstName: string; lastName: string };
                      }
                    ).patient.firstName
                  }{" "}
                  {
                    (
                      arg.event.extendedProps as {
                        patient: { firstName: string; lastName: string };
                      }
                    ).patient.lastName
                  }
                </p>
              )}
            </div>
          )}
          eventClassNames="rounded-lg border-0 cursor-pointer shadow-sm"
        />
      </div>

      <AppointmentFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        defaultDate={selectedDate}
        defaultTime={selectedTime}
        onSuccess={() => {
          setFormOpen(false);
          loadEvents(
            calendarRef.current?.getApi().view.activeStart.toISOString() ?? "",
            calendarRef.current?.getApi().view.activeEnd.toISOString() ?? "",
          );
        }}
      />
    </div>
  );
}

function formatTime(date: Date): string {
  return `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
}
