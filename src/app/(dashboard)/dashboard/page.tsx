"use client";

import { motion } from "framer-motion";
import {
  DollarSign,
  Calendar,
  Users,
  UserCheck,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  Star,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/layout/page-header";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

const stats = [
  {
    title: "Revenue",
    value: "$45,231",
    change: "+20.1%",
    trend: "up" as const,
    icon: DollarSign,
  },
  {
    title: "Appointments",
    value: "124",
    change: "+12.5%",
    trend: "up" as const,
    icon: Calendar,
  },
  {
    title: "New Patients",
    value: "38",
    change: "+8.2%",
    trend: "up" as const,
    icon: Users,
  },
  {
    title: "Returning Patients",
    value: "86",
    change: "-2.1%",
    trend: "down" as const,
    icon: UserCheck,
  },
];

const revenueData = [
  { month: "Jan", revenue: 18500, appointments: 95 },
  { month: "Feb", revenue: 22100, appointments: 108 },
  { month: "Mar", revenue: 25800, appointments: 120 },
  { month: "Apr", revenue: 23400, appointments: 112 },
  { month: "May", revenue: 28900, appointments: 135 },
  { month: "Jun", revenue: 32100, appointments: 148 },
  { month: "Jul", revenue: 35200, appointments: 156 },
  { month: "Aug", revenue: 31800, appointments: 142 },
  { month: "Sep", revenue: 38400, appointments: 168 },
  { month: "Oct", revenue: 42100, appointments: 178 },
  { month: "Nov", revenue: 39800, appointments: 165 },
  { month: "Dec", revenue: 45231, appointments: 186 },
];

const appointmentsByType = [
  { type: "Checkup", count: 45 },
  { type: "Cleaning", count: 38 },
  { type: "Filling", count: 22 },
  { type: "Crown", count: 15 },
  { type: "Root Canal", count: 8 },
  { type: "Whitening", count: 12 },
];

const todayAppointments = [
  { time: "09:00", patient: "Sarah Johnson", type: "Checkup", status: "Completed", doctor: "Dr. Smith" },
  { time: "09:30", patient: "Mike Chen", type: "Cleaning", status: "In Progress", doctor: "Dr. Wilson" },
  { time: "10:00", patient: "Emma Davis", type: "Filling", status: "Confirmed", doctor: "Dr. Smith" },
  { time: "10:30", patient: "James Wilson", type: "Crown", status: "Confirmed", doctor: "Dr. Lee" },
  { time: "11:00", patient: "Lisa Brown", type: "Root Canal", status: "Booked", doctor: "Dr. Smith" },
  { time: "11:30", patient: "Tom Anderson", type: "Whitening", status: "Booked", doctor: "Dr. Wilson" },
];

const recentReviews = [
  { name: "Sarah J.", rating: 5, comment: "Excellent service and very professional staff!" },
  { name: "Mike C.", rating: 5, comment: "Best dental experience I've ever had." },
  { name: "Emma D.", rating: 4, comment: "Great clinic, modern equipment." },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

const statusColors: Record<string, string> = {
  Completed: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
  "In Progress": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  Confirmed: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  Booked: "bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-400",
};

export default function DashboardPage() {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <motion.div variants={item}>
        <PageHeader
          title="Dashboard"
          description="Welcome back. Here's an overview of your practice."
        />
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <motion.div key={stat.title} variants={item}>
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold tracking-tight">
                      {stat.value}
                    </p>
                    <div className="flex items-center gap-1">
                      {stat.trend === "up" ? (
                        <TrendingUp className="h-3 w-3 text-emerald-500" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-red-500" />
                      )}
                      <span
                        className={`text-xs font-medium ${
                          stat.trend === "up"
                            ? "text-emerald-500"
                            : "text-red-500"
                        }`}
                      >
                        {stat.change}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        vs last month
                      </span>
                    </div>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <stat.icon className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Revenue Chart */}
        <motion.div variants={item} className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Revenue Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="revenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.1} />
                        <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--color-card)",
                        border: "1px solid var(--color-border)",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      formatter={(value: any) => [`$${Number(value ?? 0).toLocaleString()}`, "Revenue"]}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="var(--color-primary)"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#revenue)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Appointments by Type */}
        <motion.div variants={item}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-base">By Treatment Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={appointmentsByType} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} />
                    <YAxis
                      type="category"
                      dataKey="type"
                      tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }}
                      axisLine={false}
                      tickLine={false}
                      width={80}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--color-card)",
                        border: "1px solid var(--color-border)",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                    />
                    <Bar dataKey="count" fill="var(--color-primary)" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Today's Appointments */}
        <motion.div variants={item}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Today&apos;s Appointments</CardTitle>
              <Badge variant="secondary">{todayAppointments.length}</Badge>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {todayAppointments.map((apt, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                  >
                    <div className="text-center min-w-[48px]">
                      <p className="text-sm font-medium">{apt.time}</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{apt.patient}</p>
                      <p className="text-xs text-muted-foreground">
                        {apt.type} · {apt.doctor}
                      </p>
                    </div>
                    <Badge
                      variant="secondary"
                      className={`text-xs ${statusColors[apt.status] ?? ""}`}
                    >
                      {apt.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Reviews */}
        <motion.div variants={item}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Recent Reviews</CardTitle>
              <Badge variant="secondary">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                4.8
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentReviews.map((review, i) => (
                  <div key={i} className="rounded-lg border p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{review.name}</span>
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, j) => (
                          <Star
                            key={j}
                            className={`h-3 w-3 ${
                              j < review.rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-muted-foreground/30"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {review.comment}
                    </p>
                  </div>
                ))}
                <button className="flex items-center gap-1 text-xs text-primary hover:underline">
                  View all reviews
                  <ArrowUpRight className="h-3 w-3" />
                </button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
