"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { CreditCard, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { getPatientInvoices } from "@/server/actions/patient-portal";
import { PAYMENT_STATUS_COLORS } from "@/lib/constants";
import { useSession } from "@/lib/auth-client";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};
const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

export default function PatientInvoicesPage() {
  const { data: session } = useSession();
  const userId = session?.user?.id ?? "";

  const [invoices, setInvoices] = useState<Array<Record<string, unknown>>>([]);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10, total: 0, totalPages: 0 });
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchData = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const data = await getPatientInvoices(userId, {
        status: statusFilter === "all" ? undefined : statusFilter,
        page,
        pageSize: 10,
      });
      setInvoices(data.data as Array<Record<string, unknown>>);
      setPagination(data.pagination);
    } catch {
      // empty
    } finally {
      setLoading(false);
    }
  }, [userId, statusFilter]);

  useEffect(() => {
    if (!userId) return;
    fetchData(1);
  }, [userId, fetchData]);

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <motion.div variants={item}>
        <PageHeader
          title="Invoices & Payments"
          description="View your invoices and payment history."
        />
      </motion.div>

      <motion.div variants={item}>
        <div className="flex items-center gap-3 mb-4">
          <Select
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v ?? "all")}
          >
            <SelectTrigger className="h-9 w-[160px]">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="PARTIAL">Partial</SelectItem>
              <SelectItem value="PAID">Paid</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <Card>
            <CardContent className="flex items-center justify-center py-16">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </CardContent>
          </Card>
        ) : invoices.length === 0 ? (
          <Card>
            <CardContent>
              <EmptyState
                title="No invoices found"
                description="You don't have any invoices matching this filter."
              />
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {invoices.map((inv) => {
              const isExpanded = expandedId === (inv.id as string);
              const items = inv.items as Array<Record<string, unknown>> | undefined;
              const payments = inv.payments as Array<Record<string, unknown>> | undefined;

              return (
                <motion.div key={inv.id as string} variants={item}>
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-0">
                      <button
                        className="w-full p-4 text-left"
                        onClick={() =>
                          setExpandedId(isExpanded ? null : (inv.id as string))
                        }
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted shrink-0">
                            <CreditCard className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-sm font-semibold">{inv.invoiceNumber as string}</p>
                              <Badge
                                variant="secondary"
                                className={`text-[10px] ${PAYMENT_STATUS_COLORS[inv.status as string] ?? ""}`}
                              >
                                {inv.status as string}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {new Date(inv.createdAt as string).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                              {items && items.length > 0 && (
                                <> · {items.length} item{items.length > 1 ? "s" : ""}</>
                              )}
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-sm font-bold">
                              ${(inv.totalAmount as number).toFixed(2)}
                            </p>
                            {(inv.paidAmount as number) > 0 && (
                              <p className="text-xs text-green-600">
                                ${(inv.paidAmount as number).toFixed(2)} paid
                              </p>
                            )}
                          </div>
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="border-t px-4 pb-4 space-y-4">
                          {/* Line Items */}
                          {items && items.length > 0 && (
                            <div>
                              <p className="text-xs font-medium text-muted-foreground mb-2 mt-3">
                                Line Items
                              </p>
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead className="text-xs">Description</TableHead>
                                    <TableHead className="text-xs text-right">Qty</TableHead>
                                    <TableHead className="text-xs text-right">Price</TableHead>
                                    <TableHead className="text-xs text-right">Total</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {items.map((lineItem, idx) => (
                                    <TableRow key={idx}>
                                      <TableCell className="text-xs">{lineItem.description as string}</TableCell>
                                      <TableCell className="text-xs text-right">{lineItem.quantity as number}</TableCell>
                                      <TableCell className="text-xs text-right">
                                        ${(lineItem.unitPrice as number).toFixed(2)}
                                      </TableCell>
                                      <TableCell className="text-xs text-right font-medium">
                                        ${(lineItem.total as number).toFixed(2)}
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                              <div className="flex justify-end gap-6 text-xs mt-2">
                                <span>Subtotal: ${((inv.totalAmount as number) - (inv.taxAmount as number) + (inv.discountAmount as number)).toFixed(2)}</span>
                                {((inv.discountAmount as number) ?? 0) > 0 && (
                                  <span className="text-green-600">Discount: -${(inv.discountAmount as number).toFixed(2)}</span>
                                )}
                                <span>Tax: ${(inv.taxAmount as number).toFixed(2)}</span>
                                <span className="font-bold">Total: ${(inv.totalAmount as number).toFixed(2)}</span>
                              </div>
                            </div>
                          )}

                          {/* Payment History */}
                          {payments && payments.length > 0 && (
                            <div>
                              <p className="text-xs font-medium text-muted-foreground mb-2">
                                Payment History
                              </p>
                              <div className="space-y-2">
                                {payments.map((payment, idx) => (
                                  <div
                                    key={idx}
                                    className="flex items-center gap-3 rounded-lg bg-muted/50 p-2"
                                  >
                                    <CheckCircle className="h-4 w-4 text-green-600 shrink-0" />
                                    <div className="flex-1">
                                      <p className="text-xs font-medium">
                                        ${(payment.amount as number).toFixed(2)} via {(payment.method as string)?.replace("_", " ")}
                                      </p>
                                      <p className="text-[11px] text-muted-foreground">
                                        {new Date(payment.paymentDate as string).toLocaleDateString()} · {payment.reference as string}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              Showing {(pagination.page - 1) * pagination.pageSize + 1}–
              {Math.min(pagination.page * pagination.pageSize, pagination.total)} of{" "}
              {pagination.total}
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page <= 1}
                onClick={() => fetchData(pagination.page - 1)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => fetchData(pagination.page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
