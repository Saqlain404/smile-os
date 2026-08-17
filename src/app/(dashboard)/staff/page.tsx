"use client";

import { motion } from "framer-motion";
import { UserCog, Shield, Calendar, Clock, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { PageHeader } from "@/components/layout/page-header";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};
const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

const staffMembers = [
  { name: "Dr. Sarah Smith", role: "Dentist", department: "General", status: "Active", appointments: 8 },
  { name: "Dr. James Wilson", role: "Dentist", department: "Orthodontics", status: "Active", appointments: 6 },
  { name: "Dr. Emily Lee", role: "Dentist", department: "Oral Surgery", status: "Active", appointments: 5 },
  { name: "Anna Reception", role: "Receptionist", department: "Front Desk", status: "Active", appointments: 0 },
];

const roleColors: Record<string, string> = {
  Dentist: "bg-blue-100 text-blue-800",
  Receptionist: "bg-green-100 text-green-800",
  Assistant: "bg-purple-100 text-purple-800",
};

export default function StaffPage() {
  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item}>
        <PageHeader
          title="Staff"
          description="Manage your team, schedules, and permissions."
          actions={
            <Button className="gap-1.5">
              <UserCog className="h-4 w-4" />
              Add Staff
            </Button>
          }
        />
      </motion.div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Staff", value: "12", icon: Users, color: "bg-blue-100 text-blue-600" },
          { label: "Dentists", value: "4", icon: UserCog, color: "bg-purple-100 text-purple-600" },
          { label: "On Duty Today", value: "8", icon: Clock, color: "bg-green-100 text-green-600" },
          { label: "On Leave", value: "1", icon: Calendar, color: "bg-amber-100 text-amber-600" },
        ].map((stat) => (
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

      <motion.div variants={item}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Team Members</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Shield className="h-3.5 w-3.5 mr-1.5" />
                Permissions
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {staffMembers.map((s) => (
                <div key={s.name} className="flex items-center gap-4 rounded-lg border p-3 hover:bg-muted/50 transition-colors">
                  <Avatar className="h-10 w-10">
                    <div className="flex h-full w-full items-center justify-center bg-primary/10 text-primary text-sm font-medium">
                      {s.name.charAt(0)}
                    </div>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{s.name}</p>
                    <p className="text-xs text-muted-foreground">{s.department}</p>
                  </div>
                  <Badge variant="secondary" className={`text-xs ${roleColors[s.role] ?? ""}`}>
                    {s.role}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {s.appointments > 0 ? `${s.appointments} appts today` : "—"}
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
