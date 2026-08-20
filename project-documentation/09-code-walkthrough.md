# SmileOS — Code Walkthrough

This file walks through every major file in the codebase, explaining what it does and how it connects to other parts.

---

## Root Config Files

### `prisma.config.ts`
Prisma 7 requires a root-level config to provide the database URL (no longer in `schema.prisma`). Imports `dotenv/config` to load `.env.local`, then returns `process.env.DATABASE_URL`.

### `prisma/schema.prisma`
The database schema with 30+ models and 12 enums. Defines the complete data model for a dental practice management system. Generated client outputs to `../src/generated/prisma`.

### `prisma/seed.ts`
Seeds the database with demo data. Uses `hashPassword` from `@better-auth/utils/password` (scrypt) for passwords. Creates: 1 clinic, 5 departments, 3 staff, 6 patients, 3 chairs, 10 treatments, 10 appointments, 4 invoices, 2 payments, 6 AI insights, 1 AI conversation.

### `package.json`
49 dependencies including Next.js 16.3.1, React 19.2.8, Prisma 7.9.1, Better Auth 1.6.29, shadcn/ui 4.18, FullCalendar 6.1.21, Recharts 3.10.1, Zod 4.4.3, Tailwind CSS 4.

### `next.config.ts`
Configures React Compiler (babel-plugin-react-compiler) and Sentry instrumentation. Source maps enabled.

### `tsconfig.json`
TypeScript strict mode. Path alias `@/*` maps to `src/*`.

### `postcss.config.mjs`
Tailwind CSS v4 PostCSS plugin.

### `tailwind.config.ts`
Content paths for `src/**/*.{ts,tsx}`. Theme extends with custom colors and animations.

---

## Source Code — `src/`

### `src/app/layout.tsx`
Root layout. Imports Inter font, sets metadata (title: "SmileOS"), wraps children with `<Toaster />` from sonner. Global CSS import.

### `src/app/page.tsx`
Marketing landing page. Server component that renders MarketingNav, all landing sections (Hero, Logos, Features, HowItWorks, Pricing, Testimonials, FinalCTA), and MarketingFooter.

### `src/app/login/page.tsx`
Login page. Client component using `signIn.email()` from Better Auth. Email/password form with error handling. Redirects to `/dashboard` on success.

### `src/app/not-found.tsx`
404 page. Shows a sad smile icon, "Page not found" message, and link back to dashboard.

### `src/app/api/auth/[...all]/route.ts`
Better Auth API catch-all. Exports `GET` and `POST` handlers from `auth.handlers`.

---

## Dashboard Route Group — `src/app/(dashboard)/`

### `src/app/(dashboard)/layout.tsx`
Wraps all dashboard pages in `<AppShell>` component.

### `src/app/(dashboard)/dashboard/page.tsx`
Dashboard page. Server component that fetches appointment stats, patient count, revenue data, and recent activity. Renders stats cards and Recharts charts.

### `src/app/(dashboard)/patients/page.tsx`
Patient list page. Renders PageHeader with "Add Patient" button, PatientList component with DataTable.

### `src/app/(dashboard)/patients/[id]/page.tsx`
Patient detail page. Fetches patient with all relations (appointments, invoices, treatments, prescriptions, insurance, family, tags). Renders PatientDetail component with 7 tabs.

### `src/app/(dashboard)/appointments/page.tsx`
Appointment list page. Renders PageHeader with "New Appointment" button, AppointmentList component.

### `src/app/(dashboard)/calendar/page.tsx`
Calendar page. Renders CalendarView (FullCalendar) with appointment data.

### `src/app/(dashboard)/billing/page.tsx`
Billing overview. Shows billing stats cards (total revenue, pending, paid, overdue) and recent invoices.

### `src/app/(dashboard)/billing/invoices/page.tsx`
Invoice list page. Renders InvoiceList component with DataTable.

### `src/app/(dashboard)/billing/invoices/[id]/page.tsx`
Invoice detail page. Shows line items, payments, status, and record payment button.

### `src/app/(dashboard)/staff/page.tsx`
Staff list page. Renders StaffList component with DataTable.

