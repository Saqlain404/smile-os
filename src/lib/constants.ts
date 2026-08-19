export const APP_NAME = "SmileOS";
export const APP_DESCRIPTION =
  "The operating system for modern dental practices";

export const NAV_ITEMS = {
  main: [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: "LayoutDashboard",
    },
  ],
  management: [
    {
      label: "Patients",
      href: "/patients",
      icon: "Users",
    },
    {
      label: "Appointments",
      href: "/appointments",
      icon: "Calendar",
    },
    {
      label: "Calendar",
      href: "/calendar",
      icon: "CalendarDays",
    },
  ],
  operations: [
    {
      label: "Reception",
      href: "/reception",
      icon: "BellRing",
    },
    {
      label: "Dentist",
      href: "/dentist",
      icon: "Stethoscope",
    },
    {
      label: "Billing",
      href: "/billing",
      icon: "CreditCard",
    },
  ],
  intelligence: [
    {
      label: "AI Assistant",
      href: "/ai",
      icon: "Sparkles",
    },
  ],
  administration: [
    {
      label: "Staff",
      href: "/staff",
      icon: "UserCog",
    },
    {
      label: "Notifications",
      href: "/notifications",
      icon: "Bell",
    },
    {
      label: "Settings",
      href: "/settings",
      icon: "Settings",
    },
  ],
} as const;

export const APPOINTMENT_STATUS_COLORS: Record<string, string> = {
  BOOKED: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  CONFIRMED:
    "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  IN_PROGRESS:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  COMPLETED:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
  CANCELLED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  NO_SHOW:
    "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  RESCHEDULED:
    "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
};

export const PAYMENT_STATUS_COLORS: Record<string, string> = {
  PENDING:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  PAID: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  PARTIAL:
    "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  REFUNDED:
    "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  CANCELLED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

export const NOTIFICATION_TYPE_COLORS: Record<string, string> = {
  EMAIL: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  SMS: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  WHATSAPP: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
  PUSH: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  IN_APP: "bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-400",
};

export const NOTIFICATION_STATUS_COLORS: Record<string, string> = {
  UNREAD:
    "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  READ: "bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-400",
  ARCHIVED:
    "bg-muted text-muted-foreground",
};

export const TIME_SLOTS = Array.from({ length: 48 }, (_, i) => {
  const hours = Math.floor(i / 2);
  const minutes = i % 2 === 0 ? "00" : "30";
  return `${hours.toString().padStart(2, "0")}:${minutes}`;
});

export const DURATIONS = [15, 30, 45, 60, 90, 120];
