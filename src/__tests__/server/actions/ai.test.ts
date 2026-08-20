import { describe, it, expect, vi, beforeEach } from "vitest";
import { mockPrisma } from "../../__mocks__/prisma";

vi.mock("@/lib/prisma", () => ({
  default: mockPrisma,
  prisma: mockPrisma,
}));

import {
  getAIInsights,
  generateInsights,
  markInsightRead,
  dismissInsight,
  getAIDiagnosisSuggestions,
  getAITreatmentPlan,
  createAIConversation,
  getAIConversations,
  getAIConversation,
  getAIGlobalStats,
} from "@/server/actions/ai";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("getAIInsights", () => {
  it("should return empty when no clinic found", async () => {
    mockPrisma.clinic.findFirst.mockResolvedValue(null);

    const result = await getAIInsights();

    expect(result.insights).toEqual([]);
    expect(result.stats.total).toBe(0);
  });

  it("should return insights with stats", async () => {
    mockPrisma.clinic.findFirst.mockResolvedValue({ id: "clinic-1" });
    mockPrisma.aIInsight.findMany.mockResolvedValue([
      { id: "1", title: "Test Insight", severity: "HIGH" },
    ]);
    mockPrisma.aIInsight.aggregate.mockResolvedValue({ _count: 1 });
    mockPrisma.aIInsight.count
      .mockResolvedValueOnce(1) // unread
      .mockResolvedValueOnce(0); // critical

    const result = await getAIInsights();

    expect(result.insights).toHaveLength(1);
    expect(result.stats.total).toBe(1);
    expect(result.stats.unread).toBe(1);
    expect(result.stats.critical).toBe(0);
  });
});

