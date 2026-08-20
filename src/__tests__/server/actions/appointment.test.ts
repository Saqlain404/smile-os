import { describe, it, expect, vi, beforeEach } from "vitest";
import { mockPrisma } from "../../__mocks__/prisma";

vi.mock("@/lib/prisma", () => ({
  default: mockPrisma,
  prisma: mockPrisma,
}));

import {
  getAppointments,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  getDoctors,
  getChairs,
} from "@/server/actions/appointment";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("getAppointments", () => {
  it("should return appointments with pagination", async () => {
    const mockAppointments = [
      { id: "1", title: "Checkup", patient: {}, doctor: {} },
    ];
    mockPrisma.appointment.findMany.mockResolvedValue(mockAppointments);
    mockPrisma.appointment.count.mockResolvedValue(1);

    const result = await getAppointments({ page: 1, pageSize: 20 });

    expect(result.data).toEqual(mockAppointments);
    expect(result.pagination.total).toBe(1);
  });

  it("should filter by status", async () => {
    mockPrisma.appointment.findMany.mockResolvedValue([]);
    mockPrisma.appointment.count.mockResolvedValue(0);

    await getAppointments({ status: "COMPLETED" });

    expect(mockPrisma.appointment.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ status: "COMPLETED" }),
      })
    );
  });

  it("should filter by doctorId", async () => {
    mockPrisma.appointment.findMany.mockResolvedValue([]);
    mockPrisma.appointment.count.mockResolvedValue(0);

    await getAppointments({ doctorId: "doctor-1" });

    expect(mockPrisma.appointment.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ doctorId: "doctor-1" }),
      })
    );
  });

  it("should filter by date range", async () => {
    mockPrisma.appointment.findMany.mockResolvedValue([]);
    mockPrisma.appointment.count.mockResolvedValue(0);

    await getAppointments({
      start: "2024-03-01",
      end: "2024-03-31",
    });

    expect(mockPrisma.appointment.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          date: expect.objectContaining({
            gte: expect.any(Date),
            lte: expect.any(Date),
          }),
        }),
      })
    );
  });
});

describe("createAppointment", () => {
  it("should create appointment when no conflict", async () => {
    mockPrisma.clinic.findFirst.mockResolvedValue({ id: "clinic-1" });
    mockPrisma.appointment.findFirst.mockResolvedValue(null);
    mockPrisma.appointment.create.mockResolvedValue({ id: "apt-1" });

    const result = await createAppointment({
      patientId: "patient-1",
      doctorId: "doctor-1",
      title: "Checkup",
      date: "2024-03-15",
      startTime: "10:00",
      endTime: "10:30",
      duration: 30,
    });

    expect(result.id).toBe("apt-1");
  });

  it("should throw if no clinic found", async () => {
    mockPrisma.clinic.findFirst.mockResolvedValue(null);

    await expect(
      createAppointment({
        patientId: "patient-1",
        doctorId: "doctor-1",
        title: "Checkup",
        date: "2024-03-15",
        startTime: "09:00",
        endTime: "09:30",
        duration: 30,
      })
    ).rejects.toThrow("No clinic found");
  });

  it("should detect doctor conflict", async () => {
    mockPrisma.clinic.findFirst.mockResolvedValue({ id: "clinic-1" });
    mockPrisma.appointment.findFirst.mockResolvedValue({
      id: "existing",
      title: "Existing Apt",
      startTime: "09:00",
      endTime: "09:30",
    });

    await expect(
      createAppointment({
        patientId: "patient-1",
        doctorId: "doctor-1",
        title: "Checkup",
        date: "2024-03-15",
        startTime: "09:15",
        endTime: "09:45",
        duration: 30,
      })
    ).rejects.toThrow("Scheduling conflict");
  });

  it("should detect chair conflict", async () => {
    mockPrisma.clinic.findFirst.mockResolvedValue({ id: "clinic-1" });
    let callCount = 0;
    mockPrisma.appointment.findFirst.mockImplementation(async () => {
      callCount++;
      if (callCount === 1) return null;
      return { id: "chair-conflict" };
    });

    await expect(
      createAppointment({
        patientId: "patient-1",
        doctorId: "doctor-1",
        chairId: "chair-1",
        title: "Checkup",
        date: "2024-03-15",
        startTime: "09:00",
        endTime: "09:30",
        duration: 30,
      })
    ).rejects.toThrow("Chair is already booked");
  });
});

describe("updateAppointment", () => {
  it("should update appointment", async () => {
    mockPrisma.appointment.update.mockResolvedValue({ id: "apt-1", title: "Updated" });

    const result = await updateAppointment("apt-1", { title: "Updated" });

    expect(result.id).toBe("apt-1");
    expect(mockPrisma.appointment.update).toHaveBeenCalledWith({
      where: { id: "apt-1" },
      data: { title: "Updated" },
    });
  });

  it("should convert date string to Date object", async () => {
    mockPrisma.appointment.update.mockResolvedValue({ id: "apt-1" });

    await updateAppointment("apt-1", { date: "2024-03-15" });

    expect(mockPrisma.appointment.update).toHaveBeenCalledWith({
      where: { id: "apt-1" },
      data: { date: expect.any(Date) },
    });
  });
});

describe("deleteAppointment", () => {
  it("should delete appointment", async () => {
    mockPrisma.appointment.delete.mockResolvedValue({});

    await deleteAppointment("apt-1");

    expect(mockPrisma.appointment.delete).toHaveBeenCalledWith({
      where: { id: "apt-1" },
    });
  });
});

describe("getDoctors", () => {
  it("should return active doctors", async () => {
    const mockDoctors = [
      { id: "d1", user: { name: "Dr. Smith" }, specialization: "General" },
    ];
    mockPrisma.staff.findMany.mockResolvedValue(mockDoctors);

    const result = await getDoctors();

    expect(result).toEqual(mockDoctors);
    expect(mockPrisma.staff.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ isActive: true }),
      })
    );
  });
});

describe("getChairs", () => {
  it("should return active chairs", async () => {
    mockPrisma.clinic.findFirst.mockResolvedValue({ id: "clinic-1" });
    const mockChairs = [
      { id: "c1", name: "Chair 1", color: "#10B981" },
    ];
    mockPrisma.chair.findMany.mockResolvedValue(mockChairs);

    const result = await getChairs();

    expect(result).toEqual(mockChairs);
    expect(mockPrisma.chair.findMany).toHaveBeenCalledWith({
      where: { clinicId: "clinic-1", isActive: true },
    });
  });

  it("should return empty if no clinic", async () => {
    mockPrisma.clinic.findFirst.mockResolvedValue(null);

    const result = await getChairs();

    expect(result).toEqual([]);
  });
});
