import { describe, it, expect } from "vitest";
import {
  APP_NAME,
  APP_DESCRIPTION,
  NAV_ITEMS,
  APPOINTMENT_STATUS_COLORS,
  PAYMENT_STATUS_COLORS,
  NOTIFICATION_TYPE_COLORS,
  NOTIFICATION_STATUS_COLORS,
  TIME_SLOTS,
  DURATIONS,
} from "@/lib/constants";

describe("APP_NAME", () => {
  it("should be SmileOS", () => {
    expect(APP_NAME).toBe("SmileOS");
  });
});

describe("APP_DESCRIPTION", () => {
  it("should describe the app", () => {
    expect(APP_DESCRIPTION).toContain("dental");
  });
});

describe("NAV_ITEMS", () => {
  it("should have 6 navigation groups", () => {
    expect(Object.keys(NAV_ITEMS)).toHaveLength(5);
  });

  it("should have main group with Dashboard", () => {
    expect(NAV_ITEMS.main).toHaveLength(1);
    expect(NAV_ITEMS.main[0].label).toBe("Dashboard");
    expect(NAV_ITEMS.main[0].href).toBe("/dashboard");
  });

  it("should have management group with Patients, Appointments, Calendar", () => {
    expect(NAV_ITEMS.management).toHaveLength(3);
    expect(NAV_ITEMS.management[0].label).toBe("Patients");
    expect(NAV_ITEMS.management[1].label).toBe("Appointments");
    expect(NAV_ITEMS.management[2].label).toBe("Calendar");
  });

  it("should have intelligence group with AI Assistant", () => {
    expect(NAV_ITEMS.intelligence).toHaveLength(1);
    expect(NAV_ITEMS.intelligence[0].label).toBe("AI Assistant");
    expect(NAV_ITEMS.intelligence[0].href).toBe("/ai");
  });

  it("should have administration group with Staff, Notifications, Settings", () => {
    expect(NAV_ITEMS.administration).toHaveLength(3);
    expect(NAV_ITEMS.administration[0].label).toBe("Staff");
    expect(NAV_ITEMS.administration[1].label).toBe("Notifications");
    expect(NAV_ITEMS.administration[2].label).toBe("Settings");
  });

  it("all items should have label, href, and icon", () => {
    const allItems = Object.values(NAV_ITEMS).flat();
    for (const item of allItems) {
      expect(item.label).toBeDefined();
      expect(item.href).toBeDefined();
      expect(item.icon).toBeDefined();
      expect(item.href).toMatch(/^\//);
    }
  });
});

describe("APPOINTMENT_STATUS_COLORS", () => {
  it("should have colors for all 7 statuses", () => {
    expect(Object.keys(APPOINTMENT_STATUS_COLORS)).toHaveLength(7);
  });

  it("should have colors for BOOKED, CONFIRMED, IN_PROGRESS, COMPLETED, CANCELLED, NO_SHOW, RESCHEDULED", () => {
    expect(APPOINTMENT_STATUS_COLORS.BOOKED).toBeDefined();
    expect(APPOINTMENT_STATUS_COLORS.CONFIRMED).toBeDefined();
    expect(APPOINTMENT_STATUS_COLORS.IN_PROGRESS).toBeDefined();
    expect(APPOINTMENT_STATUS_COLORS.COMPLETED).toBeDefined();
    expect(APPOINTMENT_STATUS_COLORS.CANCELLED).toBeDefined();
    expect(APPOINTMENT_STATUS_COLORS.NO_SHOW).toBeDefined();
    expect(APPOINTMENT_STATUS_COLORS.RESCHEDULED).toBeDefined();
  });

  it("all colors should contain Tailwind classes", () => {
    for (const color of Object.values(APPOINTMENT_STATUS_COLORS)) {
      expect(color).toContain("bg-");
      expect(color).toContain("text-");
    }
  });
});

describe("PAYMENT_STATUS_COLORS", () => {
  it("should have colors for all 5 statuses", () => {
    expect(Object.keys(PAYMENT_STATUS_COLORS)).toHaveLength(5);
  });

  it("should have PENDING, PAID, PARTIAL, REFUNDED, CANCELLED", () => {
    expect(PAYMENT_STATUS_COLORS.PENDING).toBeDefined();
    expect(PAYMENT_STATUS_COLORS.PAID).toBeDefined();
    expect(PAYMENT_STATUS_COLORS.PARTIAL).toBeDefined();
    expect(PAYMENT_STATUS_COLORS.REFUNDED).toBeDefined();
    expect(PAYMENT_STATUS_COLORS.CANCELLED).toBeDefined();
  });
});

describe("NOTIFICATION_TYPE_COLORS", () => {
  it("should have colors for all 5 types", () => {
    expect(Object.keys(NOTIFICATION_TYPE_COLORS)).toHaveLength(5);
  });
});

describe("NOTIFICATION_STATUS_COLORS", () => {
  it("should have colors for all 3 statuses", () => {
    expect(Object.keys(NOTIFICATION_STATUS_COLORS)).toHaveLength(3);
  });
});

describe("TIME_SLOTS", () => {
  it("should have 48 slots (24 hours × 2 half-hours)", () => {
    expect(TIME_SLOTS).toHaveLength(48);
  });

  it("first slot should be 00:00", () => {
    expect(TIME_SLOTS[0]).toBe("00:00");
  });

  it("second slot should be 00:30", () => {
    expect(TIME_SLOTS[1]).toBe("00:30");
  });

  it("last slot should be 23:30", () => {
    expect(TIME_SLOTS[47]).toBe("23:30");
  });

  it("all slots should be in HH:MM format", () => {
    for (const slot of TIME_SLOTS) {
      expect(slot).toMatch(/^\d{2}:\d{2}$/);
    }
  });

  it("slots should alternate between :00 and :30", () => {
    for (let i = 0; i < TIME_SLOTS.length; i++) {
      const minutes = TIME_SLOTS[i].split(":")[1];
      if (i % 2 === 0) {
        expect(minutes).toBe("00");
      } else {
        expect(minutes).toBe("30");
      }
    }
  });
});

describe("DURATIONS", () => {
  it("should have 6 duration options", () => {
    expect(DURATIONS).toHaveLength(6);
  });

  it("should contain common appointment durations", () => {
    expect(DURATIONS).toContain(15);
    expect(DURATIONS).toContain(30);
    expect(DURATIONS).toContain(45);
    expect(DURATIONS).toContain(60);
    expect(DURATIONS).toContain(90);
    expect(DURATIONS).toContain(120);
  });

  it("should be sorted ascending", () => {
    for (let i = 1; i < DURATIONS.length; i++) {
      expect(DURATIONS[i]).toBeGreaterThan(DURATIONS[i - 1]);
    }
  });
});
