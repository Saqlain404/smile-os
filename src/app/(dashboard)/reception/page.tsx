"use client";

import { motion } from "framer-motion";
import {
  Users,
  Clock,
  UserCheck,
  CreditCard,
  BellRing,
  Search,
  CheckSquare,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/layout/page-header";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

const queuePatients = [
  { name: "Sarah Johnson", waitTime: "5 min", reason: "Checkup", status: "waiting" },
  { name: "Mike Chen", waitTime: "12 min", reason: "Filling", status: "waiting" },
  { name: "Emma Davis", waitTime: "0 min", reason: "Cleaning", status: "in-chair" },
];

const todayStats = [
  { label: "Today's Appointments", value: "18", icon: Clock, color: "bg-blue-100 text-blue-600" },
  { label: "Checked In", value: "12", icon: CheckSquare, color: "bg-green-100 text-green-600" },
  { label: "In Queue", value: "3", icon: Users, color: "bg-amber-100 text-amber-600" },
  { label: "Walk-ins", value: "2", icon: BellRing, color: "bg-purple-100 text-purple-600" },
];

export default function ReceptionPage() {
  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item}>
        <PageHeader
          title="Reception"
          description="Manage walk-ins, queue, and patient check-in/out."
          actions={
            <div className="flex gap-2">
              <Button className="gap-1.5">
                <BellRing className="h-4 w-4" />
                Quick Booking
              </Button>
            </div>
          }
        />
      </motion.div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {todayStats.map((stat) => (
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

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Waiting Queue */}
        <motion.div variants={item}>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Waiting Queue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {queuePatients.map((p, i) => (
                  <div key={i} className="flex items-center gap-4 rounded-lg border p-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-medium">
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.reason}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant={p.status === "in-chair" ? "default" : "secondary"}>
                        {p.status === "in-chair" ? "In Chair" : `${p.waitTime} wait`}
                      </Badge>
                    </div>
                    <Button size="sm" variant="outline">
                      <UserCheck className="h-3.5 w-3.5 mr-1" />
                      {p.status === "in-chair" ? "Check Out" : "Check In"}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={item}>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search patient by name or phone..." className="pl-9" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="h-16 flex-col gap-1">
                  <Users className="h-5 w-5" />
                  <span className="text-xs">Walk-in</span>
                </Button>
                <Button variant="outline" className="h-16 flex-col gap-1">
                  <CreditCard className="h-5 w-5" />
                  <span className="text-xs">New Invoice</span>
                </Button>
                <Button variant="outline" className="h-16 flex-col gap-1">
                  <BellRing className="h-5 w-5" />
                  <span className="text-xs">Quick Book</span>
                </Button>
                <Button variant="outline" className="h-16 flex-col gap-1">
                  <CheckSquare className="h-5 w-5" />
                  <span className="text-xs">Check In</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
