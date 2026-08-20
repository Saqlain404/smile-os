import { vi } from "vitest";

function createMockFn() {
  const fn = vi.fn();
  fn.findMany = vi.fn();
  fn.findUnique = vi.fn();
  fn.findFirst = vi.fn();
  fn.create = vi.fn();
  fn.createMany = vi.fn();
  fn.update = vi.fn();
  fn.updateMany = vi.fn();
  fn.delete = vi.fn();
  fn.deleteMany = vi.fn();
  fn.count = vi.fn();
  fn.aggregate = vi.fn();
  fn.groupBy = vi.fn();
  fn.upsert = vi.fn();
  return fn;
}

export const mockPrisma = {
  clinic: createMockFn(),
  clinicSettings: createMockFn(),
  department: createMockFn(),
  staff: createMockFn(),
  staffSchedule: createMockFn(),
  attendance: createMockFn(),
  leave: createMockFn(),
  patient: createMockFn(),
  patientTag: createMockFn(),
  familyMember: createMockFn(),
  insurance: createMockFn(),
  appointment: createMockFn(),
  chair: createMockFn(),
  treatment: createMockFn(),
  consultation: createMockFn(),
  medicalRecord: createMockFn(),
  prescription: createMockFn(),
  prescriptionItem: createMockFn(),
  patientDocument: createMockFn(),
  invoice: createMockFn(),
  invoiceItem: createMockFn(),
  payment: createMockFn(),
  notification: createMockFn(),
  review: createMockFn(),
  blogPost: createMockFn(),
  galleryImage: createMockFn(),
  aIConversation: createMockFn(),
  aIMessage: createMockFn(),
  aIInsight: createMockFn(),
  activityLog: createMockFn(),
  auditLog: createMockFn(),
  user: createMockFn(),
  session: createMockFn(),
  account: createMockFn(),
  verification: createMockFn(),
};

vi.mock("@/lib/prisma", () => ({
  default: mockPrisma,
  prisma: mockPrisma,
}));

beforeEach(() => {
  vi.clearAllMocks();
});
