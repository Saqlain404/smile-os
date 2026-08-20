# File: prisma/schema.prisma

**Path:** `prisma/schema.prisma`
**Lines:** 740
**Purpose:** Database schema definition — 30+ models, 12 enums, all table mappings

## What It Does
Defines the complete database schema for SmileOS. Every database table, column, relationship, index, and constraint is declared here. Prisma uses this to generate the TypeScript client and manage database migrations.

## Key Sections

### Generator & Datasource (Lines 1-8)
```prisma
generator client {
  provider = "prisma-client-js"
  output   = "../src/generated/prisma"  // Custom output path
}
datasource db {
  provider = "postgresql"
  // URL comes from prisma.config.ts, not here
}
```

### Auth Models (Lines 10-71)
- `User` — User accounts with roles (ADMIN, DENTIST, RECEPTIONIST, ASSISTANT)
- `Session` — Active sessions with token, expiry, IP
- `Account` — Auth provider data (email/password, OAuth)
- `Verification` — Email verification tokens

### Enums (Lines 73-135)
12 enums covering roles, statuses, payment methods, genders, notification types, AI insight types.

### Clinic Models (Lines 136-186)
- `Clinic` — Multi-clinic support (name, slug, timezone, currency)
- `ClinicSettings` — Per-clinic config (slot duration, working days, channels)

### Staff Models (Lines 188-283)
- `Department` — Clinic departments (links to Clinic)
- `Staff` — Staff members (links to User + Department, NO clinicId)
- `StaffSchedule` — Weekly schedules
- `Attendance` — Daily attendance
- `Leave` — Leave requests

### Patient Models (Lines 285-371)
- `Patient` — Core patient data (25+ fields)
- `PatientTag` — Custom tags
- `FamilyMember` — Family contacts
- `Insurance` — Insurance info (one per patient)

### Appointment Models (Lines 373-422)
- `Appointment` — Core appointment (startTime/endTime are Strings, not DateTime)
- `Chair` — Dental chairs per clinic

### Treatment & Clinical (Lines 424-512)
- `Treatment` — Treatment catalog with pricing
- `Consultation` — Visit records
- `MedicalRecord` — Medical records
- `Prescription` — Prescriptions with structured items
- `PrescriptionItem` — Individual medications

### Billing (Lines 530-582)
- `Invoice` — Invoices (subtotal, discount — NOT discountAmount)
- `InvoiceItem` — Line items
- `Payment` — Payments (paidAt — NOT paymentDate)

### Notifications (Lines 584-599)
- `Notification` — Multi-channel notifications

### Marketing (Lines 601-653)
- `Review` — Patient reviews
- `BlogPost` — Blog content
- `GalleryImage` — Photo gallery

### AI (Lines 655-708)
- `AIConversation` — Chat sessions
- `AIMessage` — Chat messages
- `AIInsight` — AI-generated insights

### Audit (Lines 710-740)
- `ActivityLog` — User action tracking
- `AuditLog` — Data change tracking

## Critical Notes
- `Staff` has NO `clinicId` — links via `Department.clinicId`
- `Appointment.startTime`/`endTime` are `String` (not DateTime)
- `Invoice.discount` (not `discountAmount`)
- `Payment.paidAt` (not `paymentDate`)
- `Prescription.items` is structured JSON array, not string
- Cascade deletes on most parent-child relationships
- Indexes on frequently queried columns (clinicId, patientId, status, etc.)
