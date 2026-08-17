import { z } from "zod";

export const patientSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().min(1, "Phone is required"),
  dateOfBirth: z.string().optional(),
  gender: z.enum(["MALE", "FEMALE", "OTHER", "PREFER_NOT_TO_SAY"]).optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  country: z.string().default("US"),
  bloodGroup: z.string().optional(),
  allergies: z.string().optional(),
  medicalHistory: z.string().optional(),
  dentalHistory: z.string().optional(),
  emergencyContact: z.string().optional(),
  emergencyPhone: z.string().optional(),
  referredBy: z.string().optional(),
  notes: z.string().optional(),
});

export type PatientFormData = z.infer<typeof patientSchema>;

export const appointmentSchema = z.object({
  patientId: z.string().min(1, "Patient is required"),
  doctorId: z.string().min(1, "Doctor is required"),
  treatmentId: z.string().optional(),
  chairId: z.string().optional(),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  date: z.string().min(1, "Date is required"),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  duration: z.number().min(5),
  status: z
    .enum([
      "BOOKED",
      "CONFIRMED",
      "IN_PROGRESS",
      "COMPLETED",
      "CANCELLED",
      "NO_SHOW",
      "RESCHEDULED",
    ])
    .default("BOOKED"),
  notes: z.string().optional(),
  isRecurring: z.boolean().default(false),
  recurrenceRule: z.string().optional(),
});

export type AppointmentFormData = z.infer<typeof appointmentSchema>;

export const treatmentSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  duration: z.number().min(5).default(30),
  price: z.number().min(0, "Price must be positive"),
  cost: z.number().optional(),
  color: z.string().default("#8B5CF6"),
  isActive: z.boolean().default(true),
});

export type TreatmentFormData = z.infer<typeof treatmentSchema>;

export const invoiceSchema = z.object({
  patientId: z.string().min(1, "Patient is required"),
  dueDate: z.string().optional(),
  items: z.array(
    z.object({
      description: z.string().min(1),
      quantity: z.number().min(1),
      unitPrice: z.number().min(0),
    })
  ).min(1, "At least one item is required"),
  discount: z.number().min(0).default(0),
  notes: z.string().optional(),
});

export type InvoiceFormData = z.infer<typeof invoiceSchema>;

export const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const staffSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().optional(),
  role: z.enum(["ADMIN", "DENTIST", "RECEPTIONIST", "ASSISTANT"]),
  departmentId: z.string().optional(),
  specialization: z.string().optional(),
  licenseNumber: z.string().optional(),
  bio: z.string().optional(),
  salary: z.number().optional(),
});

export type StaffFormData = z.infer<typeof staffSchema>;
