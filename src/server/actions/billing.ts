"use server";

import prisma from "@/lib/prisma";

// ─── Invoice CRUD ──────────────────────────────────────────────────

export async function getInvoices(params: {
  search?: string;
  status?: string;
  patientId?: string;
  page?: number;
  pageSize?: number;
}) {
  const { search, status, patientId, page = 1, pageSize = 20 } = params;
  const skip = (page - 1) * pageSize;

  const where: Record<string, unknown> = {};

  if (status) where.status = status;
  if (patientId) where.patientId = patientId;
  if (search) {
    where.OR = [
      { invoiceNumber: { contains: search, mode: "insensitive" } },
      { patient: { firstName: { contains: search, mode: "insensitive" } } },
      { patient: { lastName: { contains: search, mode: "insensitive" } } },
    ];
  }

  const [invoices, total] = await Promise.all([
    prisma.invoice.findMany({
      where,
      include: {
        patient: {
          select: { id: true, firstName: true, lastName: true, phone: true, email: true },
        },
        items: true,
        payments: {
          select: { id: true, amount: true, method: true, paidAt: true },
          orderBy: { paidAt: "desc" },
        },
      },
      orderBy: { date: "desc" },
      skip,
      take: pageSize,
    }),
    prisma.invoice.count({ where }),
  ]);

  return {
    data: invoices,
    pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
  };
}

export async function getInvoice(id: string) {
  return prisma.invoice.findUnique({
    where: { id },
    include: {
      patient: {
        select: { id: true, firstName: true, lastName: true, phone: true, email: true, address: true },
      },
      items: true,
      payments: {
        orderBy: { paidAt: "desc" },
      },
    },
  });
}

export async function createInvoice(data: {
  patientId: string;
  dueDate?: string;
  items: { description: string; quantity: number; unitPrice: number }[];
  discount?: number;
  notes?: string;
}) {
  const clinic = await prisma.clinic.findFirst();
  if (!clinic) throw new Error("No clinic found");

  const invoiceNumber = await generateInvoiceNumber(clinic.id);

  const subtotal = data.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const taxRate = Number(clinic.taxRate) / 100;
  const taxAmount = subtotal * taxRate;
  const discount = data.discount ?? 0;
  const totalAmount = subtotal + taxAmount - discount;

  return prisma.invoice.create({
    data: {
      clinicId: clinic.id,
      patientId: data.patientId,
      invoiceNumber,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      status: "PENDING",
      subtotal,
      taxAmount,
      discount,
      totalAmount,
      notes: data.notes,
      items: {
        create: data.items.map((item) => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.quantity * item.unitPrice,
        })),
      },
    },
    include: { items: true },
  });
}

export async function updateInvoice(
  id: string,
  data: {
    patientId?: string;
    dueDate?: string | null;
    status?: string;
    discount?: number;
    notes?: string;
    items?: { description: string; quantity: number; unitPrice: number }[];
  }
) {
  const existing = await prisma.invoice.findUnique({
    where: { id },
    include: { items: true, payments: true },
  });
  if (!existing) throw new Error("Invoice not found");

  const clinic = await prisma.clinic.findFirst();
  const taxRate = clinic ? Number(clinic.taxRate) / 100 : 0;

  const updateData: Record<string, unknown> = {};
  if (data.patientId) updateData.patientId = data.patientId;
  if (data.dueDate !== undefined) updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null;
  if (data.status) updateData.status = data.status;
  if (data.notes !== undefined) updateData.notes = data.notes;

  let subtotal = Number(existing.subtotal);
  let discount = data.discount !== undefined ? data.discount : Number(existing.discount);

  if (data.items) {
    // Delete old items, create new ones
    await prisma.invoiceItem.deleteMany({ where: { invoiceId: id } });

    const items = data.items.map((item) => ({
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      total: item.quantity * item.unitPrice,
    }));

    await prisma.invoiceItem.createMany({
      data: items.map((item) => ({ ...item, invoiceId: id })),
    });

    subtotal = items.reduce((sum, item) => sum + item.total, 0);
  }

  const taxAmount = subtotal * taxRate;
  const totalAmount = subtotal + taxAmount - discount;

  updateData.subtotal = subtotal;
  updateData.taxAmount = taxAmount;
  updateData.discount = discount;
  updateData.totalAmount = totalAmount;

  // Auto-update status based on payments
  if (!data.status) {
    const totalPaid = existing.payments.reduce((sum, p) => sum + Number(p.amount), 0);
    if (totalPaid >= totalAmount) updateData.status = "PAID";
    else if (totalPaid > 0) updateData.status = "PARTIAL";
  }

  return prisma.invoice.update({
    where: { id },
    data: updateData,
    include: { items: true, payments: true },
  });
}