describe("generateInsights", () => {
  it("should return 0 when no clinic found", async () => {
    mockPrisma.clinic.findFirst.mockResolvedValue(null);

    const result = await generateInsights();

    expect(result.generated).toBe(0);
  });

  it("should generate HIGH severity insight when no-show rate > 15%", async () => {
    mockPrisma.clinic.findFirst.mockResolvedValue({ id: "clinic-1" });

    // Mock all the parallel queries
    mockPrisma.patient.count
      .mockResolvedValueOnce(100) // totalPatients
      .mockResolvedValueOnce(5);  // newPatients30d
    mockPrisma.appointment.count
      .mockResolvedValueOnce(100)  // totalAppointments
      .mockResolvedValueOnce(80)   // completedAppointments
      .mockResolvedValueOnce(5)    // cancelledAppointments
      .mockResolvedValueOnce(20)   // noShowAppointments (20%)
      .mockResolvedValueOnce(10);  // appointmentsThisWeek
    mockPrisma.invoice.aggregate.mockResolvedValue({
      _sum: { totalAmount: 5000 },
    });
    mockPrisma.invoice.count
      .mockResolvedValueOnce(3) // pendingInvoices
      .mockResolvedValueOnce(0); // overdueInvoices
    mockPrisma.consultation.findMany.mockResolvedValue([]);
    mockPrisma.treatment.findMany.mockResolvedValue([
      { name: "Cleaning", price: 150 },
    ]);
    mockPrisma.aIInsight.deleteMany.mockResolvedValue({ count: 0 });
    mockPrisma.aIInsight.createMany.mockResolvedValue({ count: 1 });

    const result = await generateInsights();

    expect(result.generated).toBeGreaterThan(0);

    // Verify the insight data includes a high severity risk insight
    const createCall = mockPrisma.aIInsight.createMany.mock.calls[0][0];
    const insights = createCall.data;
    const highRiskInsight = insights.find(
      (i: { severity: string }) => i.severity === "HIGH" && i.type === "RISK"
    );
    expect(highRiskInsight).toBeDefined();
    expect(highRiskInsight.title).toContain("No-Show");
  });

  it("should generate MEDIUM severity insight when no-show rate > 10%", async () => {
    mockPrisma.clinic.findFirst.mockResolvedValue({ id: "clinic-1" });
    mockPrisma.patient.count
      .mockResolvedValueOnce(100)
      .mockResolvedValueOnce(5);
    mockPrisma.appointment.count
      .mockResolvedValueOnce(100)  // total
      .mockResolvedValueOnce(80)   // completed
      .mockResolvedValueOnce(5)    // cancelled
      .mockResolvedValueOnce(12)   // noShow (12%)
      .mockResolvedValueOnce(10);
    mockPrisma.invoice.aggregate.mockResolvedValue({ _sum: { totalAmount: 0 } });
    mockPrisma.invoice.count.mockResolvedValue(0);
    mockPrisma.consultation.findMany.mockResolvedValue([]);
    mockPrisma.treatment.findMany.mockResolvedValue([]);
    mockPrisma.aIInsight.deleteMany.mockResolvedValue({ count: 0 });
    mockPrisma.aIInsight.createMany.mockResolvedValue({ count: 1 });

    await generateInsights();

    const createCall = mockPrisma.aIInsight.createMany.mock.calls[0][0];
    const insights = createCall.data;
    const mediumRiskInsight = insights.find(
      (i: { severity: string }) => i.severity === "MEDIUM" && i.type === "RISK"
    );
    expect(mediumRiskInsight).toBeDefined();
  });

  it("should generate insight for high cancellation rate", async () => {
    mockPrisma.clinic.findFirst.mockResolvedValue({ id: "clinic-1" });
    mockPrisma.patient.count
      .mockResolvedValueOnce(100)
      .mockResolvedValueOnce(5);
    mockPrisma.appointment.count
      .mockResolvedValueOnce(100)  // total
      .mockResolvedValueOnce(70)   // completed
      .mockResolvedValueOnce(25)   // cancelled (25%)
      .mockResolvedValueOnce(0)    // noShow
      .mockResolvedValueOnce(10);
    mockPrisma.invoice.aggregate.mockResolvedValue({ _sum: { totalAmount: 0 } });
    mockPrisma.invoice.count.mockResolvedValue(0);
    mockPrisma.consultation.findMany.mockResolvedValue([]);
    mockPrisma.treatment.findMany.mockResolvedValue([]);
    mockPrisma.aIInsight.deleteMany.mockResolvedValue({ count: 0 });
    mockPrisma.aIInsight.createMany.mockResolvedValue({ count: 1 });

    await generateInsights();

    const createCall = mockPrisma.aIInsight.createMany.mock.calls[0][0];
    const insights = createCall.data;
    const cancelInsight = insights.find(
      (i: { title: string }) => i.title.includes("Cancellation")
    );
    expect(cancelInsight).toBeDefined();
    expect(cancelInsight.severity).toBe("HIGH");
  });

  it("should generate insight for pending invoices > 5", async () => {
    mockPrisma.clinic.findFirst.mockResolvedValue({ id: "clinic-1" });
    mockPrisma.patient.count
      .mockResolvedValueOnce(100)
      .mockResolvedValueOnce(5);
    mockPrisma.appointment.count
      .mockResolvedValueOnce(100)
      .mockResolvedValueOnce(80)
      .mockResolvedValueOnce(5)
      .mockResolvedValueOnce(5)
      .mockResolvedValueOnce(10);
    mockPrisma.invoice.aggregate.mockResolvedValue({ _sum: { totalAmount: 0 } });
    mockPrisma.invoice.count
      .mockResolvedValueOnce(8) // pendingInvoices > 5
      .mockResolvedValueOnce(0);
    mockPrisma.consultation.findMany.mockResolvedValue([]);
    mockPrisma.treatment.findMany.mockResolvedValue([]);
    mockPrisma.aIInsight.deleteMany.mockResolvedValue({ count: 0 });
    mockPrisma.aIInsight.createMany.mockResolvedValue({ count: 1 });

    await generateInsights();

    const createCall = mockPrisma.aIInsight.createMany.mock.calls[0][0];
    const insights = createCall.data;
    const pendingInsight = insights.find(
      (i: { title: string }) => i.title.includes("Pending Invoices")
    );
    expect(pendingInsight).toBeDefined();
    expect(pendingInsight.type).toBe("REVENUE");
  });

  it("should generate OPTIMIZATION insight when completion rate > 85%", async () => {
    mockPrisma.clinic.findFirst.mockResolvedValue({ id: "clinic-1" });
    mockPrisma.patient.count
      .mockResolvedValueOnce(100)
      .mockResolvedValueOnce(5);
    mockPrisma.appointment.count
      .mockResolvedValueOnce(100)  // total
      .mockResolvedValueOnce(90)   // completed (90%)
      .mockResolvedValueOnce(5)
      .mockResolvedValueOnce(5)
      .mockResolvedValueOnce(10);
    mockPrisma.invoice.aggregate.mockResolvedValue({ _sum: { totalAmount: 0 } });
    mockPrisma.invoice.count.mockResolvedValue(0);
    mockPrisma.consultation.findMany.mockResolvedValue([]);
    mockPrisma.treatment.findMany.mockResolvedValue([]);
    mockPrisma.aIInsight.deleteMany.mockResolvedValue({ count: 0 });
    mockPrisma.aIInsight.createMany.mockResolvedValue({ count: 1 });

    await generateInsights();

    const createCall = mockPrisma.aIInsight.createMany.mock.calls[0][0];
    const insights = createCall.data;
    const completionInsight = insights.find(
      (i: { title: string }) => i.title.includes("Completion")
    );
    expect(completionInsight).toBeDefined();
    expect(completionInsight.type).toBe("OPTIMIZATION");
  });
});

