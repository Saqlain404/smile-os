"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Users,
  UserCog,
  Calendar,
  Clock,
  Plus,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import { StaffList } from "@/components/staff/staff-list";
import { StaffFormDialog } from "@/components/staff/staff-form-dialog";
import { getStaffStats } from "@/server/actions/staff";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};
const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

interface StaffStats {
  total: number;
  active: number;
  onLeave: number;
  inactiveCount: number;
  byRole: Record<string, number>;
  byDepartment: { id: string; name: string; color: string; count: number }[];
}

export default function StaffPage() {
  const [stats, setStats] = useState<StaffStats>({
    total: 0,
    active: 0,
    onLeave: 0,
    inactiveCount: 0,
    byRole: {},
    byDepartment: [],
  });
  const [formOpen, setFormOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const loadStats = useCallback(async () => {
    try {
      const data = await getStaffStats();
      setStats(data as StaffStats);
    } catch (err) {
      console.error("Failed to load stats:", err);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const statCards = [
    {
      label: "Total Staff",
      value: stats.total,
      icon: Users,
      color: "bg-blue-100 text-blue-600",
    },
    {
      label: "Active",
      value: stats.active,
      icon: UserCog,
      color: "bg-green-100 text-green-600",
    },
    {
      label: "Dentists",
      value: stats.byRole.DENTIST ?? 0,
      icon: UserCog,
      color: "bg-purple-100 text-purple-600",
    },
    {
      label: "On Leave",
      value: stats.onLeave,
      icon: Calendar,
      color: "bg-amber-100 text-amber-600",
    },
  ];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item}>
        <PageHeader
          title="Staff"
          description="Manage your team, schedules, and permissions."
          actions={
            <Button onClick={() => setFormOpen(true)} className="gap-1.5">
              <Plus className="h-4 w-4" />
              Add Staff
            </Button>
          }
        />
      </motion.div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <motion.div key={stat.label} variants={item}>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.color}`}>
                    <stat.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Department breakdown */}
      {stats.byDepartment.length > 0 && (
        <motion.div variants={item}>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm font-medium mb-3">Departments</p>
              <div className="flex flex-wrap gap-3">
                {stats.byDepartment.map((dept) => (
                  <div key={dept.id} className="flex items-center gap-2 rounded-lg border px-3 py-2">
                    <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: dept.color }} />
                    <span className="text-sm font-medium">{dept.name}</span>
                    <span className="text-xs text-muted-foreground">({dept.count})</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <motion.div variants={item}>
        <StaffList key={refreshKey} />
      </motion.div>

      <StaffFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        onSuccess={() => {
          setFormOpen(false);
          setRefreshKey((k) => k + 1);
          loadStats();
        }}
      />
    </motion.div>
  );
}
