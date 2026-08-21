"use client";

import { motion } from "framer-motion";
import {
  Calendar,
  Users,
  Sparkles,
  CreditCard,
  BarChart3,
  Bell,
  Smartphone,
  UserCog,
} from "lucide-react";
import { ScrollReveal } from "./scroll-reveal";

const tiles = [
  {
    title: "Appointments",
    icon: Calendar,
    span: "md:col-span-2",
    height: "h-44",
    visual: (
      <div className="grid grid-cols-3 gap-1.5 mt-3">
        {[
          { label: "9:00", color: "bg-blue-600/40" },
          { label: "10:30", color: "bg-emerald-600/40" },
          { label: "11:00", color: "bg-violet-600/40" },
          { label: "13:00", color: "bg-amber-600/40" },
          { label: "14:30", color: "bg-blue-600/40" },
          { label: "16:00", color: "bg-rose-600/40" },
        ].map((a) => (
          <div key={a.label} className={`${a.color} rounded-md p-2 text-[10px] text-white`}>
            {a.label}
          </div>
        ))}
      </div>
    ),
  },
  {
    title: "Patient CRM",
    icon: Users,
    span: "md:row-span-2",
    height: "h-full min-h-[22rem]",
    visual: (
      <div className="space-y-3 mt-3">
        {["Sarah Johnson", "Michael Chen", "Emily Rodriguez", "David Kim", "Lisa Wang"].map(
          (name, i) => (
            <div key={name} className="flex items-center gap-2 rounded-lg bg-muted/50 p-2">
              <div className="h-7 w-7 rounded-full bg-primary/20 text-primary text-[10px] flex items-center justify-center font-medium">
                {name.split(" ").map((n) => n[0]).join("")}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-medium truncate">{name}</p>
                <p className="text-[9px] text-muted-foreground">Last visit: {3 + i} days ago</p>
              </div>
            </div>
          )
        )}
      </div>
    ),
  },
  {
    title: "AI Assistant",
    icon: Sparkles,
    span: "md:col-span-2",
    height: "h-44",
    visual: (
      <div className="space-y-2 mt-3">
        <div className="flex gap-2">
          <div className="bg-primary/10 text-primary rounded-lg rounded-bl-sm px-3 py-1.5 text-[10px] max-w-[80%]">
            What treatment do you recommend for patient #2847?
          </div>
        </div>
        <div className="flex gap-2 justify-end">
          <div className="bg-muted rounded-lg rounded-br-sm px-3 py-1.5 text-[10px] max-w-[80%]">
            Based on the X-ray, I recommend a porcelain crown for tooth #14. Estimated cost: $1,200
          </div>
        </div>
      </div>
    ),
  },
  {
    title: "Billing",
    icon: CreditCard,
    span: "",
    height: "h-40",
    visual: (
      <div className="mt-3 rounded-lg bg-muted/50 p-3">
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold text-primary">$2,450</span>
          <span className="text-[10px] text-muted-foreground">this month</span>
        </div>
        <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
          <div className="h-full w-3/4 rounded-full bg-primary" />
        </div>
      </div>
    ),
  },
  {
    title: "Analytics",
    icon: BarChart3,
    span: "",
    height: "h-40",
    visual: (
      <div className="flex items-end gap-1 mt-3 h-16">
        {[30, 45, 35, 60, 50, 75, 65, 85, 70, 90].map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-t bg-gradient-to-t from-primary/40 to-primary/20"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
    ),
  },
  {
    title: "Staff",
    icon: UserCog,
    span: "",
    height: "h-40",
    visual: (
      <div className="flex -space-x-2 mt-3">
        {["DS", "JW", "EL", "AR", "MK"].map((initials, i) => (
          <div
            key={initials}
            className="h-10 w-10 rounded-full border-2 border-background bg-primary/20 text-primary text-xs flex items-center justify-center font-medium"
            style={{ zIndex: 5 - i }}
          >
            {initials}
          </div>
        ))}
        <div className="h-10 w-10 rounded-full border-2 border-background bg-muted text-muted-foreground text-[10px] flex items-center justify-center">
          +12
        </div>
      </div>
    ),
  },
  {
    title: "Notifications",
    icon: Bell,
    span: "",
    height: "h-40",
    visual: (
      <div className="mt-3 space-y-2">
        <div className="flex items-center gap-2 rounded-lg bg-primary/10 p-2">
          <Bell className="h-3 w-3 text-primary" />
          <span className="text-[10px] text-primary">12 unread</span>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-2">
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          <span className="text-[10px] text-muted-foreground">Appointment confirmed</span>
        </div>
      </div>
    ),
  },
  {
    title: "Patient Portal",
    icon: Smartphone,
    span: "",
    height: "h-40",
    visual: (
      <div className="mt-3 flex justify-center">
        <div className="w-24 h-32 rounded-xl border border-border bg-card p-2 space-y-1.5">
          <div className="h-2 w-12 rounded bg-primary/20 mx-auto" />
          <div className="h-1.5 w-full rounded bg-muted" />
          <div className="h-1.5 w-3/4 rounded bg-muted" />
          <div className="h-1.5 w-full rounded bg-muted" />
          <div className="mt-2 h-5 w-full rounded bg-primary/10 flex items-center justify-center text-[8px] text-primary">
            View Records
          </div>
        </div>
      </div>
    ),
  },
];

export function BentoGrid() {
  return (
    <section className="py-24 sm:py-32 ">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <ScrollReveal>
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Everything your clinic needs
            </h2>
            <p className="mt-3 text-muted-foreground">
              A complete platform designed for modern dental practices.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {tiles.map((tile, i) => (
            <motion.div
              key={tile.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
              className={`group rounded-2xl border bg-card p-6 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 ${tile.span} ${tile.height}`}
            >
              <div className="flex items-center gap-2.5 mb-1">
                <tile.icon className="h-4 w-4 text-primary" />
                <h3 className="font-semibold text-sm">{tile.title}</h3>
              </div>
              {tile.visual}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
