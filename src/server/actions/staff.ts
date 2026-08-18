"use server";

import prisma from "@/lib/prisma";

// ─── Staff CRUD ────────────────────────────────────────────────────

export async function getStaff(params: {
  search?: string;
  role?: string;
  departmentId?: string;
  isActive?: boolean;
  page?: number;
  pageSize?: number;
}) {
  const { search, role, departmentId, isActive, page = 1, pageSize = 20 } = params;
  const skip = (page - 1) * pageSize;

  const where: Record<string, unknown> = {};

  if (isActive !== undefined) where.isActive = isActive;
  if (role) where.user = { role };
  if (departmentId) where.departmentId = departmentId;
  if (search) {
    where.OR = [
      { user: { name: { contains: search, mode: "insensitive" } } },
      { user: { email: { contains: search, mode: "insensitive" } } },
      { employeeId: { contains: search, mode: "insensitive" } },
      { specialization: { contains: search, mode: "insensitive" } },
    ];
  }

  const [staff, total] = await Promise.all([
    prisma.staff.findMany({
      where,
      include: {
        user: {
          select: { id: true, name: true, email: true, image: true, role: true },
        },
        department: {
          select: { id: true, name: true, color: true },
        },
        _count: {
          select: { appointments: true, consultations: true, schedules: true },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
    }),
    prisma.staff.count({ where }),
  ]);

  return {
    data: staff,
    pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
  };
}

export async function getStaffMember(id: string) {
  return prisma.staff.findUnique({
    where: { id },
    include: {
      user: {
        select: { id: true, name: true, email: true, image: true, role: true },
      },
      department: {
        select: { id: true, name: true, color: true },
      },
      schedules: {
        orderBy: { dayOfWeek: "asc" },
      },
      attendance: {
        orderBy: { date: "desc" },
        take: 30,
      },
      leaves: {
        orderBy: { createdAt: "desc" },
        take: 10,
      },
      _count: {
        select: { appointments: true, consultations: true },
      },
    },
  });
}

export async function createStaff(data: {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: string;
  departmentId?: string;
  specialization?: string;
  licenseNumber?: string;
  bio?: string;
  salary?: number;
}) {
  // Check email uniqueness
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) throw new Error("A user with this email already exists");

  // Generate employee ID
  const lastStaff = await prisma.staff.findFirst({
    orderBy: { createdAt: "desc" },
    select: { employeeId: true },
  });
  const empNum = lastStaff
    ? parseInt(lastStaff.employeeId.replace("EMP", ""), 10) + 1
    : 1;
  const employeeId = `EMP${String(empNum).padStart(3, "0")}`;

  // Create user first
  const user = await prisma.user.create({
    data: {
      name: `${data.firstName} ${data.lastName}`,
      email: data.email,
      role: data.role as "ADMIN" | "DENTIST" | "RECEPTIONIST" | "ASSISTANT",
      emailVerified: false,
    },
  });

  // Create staff record (no clinicId — Staff is linked to Clinic via Department)
  return prisma.staff.create({
    data: {
      userId: user.id,
      employeeId,
      departmentId: data.departmentId || null,
      phone: data.phone,
      specialization: data.specialization,
      licenseNumber: data.licenseNumber,
      bio: data.bio,
      salary: data.salary,
    },
    include: {
      user: { select: { name: true, email: true, role: true } },
      department: { select: { name: true } },
    },
  });
}

export async function updateStaff(
  id: string,
  data: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    role?: string;
    departmentId?: string | null;
    specialization?: string;
    licenseNumber?: string;
    bio?: string;
    salary?: number | null;
    isActive?: boolean;
  }
) {
  const staff = await prisma.staff.findUnique({
    where: { id },
    include: { user: true },
  });
  if (!staff) throw new Error("Staff member not found");

  // Update user record if name or role changed
  const userData: Record<string, unknown> = {};
  if (data.firstName || data.lastName) {
    userData.name = `${data.firstName ?? staff.user.name.split(" ")[0]} ${data.lastName ?? staff.user.name.split(" ").slice(1).join(" ")}`;
  }
  if (data.email) userData.email = data.email;
  if (data.role) userData.role = data.role;

  if (Object.keys(userData).length > 0) {
    await prisma.user.update({ where: { id: staff.userId }, data: userData });
  }

  // Update staff record
  const staffData: Record<string, unknown> = {};
  if (data.phone !== undefined) staffData.phone = data.phone;
  if (data.departmentId !== undefined) staffData.departmentId = data.departmentId || null;
  if (data.specialization !== undefined) staffData.specialization = data.specialization;
  if (data.licenseNumber !== undefined) staffData.licenseNumber = data.licenseNumber;
  if (data.bio !== undefined) staffData.bio = data.bio;
  if (data.salary !== undefined) staffData.salary = data.salary;
  if (data.isActive !== undefined) staffData.isActive = data.isActive;

  return prisma.staff.update({
    where: { id },
    data: staffData,
    include: {
      user: { select: { name: true, email: true, role: true } },
      department: { select: { name: true, color: true } },
    },
  });
}

