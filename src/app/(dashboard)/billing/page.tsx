"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  DollarSign,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import { getBillingStats, getInvoices } from "@/server/actions/billing";
import { PAYMENT_STATUS_COLORS } from "@/lib/constants";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};
const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

interface RecentInvoice {
  id: string;
  invoiceNumber: string;
  totalAmount: number;
  status: string;
  date: string;
  patient: { firstName: string; lastName: string };
  payments: { amount: number }[];
}

export default function BillingPage() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    pendingAmount: 0,
    paidThisMonth: 0,
    overdueAmount: 0,
  });
  const [invoices, setInvoices] = useState<RecentInvoice[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [statsData, invoiceData] = await Promise.all([
        getBillingStats(),
        getInvoices({ pageSize: 5 }),
      ]);
      setStats(statsData);
      setInvoices(invoiceData.data as unknown as RecentInvoice[]);
    } catch (err) {
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);

  const statCards = [
    {
      label: "Total Revenue",
      value: formatCurrency(stats.totalRevenue),
      icon: DollarSign,
      color: "bg-green-100 text-green-600",
    },
    {
      label: "Pending",
      value: formatCurrency(stats.pendingAmount),
      icon: Clock,
      color: "bg-amber-100 text-amber-600",
    },
    {
      label: "Paid This Month",
      value: formatCurrency(stats.paidThisMonth),
      icon: CheckCircle,
      color: "bg-blue-100 text-blue-600",
    },
    {
      label: "Overdue",
      value: formatCurrency(stats.overdueAmount),
      icon: AlertCircle,
      color: "bg-red-100 text-red-600",
    },
  ];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item}>
        <PageHeader
          title="Billing"
          description="Invoices, payments, and financial overview."
          actions={
            <div className="flex gap-2">
              <Link
                href="/billing/invoices"
                className={buttonVariants({ variant: "outline" }) + " gap-1.5"}
              >
                <FileText className="h-4 w-4" />
                All Invoices
              </Link>
              <Link
                href="/billing/invoices"
                className={buttonVariants({ variant: "default" }) + " gap-1.5"}
              >
                <Plus className="h-4 w-4" />
                New Invoice
              </Link>
            </div>
          }
        />
      </motion.div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <motion.div key={stat.label} variants={item}>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.color}`}>
                    <stat.icon className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <motion.div variants={item}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Recent Invoices</CardTitle>
            <Link
              href="/billing/invoices"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              View All
            </Link>
          </CardHeader>
          <CardContent>
            {invoices.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                {loading ? "Loading..." : "No invoices yet. Create your first invoice."}
              </p>
            ) : (
              <div className="space-y-2">
                {invoices.map((inv) => {
                  const paid = inv.payments.reduce((sum, p) => sum + Number(p.amount), 0);
                  return (
                    <Link
                      key={inv.id}
                      href={`/billing/invoices/${inv.id}`}
                      className="flex items-center gap-4 rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{inv.invoiceNumber}</p>
                        <p className="text-xs text-muted-foreground">
                          {inv.patient.firstName} {inv.patient.lastName} ·{" "}
                          {new Date(inv.date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold">{formatCurrency(Number(inv.totalAmount))}</p>
                        {paid > 0 && paid < Number(inv.totalAmount) && (
                          <p className="text-xs text-muted-foreground">Paid: {formatCurrency(paid)}</p>
                        )}
                      </div>
                      <Badge variant="secondary" className={`text-xs ${PAYMENT_STATUS_COLORS[inv.status] ?? ""}`}>
                        {inv.status}
                      </Badge>
                    </Link>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
