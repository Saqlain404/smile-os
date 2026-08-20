import { describe, it, expect, vi, beforeEach } from "vitest";
import { mockPrisma } from "../../__mocks__/prisma";

vi.mock("@/lib/prisma", () => ({
  default: mockPrisma,
  prisma: mockPrisma,
}));

import {
  getInvoices,
  getInvoice,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  recordPayment,
  getBillingStats,
} from "@/server/actions/billing";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("getInvoices", () => {
  it("should return paginated invoices", async () => {
    const mockInvoices = [
      { id: "1", invoiceNumber: "INV-01001", totalAmount: 150 },
      { id: "2", invoiceNumber: "INV-01002", totalAmount: 250 },
    ];

    mockPrisma.invoice.findMany.mockResolvedValue(mockInvoices);
    mockPrisma.invoice.count.mockResolvedValue(2);

    const result = await getInvoices({ page: 1, pageSize: 20 });

    expect(result.data).toEqual(mockInvoices);
    expect(result.pagination.total).toBe(2);
    expect(result.pagination.totalPages).toBe(1);
    expect(result.pagination.page).toBe(1);
  });

  it("should calculate total pages correctly", async () => {
    mockPrisma.invoice.findMany.mockResolvedValue([]);
    mockPrisma.invoice.count.mockResolvedValue(45);

    const result = await getInvoices({ page: 1, pageSize: 20 });

    expect(result.pagination.totalPages).toBe(3);
  });

  it("should filter by status", async () => {
    mockPrisma.invoice.findMany.mockResolvedValue([]);
    mockPrisma.invoice.count.mockResolvedValue(0);

    await getInvoices({ status: "PAID" });

    expect(mockPrisma.invoice.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ status: "PAID" }),
      })
    );
  });

  it("should filter by patientId", async () => {
    mockPrisma.invoice.findMany.mockResolvedValue([]);
    mockPrisma.invoice.count.mockResolvedValue(0);

    await getInvoices({ patientId: "patient-1" });

    expect(mockPrisma.invoice.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ patientId: "patient-1" }),
      })
    );
  });

  it("should search by invoice number", async () => {
    mockPrisma.invoice.findMany.mockResolvedValue([]);
    mockPrisma.invoice.count.mockResolvedValue(0);

    await getInvoices({ search: "INV-01" });

    expect(mockPrisma.invoice.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: expect.arrayContaining([
            expect.objectContaining({
              invoiceNumber: expect.objectContaining({ contains: "INV-01" }),
            }),
          ]),
        }),
      })
    );
  });
});

describe("getInvoice", () => {
  it("should return a single invoice with relations", async () => {
    const mockInvoice = {
      id: "1",
      invoiceNumber: "INV-01001",
      patient: { id: "p1", firstName: "John", lastName: "Doe" },
      items: [],
      payments: [],
    };

    mockPrisma.invoice.findUnique.mockResolvedValue(mockInvoice);

    const result = await getInvoice("1");

    expect(result).toEqual(mockInvoice);
    expect(mockPrisma.invoice.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "1" },
      })
    );
  });
});

describe("createInvoice", () => {
  it("should create invoice with correct calculations", async () => {
    mockPrisma.clinic.findFirst.mockResolvedValue({
      id: "clinic-1",
      taxRate: 10,
    });
    mockPrisma.invoice.findFirst.mockResolvedValue(null);
    mockPrisma.invoice.create.mockResolvedValue({
      id: "1",
      invoiceNumber: "INV-01001",
      subtotal: 200,
      taxAmount: 20,
      discount: 0,
      totalAmount: 220,
    });

    const result = await createInvoice({
      patientId: "patient-1",
      items: [
        { description: "Cleaning", quantity: 1, unitPrice: 100 },
        { description: "X-Ray", quantity: 1, unitPrice: 100 },
      ],
    });

    expect(result.subtotal).toBe(200);
    expect(result.taxAmount).toBe(20);
    expect(result.discount).toBe(0);
    expect(result.totalAmount).toBe(220);
  });

  it("should apply discount", async () => {
    mockPrisma.clinic.findFirst.mockResolvedValue({
      id: "clinic-1",
      taxRate: 10,
    });
    mockPrisma.invoice.findFirst.mockResolvedValue(null);
    mockPrisma.invoice.create.mockResolvedValue({
      id: "1",
      subtotal: 200,
      taxAmount: 20,
      discount: 50,
      totalAmount: 170,
    });

    const result = await createInvoice({
      patientId: "patient-1",
      items: [{ description: "Cleaning", quantity: 2, unitPrice: 100 }],
      discount: 50,
    });

    expect(result.discount).toBe(50);
    expect(result.totalAmount).toBe(170);
  });

  it("should generate invoice number starting from 01001", async () => {
    mockPrisma.clinic.findFirst.mockResolvedValue({
      id: "clinic-1",
      taxRate: 0,
    });
    mockPrisma.invoice.findFirst.mockResolvedValue(null);
    mockPrisma.invoice.create.mockResolvedValue({ id: "1" });

    await createInvoice({
      patientId: "patient-1",
      items: [{ description: "Test", quantity: 1, unitPrice: 100 }],
    });

    expect(mockPrisma.invoice.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          invoiceNumber: "INV-01001",
        }),
      })
    );
  });

  it("should increment invoice number", async () => {
    mockPrisma.clinic.findFirst.mockResolvedValue({
      id: "clinic-1",
      taxRate: 0,
    });
    mockPrisma.invoice.findFirst.mockResolvedValue({
      invoiceNumber: "INV-01005",
    });
    mockPrisma.invoice.create.mockResolvedValue({ id: "1" });

    await createInvoice({
      patientId: "patient-1",
      items: [{ description: "Test", quantity: 1, unitPrice: 100 }],
    });

    expect(mockPrisma.invoice.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          invoiceNumber: "INV-01006",
        }),
      })
    );
  });

  it("should throw if no clinic found", async () => {
    mockPrisma.clinic.findFirst.mockResolvedValue(null);

    await expect(
      createInvoice({
        patientId: "patient-1",
        items: [{ description: "Test", quantity: 1, unitPrice: 100 }],
      })
    ).rejects.toThrow("No clinic found");
  });
});