export async function deleteInvoice(id: string) {
  // Delete items and payments first (cascade should handle it, but be explicit)
  await prisma.invoiceItem.deleteMany({ where: { invoiceId: id } });
  await prisma.payment.deleteMany({ where: { invoiceId: id } });
  await prisma.invoice.delete({ where: { id } });
}

// ─── Payments ──────────────────────────────────────────────────────

export async function recordPayment(data: {
  invoiceId: string;
  amount: number;
  method: string;
  reference?: string;
  notes?: string;
}) {
  const invoice = await prisma.invoice.findUnique({
    where: { id: data.invoiceId },
    include: { payments: true },
  });
  if (!invoice) throw new Error("Invoice not found");

  const totalPaid = invoice.payments.reduce((sum, p) => sum + Number(p.amount), 0);
  const remaining = Number(invoice.totalAmount) - totalPaid;

  if (data.amount > remaining) {
    throw new Error(`Payment exceeds remaining balance of $${remaining.toFixed(2)}`);
  }

  const payment = await prisma.payment.create({
    data: {
      invoiceId: data.invoiceId,
      amount: data.amount,
      method: data.method as "CASH" | "CARD" | "ONLINE" | "INSURANCE" | "BANK_TRANSFER",
      status: "PAID",
      reference: data.reference,
      notes: data.notes,
    },
  });

  // Update invoice status
  const newTotalPaid = totalPaid + data.amount;
  const totalAmount = Number(invoice.totalAmount);
  let newStatus: string;
  if (newTotalPaid >= totalAmount) newStatus = "PAID";
  else newStatus = "PARTIAL";

  await prisma.invoice.update({
    where: { id: data.invoiceId },
    data: { status: newStatus as "PAID" | "PARTIAL" },
  });

  return payment;
}

// ─── Stats ─────────────────────────────────────────────────────────

export async function getBillingStats() {
  const clinic = await prisma.clinic.findFirst();
  if (!clinic) {
    return {
      totalRevenue: 0,
      pendingAmount: 0,
      partialAmount: 0,
      overdueAmount: 0,
      paidThisMonth: 0,
      invoiceCount: 0,
      paidCount: 0,
      pendingCount: 0,
      overdueCount: 0,
    };
  }

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const [paidInvoices, pendingInvoices, partialInvoices, overdueInvoices, thisMonthPaid, totalCount] =
    await Promise.all([
      prisma.payment.findMany({
        where: {
          status: "PAID",
          invoice: { clinicId: clinic.id },
        },
        select: { amount: true },
      }),
      prisma.invoice.findMany({
        where: { clinicId: clinic.id, status: "PENDING" },
        select: { totalAmount: true },
      }),
      prisma.invoice.findMany({
        where: { clinicId: clinic.id, status: "PARTIAL" },
        include: { payments: { select: { amount: true } } },
      }),
      prisma.invoice.findMany({
        where: {
          clinicId: clinic.id,
          status: "PENDING",
          dueDate: { lt: now },
        },
        select: { totalAmount: true },
      }),
      prisma.payment.findMany({
        where: {
          status: "PAID",
          invoice: { clinicId: clinic.id },
          paidAt: { gte: startOfMonth, lte: endOfMonth },
        },
        select: { amount: true },
      }),
      prisma.invoice.count({ where: { clinicId: clinic.id } }),
    ]);

  const totalRevenue = paidInvoices.reduce((sum, p) => sum + Number(p.amount), 0);
  const pendingAmount = pendingInvoices.reduce((sum, i) => sum + Number(i.totalAmount), 0);
  const partialAmount = partialInvoices.reduce((sum, inv) => {
    const paid = inv.payments.reduce((s, p) => s + Number(p.amount), 0);
    return sum + (Number(inv.totalAmount) - paid);
  }, 0);
  const overdueAmount = overdueInvoices.reduce((sum, i) => sum + Number(i.totalAmount), 0);
  const paidThisMonth = thisMonthPaid.reduce((sum, p) => sum + Number(p.amount), 0);

  return {
    totalRevenue,
    pendingAmount,
    partialAmount,
    overdueAmount,
    paidThisMonth,
    invoiceCount: totalCount,
    paidCount: paidInvoices.length,
    pendingCount: pendingInvoices.length + partialInvoices.length,
    overdueCount: overdueInvoices.length,
  };
}

// ─── Invoice Number Generation ─────────────────────────────────────

async function generateInvoiceNumber(clinicId: string): Promise<string> {
  const lastInvoice = await prisma.invoice.findFirst({
    where: { clinicId },
    orderBy: { createdAt: "desc" },
    select: { invoiceNumber: true },
  });

  if (!lastInvoice) return "INV-01001";

  const match = lastInvoice.invoiceNumber.match(/INV-(\d+)/);
  if (!match) return "INV-01001";

  const next = parseInt(match[1], 10) + 1;
  return `INV-${String(next).padStart(5, "0")}`;
}
