import { describe, it, expect, vi, beforeEach } from "vitest";
import { mockPrisma } from "../../__mocks__/prisma";

vi.mock("@/lib/prisma", () => ({
  default: mockPrisma,
  prisma: mockPrisma,
}));

import {
  getStaff,
  getStaffMember,
  createStaff,
  updateStaff,
  deleteStaff,
  getDepartments,
  createDepartment,
  deleteDepartment,
  getStaffStats,
} from "@/server/actions/staff";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("getStaff", () => {
  it("should return staff list", async () => {
    const mockStaff = [
      { id: "s1", user: { name: "Dr. Smith" }, department: { name: "General" } },
    ];
    mockPrisma.staff.findMany.mockResolvedValue(mockStaff);
    mockPrisma.staff.count.mockResolvedValue(1);

    const result = await getStaff({ page: 1, pageSize: 20 });

    expect(result.data).toEqual(mockStaff);
    expect(result.pagination.total).toBe(1);
  });

  it("should filter by department", async () => {
    mockPrisma.staff.findMany.mockResolvedValue([]);
    mockPrisma.staff.count.mockResolvedValue(0);

    await getStaff({ departmentId: "dept-1" });

    expect(mockPrisma.staff.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ departmentId: "dept-1" }),
      })
    );
  });

  it("should search by name", async () => {
    mockPrisma.staff.findMany.mockResolvedValue([]);
    mockPrisma.staff.count.mockResolvedValue(0);

    await getStaff({ search: "Smith" });

    expect(mockPrisma.staff.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: expect.arrayContaining([
            expect.objectContaining({
              user: expect.objectContaining({
                name: expect.objectContaining({ contains: "Smith" }),
              }),
            }),
          ]),
        }),
      })
    );
  });
});

describe("createStaff", () => {
  it("should create staff with user account", async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);
    mockPrisma.staff.findFirst.mockResolvedValue(null);
    mockPrisma.user.create.mockResolvedValue({ id: "user-1" });
    mockPrisma.staff.create.mockResolvedValue({
      id: "s1",
      employeeId: "EMP001",
    });

    const result = await createStaff({
      firstName: "John",
      lastName: "Smith",
      email: "john@clinic.com",
      role: "DENTIST",
      departmentId: "dept-1",
    });

    expect(result.id).toBe("s1");
    expect(mockPrisma.user.create).toHaveBeenCalled();
    expect(mockPrisma.staff.create).toHaveBeenCalled();
  });

  it("should throw if email already exists", async () => {
    mockPrisma.user.findUnique.mockResolvedValue({ id: "existing-user" });

    await expect(
      createStaff({
        firstName: "John",
        lastName: "Smith",
        email: "existing@clinic.com",
        role: "DENTIST",
      })
    ).rejects.toThrow("already exists");
  });

  it("should generate employee ID", async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);
    mockPrisma.staff.findFirst.mockResolvedValue({ employeeId: "EMP005" });
    mockPrisma.user.create.mockResolvedValue({ id: "user-1" });
    mockPrisma.staff.create.mockResolvedValue({ id: "s1" });

    await createStaff({
      firstName: "John",
      lastName: "Smith",
      email: "john@clinic.com",
      role: "DENTIST",
    });

    expect(mockPrisma.staff.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          employeeId: "EMP006",
        }),
      })
    );
  });
});

describe("updateStaff", () => {
  it("should update staff", async () => {
    mockPrisma.staff.findUnique.mockResolvedValue({ id: "s1", user: { name: "John Smith" } });
    mockPrisma.user.update.mockResolvedValue({});
    mockPrisma.staff.update.mockResolvedValue({ id: "s1" });

    const result = await updateStaff("s1", { phone: "555-0123" });

    expect(result.id).toBe("s1");
  });

  it("should throw if staff not found", async () => {
    mockPrisma.staff.findUnique.mockResolvedValue(null);

    await expect(updateStaff("nonexistent", {})).rejects.toThrow("not found");
  });
});

describe("deleteStaff", () => {
  it("should deactivate staff", async () => {
    mockPrisma.staff.findUnique.mockResolvedValue({ id: "s1" });
    mockPrisma.staff.update.mockResolvedValue({});

    await deleteStaff("s1");

    expect(mockPrisma.staff.findUnique).toHaveBeenCalledWith({ where: { id: "s1" } });
    expect(mockPrisma.staff.update).toHaveBeenCalledWith({
      where: { id: "s1" },
      data: { isActive: false },
    });
  });
});

describe("getDepartments", () => {
  it("should return departments", async () => {
    mockPrisma.clinic.findFirst.mockResolvedValue({ id: "clinic-1" });
    const mockDepts = [
      { id: "d1", name: "General", _count: { staff: 5 } },
    ];
    mockPrisma.department.findMany.mockResolvedValue(mockDepts);

    const result = await getDepartments();

    expect(result).toEqual(mockDepts);
    expect(mockPrisma.clinic.findFirst).toHaveBeenCalled();
    expect(mockPrisma.department.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ clinicId: "clinic-1" }),
      })
    );
  });
});

describe("createDepartment", () => {
  it("should create department", async () => {
    mockPrisma.clinic.findFirst.mockResolvedValue({ id: "clinic-1" });
    mockPrisma.department.create.mockResolvedValue({
      id: "d1",
      name: "Orthodontics",
      clinicId: "clinic-1",
    });

    const result = await createDepartment({
      name: "Orthodontics",
    });

    expect(result.name).toBe("Orthodontics");
    expect(mockPrisma.department.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          clinicId: "clinic-1",
          name: "Orthodontics",
        }),
      })
    );
  });
});

describe("deleteDepartment", () => {
  it("should delete department with no staff", async () => {
    mockPrisma.staff.count.mockResolvedValue(0);
    mockPrisma.department.delete.mockResolvedValue({});

    await deleteDepartment("d1");

    expect(mockPrisma.department.delete).toHaveBeenCalledWith({
      where: { id: "d1" },
    });
  });

  it("should throw if department has staff", async () => {
    mockPrisma.staff.count.mockResolvedValue(3);

    await expect(deleteDepartment("d1")).rejects.toThrow("Cannot delete");
  });
});

describe("getStaffStats", () => {
  it("should return staff statistics", async () => {
    mockPrisma.clinic.findFirst.mockResolvedValue({ id: "clinic-1" });
    mockPrisma.department.findMany
      .mockResolvedValueOnce([{ id: "d1" }, { id: "d2" }]) // deptIds
      .mockResolvedValueOnce([ // byDepartment
        { id: "d1", name: "General", color: "#3B82F6", _count: { staff: 5 } },
        { id: "d2", name: "Ortho", color: "#10B981", _count: { staff: 3 } },
      ]);
    mockPrisma.staff.count
      .mockResolvedValueOnce(10) // total
      .mockResolvedValueOnce(8); // active
    mockPrisma.leave.count.mockResolvedValue(1); // onLeave
    mockPrisma.staff.findMany.mockResolvedValue([
      { user: { role: "DENTIST" } },
      { user: { role: "DENTIST" } },
      { user: { role: "RECEPTIONIST" } },
    ]);

    const result = await getStaffStats();

    expect(result.total).toBe(10);
    expect(result.active).toBe(8);
    expect(result.onLeave).toBe(1);
    expect(result.inactiveCount).toBe(2);
    expect(result.byDepartment).toHaveLength(2);
    expect(result.byRole).toEqual({ DENTIST: 2, RECEPTIONIST: 1 });
  });
});