describe("updateInvoice", () => {
  it("should recalculate totals when items change", async () => {
    mockPrisma.invoice.findUnique.mockResolvedValue({
      id: "1",
      subtotal: 100,
      discount: 0,
      payments: [],
    });
    mockPrisma.clinic.findFirst.mockResolvedValue({
      taxRate: 10,
    });
    mockPrisma.invoiceItem.deleteMany.mockResolvedValue({ count: 1 });
    mockPrisma.invoiceItem.createMany.mockResolvedValue({ count: 2 });
    mockPrisma.invoice.update.mockResolvedValue({});

    await updateInvoice("1", {
      items: [
        { description: "New Item", quantity: 2, unitPrice: 100 },
      ],
    });

    expect(mockPrisma.invoice.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          subtotal: 200,
          taxAmount: 20,
          totalAmount: 220,
        }),
      })
    );
  });

  it("should throw if invoice not found", async () => {
    mockPrisma.invoice.findUnique.mockResolvedValue(null);

    await expect(updateInvoice("nonexistent", {})).rejects.toThrow("Invoice not found");
  });

  it("should auto-update status based on payments", async () => {
    mockPrisma.invoice.findUnique.mockResolvedValue({
      id: "1",
      subtotal: 100,
      discount: 0,
      payments: [{ amount: 100 }],
    });
    mockPrisma.clinic.findFirst.mockResolvedValue({ taxRate: 0 });
    mockPrisma.invoice.update.mockResolvedValue({});

    await updateInvoice("1", {});

    expect(mockPrisma.invoice.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: "PAID",
        }),
      })
    );
  });
});

describe("deleteInvoice", () => {
  it("should delete invoice and related items", async () => {
    mockPrisma.invoiceItem.deleteMany.mockResolvedValue({ count: 2 });
    mockPrisma.payment.deleteMany.mockResolvedValue({ count: 1 });
    mockPrisma.invoice.delete.mockResolvedValue({});

    await deleteInvoice("1");

    expect(mockPrisma.invoiceItem.deleteMany).toHaveBeenCalledWith({
      where: { invoiceId: "1" },
    });
    expect(mockPrisma.payment.deleteMany).toHaveBeenCalledWith({
      where: { invoiceId: "1" },
    });
    expect(mockPrisma.invoice.delete).toHaveBeenCalledWith({
      where: { id: "1" },
    });
  });
});

describe("recordPayment", () => {
  it("should record payment and update invoice status", async () => {
    mockPrisma.invoice.findUnique.mockResolvedValue({
      id: "1",
      totalAmount: 200,
      payments: [{ amount: 100 }],
    });
    mockPrisma.payment.create.mockResolvedValue({
      id: "pay-1",
      amount: 100,
    });
    mockPrisma.invoice.update.mockResolvedValue({});

    const result = await recordPayment({
      invoiceId: "1",
      amount: 100,
      method: "CARD",
    });

    expect(result.amount).toBe(100);
    expect(mockPrisma.invoice.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: "PAID" }),
      })
    );
  });

  it("should set PARTIAL status when partially paid", async () => {
    mockPrisma.invoice.findUnique.mockResolvedValue({
      id: "1",
      totalAmount: 200,
      payments: [],
    });
    mockPrisma.payment.create.mockResolvedValue({ id: "pay-1" });
    mockPrisma.invoice.update.mockResolvedValue({});

    await recordPayment({
      invoiceId: "1",
      amount: 50,
      method: "CASH",
    });

    expect(mockPrisma.invoice.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: "PARTIAL" }),
      })
    );
  });

  it("should throw if invoice not found", async () => {
    mockPrisma.invoice.findUnique.mockResolvedValue(null);

    await expect(
      recordPayment({ invoiceId: "nonexistent", amount: 100, method: "CASH" })
    ).rejects.toThrow("Invoice not found");
  });

  it("should throw if payment exceeds remaining balance", async () => {
    mockPrisma.invoice.findUnique.mockResolvedValue({
      id: "1",
      totalAmount: 100,
      payments: [{ amount: 80 }],
    });

    await expect(
      recordPayment({ invoiceId: "1", amount: 50, method: "CASH" })
    ).rejects.toThrow("Payment exceeds remaining balance");
  });
});

describe("getBillingStats", () => {
  it("should return zeros when no clinic found", async () => {
    mockPrisma.clinic.findFirst.mockResolvedValue(null);

    const result = await getBillingStats();

    expect(result.totalRevenue).toBe(0);
    expect(result.pendingAmount).toBe(0);
    expect(result.invoiceCount).toBe(0);
  });

  it("should calculate billing stats correctly", async () => {
    mockPrisma.clinic.findFirst.mockResolvedValue({ id: "clinic-1" });
    mockPrisma.payment.findMany
      .mockResolvedValueOnce([{ amount: 500 }, { amount: 300 }])
      .mockResolvedValueOnce([{ amount: 400 }]);
    mockPrisma.invoice.findMany
      .mockResolvedValueOnce([{ totalAmount: 200 }])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([]);
    mockPrisma.invoice.count.mockResolvedValue(10);

    const result = await getBillingStats();

    expect(result.totalRevenue).toBe(800);
    expect(result.pendingAmount).toBe(200);
    expect(result.invoiceCount).toBe(10);
  });
});