describe("markInsightRead", () => {
  it("should mark insight as read", async () => {
    mockPrisma.aIInsight.update.mockResolvedValue({ id: "1", isRead: true });

    await markInsightRead("1");

    expect(mockPrisma.aIInsight.update).toHaveBeenCalledWith({
      where: { id: "1" },
      data: { isRead: true },
    });
  });
});

describe("dismissInsight", () => {
  it("should dismiss insight", async () => {
    mockPrisma.aIInsight.update.mockResolvedValue({ id: "1", isDismissed: true });

    await dismissInsight("1");

    expect(mockPrisma.aIInsight.update).toHaveBeenCalledWith({
      where: { id: "1" },
      data: { isDismissed: true },
    });
  });
});

describe("getAIDiagnosisSuggestions", () => {
  it("should return null if patient not found", async () => {
    mockPrisma.patient.findUnique.mockResolvedValue(null);

    const result = await getAIDiagnosisSuggestions("nonexistent");

    expect(result).toBeNull();
  });

  it("should suggest allergy consideration", async () => {
    mockPrisma.patient.findUnique.mockResolvedValue({
      firstName: "John",
      lastName: "Doe",
      allergies: "Penicillin",
      medicalHistory: null,
      dentalHistory: null,
      dateOfBirth: "1990-01-01",
      consultationHistory: [],
      prescriptions: [],
      appointments: [],
      medicalRecords: [],
    });

    const result = await getAIDiagnosisSuggestions("patient-1");

    expect(result).not.toBeNull();
    const allergySuggestion = result!.suggestions.find(
      (s) => s.title === "Allergy Consideration"
    );
    expect(allergySuggestion).toBeDefined();
    expect(allergySuggestion!.priority).toBe("high");
    expect(allergySuggestion!.confidence).toBe(0.99);
  });

  it("should suggest diabetes management", async () => {
    mockPrisma.patient.findUnique.mockResolvedValue({
      firstName: "John",
      lastName: "Doe",
      allergies: null,
      medicalHistory: "Type 2 Diabetes",
      dentalHistory: null,
      dateOfBirth: "1990-01-01",
      consultationHistory: [],
      prescriptions: [],
      appointments: [],
      medicalRecords: [],
    });

    const result = await getAIDiagnosisSuggestions("patient-1");

    const diabetesSuggestion = result!.suggestions.find(
      (s) => s.title === "Diabetes Management"
    );
    expect(diabetesSuggestion).toBeDefined();
    expect(diabetesSuggestion!.priority).toBe("high");
  });

  it("should suggest cardiac history consideration", async () => {
    mockPrisma.patient.findUnique.mockResolvedValue({
      firstName: "John",
      lastName: "Doe",
      allergies: null,
      medicalHistory: "Heart disease, hypertension",
      dentalHistory: null,
      dateOfBirth: "1990-01-01",
      consultationHistory: [],
      prescriptions: [],
      appointments: [],
      medicalRecords: [],
    });

    const result = await getAIDiagnosisSuggestions("patient-1");

    const cardiacSuggestion = result!.suggestions.find(
      (s) => s.title === "Cardiac History"
    );
    expect(cardiacSuggestion).toBeDefined();
    expect(cardiacSuggestion!.priority).toBe("high");
  });

  it("should suggest periodontal concern", async () => {
    mockPrisma.patient.findUnique.mockResolvedValue({
      firstName: "John",
      lastName: "Doe",
      allergies: null,
      medicalHistory: null,
      dentalHistory: "History of gum disease",
      dateOfBirth: "1990-01-01",
      consultationHistory: [],
      prescriptions: [],
      appointments: [],
      medicalRecords: [],
    });

    const result = await getAIDiagnosisSuggestions("patient-1");

    const periodontalSuggestion = result!.suggestions.find(
      (s) => s.title === "Periodontal Concern"
    );
    expect(periodontalSuggestion).toBeDefined();
    expect(periodontalSuggestion!.priority).toBe("medium");
  });

  it("should suggest age-related care for patients over 60", async () => {
    mockPrisma.patient.findUnique.mockResolvedValue({
      firstName: "John",
      lastName: "Doe",
      allergies: null,
      medicalHistory: null,
      dentalHistory: null,
      dateOfBirth: "1960-01-01", // ~66 years old
      consultationHistory: [],
      prescriptions: [],
      appointments: [],
      medicalRecords: [],
    });

    const result = await getAIDiagnosisSuggestions("patient-1");

    const ageSuggestion = result!.suggestions.find(
      (s) => s.title === "Age-Related Considerations"
    );
    expect(ageSuggestion).toBeDefined();
    expect(ageSuggestion!.priority).toBe("low");
  });

  it("should suggest routine checkup when no risk factors", async () => {
    mockPrisma.patient.findUnique.mockResolvedValue({
      firstName: "John",
      lastName: "Doe",
      allergies: null,
      medicalHistory: null,
      dentalHistory: null,
      dateOfBirth: "1990-01-01",
      consultationHistory: [],
      prescriptions: [],
      appointments: [],
      medicalRecords: [],
    });

    const result = await getAIDiagnosisSuggestions("patient-1");

    const routineSuggestion = result!.suggestions.find(
      (s) => s.title === "Routine Checkup Recommended"
    );
    expect(routineSuggestion).toBeDefined();
    expect(routineSuggestion!.priority).toBe("low");
  });
});