### `src/app/(dashboard)/staff/[id]/page.tsx`
Staff detail page. Shows staff info, schedule, attendance, and leave history.

### `src/app/(dashboard)/notifications/page.tsx`
Notifications page. Renders stats cards + NotificationList component.

### `src/app/(dashboard)/ai/page.tsx`
AI Dashboard. Server component fetching AI stats (total insights, unread count, conversations). Client component with tabbed sections (Overview, Diagnosis, Treatment, Schedule) + AIInsightsPanel.

### `src/app/(dashboard)/ai/chat/page.tsx`
AI Chat page. Renders AIChatbot component.

### `src/app/(dashboard)/reception/page.tsx`, `dentist/page.tsx`, `settings/page.tsx`
Placeholder pages for future implementation.

---

## Patient Portal — `src/app/portal/`

### `src/app/portal/layout.tsx`
Separate layout with PatientSidebar + PatientTopbar. No AppShell.

### `src/app/portal/dashboard/page.tsx`
Portal dashboard. Shows patient stats (appointments, invoices, treatments), recent appointments, and unpaid invoices.

### `src/app/portal/appointments/page.tsx`
Patient's appointments list with status filters.

### `src/app/portal/invoices/page.tsx`
Patient's invoices with payment status.

### `src/app/portal/treatments/page.tsx`
Tabbed view: Consultations tab + Prescriptions tab.

### `src/app/portal/profile/page.tsx`
Patient profile view and edit form.

---

## Layout Components — `src/components/layout/`

### `sidebar.tsx`
Collapsible sidebar. Uses iconMap to render Lucide icons. 6 navigation groups (Main, Management, Operations, Intelligence, Administration). Active route highlighting. Collapse/expand toggle.

### `topbar.tsx`
Top bar with NotificationCenter dropdown. Shows unread count badge. Auto-refreshes every 30 seconds. Mark all as read. Recent notifications list.

### `app-shell.tsx`
Combines Sidebar + Topbar + main content area. Responsive layout.

### `page-header.tsx`
Page header with title, description, and optional action buttons. **Does NOT accept `icon` prop.**

---

## UI Components — `src/components/ui/`

24 shadcn/ui components built on `@base-ui/react` (NOT Radix). Key differences:
- **Button:** No `asChild` prop
- **DropdownMenuItem:** Use `render` prop for custom elements
- **TooltipProvider:** Use `delay` not `delayDuration`
- **Checkbox:** Custom implementation (pure HTML input)
- **Select:** `onValueChange` returns `string | null`

---

## Shared Components — `src/components/shared/`

### `data-table/index.tsx`
Full-featured DataTable with: search, sort (column-based), pagination (page size selector), bulk actions (select all, individual), CSV export. Uses react-table patterns.

### `empty-state.tsx`
Reusable empty state with icon, title, description, and optional action button.

### `error-state.tsx`
Error display with retry button.

### `loading-skeleton.tsx`
Loading state variants (page, table, card, form).

---

## Feature Components

### `patients/patient-list.tsx`
Patient list with DataTable. Columns: name, email, phone, status, tags, actions. Search by name/email/phone.

### `patients/patient-form-dialog.tsx`
Patient create/edit form dialog. Uses react-hook-form + zod validation. Fields: personal info, contact, medical history, emergency contact.

### `patients/patient-detail.tsx`
Patient detail with 7 tabs: Overview, Appointments, Treatments, Prescriptions, Billing, Insurance, Family. Shows patient stats, recent activity, and edit/delete actions.

### `appointments/appointment-list.tsx`
Appointment list with DataTable. Columns: patient, doctor, date, time, status, treatment. Status badges with colors.

### `appointments/appointment-form-dialog.tsx`
Appointment create/edit form. Patient/doctor/treatment selectors, date/time pickers, duration, notes.

### `appointments/calendar-view.tsx`
FullCalendar v6.1.21 integration. Day/week/month views. Drag-and-drop to reschedule. Click to view/edit. Color-coded by status.

### `billing/invoice-list.tsx`
Invoice list with DataTable. Columns: invoice number, patient, date, amount, status, actions.

