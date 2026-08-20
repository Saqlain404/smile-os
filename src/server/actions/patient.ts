"use server";

import prisma from "@/lib/prisma";
import { patientSchema, type PatientFormData } from "@/lib/validations";
import { requireSession } from "@/lib/auth-server";

export async function getPatients(params: {
  search?: string;
  page?: number;
  pageSize?: number;
  sort?: string;
  order?: "asc" | "desc";
  tag?: string;
  gender?: string;
}) {
  await requireSession();
  const {
    search = "",
    page = 1,
    pageSize = 20,
    sort = "createdAt",
    order = "desc",
    tag,
    gender,
  } = params;

  const skip = (page - 1) * pageSize;

  const where: Record<string, unknown> = {};

  if (search) {
    where.OR = [
      { firstName: { contains: search, mode: "insensitive" } },
      { lastName: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
      { phone: { contains: search, mode: "insensitive" } },
    ];
  }

  if (gender) {
    where.gender = gender;
  }

  if (tag) {
    where.tags = { some: { name: tag } };
  }

  const [patients, total] = await Promise.all([
    prisma.patient.findMany({
      where,
      include: {
        tags: true,
        _count: {
          select: {
            appointments: true,
            invoices: true,
          },
        },
      },
      orderBy: { [sort]: order },
      skip,
      take: pageSize,
    }),
    prisma.patient.count({ where }),
  ]);

  return {
    data: patients,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  };
}

export async function getPatient(id: string) {
  await requireSession();
  const patient = await prisma.patient.findUnique({
    where: { id },
    include: {
      tags: true,
      familyMembers: true,
      insurance: true,
      appointments: {
        include: {
          doctor: { include: { user: true } },
          treatment: true,
        },
        orderBy: { date: "desc" },
        take: 10,
      },
      invoices: {
        include: {
          items: true,
          payments: true,
        },
        orderBy: { date: "desc" },
      },
      medicalRecords: {
        orderBy: { createdAt: "desc" },
      },
      prescriptions: {
        include: { items: true },
        orderBy: { date: "desc" },
      },
      documents: {
        orderBy: { createdAt: "desc" },
      },
      consultationHistory: {
        include: { staff: { include: { user: true } } },
        orderBy: { date: "desc" },
      },
      _count: {
        select: {
          appointments: true,
          invoices: true,
          medicalRecords: true,
          prescriptions: true,
        },
      },
    },
  });

  return patient;
}

export async function createPatient(data: PatientFormData) {
  await requireSession();
  const validated = patientSchema.parse(data);

  // Get first clinic (single-clinic mode for now)
  const clinic = await prisma.clinic.findFirst();
  if (!clinic) throw new Error("No clinic found");

  const patient = await prisma.patient.create({
    data: {
      clinicId: clinic.id,
      firstName: validated.firstName,
      lastName: validated.lastName,
      email: validated.email || undefined,
      phone: validated.phone,
      dateOfBirth: validated.dateOfBirth
        ? new Date(validated.dateOfBirth)
        : undefined,
      gender: validated.gender || undefined,
      address: validated.address,
      city: validated.city,
      state: validated.state,
      zipCode: validated.zipCode,
      country: validated.country,
      bloodGroup: validated.bloodGroup,
      allergies: validated.allergies,
      medicalHistory: validated.medicalHistory,
      dentalHistory: validated.dentalHistory,
      emergencyContact: validated.emergencyContact,
      emergencyPhone: validated.emergencyPhone,
      referredBy: validated.referredBy,
      notes: validated.notes,
    },
  });

  return patient;
}

export async function updatePatient(id: string, data: PatientFormData) {
  await requireSession();
  const validated = patientSchema.parse(data);

  const patient = await prisma.patient.update({
    where: { id },
    data: {
      firstName: validated.firstName,
      lastName: validated.lastName,
      email: validated.email || undefined,
      phone: validated.phone,
      dateOfBirth: validated.dateOfBirth
        ? new Date(validated.dateOfBirth)
        : undefined,
      gender: validated.gender || undefined,
      address: validated.address,
      city: validated.city,
      state: validated.state,
      zipCode: validated.zipCode,
      country: validated.country,
      bloodGroup: validated.bloodGroup,
      allergies: validated.allergies,
      medicalHistory: validated.medicalHistory,
      dentalHistory: validated.dentalHistory,
      emergencyContact: validated.emergencyContact,
      emergencyPhone: validated.emergencyPhone,
      referredBy: validated.referredBy,
      notes: validated.notes,
    },
  });

  return patient;
}

export async function deletePatient(id: string) {
  await requireSession();
  await prisma.patient.delete({ where: { id } });
}

export async function addPatientTag(patientId: string, name: string, color: string) {
  await requireSession();
  return prisma.patientTag.create({
    data: { patientId, name, color },
  });
}

export async function removePatientTag(id: string) {
  await requireSession();
  await prisma.patientTag.delete({ where: { id } });
}

export async function addFamilyMember(
  patientId: string,
  data: { name: string; relation: string; phone?: string;   email?: string }
) {
  await requireSession();
  return prisma.familyMember.create({
    data: { patientId, ...data },
  });
}

export async function deleteFamilyMember(id: string) {
  await requireSession();
  await prisma.familyMember.delete({ where: { id } });
}

export async function upsertInsurance(
  patientId: string,
  data: {
    provider: string;
    policyNumber: string;
    groupNumber?: string;
    memberName: string;
    relationship?: string;
    coveragePercent?: number;
    maxCoverage?: number;
    expiryDate?: string;
  }
) {
  await requireSession();
  return prisma.insurance.upsert({
    where: { patientId },
    create: {
      patientId,
      ...data,
      coveragePercent: data.coveragePercent ?? 0,
      maxCoverage: data.maxCoverage ?? undefined,
      expiryDate: data.expiryDate ? new Date(data.expiryDate) : undefined,
    },
    update: {
      provider: data.provider,
      policyNumber: data.policyNumber,
      groupNumber: data.groupNumber,
      memberName: data.memberName,
      relationship: data.relationship,
      coveragePercent: data.coveragePercent,
      maxCoverage: data.maxCoverage,
      expiryDate: data.expiryDate ? new Date(data.expiryDate) : undefined,
    },
  });
}

export async function getPatientStats() {
  await requireSession();
  const total = await prisma.patient.count();
  const thisMonth = await prisma.patient.count({
    where: {
      createdAt: {
        gte: new Date(new Date().setDate(1)),
      },
    },
  });
  const lastMonth = await prisma.patient.count({
    where: {
      createdAt: {
        gte: new Date(new Date().setDate(1) - 30 * 24 * 60 * 60 * 1000),
        lt: new Date(new Date().setDate(1)),
      },
    },
  });

  return {
    total,
    thisMonth,
    lastMonth,
    change: lastMonth > 0 ? ((thisMonth - lastMonth) / lastMonth) * 100 : 0,
  };
}
