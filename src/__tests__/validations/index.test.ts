import { describe, it, expect } from "vitest";
import {
  patientSchema,
  appointmentSchema,
  treatmentSchema,
  invoiceSchema,
  loginSchema,
  staffSchema,
} from "@/lib/validations";

describe("patientSchema", () => {
  const validPatient = {
    firstName: "John",
    lastName: "Doe",
    phone: "555-0123",
  };

  it("should accept valid minimal patient", () => {
    const result = patientSchema.safeParse(validPatient);
    expect(result.success).toBe(true);
  });

  it("should accept valid full patient", () => {
    const result = patientSchema.safeParse({
      ...validPatient,
      email: "john@example.com",
      dateOfBirth: "1990-01-15",
      gender: "MALE",
      address: "123 Main St",
      city: "New York",
      state: "NY",
      zipCode: "10001",
      country: "US",
      bloodGroup: "O+",
      allergies: "Penicillin",
      medicalHistory: "None",
      dentalHistory: "Regular checkups",
      emergencyContact: "Jane Doe",
      emergencyPhone: "555-0124",
      referredBy: "Website",
      notes: "Regular patient",
    });
    expect(result.success).toBe(true);
  });

  it("should reject patient without firstName", () => {
    const result = patientSchema.safeParse({ lastName: "Doe", phone: "555-0123" });
    expect(result.success).toBe(false);
  });

  it("should reject patient without lastName", () => {
    const result = patientSchema.safeParse({ firstName: "John", phone: "555-0123" });
    expect(result.success).toBe(false);
  });

  it("should reject patient without phone", () => {
    const result = patientSchema.safeParse({ firstName: "John", lastName: "Doe" });
    expect(result.success).toBe(false);
  });

  it("should accept empty email", () => {
    const result = patientSchema.safeParse({ ...validPatient, email: "" });
    expect(result.success).toBe(true);
  });

  it("should accept valid email", () => {
    const result = patientSchema.safeParse({ ...validPatient, email: "test@example.com" });
    expect(result.success).toBe(true);
  });

  it("should reject invalid email format", () => {
    const result = patientSchema.safeParse({ ...validPatient, email: "not-an-email" });
    expect(result.success).toBe(false);
  });

  it("should accept all gender values", () => {
    for (const gender of ["MALE", "FEMALE", "OTHER", "PREFER_NOT_TO_SAY"]) {
      const result = patientSchema.safeParse({ ...validPatient, gender });
      expect(result.success).toBe(true);
    }
  });

  it("should reject invalid gender", () => {
    const result = patientSchema.safeParse({ ...validPatient, gender: "INVALID" });
    expect(result.success).toBe(false);
  });

  it("should default country to US", () => {
    const result = patientSchema.safeParse(validPatient);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.country).toBe("US");
    }
  });
});

