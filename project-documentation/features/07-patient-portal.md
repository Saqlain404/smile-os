# Feature: Patient Portal

## Overview
Separate route group (`/portal/`) with own layout, sidebar, and topbar. Allows patients to view their own appointments, invoices, treatments, and profile.

## Files
- `src/server/actions/patient-portal.ts` — 5 server actions
- `src/components/patient-portal/patient-sidebar.tsx` — Portal sidebar
- `src/components/patient-portal/patient-topbar.tsx` — Portal topbar
- `src/app/portal/layout.tsx` — Portal layout (separate from dashboard)
- `src/app/portal/dashboard/page.tsx` — Portal dashboard
- `src/app/portal/appointments/page.tsx` — Patient's appointments
- `src/app/portal/invoices/page.tsx` — Patient's invoices
- `src/app/portal/treatments/page.tsx` — Treatments (tabbed)
- `src/app/portal/profile/page.tsx` — Patient profile

## Portal Layout
Separate from the main dashboard layout. Has its own:
- Sidebar (5 nav items: Dashboard, Appointments, Invoices, Treatments, Profile)
- Topbar (patient name, logout)
- No admin navigation

## Server Actions
| Action | Purpose |
|--------|---------|
| `getPatientByUserId` | Get patient record from user ID |
| `getPatientAppointments` | Patient's appointments |
| `getPatientInvoices` | Patient's invoices with items/payments |
| `getPatientTreatments` | Patient's consultations and prescriptions |
| `getPatientStats` | Patient statistics |

## Portal Pages

### Dashboard
- Stats cards (total appointments, pending invoices, active treatments)
- Recent appointments
- Unpaid invoices

### Appointments
- List of patient's appointments
- Status filters
- Date, time, doctor, treatment info

### Invoices
- List of patient's invoices
- Payment status
- Amount, due date
- Line items detail

### Treatments
Tabbed view:
- **Consultations** — Diagnosis, notes, follow-up dates
- **Prescriptions** — Medications, dosage, frequency

### Profile
- View and edit personal information
- Medical history
- Emergency contact
- Insurance info

## Known Gaps
- No online appointment booking
- No online payment processing
- No secure messaging
- No document upload
- No treatment plan approval
- No appointment reminders