describe("getAITreatmentPlan", () => {
  it("should return null if patient not found", async () => {
    mockPrisma.patient.findUnique.mockResolvedValue(null);

    const result = await getAITreatmentPlan("nonexistent");

    expect(result).toBeNull();
  });

  it("should suggest checkup and cleaning when overdue", async () => {
    mockPrisma.patient.findUnique.mockResolvedValue({
      firstName: "John",
      lastName: "Doe",
      consultationHistory: [],
      appointments: [],
      prescriptions: [],
    });
    mockPrisma.clinic.findFirst.mockResolvedValue({ id: "clinic-1" });
    mockPrisma.treatment.findMany.mockResolvedValue([
      { id: "1", name: "Checkup", price: 100, duration: 30 },
      { id: "2", name: "Teeth Cleaning", price: 150, duration: 45 },
      { id: "3", name: "Filling", price: 200, duration: 60 },
    ]);

    const result = await getAITreatmentPlan("patient-1");

    expect(result).not.toBeNull();
    expect(result!.recommendations.length).toBeGreaterThan(0);

    const treatmentNames = result!.recommendations.map((r) => r.treatment);
    expect(treatmentNames).toContain("Checkup");
    expect(treatmentNames).toContain("Teeth Cleaning");
  });
});

describe("createAIConversation", () => {
  it("should create a conversation", async () => {
    mockPrisma.aIConversation.create.mockResolvedValue({
      id: "conv-1",
      userId: "user-1",
      title: "New Conversation",
    });

    const result = await createAIConversation("user-1");

    expect(result.id).toBe("conv-1");
    expect(mockPrisma.aIConversation.create).toHaveBeenCalledWith({
      data: { userId: "user-1", title: "New Conversation" },
    });
  });

  it("should use custom title", async () => {
    mockPrisma.aIConversation.create.mockResolvedValue({
      id: "conv-1",
      title: "Custom Title",
    });

    await createAIConversation("user-1", "Custom Title");

    expect(mockPrisma.aIConversation.create).toHaveBeenCalledWith({
      data: { userId: "user-1", title: "Custom Title" },
    });
  });
});

