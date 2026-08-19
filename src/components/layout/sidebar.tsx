"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  Calendar,
  CalendarDays,
  BellRing,
  Stethoscope,
  CreditCard,
  UserCog,
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Sparkles,
  Brain,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession, signOut } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const iconMap = {
  LayoutDashboard,
  Users,
  Calendar,
  CalendarDays,
  BellRing,
  Stethoscope,
  CreditCard,
  UserCog,
  Bell,
  Settings,
  Sparkles,
  Brain,
} as const;

interface NavGroup {
  label: string;
  items: { label: string; href: string; icon: keyof typeof iconMap }[];
}

const navGroups: NavGroup[] = [
  {
    label: "",
    items: [{ label: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" }],
  },
  {
    label: "Management",
    items: [
      { label: "Patients", href: "/patients", icon: "Users" },
      { label: "Appointments", href: "/appointments", icon: "Calendar" },
      { label: "Calendar", href: "/calendar", icon: "CalendarDays" },
    ],
  },
  {
    label: "Operations",
    items: [
      { label: "Reception", href: "/reception", icon: "BellRing" },
      { label: "Dentist", href: "/dentist", icon: "Stethoscope" },
      { label: "Billing", href: "/billing", icon: "CreditCard" },
    ],
  },
  {
    label: "Intelligence",
    items: [{ label: "AI Assistant", href: "/ai", icon: "Sparkles" }],
  },
  {
    label: "Administration",
    items: [
      { label: "Staff", href: "/staff", icon: "UserCog" },
      { label: "Notifications", href: "/notifications", icon: "Bell" },
      { label: "Settings", href: "/settings", icon: "Settings" },
    ],
  },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <TooltipProvider delay={0}>
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 68 : 260 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className="relative flex h-screen flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground"
      >
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 px-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-sm">
            <Sparkles className="h-4 w-4" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="flex flex-col overflow-hidden"
              >
                <span className="text-sm font-semibold tracking-tight">
                  SmileOS
                </span>
                <span className="text-[10px] text-muted-foreground">
                  Dental Platform
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <Separator className="bg-sidebar-border" />

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
          {navGroups.map((group) => (
            <div key={group.label}>
              {group.label && !collapsed && (
                <p className="mb-2 px-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  {group.label}
                </p>
              )}
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = iconMap[item.icon];
                  const isActive =
                    pathname === item.href ||
                    pathname.startsWith(item.href + "/");

                  const linkContent = (
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150",
                        isActive
                          ? "bg-sidebar-accent text-sidebar-primary"
                          : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                      )}
                    >
                      <Icon
                        className={cn(
                          "h-4 w-4 shrink-0",
                          isActive ? "text-sidebar-primary" : ""
                        )}
                      />
                      <AnimatePresence>
                        {!collapsed && (
                          <motion.span
                            initial={{ opacity: 0, width: 0 }}
                            animate={{ opacity: 1, width: "auto" }}
                            exit={{ opacity: 0, width: 0 }}
                            className="overflow-hidden whitespace-nowrap"
                          >
                            {item.label}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </Link>
                  );

                  if (collapsed) {
                    return (
                      <Tooltip key={item.href}>
                        <TooltipTrigger>
                          {linkContent}
                        </TooltipTrigger>
                        <TooltipContent side="right">
                          {item.label}
                        </TooltipContent>
                      </Tooltip>
                    );
                  }

                  return <div key={item.href}>{linkContent}</div>;
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <Separator className="bg-sidebar-border" />
        <div className="p-3 space-y-2">
          {!collapsed && session?.user && (
            <div className="flex items-center gap-3 rounded-lg px-3 py-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-medium">
                {session.user.name?.charAt(0)?.toUpperCase() ?? "U"}
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-medium truncate">
                  {session.user.name ?? "User"}
                </span>
                <span className="text-[11px] text-muted-foreground truncate">
                  {session.user.email ?? ""}
                </span>
              </div>
            </div>
          )}

          <Tooltip>
            <TooltipTrigger
              className={cn(
                "w-full justify-start gap-3 text-muted-foreground hover:text-destructive",
                collapsed && "justify-center px-0"
              )}
              onClick={() => signOut()}
            >
              <LogOut className="h-4 w-4" />
              {!collapsed && <span>Sign Out</span>}
            </TooltipTrigger>
            {collapsed && (
              <TooltipContent side="right">Sign Out</TooltipContent>
            )}
          </Tooltip>
        </div>

        {/* Collapse Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 z-10 flex h-6 w-6 items-center justify-center rounded-full border bg-background text-muted-foreground shadow-sm hover:text-foreground transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="h-3 w-3" />
          ) : (
            <ChevronLeft className="h-3 w-3" />
          )}
        </button>
      </motion.aside>
    </TooltipProvider>
  );
}
