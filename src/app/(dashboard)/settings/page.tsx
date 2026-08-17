"use client";

import { motion } from "framer-motion";
import {
  Building2,
  Clock,
  Palette,
  Mail,
  MessageSquare,
  Smartphone,
  Users,
  DollarSign,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/layout/page-header";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};
const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

const settingGroups = [
  {
    title: "Clinic",
    items: [
      { label: "Clinic Profile", description: "Name, address, contact info", icon: Building2 },
      { label: "Opening Hours", description: "Working days and hours", icon: Clock },
      { label: "Departments", description: "Manage departments", icon: Users },
    ],
  },
  {
    title: "Practice",
    items: [
      { label: "Treatments & Pricing", description: "Services and pricing", icon: DollarSign },
      { label: "Tax Settings", description: "Tax rates and rules", icon: DollarSign },
      { label: "Staff & Permissions", description: "Roles and access control", icon: Users },
    ],
  },
  {
    title: "Communications",
    items: [
      { label: "Email Templates", description: "Appointment, follow-up, review", icon: Mail },
      { label: "SMS Templates", description: "Text message templates", icon: MessageSquare },
      { label: "WhatsApp Templates", description: "WhatsApp message templates", icon: Smartphone },
    ],
  },
  {
    title: "Branding",
    items: [
      { label: "Brand Settings", description: "Logo, colors, theme", icon: Palette },
    ],
  },
];

export default function SettingsPage() {
  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item}>
        <PageHeader
          title="Settings"
          description="Configure your clinic and application preferences."
        />
      </motion.div>

      {settingGroups.map((group) => (
        <motion.div key={group.title} variants={item}>
          <h3 className="text-sm font-medium text-muted-foreground mb-3">{group.title}</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {group.items.map((setting) => (
              <Card key={setting.label} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
                      <setting.icon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{setting.label}</p>
                      <p className="text-xs text-muted-foreground">{setting.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
