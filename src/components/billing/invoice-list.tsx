/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Eye, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTable, type Column } from "@/components/shared/data-table/data-table";
import { PAYMENT_STATUS_COLORS } from "@/lib/constants";
import { getInvoices, deleteInvoice } from "@/server/actions/billing";

interface InvoiceRow {
  id: string;
  invoiceNumber: string;
  date: Date;
  dueDate: Date | null;
  status: string;
  subtotal: number;
  taxAmount: number;
  discount: number;
  totalAmount: number;
  patient: { id: string; firstName: string; lastName: string; phone: string };
  items: { description: string; quantity: number; unitPrice: number; total: number }[];
  payments: { id: string; amount: number; method: string; paidAt: Date }[];
}

export function InvoiceList() {
  const [invoices, setInvoices] = useState<InvoiceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 20, total: 0, totalPages: 0 });

  const loadInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getInvoices({ search, page, pageSize: 20 });
      setInvoices(result.data as unknown as InvoiceRow[]);
      setPagination(result.pagination);
    } catch (err) {
      console.error("Failed to load invoices:", err);
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => {
    loadInvoices();
  }, [loadInvoices]);

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this invoice? This cannot be undone.")) return;
    try {
      await deleteInvoice(id);
      loadInvoices();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete");
    }
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);

  const columns: Column<InvoiceRow>[] = [
    {
      id: "invoiceNumber",
      header: "Invoice #",
      accessorFn: (row) => (
        <Link href={`/billing/invoices/${row.id}`} className="text-sm font-medium hover:underline">
          {row.invoiceNumber}
        </Link>
      ),
      sortable: true,
    },
    {
      id: "patient",
      header: "Patient",
      accessorFn: (row) => (
        <div>
          <p className="text-sm font-medium">{row.patient.firstName} {row.patient.lastName}</p>
          <p className="text-xs text-muted-foreground">{row.patient.phone}</p>
        </div>
      ),
    },
    {
      id: "date",
      header: "Date",
      accessorFn: (row) => (
        <span className="text-sm">{new Date(row.date).toLocaleDateString()}</span>
      ),
      sortable: true,
    },
    {
      id: "dueDate",
      header: "Due Date",
      accessorFn: (row) => (
        <span className="text-sm">
          {row.dueDate ? new Date(row.dueDate).toLocaleDateString() : "\u2014"}
        </span>
      ),
    },
    {
      id: "items",
      header: "Items",
      accessorFn: (row) => (
        <span className="text-sm">{row.items.length} {row.items.length === 1 ? "item" : "items"}</span>
      ),
    },
    {
      id: "totalAmount",
      header: "Total",
      accessorFn: (row) => (
        <span className="text-sm font-semibold">{formatCurrency(Number(row.totalAmount))}</span>
      ),
      sortable: true,
    },
    {
      id: "paid",
      header: "Paid",
      accessorFn: (row) => {
        const paid = row.payments.reduce((sum, p) => sum + Number(p.amount), 0);
        return (
          <span className={`text-sm ${paid >= Number(row.totalAmount) ? "text-green-600" : "text-muted-foreground"}`}>
            {formatCurrency(paid)}
          </span>
        );
      },
    },
    {
      id: "status",
      header: "Status",
      accessorFn: (row) => (
        <Badge variant="secondary" className={`text-xs ${PAYMENT_STATUS_COLORS[row.status] ?? ""}`}>
          {row.status}
        </Badge>
      ),
    },
  ];

  const actions = (row: InvoiceRow) => (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem render={<Link href={`/billing/invoices/${row.id}`} />}>
          <Eye className="h-4 w-4" /> View
        </DropdownMenuItem>
        <DropdownMenuItem render={<Link href={`/billing/invoices/${row.id}/edit`} />}>
          <Pencil className="h-4 w-4" /> Edit
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleDelete(row.id)}
          variant="destructive"
        >
          <Trash2 className="h-4 w-4" /> Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <DataTable
      columns={columns as unknown as Column<Record<string, unknown>>[]}
      data={invoices as unknown as Record<string, unknown>[]}
      searchPlaceholder="Search invoices..."
      onSearch={handleSearch}
      pagination={pagination}
      onPageChange={setPage}
      actions={(row) => actions(row as unknown as InvoiceRow)}
      loading={loading}
      emptyTitle="No invoices"
      emptyDescription="Create your first invoice to get started."
      getRowId={(row) => (row as Record<string, unknown>).id as string}
    />
  );
}
