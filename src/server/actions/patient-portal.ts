"use server";

import { requireSession } from "@/lib/auth-server";
import prisma from "@/lib/prisma";

// ─── Patient Portal Data ───────────────────────────────────────────

export async function getPatientByUserId(userId: string) {
  const session = await requireSession();
  if (session.user.id !== userId) {
    throw new Error("Forbidden: cannot access another user's data");
  }
  return prisma.patient.findUnique({
    where: { userId },
    include: {
      clinic: { select: { name: true, phone: true, email: true, address: true } },
      insurance: true,
      _count: {
        select: { appointments: true, invoices: true, documents: true },
      },
    },
  });
}

export async function getPatientAppointments(patientId: string, params?: {
  status?: string;
  page?: number;
  pageSize?: number;
}) {
  await requireSession();
  const { status, page = 1, pageSize = 10 } = params ?? {};
  const skip = (page - 1) * pageSize;

  const where: Record<string, unknown> = { patientId };
  if (status) where.status = status;

  const [appointments, total] = await Promise.all([
    prisma.appointment.findMany({
      where,
      include: {
        doctor: {
          include: { user: { select: { name: true } } },
        },
        treatment: { select: { name: true, categoryId: true } },
        chair: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
    }),
    prisma.appointment.count({ where }),
  ]);

  return {
    data: appointments.map((a) => ({
      id: a.id,
      title: a.title,
      date: a.date,
      startTime: a.startTime,
      endTime: a.endTime,
      duration: a.duration,
      status: a.status,
      notes: a.notes,
      color: a.color,
      doctorName: a.doctor?.user?.name ?? "Unassigned",
      treatmentName: a.treatment?.name ?? "General",
      chairName: a.chair?.name ?? "N/A",
      createdAt: a.createdAt,
    })),
    pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
  };
}

export async function getPatientInvoices(patientId: string, params?: {
  status?: string;
  page?: number;
  pageSize?: number;
}) {
  await requireSession();
  const { status, page = 1, pageSize = 10 } = params ?? {};
  const skip = (page - 1) * pageSize;

  const where: Record<string, unknown> = { patientId };
  if (status) where.status = status;

  const [invoices, total] = await Promise.all([
    prisma.invoice.findMany({
      where,
      include: {
        items: true,
        payments: {
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            amount: true,
            method: true,
            paidAt: true,
            reference: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
    }),
    prisma.invoice.count({ where }),
  ]);

  return {
    data: invoices.map((inv) => ({
      id: inv.id,
      invoiceNumber: inv.invoiceNumber,
      date: inv.date,
      dueDate: inv.dueDate,
      status: inv.status,
      subtotal: Number(inv.subtotal),
      taxAmount: Number(inv.taxAmount),
      discount: Number(inv.discount),
      totalAmount: Number(inv.totalAmount),
      notes: inv.notes,
      createdAt: inv.createdAt,
      paidAmount: inv.payments.reduce((sum, p) => sum + Number(p.amount), 0),
      items: inv.items.map((item) => ({
        id: item.id,
        description: item.description,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        total: Number(item.total),
      })),
      payments: inv.payments.map((p) => ({
        id: p.id,
        amount: Number(p.amount),
        method: p.method,
        paidAt: p.paidAt,
        reference: p.reference,
      })),
    })),
    pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
  };
}

export async function getPatientTreatments(patientId: string) {
  await requireSession();
  const consultations = await prisma.consultation.findMany({
    where: { patientId },
    include: {
      staff: {
        include: { user: { select: { name: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const prescriptions = await prisma.prescription.findMany({
    where: { patientId },
    include: {
      items: true,
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return {
    consultations: consultations.map((c) => ({
      id: c.id,
      diagnosis: c.diagnosis,
      notes: c.notes,
      treatmentPlan: c.treatmentPlan,
      doctorName: c.staff?.user?.name ?? "Unknown",
      date: c.date,
      createdAt: c.createdAt,
    })),
    prescriptions: prescriptions.map((p) => ({
      id: p.id,
      doctorName: p.doctorName,
      diagnosis: p.diagnosis,
      notes: p.notes,
      date: p.date,
      items: p.items.map((item) => ({
        id: item.id,
        medication: item.medication,
        dosage: item.dosage,
        frequency: item.frequency,
        duration: item.duration,
        instructions: item.instructions,
      })),
      createdAt: p.createdAt,
    })),
  };
}

export async function getPatientStats(patientId: string) {
  await requireSession();
  const [totalAppointments, upcomingAppointments, totalInvoices, unpaidInvoices, totalDocuments] =
    await Promise.all([
      prisma.appointment.count({ where: { patientId } }),
      prisma.appointment.count({
        where: {
          patientId,
          status: { in: ["BOOKED", "CONFIRMED"] },
        },
      }),
      prisma.invoice.count({ where: { patientId } }),
      prisma.invoice.count({
        where: {
          patientId,
          status: { in: ["PENDING", "PARTIAL"] },
        },
      }),
      prisma.patientDocument.count({ where: { patientId } }),
    ]);

  return {
    totalAppointments,
    upcomingAppointments,
    totalInvoices,
    unpaidInvoices,
    totalDocuments,
  };
}
