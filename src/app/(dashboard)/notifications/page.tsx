"use client";

import { motion } from "framer-motion";
import { Bell, Mail, MessageSquare, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/shared/empty-state";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};
const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

const notifications = [
  { type: "email", title: "Appointment Reminder Sent", description: "Reminder sent to Sarah Johnson for tomorrow's appointment", time: "5 min ago", read: false },
  { type: "review", title: "New Google Review", description: "Mike Chen left a 5-star review on Google", time: "1 hour ago", read: false },
  { type: "appointment", title: "Appointment Confirmed", description: "Emma Davis confirmed her appointment for Jan 20", time: "2 hours ago", read: true },
  { type: "sms", title: "SMS Delivery Successful", description: "Appointment reminder SMS delivered to James Wilson", time: "3 hours ago", read: true },
];

const typeIcons: Record<string, React.ElementType> = {
  email: Mail,
  review: Star,
  appointment: Bell,
  sms: MessageSquare,
};

export default function NotificationsPage() {
  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item}>
        <PageHeader
          title="Notifications"
          description="Manage notifications and communication templates."
          actions={
            <Button variant="outline" className="gap-1.5">
              <Mail className="h-4 w-4" />
              Templates
            </Button>
          }
        />
      </motion.div>

      <motion.div variants={item}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Recent Notifications</CardTitle>
            <Button variant="ghost" size="sm">Mark all read</Button>
          </CardHeader>
          <CardContent>
            {notifications.length === 0 ? (
              <EmptyState title="No notifications" description="You're all caught up!" />
            ) : (
              <div className="space-y-2">
                {notifications.map((n, i) => {
                  const Icon = typeIcons[n.type] ?? Bell;
                  return (
                    <div
                      key={i}
                      className={`flex items-start gap-3 rounded-lg border p-3 transition-colors ${
                        !n.read ? "bg-primary/5" : "hover:bg-muted/50"
                      }`}
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted shrink-0 mt-0.5">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium">{n.title}</p>
                          {!n.read && (
                            <div className="h-2 w-2 rounded-full bg-primary" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{n.description}</p>
                        <p className="text-[11px] text-muted-foreground mt-1">{n.time}</p>
                      </div>
                    </div>
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
