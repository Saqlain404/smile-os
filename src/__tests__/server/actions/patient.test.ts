import { describe, it, expect, vi, beforeEach } from "vitest";
import { mockPrisma } from "../../__mocks__/prisma";

vi.mock("@/lib/prisma", () => ({
  default: mockPrisma,
  prisma: mockPrisma,
}));

import {
  getPatients,
  getPatient,
  createPatient,
  updatePatient,
  deletePatient,
  getPatientStats,
} from "@/server/actions/patient";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("getPatients", () => {
  it("should return paginated patients", async () => {
    const mockPatients = [
      { id: "p1", firstName: "John", lastName: "Doe", tags: [] },
    ];
    mockPrisma.patient.findMany.mockResolvedValue(mockPatients);
    mockPrisma.patient.count.mockResolvedValue(1);

    const result = await getPatients({ page: 1, pageSize: 20 });

    expect(result.data).toEqual(mockPatients);
    expect(result.pagination.total).toBe(1);
  });

  it("should search by name", async () => {
    mockPrisma.patient.findMany.mockResolvedValue([]);
    mockPrisma.patient.count.mockResolvedValue(0);

    await getPatients({ search: "John" });

    expect(mockPrisma.patient.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: expect.arrayContaining([
            expect.objectContaining({
              firstName: expect.objectContaining({ contains: "John" }),
            }),
          ]),
        }),
      })
    );
  });

  it("should filter by gender", async () => {
    mockPrisma.patient.findMany.mockResolvedValue([]);
    mockPrisma.patient.count.mockResolvedValue(0);

    await getPatients({ gender: "MALE" });

    expect(mockPrisma.patient.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ gender: "MALE" }),
      })
    );
  });

  it("should filter by tag", async () => {
    mockPrisma.patient.findMany.mockResolvedValue([]);
    mockPrisma.patient.count.mockResolvedValue(0);

    await getPatients({ tag: "VIP" });

    expect(mockPrisma.patient.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ tags: { some: { name: "VIP" } } }),
      })
    );
  });
});

describe("getPatient", () => {
  it("should return patient with all relations", async () => {
    const mockPatient = {
      id: "p1",
      firstName: "John",
      lastName: "Doe",
      appointments: [],
      invoices: [],
      prescriptions: [],
      insurance: null,
      familyMembers: [],
      tags: [],
    };
    mockPrisma.patient.findUnique.mockResolvedValue(mockPatient);

    const result = await getPatient("p1");

    expect(result).toEqual(mockPatient);
    expect(mockPrisma.patient.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "p1" },
      })
    );
  });
});

describe("createPatient", () => {
  it("should create patient", async () => {
    mockPrisma.clinic.findFirst.mockResolvedValue({ id: "clinic-1" });
    mockPrisma.patient.create.mockResolvedValue({
      id: "p1",
      firstName: "John",
      lastName: "Doe",
    });

    const result = await createPatient({
      firstName: "John",
      lastName: "Doe",
      phone: "555-0123",
      country: "US",
    });

    expect(result.firstName).toBe("John");
    expect(mockPrisma.clinic.findFirst).toHaveBeenCalled();
    expect(mockPrisma.patient.create).toHaveBeenCalled();
  });
});

describe("updatePatient", () => {
  it("should update patient", async () => {
    mockPrisma.patient.update.mockResolvedValue({
      id: "p1",
      firstName: "Updated",
      lastName: "Doe",
    });

    const result = await updatePatient("p1", {
      firstName: "Updated",
      lastName: "Doe",
      phone: "555-0123",
      country: "US",
    });

    expect(result.firstName).toBe("Updated");
  });
});

describe("deletePatient", () => {
  it("should delete patient", async () => {
    mockPrisma.patient.delete.mockResolvedValue({});

    await deletePatient("p1");

    expect(mockPrisma.patient.delete).toHaveBeenCalledWith({
      where: { id: "p1" },
    });
  });
});

describe("getPatientStats", () => {
  it("should return patient statistics", async () => {
    mockPrisma.patient.count
      .mockResolvedValueOnce(100) // total
      .mockResolvedValueOnce(15)  // thisMonth
      .mockResolvedValueOnce(10); // lastMonth

    const result = await getPatientStats();

    expect(result.total).toBe(100);
    expect(result.thisMonth).toBe(15);
    expect(result.lastMonth).toBe(10);
    expect(result.change).toBe(50); // (15-10)/10 * 100
  });
});
