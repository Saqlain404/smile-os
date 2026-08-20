# SmileOS — Architecture

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client (Browser)                      │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────────┐  │
│  │  Marketing   │  │  Dashboard   │  │  Patient Portal    │  │
│  │  Website     │  │  (App Shell) │  │  (Separate Layout) │  │
│  │  /           │  │  /(dashboard)│  │  /portal/*          │  │
│  └──────┬──────┘  └──────┬───────┘  └────────┬───────────┘  │
│         │                │                    │              │
│         └────────────────┼────────────────────┘              │
│                          │                                   │
│                    React 19 + Next.js 16                     │
│                    Server Components + Client Components      │
└──────────────────────────┬──────────────────────────────────┘
                           │
                    Server Actions (RPC)
                    "use server" functions
                           │
┌──────────────────────────┼──────────────────────────────────┐
│                     Server (Next.js)                         │
│  ┌───────────────────────┼──────────────────────────────┐   │
│  │                 Middleware Layer                        │   │
│  │  ┌──────────┐  ┌────────────┐  ┌──────────────────┐  │   │
│  │  │ Auth     │  │ RBAC       │  │ Session          │  │   │
│  │  │ (Better  │  │ (permissions│  │ Management       │  │   │
│  │  │  Auth)   │  │  .ts)      │  │ (7-day expiry)   │  │   │
│  │  └──────────┘  └────────────┘  └──────────────────┘  │   │
│  └───────────────────────────────────────────────────────┘   │
│                          │                                   │
│  ┌───────────────────────┼──────────────────────────────┐   │
│  │               Server Actions Layer                     │   │
│  │  ┌──────────┐  ┌────────────┐  ┌──────────────────┐  │   │
│  │  │ Patient  │  │ Appointment│  │ Billing          │  │   │
│  │  │ Actions  │  │ Actions    │  │ Actions          │  │   │
│  │  └──────────┘  └────────────┘  └──────────────────┘  │   │
│  │  ┌──────────┐  ┌────────────┐  ┌──────────────────┐  │   │
│  │  │ Staff    │  │ Notification│  │ AI Actions       │  │   │
│  │  │ Actions  │  │ Actions    │  │ (Insights, Chat) │  │   │
│  │  └──────────┘  └────────────┘  └──────────────────┘  │   │
│  └───────────────────────────┬───────────────────────────┘   │
│                              │                               │
│  ┌───────────────────────────┼───────────────────────────┐   │
│  │                 Data Access Layer                      │   │
│  │  ┌─────────────────────────────────────────────────┐  │   │
│  │  │         Prisma 7 + PrismaPg Adapter              │  │   │
│  │  │         (src/lib/prisma.ts — singleton)          │  │   │
│  │  └─────────────────────┬───────────────────────────┘  │   │
│  └────────────────────────┼──────────────────────────────┘   │
│                           │                                  │
└───────────────────────────┼──────────────────────────────────┘
                            │
                     PostgreSQL (Supabase)
                     35+ tables
                     30+ models
```

## Architectural Patterns

### 1. Server Actions (Not REST API)

SmileOS uses **Next.js Server Actions** for all data mutations. Instead of defining API routes and calling them with `fetch()`, server actions are plain async functions marked with `"use server"` that run on the server and are called directly from client components.

```typescript
// Server action definition
"use server";
export async function createPatient(data: PatientFormData) {
  const result = patientSchema.safeParse(data);
  if (!result.success) throw new Error("Validation failed");
  return prisma.patient.create({ data: result.data });
}

// Client component usage
const handleSubmit = async (data: PatientFormData) => {
  const patient = await createPatient(data);
};
```

**Advantages:** Type safety end-to-end, no manual fetch/serialization, automatic caching/revalidation.

### 2. Server Components + Client Components

Next.js 16 uses **React Server Components (RSC)** by default. Components are server-rendered unless they use `"use client"`.

| Pattern | Example |
|---------|---------|
| **Server Component** (default) | Page components, layouts, data-fetching |
| **Client Component** (`"use client"`) | Interactive forms, dialogs, DataTable, NotificationCenter |
| **Server Action** (`"use server"`) | All data mutations (create, update, delete) |

**Rule of thumb:** If a component needs `useState`, `useEffect`, `onClick`, or browser APIs, it must have `"use client"`. Everything else stays as a server component.

### 3. Route Groups

Next.js route groups use parentheses to organize routes without affecting the URL:

- `(dashboard)` — All authenticated app pages share the AppShell layout (sidebar + topbar)
- `portal/` — Patient portal has its own separate layout (own sidebar + topbar)
- `marketing` (root `page.tsx`) — Landing page with no app shell

### 4. Feature-Based Organization

Components and server actions are organized by **feature domain**, not by technical role:

```
src/
├── components/
│   ├── patients/          # Patient domain
│   ├── appointments/      # Appointment domain
│   ├── billing/           # Billing domain
│   ├── staff/             # Staff domain
│   ├── notifications/     # Notification domain
│   ├── ai/                # AI domain
│   └── patient-portal/    # Patient portal domain
│
├── server/actions/        # Server actions by domain
│   ├── patient.ts
│   ├── appointment.ts
│   ├── billing.ts
│   ├── staff.ts
│   ├── notifications.ts
│   └── ai.ts
```

### 5. Singleton Pattern for Prisma Client

The Prisma client is instantiated once and cached in `globalThis` to prevent multiple instances during hot reloading in development:

```typescript
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
export const prisma = globalForPrisma.prisma || createPrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

### 6. RBAC (Role-Based Access Control)

Permissions are defined in `src/lib/permissions.ts` with 4 roles:

| Role | Permissions |
|------|-------------|
| Admin | `*` (all permissions) |
| Dentist | patients:read/write, appointments:read/write, medical_records:read/write, prescriptions:read/write, treatments:read, billing:read, dashboard:read, staff:read |
| Receptionist | patients:read/write, appointments:read/write, billing:read/write, dashboard:read, staff:read, treatments:read |
| Assistant | patients:read, appointments:read, medical_records:read, treatments:read, dashboard:read |

**Note:** RBAC is defined but not yet enforced at the server action level — all actions currently run without permission checks. This is a known improvement area.

### 7. Auth Flow

```
1. User submits email/password on /login
2. Client calls signIn.email() from better-auth/react
3. Better Auth validates credentials against accounts table
4. Session token created (7-day expiry, 24-hour refresh)
5. Token stored in HTTP-only cookie
6. useSession() hook provides user/session to components
7. Server actions can access session via auth API
```

## Data Flow

### Creating a Patient

```
PatientFormDialog (client component)
  → handleSubmit(data)
  → createPatient(data) // server action
  → prisma.patient.create({ data })
  → PostgreSQL
  → revalidatePath("/patients")
  → DataTable refreshes with new data
```

### Loading the Dashboard

```
DashboardPage (server component)
  → prisma.appointment.aggregate({ where: { date: today } })
  → prisma.patient.count()
  → prisma.invoice.aggregate({ where: { status: "PENDING" } })
  → Renders stats cards + Recharts
  → Client-side interactive charts
```

### AI Chat Flow

```
AIChatbot (client component)
  → sendMessage(conversationId, content)
  → sendAIMessage() // server action
  → prisma.aIMessage.create()
  → generateAIResponse() // simulated AI response
  → prisma.aIMessage.create({ role: "assistant" })
  → Returns updated messages
  → UI re-renders with new messages
```

## Security Considerations

| Layer | Mechanism |
|-------|-----------|
| **Auth** | Better Auth with scrypt password hashing (salt:key format) |
| **Sessions** | HTTP-only cookies, 7-day expiry, 24-hour refresh |
| **RBAC** | 4 roles with granular permissions (defined but not enforced in server actions) |
| **Input Validation** | Zod schemas for all form inputs |
| **SQL Injection** | Prisma ORM (parameterized queries) |
| **CORS** | `trustedOrigins: ["http://localhost:3000"]` |
| **Database** | SSL required (`sslmode=no-verify` for self-signed cert) |
| **Environment** | `.env.local` for secrets, `.env` for defaults |

## Known Architectural Gaps

1. **No RBAC enforcement in server actions** — Permissions are defined but not checked
2. **No API rate limiting** — Server actions have no throttling
3. **No audit logging** — `AuditLog` model exists but is not used
4. **No real-time updates** — Polling-based (30s refresh for notifications)
5. **AI features are simulated** — No actual LLM integration, uses pattern-based suggestions
6. **No file upload** — Document references exist but no upload mechanism
7. **No email/SMS sending** — Notification models exist but no provider integration