export async function deleteStaff(id: string) {
  const staff = await prisma.staff.findUnique({ where: { id } });
  if (!staff) throw new Error("Staff member not found");

  await prisma.staff.update({
    where: { id },
    data: { isActive: false },
  });
}

// ─── Departments ───────────────────────────────────────────────────

export async function getDepartments() {
  const clinic = await prisma.clinic.findFirst();
  if (!clinic) return [];

  return prisma.department.findMany({
    where: { clinicId: clinic.id },
    include: {
      _count: { select: { staff: true } },
    },
    orderBy: { name: "asc" },
  });
}

export async function createDepartment(data: {
  name: string;
  description?: string;
  color?: string;
}) {
  const clinic = await prisma.clinic.findFirst();
  if (!clinic) throw new Error("No clinic found");

  return prisma.department.create({
    data: {
      clinicId: clinic.id,
      name: data.name,
      description: data.description,
      color: data.color ?? "#3B82F6",
    },
  });
}

export async function updateDepartment(
  id: string,
  data: { name?: string; description?: string; color?: string; isActive?: boolean }
) {
  return prisma.department.update({ where: { id }, data });
}

export async function deleteDepartment(id: string) {
  const staffCount = await prisma.staff.count({ where: { departmentId: id } });
  if (staffCount > 0) {
    throw new Error(
      `Cannot delete department — ${staffCount} staff member(s) are assigned to it. Reassign them first.`
    );
  }
  await prisma.department.delete({ where: { id } });
}

// ─── Stats ─────────────────────────────────────────────────────────

export async function getStaffStats() {
  const clinic = await prisma.clinic.findFirst();
  if (!clinic) {
    return { total: 0, active: 0, byRole: {}, byDepartment: [], onLeave: 0, inactiveCount: 0 };
  }

  const deptIds = (
    await prisma.department.findMany({
      where: { clinicId: clinic.id },
      select: { id: true },
    })
  ).map((d) => d.id);

  const [total, active, onLeave, byDepartment] = await Promise.all([
    prisma.staff.count({
      where: deptIds.length > 0 ? { departmentId: { in: deptIds } } : {},
    }),
    prisma.staff.count({
      where: {
        isActive: true,
        ...(deptIds.length > 0 ? { departmentId: { in: deptIds } } : {}),
      },
    }),
    prisma.leave.count({
      where: {
        staff: {
          isActive: true,
          ...(deptIds.length > 0 ? { departmentId: { in: deptIds } } : {}),
        },
        status: "APPROVED",
        startDate: { lte: new Date() },
        endDate: { gte: new Date() },
      },
    }),
    prisma.department.findMany({
      where: { clinicId: clinic.id, isActive: true },
      include: { _count: { select: { staff: true } } },
      orderBy: { name: "asc" },
    }),
  ]);

  const staffWithUsers = await prisma.staff.findMany({
    where: {
      isActive: true,
      ...(deptIds.length > 0 ? { departmentId: { in: deptIds } } : {}),
    },
    include: { user: { select: { role: true } } },
  });

  const roleCounts: Record<string, number> = {};
  staffWithUsers.forEach((s) => {
    const role = s.user.role;
    roleCounts[role] = (roleCounts[role] || 0) + 1;
  });

  return {
    total,
    active,
    onLeave,
    inactiveCount: total - active,
    byRole: roleCounts,
    byDepartment: byDepartment.map((d) => ({
      id: d.id,
      name: d.name,
      color: d.color,
      count: d._count.staff,
    })),
  };
}
