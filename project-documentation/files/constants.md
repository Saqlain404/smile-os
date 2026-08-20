# File: src/lib/constants.ts

**Path:** `src/lib/constants.ts`
**Lines:** 121
**Purpose:** App-wide constants — navigation, status colors, time slots

## What It Does
Central configuration for the application. Defines navigation structure, visual constants, and utility arrays used throughout the UI.

## Exports

### `APP_NAME` (Line 1)
```typescript
export const APP_NAME = "SmileOS";
```

### `APP_DESCRIPTION` (Line 2-3)
```typescript
export const APP_DESCRIPTION = "The operating system for modern dental practices";
```

### `NAV_ITEMS` (Lines 5-71)
Navigation structure with 6 groups:

| Group | Items |
|-------|-------|
| `main` | Dashboard |
| `management` | Patients, Appointments, Calendar |
| `operations` | Reception, Dentist, Billing |
| `intelligence` | AI Assistant |
| `administration` | Staff, Notifications, Settings |

Each item has `label`, `href`, and `icon` (Lucide icon name).

### `APPOINTMENT_STATUS_COLORS` (Lines 73-86)
Map of appointment status → Tailwind CSS classes (light + dark mode):
- BOOKED: Blue
- CONFIRMED: Green
- IN_PROGRESS: Yellow
- COMPLETED: Emerald
- CANCELLED: Red
- NO_SHOW: Orange
- RESCHEDULED: Purple

### `PAYMENT_STATUS_COLORS` (Lines 88-97)
Map of payment status → Tailwind CSS classes:
- PENDING: Yellow
- PAID: Green
- PARTIAL: Orange
- REFUNDED: Blue
- CANCELLED: Red

### `NOTIFICATION_TYPE_COLORS` (Lines 99-105)
Map of notification type → Tailwind CSS classes.

### `NOTIFICATION_STATUS_COLORS` (Lines 107-113)
Map of notification status → Tailwind CSS classes.

### `TIME_SLOTS` (Lines 115-119)
```typescript
export const TIME_SLOTS = Array.from({ length: 48 }, (_, i) => {
  const hours = Math.floor(i / 2);
  const minutes = i % 2 === 0 ? "00" : "30";
  return `${hours.toString().padStart(2, "0")}:${minutes}`;
});
```
Generates 48 time slots (00:00 to 23:30 in 30-minute intervals).

### `DURATIONS` (Line 121)
```typescript
export const DURATIONS = [15, 30, 45, 60, 90, 120];
```
Available appointment durations in minutes.

## Related Files
- `src/components/layout/sidebar.tsx` — Uses NAV_ITEMS for navigation
- `src/components/appointments/` — Uses APPOINTMENT_STATUS_COLORS
- `src/components/billing/` — Uses PAYMENT_STATUS_COLORS
- `src/components/notifications/` — Uses NOTIFICATION_*_COLORS
