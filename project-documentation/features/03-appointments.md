# Feature: Appointment System

## Overview
Appointment scheduling with list view and calendar view. Conflict detection, chair management, drag-and-drop rescheduling.

## Files
- `src/server/actions/appointment.ts` — 8 server actions
- `src/components/appointments/appointment-list.tsx` — List with DataTable
- `src/components/appointments/appointment-form-dialog.tsx` — Create/edit form
- `src/components/appointments/calendar-view.tsx` — FullCalendar v6.1.21
- `src/app/(dashboard)/appointments/page.tsx` — List page
- `src/app/(dashboard)/calendar/page.tsx` — Calendar page

## Appointment Fields
- **Core:** patientId, doctorId, treatmentId, chairId, title, description
- **Schedule:** date (DateTime), startTime (String), endTime (String), duration (Int)
- **Status:** BOOKED → CONFIRMED → IN_PROGRESS → COMPLETED / CANCELLED / NO_SHOW
- **Other:** notes, isRecurring, recurrenceRule, reminderSent

## Server Actions
| Action | Purpose |
|--------|---------|
| `getAppointments` | List with filters (date range, doctor, status) |
| `getAppointment` | Single appointment with relations |
| `createAppointment` | Create with conflict detection |
| `updateAppointment` | Update appointment |
| `deleteAppointment` | Delete appointment |
| `updateAppointmentStatus` | Change status (check-in, complete, cancel) |
| `moveAppointment` | Drag-and-drop reschedule |
| `getDoctors` | Get staff for doctor selector |
| `getChairs` | Get chairs for chair selector |

## Conflict Detection
- **Doctor conflict:** Same doctor, overlapping time on same date
- **Chair conflict:** Same chair, overlapping time on same date
- Returns conflict details (conflicting appointment info)

## Calendar Views
- **Day view** — Hourly time slots
- **Week view** — 7-day grid
- **Month view** — Traditional calendar
- **List view** — Agenda format

## Calendar Features
- Drag-and-drop to reschedule
- Click to view/edit
- Color-coded by appointment status
- Click on empty slot to create new
- Filter by doctor/chair

## Status Colors
| Status | Color |
|--------|-------|
| BOOKED | Blue |
| CONFIRMED | Green |
| IN_PROGRESS | Yellow |
| COMPLETED | Emerald |
| CANCELLED | Red |
| NO_SHOW | Orange |
| RESCHEDULED | Purple |

## Known Gaps
- `startTime`/`endTime` are strings (not DateTime) — sorting issues
- No recurring appointment support (field exists but not implemented)
- No waitlist functionality
- No online booking
