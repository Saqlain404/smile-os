# SmileOS — Backend

## Overview

SmileOS backend is built with **Next.js Server Actions** — no separate backend server, no REST API routes (except the Better Auth catch-all). All data mutations run as server-side functions called directly from client components.

## Server Actions

### What Are Server Actions?

Server Actions are async functions marked with `"use server"` that execute on the server. They are called directly from client components without `fetch()`:

```typescript
// src/server/actions/patient.ts
"use server";
export async function createPatient(data: PatientFormData) {
  const validated = patientSchema.safeParse(data);
  if (!validated.success) throw new Error("Validation failed");
  return prisma.patient.create({ data: validated.data });
}
```

```typescript
// Client component
const patient = await createPatient(formData);
```

### Server Action Files

| File | Actions | Purpose |
|------|---------|---------|
| `src/server/actions/patient.ts` | `getPatients`, `getPatient`, `createPatient`, `updatePatient`, `deletePatient`, `getPatientTags`, `addPatientTag`, `removePatientTag`, `getPatientFamilyMembers`, `addFamilyMember`, `updateFamilyMember`, `removeFamilyMember`, `getPatientInsurance`, `upsertInsurance`, `getPatientStats` | Patient CRUD + tags + family + insurance + stats |
| `src/server/actions/appointment.ts` | `getAppointments`, `getAppointment`, `createAppointment`, `updateAppointment`, `deleteAppointment`, `updateAppointmentStatus`, `moveAppointment`, `getDoctors`, `getChairs` | Appointment CRUD + calendar + conflict detection |
| `src/server/actions/billing.ts` | `getInvoices`, `getInvoice`, `createInvoice`, `updateInvoice`, `deleteInvoice`, `recordPayment`, `getBillingStats` | Invoice CRUD + payments + stats |
| `src/server/actions/staff.ts` | `getStaff`, `getStaffMember`, `createStaff`, `updateStaff`, `deleteStaff`, `getDepartments`, `createDepartment`, `updateDepartment`, `deleteDepartment`, `getStaffStats` | Staff CRUD + departments + stats |
| `src/server/actions/notifications.ts` | `getNotifications`, `getUnreadCount`, `getRecentNotifications`, `markAsRead`, `markAllAsRead`, `archiveNotification`, `deleteNotification`, `createNotification`, `getNotificationStats` | Notification CRUD + mark read + stats |
| `src/server/actions/patient-portal.ts` | `getPatientByUserId`, `getPatientAppointments`, `getPatientInvoices`, `getPatientTreatments`, `getPatientStats` | Patient portal data fetching |
| `src/server/actions/ai.ts` | `getAIInsights`, `generateInsights`, `markInsightRead`, `dismissInsight`, `getAIDiagnosisSuggestions`, `getAITreatmentPlan`, `getAIScheduleOptimization`, `createAIConversation`, `getAIConversations`, `getAIConversation`, `sendAIMessage`, `generateAIResponse`, `getAIGlobalStats` | AI features (insights, diagnosis, treatment, schedule, chatbot) |

### Common Patterns

#### Input Validation
All server actions validate input with Zod before processing:

```typescript
export async function createPatient(data: PatientFormData) {
  const result = patientSchema.safeParse(data);
  if (!result.success) {
    throw new Error("Validation failed: " + result.error.issues.map(i => i.message).join(", "));
  }
  // ... proceed with validated data
}
```

#### Error Handling
```typescript
try {
  const patient = await prisma.patient.create({ data });
  revalidatePath("/patients");
  return { success: true, data: patient };
} catch (error) {
  console.error("Failed to create patient:", error);
  return { success: false, error: "Failed to create patient" };
}
```

#### Cache Invalidation
After mutations, `revalidatePath()` refreshes cached data:
```typescript
revalidatePath("/patients");
revalidatePath(`/patients/${id}`);
revalidatePath("/dashboard");
```

## Authentication

### Better Auth Server (`src/lib/auth.ts`)

```typescript
export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: { enabled: true },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,  // 7 days
    updateAge: 60 * 60 * 24,        // Refresh every 24 hours
  },
  trustedOrigins: ["http://localhost:3000"],
});
```

### Better Auth Client (`src/lib/auth-client.ts`)

```typescript
"use client";
export const { signIn, signUp, signOut, useSession } = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
});
```

### Auth API Route (`src/app/api/auth/[...all]/route.ts`)

Better Auth uses a catch-all API route to handle all auth endpoints:
```typescript
import { auth } from "@/lib/auth";
export const { GET, POST } = auth.handlers;
```

### Password Hashing

Passwords are hashed using **scrypt** from `@better-auth/utils/password`:
```typescript
import { hashPassword } from "@better-auth/utils/password";
const hash = await hashPassword("password123"); // Returns "salt:key" format
```

**Do not use SHA-256** — Better Auth expects the `salt:key` scrypt format.

## Database Access

### Prisma Client Singleton (`src/lib/prisma.ts`)

```typescript
import { PrismaClient } from "@/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function createPrismaClient() {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
  });
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma || createPrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

**Key details:**
- Prisma 7 requires `PrismaPg` adapter (driver adapter pattern)
- `globalThis` caching prevents multiple instances during hot reload
- Generated client at `src/generated/prisma` (not default `node_modules/.prisma/client`)

### Prisma Config (`prisma.config.ts`)

```typescript
import { defineConfig } from "prisma/config";
import dotenv from "dotenv/config";

export default defineConfig({
  earlyAccess: true,
  schema: "prisma/schema.prisma",
  async url() {
    return process.env.DATABASE_URL!;
  },
});
```

## RBAC (Role-Based Access Control)

Defined in `src/lib/permissions.ts`:

```typescript
export const ROLES = {
  ADMIN: { permissions: ["*"] },
  DENTIST: { permissions: ["patients:read", "patients:write", ...] },
  RECEPTIONIST: { permissions: ["patients:read", "patients:write", ...] },
  ASSISTANT: { permissions: ["patients:read", "appointments:read", ...] },
};

export function hasPermission(role: Role, permission: string): boolean { ... }
export function hasAnyPermission(role: Role, permissions: string[]): boolean { ... }
```

**⚠️ Known gap:** RBAC is defined but not enforced in server actions. All actions currently run without permission checks.

## Zod Validation Schemas (`src/lib/validations/index.ts`)

| Schema | Fields |
|--------|--------|
| `patientSchema` | firstName, lastName, email, phone, dateOfBirth, gender, address, city, state, zipCode, bloodGroup, allergies, medicalHistory, dentalHistory, emergencyContact, emergencyPhone |
| `appointmentSchema` | patientId, doctorId, treatmentId, chairId, title, description, date, startTime, endTime, duration, notes |
| `treatmentSchema` | name, description, duration, price, cost, color, isActive |
| `invoiceSchema` | patientId, dueDate, items (array: description, quantity, unitPrice), taxRate, discount, notes |
| `loginSchema` | email, password |
| `staffSchema` | name, email, password, role, departmentId, phone, specialization, licenseNumber, bio |

## Activity & Audit Logging

Two models exist in the schema but are **not currently used**:

- `ActivityLog` — Tracks user actions (userId, action, entity, entityId, details, ipAddress)
- `AuditLog` — Tracks data changes (oldValues, newValues) for compliance

## Email Integration

Resend is configured but not active:
```typescript
// package.json includes "resend": "^6.20.0"
// No actual email sending implementation exists yet
```

## Error Handling

Server actions use try/catch with console.error logging. Errors are returned as `{ success: false, error: string }` objects. The client displays errors via sonner toast notifications.
