# SmileOS — Database

## Overview

SmileOS uses **PostgreSQL** hosted on **Supabase** with **Prisma 7** as the ORM. The database contains **35+ tables** covering auth, clinic management, patients, appointments, treatments, billing, staff, notifications, AI features, and audit logging.

## Connection

```
postgresql://postgres:Wapking%4023%3DSmileOS@db.iptuwixtpzdwscsbzvnd.supabase.co:5432/postgres?sslmode=no-verify
```

- **Host:** `db.iptuwixtpzdwscsbzvnd.supabase.co`
- **Port:** 5432
- **Database:** `postgres`
- **SSL:** `no-verify` (self-signed cert)
- **Driver:** PrismaPg adapter (not direct Prisma engine)

## Schema Overview

### Auth Models (4 tables)

| Table | Model | Purpose |
|-------|-------|---------|
| `users` | `User` | User accounts (id, name, email, role, emailVerified) |
| `sessions` | `Session` | Active sessions (token, expiresAt, ipAddress, userAgent) |
| `accounts` | `Account` | Auth providers (email/password, Google OAuth, tokens) |
| `verifications` | `Verification` | Email verification tokens |

### Enums (12)

| Enum | Values |
|------|--------|
| `UserRole` | ADMIN, DENTIST, RECEPTIONIST, ASSISTANT |
| `AppointmentStatus` | BOOKED, CONFIRMED, IN_PROGRESS, COMPLETED, CANCELLED, NO_SHOW, RESCHEDULED |
| `PaymentStatus` | PENDING, PAID, PARTIAL, REFUNDED, CANCELLED |
| `PaymentMethod` | CASH, CARD, ONLINE, INSURANCE, BANK_TRANSFER |
| `LeaveStatus` | PENDING, APPROVED, REJECTED, CANCELLED |
| `Gender` | MALE, FEMALE, OTHER, PREFER_NOT_TO_SAY |
| `NotificationType` | EMAIL, SMS, WHATSAPP, PUSH, IN_APP |
| `NotificationStatus` | UNREAD, READ, ARCHIVED |
| `AttendanceStatus` | PRESENT, ABSENT, LATE, HALF_DAY, ON_LEAVE |
| `AIInsightType` | DIAGNOSIS, TREATMENT, RISK, PREDICTION, OPTIMIZATION, REVENUE |
| `AIInsightSeverity` | LOW, MEDIUM, HIGH, CRITICAL |

### Clinic Models (2 tables)

| Table | Model | Purpose |
|-------|-------|---------|
| `clinics` | `Clinic` | Multi-clinic support (name, slug, address, timezone, currency, taxRate) |
| `clinic_settings` | `ClinicSettings` | Per-clinic config (slotDuration, workingDays, openingTime, closingTime, reminder settings, channel toggles) |

### Department & Staff (5 tables)

| Table | Model | Purpose |
|-------|-------|---------|
| `departments` | `Department` | Clinic departments (name, color, isActive) — links to Clinic |
| `staff` | `Staff` | Staff members (employeeId, phone, specialization, licenseNumber, salary) — links to User + Department |
| `staff_schedules` | `StaffSchedule` | Weekly schedules (dayOfWeek, startTime, endTime) — unique per staff+day |
| `attendance` | `Attendance` | Daily attendance (clockIn, clockOut, status) — unique per staff+date |
| `leaves` | `Leave` | Leave requests (startDate, endDate, reason, status, approvedBy) |

**Critical:** Staff has **no `clinicId`**. Staff links to Clinic via `Department.clinicId`. All staff queries filter by `department.clinicId`.

### Patient Models (5 tables)

| Table | Model | Purpose |
|-------|-------|---------|
| `patients` | `Patient` | Core patient data (25+ fields: name, contact, medical, dental, emergency) — links to Clinic + User |
| `patient_tags` | `PatientTag` | Custom tags (name, color) — unique per patient+name |
| `family_members` | `FamilyMember` | Family contacts (name, relation, phone, email) |
| `insurance` | `Insurance` | Insurance info (provider, policyNumber, groupNumber, coveragePercent, maxCoverage) — one per patient |
| `patient_documents` | `PatientDocument` | Document references (name, type, fileUrl, fileSize) |

### Appointment Models (2 tables)

| Table | Model | Purpose |
|-------|-------|---------|
| `appointments` | `Appointment` | Core appointment (date, startTime, endTime, duration, status, notes, recurring support) — links to Patient + Doctor + Chair + Treatment |
| `chairs` | `Chair` | Dental chairs (name, color, isActive) — per clinic |

**Note:** `startTime` and `endTime` are **String** fields (not DateTime). `date` is `DateTime @db.Date`.

### Treatment Models (1 table)

| Table | Model | Purpose |
|-------|-------|---------|
| `treatments` | `Treatment` | Treatment catalog (name, description, duration, price, cost, color) — per clinic |

### Clinical Models (3 tables)

| Table | Model | Purpose |
|-------|-------|---------|
| `consultations` | `Consultation` | Visit records (diagnosis, notes, voiceNotes, treatmentPlan, followUpDate) |
| `medical_records` | `MedicalRecord` | Medical records (title, type, content, fileUrl, fileName, mimeType) |
| `prescriptions` | `Prescription` | Prescriptions with structured items (diagnosis, notes) |

### Prescription Items (1 table)

| Table | Model | Purpose |
|-------|-------|---------|
| `prescription_items` | `PrescriptionItem` | Individual medications (medication, dosage, frequency, duration, instructions) — nested JSON in Prescription |

### Billing Models (3 tables)

