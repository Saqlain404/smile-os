"use client";

import { motion } from "framer-motion";
import {
  CreditCard,
  DollarSign,
  FileText,
  Receipt,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};
const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

const stats = [
  { label: "Total Revenue", value: "$45,231", icon: DollarSign, color: "bg-green-100 text-green-600", change: "+12%" },
  { label: "Pending Payments", value: "$3,450", icon: Clock, color: "bg-amber-100 text-amber-600", change: "" },
  { label: "Paid This Month", value: "$38,200", icon: CheckCircle, color: "bg-blue-100 text-blue-600", change: "+8%" },
  { label: "Overdue", value: "$1,200", icon: AlertCircle, color: "bg-red-100 text-red-600", change: "" },
];

const recentInvoices = [
  { number: "INV-01001", patient: "Sarah Johnson", amount: "$450", status: "PAID", date: "Jan 15" },
  { number: "INV-01002", patient: "Mike Chen", amount: "$280", status: "PENDING", date: "Jan 14" },
  { number: "INV-01003", patient: "Emma Davis", amount: "$1,200", status: "PAID", date: "Jan 13" },
  { number: "INV-01004", patient: "James Wilson", amount: "$150", status: "PARTIAL", date: "Jan 12" },
  { number: "INV-01005", patient: "Lisa Brown", amount: "$900", status: "PENDING", date: "Jan 11" },
];

const statusColors: Record<string, string> = {
  PAID: "bg-green-100 text-green-800",
  PENDING: "bg-amber-100 text-amber-800",
  PARTIAL: "bg-blue-100 text-blue-800",
  REFUNDED: "bg-gray-100 text-gray-800",
};

export default function BillingPage() {
  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item}>
        <PageHeader
          title="Billing"
          description="Invoices, payments, and financial overview."
          actions={
            <div className="flex gap-2">
              <Button variant="outline" className="gap-1.5">
                <FileText className="h-4 w-4" />
                Packages
              </Button>
              <Button className="gap-1.5">
                <CreditCard className="h-4 w-4" />
                New Invoice
              </Button>
            </div>
          }
        />
      </motion.div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <motion.div key={stat.label} variants={item}>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    {stat.change && (
                      <p className="text-xs text-green-600 mt-0.5">{stat.change} vs last month</p>
                    )}
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
            <Button variant="ghost" size="sm">View All</Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentInvoices.map((inv) => (
                <div key={inv.number} className="flex items-center gap-4 rounded-lg border p-3 hover:bg-muted/50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{inv.number}</p>
                    <p className="text-xs text-muted-foreground">{inv.patient} · {inv.date}</p>
                  </div>
                  <p className="text-sm font-semibold">{inv.amount}</p>
                  <Badge variant="secondary" className={`text-xs ${statusColors[inv.status] ?? ""}`}>
                    {inv.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
