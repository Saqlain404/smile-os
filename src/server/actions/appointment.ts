"use server";

import { requireSession } from "@/lib/auth-server";
import prisma from "@/lib/prisma";

export async function getAppointments(params: {
  start?: string;
  end?: string;
  doctorId?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}) {
  await requireSession();
  const { start, end, doctorId, status, page = 1, pageSize = 50 } = params;
  const skip = (page - 1) * pageSize;

  const where: Record<string, unknown> = {};

  if (start && end) {
    where.date = {
      gte: new Date(start),
      lte: new Date(end),
    };
  }

  if (doctorId) {
    where.doctorId = doctorId;
  }

  if (status) {
    where.status = status;
  }

  const [appointments, total] = await Promise.all([
    prisma.appointment.findMany({
      where,
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            avatar: true,
          },
        },
        doctor: {
          include: {
            user: {
              select: { name: true, image: true },
            },
          },
        },
        treatment: {
          select: { id: true, name: true, color: true, duration: true },
        },
        chair: {
          select: { id: true, name: true },
        },
      },
      orderBy: [{ date: "asc" }, { startTime: "asc" }],
      skip,
      take: pageSize,
    }),
    prisma.appointment.count({ where }),
  ]);

  return {
    data: appointments,
    pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
  };
}

export async function getCalendarAppointments(start: string, end: string, doctorId?: string) {
  await requireSession();
  const where: Record<string, unknown> = {
    date: { gte: new Date(start), lte: new Date(end) },
  };
  if (doctorId) where.doctorId = doctorId;

  const appointments = await prisma.appointment.findMany({
    where,
    include: {
      patient: { select: { id: true, firstName: true, lastName: true } },
      doctor: { include: { user: { select: { name: true } } } },
      treatment: { select: { name: true, color: true } },
      chair: { select: { name: true } },
    },
    orderBy: [{ date: "asc" }, { startTime: "asc" }],
  });

  return appointments.map((apt) => ({
    id: apt.id,
    title: apt.title,
    start: `${apt.date.toISOString().split("T")[0]}T${apt.startTime}`,
    end: `${apt.date.toISOString().split("T")[0]}T${apt.endTime}`,
    backgroundColor: getAptColor(apt.status, apt.treatment?.color),
    extendedProps: {
      status: apt.status,
      patient: apt.patient,
      doctor: apt.doctor.user.name,
      treatment: apt.treatment?.name,
      chair: apt.chair?.name,
      notes: apt.notes,
    },
  }));
}

function getAptColor(status: string, treatmentColor?: string | null): string {
  switch (status) {
    case "BOOKED": return treatmentColor ?? "#3B82F6";
    case "CONFIRMED": return "#10B981";
    case "IN_PROGRESS": return "#F59E0B";
    case "COMPLETED": return "#6366F1";
    case "CANCELLED": return "#EF4444";
    case "NO_SHOW": return "#F97316";
    case "RESCHEDULED": return "#8B5CF6";
    default: return treatmentColor ?? "#6B7280";
  }
}

export async function getAppointment(id: string) {
  await requireSession();
  return prisma.appointment.findUnique({
    where: { id },
    include: {
      patient: {
        include: {
          tags: true,
          _count: { select: { appointments: true } },
        },
      },
      doctor: {
        include: {
          user: { select: { name: true, email: true, image: true } },
          department: { select: { name: true, color: true } },
        },
      },
      treatment: true,
      chair: true,
    },
  });
}

export async function createAppointment(data: {
  patientId: string;
  doctorId: string;
  treatmentId?: string;
  chairId?: string;
  title: string;
  description?: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  notes?: string;
}) {
  await requireSession();
  const clinic = await prisma.clinic.findFirst();
  if (!clinic) throw new Error("No clinic found");

  // Conflict check: same doctor, same time
  const conflicting = await prisma.appointment.findFirst({
    where: {
      doctorId: data.doctorId,
      date: new Date(data.date),
      status: { notIn: ["CANCELLED", "NO_SHOW"] },
      OR: [
        {
          startTime: { lt: data.endTime },
          endTime: { gt: data.startTime },
        },
      ],
    },
  });

  if (conflicting) {
    throw new Error(
      `Scheduling conflict with appointment "${conflicting.title}" at ${conflicting.startTime}-${conflicting.endTime}`
    );
  }

  // Chair conflict check
  if (data.chairId) {
    const chairConflict = await prisma.appointment.findFirst({
      where: {
        chairId: data.chairId,
        date: new Date(data.date),
        status: { notIn: ["CANCELLED", "NO_SHOW"] },
        startTime: { lt: data.endTime },
        endTime: { gt: data.startTime },
      },
    });
    if (chairConflict) {
      throw new Error(`Chair is already booked for this time slot`);
    }
  }

  return prisma.appointment.create({
    data: {
      clinicId: clinic.id,
      patientId: data.patientId,
      doctorId: data.doctorId,
      treatmentId: data.treatmentId,
      chairId: data.chairId,
      title: data.title,
      description: data.description,
      date: new Date(data.date),
      startTime: data.startTime,
      endTime: data.endTime,
      duration: data.duration,
      notes: data.notes,
      status: "BOOKED",
    },
  });
}

export async function updateAppointment(
  id: string,
  data: Partial<{
    patientId: string;
    doctorId: string;
    treatmentId: string;
    chairId: string;
    title: string;
    description: string;
    date: string;
    startTime: string;
    endTime: string;
    duration: number;
    notes: string;
    status: string;
  }>
) {
  await requireSession();
  const updateData: Record<string, unknown> = { ...data };
  if (data.date) updateData.date = new Date(data.date);

  return prisma.appointment.update({
    where: { id },
    data: updateData,
  });
}

export async function updateAppointmentStatus(id: string, status: string) {
  await requireSession();
  const now = new Date();
  const updateData: Record<string, unknown> = { status };

  if (status === "COMPLETED") {
    updateData.checkedOutAt = now;
  }

  return prisma.appointment.update({
    where: { id },
    data: updateData,
  });
}

export async function moveAppointment(id: string, date: string, startTime: string, endTime: string) {
  await requireSession();
  return prisma.appointment.update({
    where: { id },
    data: {
      date: new Date(date),
      startTime,
      endTime,
    },
  });
}

export async function deleteAppointment(id: string) {
  await requireSession();
  await prisma.appointment.delete({ where: { id } });
}

export async function getDoctors() {
  await requireSession();
  return prisma.staff.findMany({
    where: { isActive: true },
    include: {
      user: { select: { name: true, image: true } },
      department: { select: { name: true, color: true } },
    },
  });
}

export async function getChairs() {
  await requireSession();
  const clinic = await prisma.clinic.findFirst();
  if (!clinic) return [];
  return prisma.chair.findMany({
    where: { clinicId: clinic.id, isActive: true },
  });
}

export async function getTreatments() {
  await requireSession();
  const clinic = await prisma.clinic.findFirst();
  if (!clinic) return [];
  return prisma.treatment.findMany({
    where: { clinicId: clinic.id, isActive: true },
    select: { id: true, name: true, duration: true, price: true, color: true },
  });
}