### `billing/invoice-form-dialog.tsx`
Invoice create/edit with dynamic line items (useFieldArray). Quick-add from treatment catalog. Tax/discount calculations.

### `billing/payment-form-dialog.tsx`
Record payment dialog. Amount, method, reference, notes.

### `staff/staff-list.tsx`
Staff list with DataTable. Columns: name, role, department, specialization, status, actions.

### `staff/staff-form-dialog.tsx`
Staff create/edit form. Name, email, password, role, department, phone, specialization, license, bio.

### `notifications/notification-center.tsx`
Topbar dropdown. Unread count badge. Recent notifications list. Mark as read. Mark all as read. Auto-refresh 30s.

### `notifications/notification-list.tsx`
Full page with type/status filters. Select all checkbox. Bulk actions (mark read, archive, delete). Pagination.

### `ai/ai-chatbot.tsx`
Conversational chatbot UI. Message list with role indicators (user/assistant). Input field with send button. Conversation management (new, switch).

### `ai/ai-insights-panel.tsx`
AI insights list. Type/severity filters. Mark as read. Dismiss. Auto-generate insights.

### `ai/ai-diagnosis-panel.tsx`
AI diagnosis suggestions. Enter symptoms → get diagnosis suggestions with confidence scores.

### `ai/ai-treatment-plan-panel.tsx`
AI treatment planning. Select patient → generate treatment plan with phases and cost estimates.

### `ai/ai-schedule-panel.tsx`
AI schedule optimization. Analyzes appointment patterns → suggests optimizations.

### `marketing/marketing-nav.tsx`
Sticky navigation. Logo, nav links, CTA button. Mobile hamburger menu with slide-in drawer.

### `marketing/marketing-footer.tsx`
4-column footer. Company info, features, support, legal. HIPAA/SOC2 compliance badges.

---

## Server Actions — `src/server/actions/`

7 files with 50+ server action functions. All use `"use server"` directive. Common patterns:
1. Validate input with Zod
2. Execute Prisma query
3. Call `revalidatePath()` after mutations
4. Return `{ success, data }` or `{ success: false, error }`

### `patient.ts`
13 actions: CRUD + tags + family + insurance + stats. Most complex file. Handles nested relations.

### `appointment.ts`
8 actions: CRUD + status updates + drag-move + conflict detection. `getDoctors` and `getChairs` for form selectors.

### `billing.ts`
7 actions: Invoice CRUD + payment recording + billing stats. Computes paid amount from payments relation.

### `staff.ts`
10 actions: Staff CRUD + department CRUD + stats. Filters by `department.clinicId` (staff has no clinicId).

### `notifications.ts`
9 actions: CRUD + mark read/archive + stats. `getRecentNotifications` for topbar dropdown.

### `patient-portal.ts`
5 actions: Data fetching for patient portal pages. Filters by `userId` from session.

### `ai.ts`
13 actions: Insights, diagnosis, treatment planning, schedule optimization, chatbot, global stats. AI responses are simulated (pattern-based, no LLM).

---

## Lib — `src/lib/`

### `prisma.ts`
PrismaClient singleton with PrismaPg adapter. Caches in `globalThis` for dev hot reload.

### `auth.ts`
Better Auth server config. prismaAdapter, email/password, Google OAuth (configured), 7-day sessions.

### `auth-client.ts`
Better Auth client. `signIn`, `signUp`, `signOut`, `useSession` hooks.

### `permissions.ts`
RBAC: 4 roles with permission arrays. `hasPermission()` and `hasAnyPermission()` functions.

### `constants.ts`
APP_NAME, NAV_ITEMS (6 groups), status color maps, TIME_SLOTS (48 half-hour slots), DURATIONS.

### `validations/index.ts`
Zod schemas for: patient, appointment, treatment, invoice, login, staff.

### `utils.ts`
`cn()` helper combining `clsx` + `tailwind-merge`.

---

## Hooks — `src/hooks/`

### `use-debounce.ts`
Debounces a value by a specified delay. Used for search inputs in DataTables.

---

## Types — `src/types/index.ts`

TypeScript interfaces for: Patient, Appointment, Invoice, Treatment, Staff, Notification, etc. Mirrors Prisma models with UI-specific additions.
