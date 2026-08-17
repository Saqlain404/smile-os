"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Printer, CreditCard, Pencil, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/layout/page-header";
import { PaymentFormDialog } from "@/components/billing/payment-form-dialog";
import { PAYMENT_STATUS_COLORS } from "@/lib/constants";
import { getInvoice, deleteInvoice } from "@/server/actions/billing";
import { InvoiceFormDialog } from "@/components/billing/invoice-form-dialog";

interface InvoiceData {
  id: string;
  invoiceNumber: string;
  date: string;
  dueDate: string | null;
  status: string;
  subtotal: number;
  taxAmount: number;
  discount: number;
  totalAmount: number;
  notes: string | null;
  patient: { id: string; firstName: string; lastName: string; phone: string; email: string | null; address: string | null };
  items: { id: string; description: string; quantity: number; unitPrice: number; total: number }[];
  payments: { id: string; amount: number; method: string; reference: string | null; notes: string | null; paidAt: string; status: string }[];
}

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  CASH: "Cash",
  CARD: "Card",
  ONLINE: "Online",
  INSURANCE: "Insurance",
  BANK_TRANSFER: "Bank Transfer",
};

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const loadInvoice = useCallback(async () => {
    try {
      const data = await getInvoice(id);
      setInvoice(data as unknown as InvoiceData);
    } catch (err) {
      console.error("Failed to load invoice:", err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadInvoice();
  }, [loadInvoice]);

  const handleDelete = async () => {
    if (!confirm("Delete this invoice? This cannot be undone.")) return;
    try {
      await deleteInvoice(id);
      router.push("/billing/invoices");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete");
    }
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Invoice not found.</p>
        <Button variant="link" className="mt-2">
          <Link href="/billing/invoices">Back to invoices</Link>
        </Button>
      </div>
    );
  }

  const totalPaid = invoice.payments.reduce((sum, p) => sum + Number(p.amount), 0);
  const remaining = Number(invoice.totalAmount) - totalPaid;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm">
            <Link href="/billing/invoices" className="flex items-center gap-1.5">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{invoice.invoiceNumber}</h1>
            <p className="text-sm text-muted-foreground">
              Created {new Date(invoice.date).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className={`text-xs ${PAYMENT_STATUS_COLORS[invoice.status] ?? ""}`}>
            {invoice.status}
          </Badge>
          {remaining > 0 && (
            <Button onClick={() => setPaymentOpen(true)} className="gap-1.5">
              <CreditCard className="h-4 w-4" />
              Record Payment
            </Button>
          )}
          <Button variant="outline" onClick={() => setEditOpen(true)} className="gap-1.5">
            <Pencil className="h-4 w-4" />
            Edit
          </Button>
          <Button variant="outline" onClick={handleDelete} className="gap-1.5 text-destructive">
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Invoice Items */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Line Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="pb-2 font-medium">Description</th>
                      <th className="pb-2 font-medium text-right">Qty</th>
                      <th className="pb-2 font-medium text-right">Unit Price</th>
                      <th className="pb-2 font-medium text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.items.map((item) => (
                      <tr key={item.id} className="border-b last:border-0">
                        <td className="py-3">{item.description}</td>
                        <td className="py-3 text-right">{item.quantity}</td>
                        <td className="py-3 text-right">{formatCurrency(Number(item.unitPrice))}</td>
                        <td className="py-3 text-right font-medium">{formatCurrency(Number(item.total))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <Separator className="my-4" />

              <div className="flex justify-end space-y-1 w-64">
                <div className="w-full space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatCurrency(Number(invoice.subtotal))}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax</span>
                    <span>{formatCurrency(Number(invoice.taxAmount))}</span>
                  </div>
                  {Number(invoice.discount) > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount</span>
                      <span>-{formatCurrency(Number(invoice.discount))}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between text-base font-bold">
                    <span>Total</span>
                    <span>{formatCurrency(Number(invoice.totalAmount))}</span>
                  </div>
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Paid</span>
                    <span>{formatCurrency(totalPaid)}</span>
                  </div>
                  {remaining > 0 && (
                    <div className="flex justify-between text-sm font-medium text-amber-600">
                      <span>Balance Due</span>
                      <span>{formatCurrency(remaining)}</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment History */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Payment History</CardTitle>
            </CardHeader>
            <CardContent>
              {invoice.payments.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">No payments recorded yet.</p>
              ) : (
                <div className="space-y-2">
                  {invoice.payments.map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between rounded-lg border p-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-100 text-green-600">
                          <CreditCard className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{formatCurrency(Number(payment.amount))}</p>
                          <p className="text-xs text-muted-foreground">
                            {PAYMENT_METHOD_LABELS[payment.method] ?? payment.method}
                            {payment.reference && ` · ${payment.reference}`}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="secondary" className={`text-xs ${PAYMENT_STATUS_COLORS[payment.status] ?? ""}`}>
                          {payment.status}
                        </Badge>
                        <p className="text-[11px] text-muted-foreground mt-1">
                          {new Date(payment.paidAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Patient & Invoice Info */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Patient</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm font-medium">
                {invoice.patient.firstName} {invoice.patient.lastName}
              </p>
              <p className="text-sm text-muted-foreground">{invoice.patient.phone}</p>
              {invoice.patient.email && (
                <p className="text-sm text-muted-foreground">{invoice.patient.email}</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Invoice Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Invoice #</span>
                <span className="font-medium">{invoice.invoiceNumber}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Date</span>
                <span>{new Date(invoice.date).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Due Date</span>
                <span>{invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : "—"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Status</span>
                <Badge variant="secondary" className={`text-xs ${PAYMENT_STATUS_COLORS[invoice.status] ?? ""}`}>
                  {invoice.status}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {invoice.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{invoice.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <PaymentFormDialog
        open={paymentOpen}
        onOpenChange={setPaymentOpen}
        invoiceId={invoice.id}
        remainingBalance={remaining}
        onSuccess={() => {
          setPaymentOpen(false);
          loadInvoice();
        }}
      />

      <InvoiceFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        invoice={invoice as unknown as Record<string, unknown>}
        onSuccess={() => {
          setEditOpen(false);
          loadInvoice();
        }}
      />
    </div>
  );
}