describe("appointmentSchema", () => {
  const validAppointment = {
    patientId: "patient-1",
    doctorId: "doctor-1",
    title: "Checkup",
    date: "2024-03-15",
    startTime: "09:00",
    endTime: "09:30",
    duration: 30,
  };

  it("should accept valid appointment", () => {
    const result = appointmentSchema.safeParse(validAppointment);
    expect(result.success).toBe(true);
  });

  it("should reject without patientId", () => {
    const { patientId, ...rest } = validAppointment;
    const result = appointmentSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it("should reject without doctorId", () => {
    const { doctorId, ...rest } = validAppointment;
    const result = appointmentSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it("should reject without title", () => {
    const { title, ...rest } = validAppointment;
    const result = appointmentSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it("should reject without date", () => {
    const { date, ...rest } = validAppointment;
    const result = appointmentSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it("should reject without startTime", () => {
    const { startTime, ...rest } = validAppointment;
    const result = appointmentSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it("should reject without endTime", () => {
    const { endTime, ...rest } = validAppointment;
    const result = appointmentSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it("should reject duration less than 5", () => {
    const result = appointmentSchema.safeParse({ ...validAppointment, duration: 4 });
    expect(result.success).toBe(false);
  });

  it("should default status to BOOKED", () => {
    const result = appointmentSchema.safeParse(validAppointment);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe("BOOKED");
    }
  });

  it("should accept all valid statuses", () => {
    const statuses = ["BOOKED", "CONFIRMED", "IN_PROGRESS", "COMPLETED", "CANCELLED", "NO_SHOW", "RESCHEDULED"];
    for (const status of statuses) {
      const result = appointmentSchema.safeParse({ ...validAppointment, status });
      expect(result.success).toBe(true);
    }
  });

  it("should default isRecurring to false", () => {
    const result = appointmentSchema.safeParse(validAppointment);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.isRecurring).toBe(false);
    }
  });
});

describe("treatmentSchema", () => {
  const validTreatment = {
    name: "Teeth Cleaning",
    price: 150,
  };

  it("should accept valid treatment", () => {
    const result = treatmentSchema.safeParse(validTreatment);
    expect(result.success).toBe(true);
  });

  it("should reject without name", () => {
    const result = treatmentSchema.safeParse({ price: 150 });
    expect(result.success).toBe(false);
  });

  it("should reject negative price", () => {
    const result = treatmentSchema.safeParse({ ...validTreatment, price: -10 });
    expect(result.success).toBe(false);
  });

  it("should accept zero price", () => {
    const result = treatmentSchema.safeParse({ ...validTreatment, price: 0 });
    expect(result.success).toBe(true);
  });

  it("should default duration to 30", () => {
    const result = treatmentSchema.safeParse(validTreatment);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.duration).toBe(30);
    }
  });

  it("should reject duration less than 5", () => {
    const result = treatmentSchema.safeParse({ ...validTreatment, duration: 4 });
    expect(result.success).toBe(false);
  });

  it("should default color to #8B5CF6", () => {
    const result = treatmentSchema.safeParse(validTreatment);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.color).toBe("#8B5CF6");
    }
  });

  it("should default isActive to true", () => {
    const result = treatmentSchema.safeParse(validTreatment);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.isActive).toBe(true);
    }
  });
});

describe("invoiceSchema", () => {
  const validInvoice = {
    patientId: "patient-1",
    items: [
      { description: "Teeth Cleaning", quantity: 1, unitPrice: 150 },
    ],
  };

  it("should accept valid invoice", () => {
    const result = invoiceSchema.safeParse(validInvoice);
    expect(result.success).toBe(true);
  });

  it("should reject without patientId", () => {
    const { patientId, ...rest } = validInvoice;
    const result = invoiceSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it("should reject with empty items", () => {
    const result = invoiceSchema.safeParse({ ...validInvoice, items: [] });
    expect(result.success).toBe(false);
  });

  it("should reject item without description", () => {
    const result = invoiceSchema.safeParse({
      ...validInvoice,
      items: [{ quantity: 1, unitPrice: 150 }],
    });
    expect(result.success).toBe(false);
  });

  it("should reject item with quantity less than 1", () => {
    const result = invoiceSchema.safeParse({
      ...validInvoice,
      items: [{ description: "Cleaning", quantity: 0, unitPrice: 150 }],
    });
    expect(result.success).toBe(false);
  });

  it("should reject item with negative unitPrice", () => {
    const result = invoiceSchema.safeParse({
      ...validInvoice,
      items: [{ description: "Cleaning", quantity: 1, unitPrice: -10 }],
    });
    expect(result.success).toBe(false);
  });

  it("should accept multiple items", () => {
    const result = invoiceSchema.safeParse({
      ...validInvoice,
      items: [
        { description: "Cleaning", quantity: 1, unitPrice: 150 },
        { description: "X-Ray", quantity: 2, unitPrice: 75 },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("should default discount to 0", () => {
    const result = invoiceSchema.safeParse(validInvoice);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.discount).toBe(0);
    }
  });
});

describe("loginSchema", () => {
  it("should accept valid login", () => {
    const result = loginSchema.safeParse({
      email: "test@example.com",
      password: "password123",
    });
    expect(result.success).toBe(true);
  });

  it("should reject invalid email", () => {
    const result = loginSchema.safeParse({
      email: "not-email",
      password: "password123",
    });
    expect(result.success).toBe(false);
  });

  it("should reject short password", () => {
    const result = loginSchema.safeParse({
      email: "test@example.com",
      password: "1234567",
    });
    expect(result.success).toBe(false);
  });

  it("should accept exactly 8 character password", () => {
    const result = loginSchema.safeParse({
      email: "test@example.com",
      password: "12345678",
    });
    expect(result.success).toBe(true);
  });

  it("should reject empty email", () => {
    const result = loginSchema.safeParse({
      email: "",
      password: "password123",
    });
    expect(result.success).toBe(false);
  });

  it("should reject empty password", () => {
    const result = loginSchema.safeParse({
      email: "test@example.com",
      password: "",
    });
    expect(result.success).toBe(false);
  });
});

describe("staffSchema", () => {
  const validStaff = {
    firstName: "John",
    lastName: "Smith",
    email: "john@clinic.com",
    role: "DENTIST",
  };

  it("should accept valid staff", () => {
    const result = staffSchema.safeParse(validStaff);
    expect(result.success).toBe(true);
  });

  it("should reject without firstName", () => {
    const { firstName, ...rest } = validStaff;
    const result = staffSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it("should reject without lastName", () => {
    const { lastName, ...rest } = validStaff;
    const result = staffSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it("should reject without email", () => {
    const { email, ...rest } = validStaff;
    const result = staffSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it("should reject without role", () => {
    const { role, ...rest } = validStaff;
    const result = staffSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it("should accept all valid roles", () => {
    for (const role of ["ADMIN", "DENTIST", "RECEPTIONIST", "ASSISTANT"]) {
      const result = staffSchema.safeParse({ ...validStaff, role });
      expect(result.success).toBe(true);
    }
  });

  it("should reject invalid role", () => {
    const result = staffSchema.safeParse({ ...validStaff, role: "MANAGER" });
    expect(result.success).toBe(false);
  });

  it("should accept optional fields", () => {
    const result = staffSchema.safeParse({
      ...validStaff,
      phone: "555-0123",
      departmentId: "dept-1",
      specialization: "Orthodontics",
      licenseNumber: "DEN-12345",
      bio: "Experienced dentist",
      salary: 120000,
    });
    expect(result.success).toBe(true);
  });
});