| Table | Model | Purpose |
|-------|-------|---------|
| `invoices` | `Invoice` | Invoices (invoiceNumber, date, dueDate, status, subtotal, taxAmount, discount, totalAmount) |
| `invoice_items` | `InvoiceItem` | Line items (description, quantity, unitPrice, total) |
| `payments` | `Payment` | Payments (amount, method, status, reference, paidAt) |

**Note:** Invoice has `discount` (not `discountAmount`), no `paidAmount` — computed from `payments` relation. Payment has `paidAt` (not `paymentDate`).

### Notification Models (1 table)

| Table | Model | Purpose |
|-------|-------|---------|
| `notifications` | `Notification` | Notifications (title, message, type, status, link, metadata) — per user |

### Marketing Models (3 tables)

| Table | Model | Purpose |
|-------|-------|---------|
| `reviews` | `Review` | Patient reviews (name, rating, comment, source, isPublic) |
| `blog_posts` | `BlogPost` | Blog content (title, slug, excerpt, content, published, tags) |
| `gallery_images` | `GalleryImage` | Photo gallery (url, alt, caption, album, sortOrder) |

### AI Models (3 tables)

| Table | Model | Purpose |
|-------|-------|---------|
| `ai_conversations` | `AIConversation` | Chat sessions (title, userId) |
| `ai_messages` | `AIMessage` | Chat messages (role, content) — linked to conversation |
| `ai_insights` | `AIInsight` | AI-generated insights (type, severity, title, description, metadata, isRead, isDismissed) |

### Audit Models (2 tables)

| Table | Model | Purpose |
|-------|-------|---------|
| `activity_logs` | `ActivityLog` | User actions (action, entity, entityId, details, ipAddress) |
| `audit_logs` | `AuditLog` | Data changes (action, entity, entityId, oldValues, newValues, ipAddress) |

## Entity Relationship Diagram

```
User ─────┬── Session
          ├── Account
          ├── Staff ──────── Department ──── Clinic
          │     ├── StaffSchedule              ├── ClinicSettings
          │     ├── Attendance                 ├── Chair
          │     ├── Leave                      ├── Treatment
          │     └── Consultation               ├── Patient
          └── Patient ──────── PatientTag       ├── BlogPost
                ├── FamilyMember                ├── Review
                ├── Insurance                   └── GalleryImage
                ├── Appointment ── Doctor (Staff)
                │     └── Chair
                ├── MedicalRecord
                ├── Prescription
                │     └── PrescriptionItem
                ├── Invoice
                │     ├── InvoiceItem
                │     └── Payment
                └── PatientDocument

Notification ── User
AIConversation ── User
  └── AIMessage
AIInsight ── Clinic
ActivityLog
AuditLog
```

## Indexes

| Table | Indexes |
|-------|---------|
| `patients` | `clinicId`, `email`, `phone` |
| `appointments` | `[clinicId, date]`, `[doctorId, date]`, `patientId`, `status` |
| `invoices` | `clinicId`, `patientId`, `status` |
| `notifications` | `[userId, status]` |
| `ai_insights` | `[clinicId, type]` |
| `activity_logs` | `userId`, `[entity, entityId]` |
| `audit_logs` | `[entity, entityId]` |

## Unique Constraints

| Table | Constraint |
|-------|-----------|
| `users` | `email` |
| `sessions` | `token` |
| `accounts` | (none extra) |
| `staff_schedules` | `[staffId, dayOfWeek]` |
| `attendance` | `[staffId, date]` |
| `patient_tags` | `[patientId, name]` |
| `insurance` | `patientId` |
| `clinic_settings` | `clinicId` |
| `departments` | (none extra) |
| `invoices` | `invoiceNumber` |

## Cascade Deletes

| Parent | Child | On Delete |
|--------|-------|-----------|
| User | Session | Cascade |
| User | Account | Cascade |
| Clinic | Department | Cascade |
| Clinic | Chair | Cascade |
| Clinic | Treatment | Cascade |
| Department | Staff | (no cascade — set null) |
| Staff | StaffSchedule | Cascade |
| Staff | Attendance | Cascade |
| Staff | Leave | Cascade |
| Patient | PatientTag | Cascade |
| Patient | FamilyMember | Cascade |
| Patient | Insurance | Cascade |
| Patient | MedicalRecord | Cascade |
| Patient | Prescription | Cascade |
| Patient | PatientDocument | Cascade |
| Prescription | PrescriptionItem | Cascade |
| Invoice | InvoiceItem | Cascade |
| AIConversation | AIMessage | Cascade |
| Clinic | Review | Cascade |
| Clinic | BlogPost | Cascade |

## Database Operations

```bash
# Generate Prisma client (required after schema changes)
./node_modules/.bin/prisma generate

# Push schema to database (creates/updates tables without migrations)
./node_modules/.bin/prisma db push

# Open Prisma Studio (visual database browser)
./node_modules/.bin/prisma studio

# Seed database
npx tsx prisma/seed.ts

# Reset database (WARNING: deletes all data)
./node_modules/.bin/prisma db push --force-reset
```

## Seed Data

The seed script (`prisma/seed.ts`) creates:

| Entity | Count |
|--------|-------|
| Clinic | 1 (Smile Dental Studio) |
| ClinicSettings | 1 |
| Departments | 5 (General, Orthodontics, Pediatric, Oral Surgery, Endodontics) |
| Staff | 3 (Admin, Dr. Sarah Chen, Anna Kim) |
| Patients | 6 |
| Chairs | 3 |
| Treatments | 10 |
| Appointments | 10 |
| Invoices | 4 |
| Payments | 2 |
| AI Insights | 6 |
| AI Conversations | 1 |

**Password:** All demo users use `password123` (hashed with scrypt).