describe("getAIConversations", () => {
  it("should return conversations for user", async () => {
    const mockConversations = [
      { id: "conv-1", title: "Chat 1", messages: [] },
      { id: "conv-2", title: "Chat 2", messages: [] },
    ];
    mockPrisma.aIConversation.findMany.mockResolvedValue(mockConversations);

    const result = await getAIConversations("user-1");

    expect(result).toEqual(mockConversations);
  });
});

describe("getAIConversation", () => {
  it("should return conversation with messages", async () => {
    const mockConversation = {
      id: "conv-1",
      title: "Chat",
      messages: [
        { id: "m1", role: "user", content: "Hello" },
        { id: "m2", role: "assistant", content: "Hi there!" },
      ],
    };
    mockPrisma.aIConversation.findUnique.mockResolvedValue(mockConversation);

    const result = await getAIConversation("conv-1");

    expect(result).toEqual(mockConversation);
    expect(result!.messages).toHaveLength(2);
  });
});

describe("getAIGlobalStats", () => {
  it("should return null when no clinic found", async () => {
    mockPrisma.clinic.findFirst.mockResolvedValue(null);

    const result = await getAIGlobalStats();

    expect(result).toBeNull();
  });

  it("should return stats when clinic found", async () => {
    mockPrisma.clinic.findFirst.mockResolvedValue({ id: "clinic-1" });
    mockPrisma.patient.count
      .mockResolvedValueOnce(100)
      .mockResolvedValueOnce(10);
    mockPrisma.appointment.count
      .mockResolvedValueOnce(200)
      .mockResolvedValueOnce(50)
      .mockResolvedValueOnce(10)
      .mockResolvedValueOnce(5);
    mockPrisma.invoice.aggregate
      .mockResolvedValueOnce({ _sum: { totalAmount: 10000 } })
      .mockResolvedValueOnce({ _sum: { totalAmount: 3000 } })
      .mockResolvedValueOnce({ _sum: { totalAmount: 2000 } });
    mockPrisma.aIConversation.count.mockResolvedValue(5);
    mockPrisma.aIInsight.count.mockResolvedValue(8);

    const result = await getAIGlobalStats();

    expect(result).not.toBeNull();
    expect(result!.patients.total).toBe(100);
    expect(result!.patients.newThisMonth).toBe(10);
    expect(result!.appointments.total).toBe(200);
    expect(result!.revenue.total).toBe(10000);
    expect(result!.revenue.pending).toBe(2000);
    expect(result!.ai.insights).toBe(8);
    expect(result!.ai.conversations).toBe(5);
  });
});
