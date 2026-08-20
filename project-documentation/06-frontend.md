# SmileOS — Frontend

## Overview

SmileOS frontend is built with Next.js 16 App Router, React 19, Tailwind CSS v4, and shadcn/ui v4 (base-nova, @base-ui/react). It uses a mix of Server Components and Client Components with Server Actions for data mutations.

## Component Architecture

### Component Types

| Type | Convention | Example |
|------|-----------|---------|
| **Server Component** | No directive (default) | `src/app/(dashboard)/dashboard/page.tsx` |
| **Client Component** | `"use client"` at top | `src/components/ui/dialog.tsx` |
| **Server Action** | `"use server"` at top | `src/server/actions/patient.ts` |

### Component Hierarchy

```
Root Layout (src/app/layout.tsx)
├── <Toaster /> (sonner)
├── Metadata, Fonts
│
├── Marketing Page (/) → MarketingNav + LandingSections + MarketingFooter
│
├── Login Page (/login) → LoginForm
│
└── Dashboard Route Group (/(dashboard))
    ├── Dashboard Layout → AppShell
    │   ├── Sidebar (iconMap: 12 icons, 6 nav groups)
    │   ├── Topbar (NotificationCenter dropdown)
    │   └── <Outlet /> → Page content
    │
    ├── Dashboard → StatsCards + Charts
    ├── Patients → PatientList → PatientFormDialog, PatientDetail
    ├── Appointments → AppointmentList → AppointmentFormDialog
    ├── Calendar → CalendarView (FullCalendar)
    ├── Billing → InvoiceList → InvoiceFormDialog, PaymentFormDialog
    ├── Staff → StaffList → StaffFormDialog
    ├── Notifications → NotificationList
    ├── AI Dashboard → AIInsightsPanel + AIDiagnosisPanel + AITreatmentPlanPanel + AISchedulePanel
    ├── AI Chat → AIChatbot
    └── ... (reception, dentist, settings — placeholders)
│
└── Patient Portal Route Group (/portal)
    ├── Portal Layout → PatientSidebar + PatientTopbar
    ├── Portal Dashboard
    ├── Portal Appointments
    ├── Portal Invoices
    ├── Portal Treatments (tabbed)
    └── Portal Profile
```

## Design System

### shadcn/ui Components (24)

All from `src/components/ui/`. Built on `@base-ui/react` (NOT Radix).

| Component | File | Notes |
|-----------|------|-------|
| Accordion | accordion.tsx | |
| Alert | alert.tsx | |
| AlertDialog | alert-dialog.tsx | |
| Avatar | avatar.tsx | |
| Badge | badge.tsx | |
| Breadcrumb | breadcrumb.tsx | |
| Button | button.tsx | **No `asChild` prop** — use `render` prop |
| Card | card.tsx | |
| Chart | chart.tsx | Recharts wrapper |
| Checkbox | checkbox.tsx | **Custom** — pure HTML input, not base-ui |
| Command | command.tsx | cmdk-based |
| DatePicker | date-picker.tsx | react-day-picker |
| Dialog | dialog.tsx | |
| DropdownMenu | dropdown-menu.tsx | Use `render` prop on items |
| Form | form.tsx | react-hook-form integration |
| Input | input.tsx | |
| Label | label.tsx | |
| Popover | popover.tsx | |
| Select | select.tsx | `onValueChange` returns `string \| null` |
| Separator | separator.tsx | |
| Skeleton | skeleton.tsx | |
| Table | table.tsx | |
| Tabs | tabs.tsx | |
| Textarea | textarea.tsx | |
| Tooltip | tooltip.tsx | Uses `delay` not `delayDuration` |

### Shared Components (4)

| Component | File | Purpose |
|-----------|------|---------|
| EmptyState | `shared/empty-state.tsx` | No-data states with icon, title, description, action button |
| ErrorState | `shared/error-state.tsx` | Error display with retry |
| LoadingSkeleton | `shared/loading-skeleton.tsx` | Loading states (page, table, card, form variants) |
| DataTable | `shared/data-table/index.tsx` | Full-featured table with search, sort, pagination, bulk actions, CSV export |

### Layout Components (4)

| Component | File | Purpose |
|-----------|------|---------|
| Sidebar | `layout/sidebar.tsx` | Collapsible sidebar with iconMap (12 icons including Sparkles, Brain) |
| Topbar | `layout/topbar.tsx` | Top bar with NotificationCenter dropdown |
| AppShell | `layout/app-shell.tsx` | Combines Sidebar + Topbar + main content |
| PageHeader | `layout/page-header.tsx` | Page header (title, description, actions — **NO icon prop**) |

## Key UI Patterns

### Data Tables

The DataTable component (`src/components/shared/data-table/index.tsx`) provides:
- **Search:** Client-side text filtering
- **Sort:** Column-based sorting (asc/desc)
- **Pagination:** Page size selector, page navigation
- **Bulk actions:** Select all, individual selection, bulk delete/export
- **CSV export:** Download filtered data as CSV

### Forms

Forms use `react-hook-form` + `zod` validation:
```typescript
const form = useForm<FormData>({
  resolver: zodResolver(schema),
  defaultValues: { ... },
});
```

### Dialogs

Feature-specific dialogs (PatientFormDialog, AppointmentFormDialog, etc.) combine:
- Dialog from shadcn/ui
- Form with react-hook-form
- Server action calls
- Toast notifications via sonner

### Dark/Light Mode

CSS variables with Tailwind's `dark:` prefix:
```css
:root { --background: 0 0% 100%; }
.dark { --background: 222.2 84% 4.9%; }
```

## Navigation Structure

Defined in `src/lib/constants.ts` as `NAV_ITEMS` with 6 groups:

| Group | Items |
|-------|-------|
| **Main** | Dashboard |
| **Management** | Patients, Appointments, Calendar |
| **Operations** | Reception, Dentist, Billing |
| **Intelligence** | AI Assistant |
| **Administration** | Staff, Notifications, Settings |

Icon map in `sidebar.tsx` maps icon names to Lucide components.

## State Management

SmileOS does **not** use Redux, Zustand, or Context for global state. Instead:

- **Server Components** fetch data directly (no client state needed)
- **Server Actions** handle mutations and call `revalidatePath()` to refresh
- **Client Components** use local `useState` for UI state (form data, dialog open/close)
- **URL state** for filters and navigation
- **`useSession()`** from Better Auth for auth state

## Animation

Framer Motion is available but used sparingly:
- Marketing page scroll animations
- Sidebar collapse/expand transitions
- Dialog open/close animations

## Icons

All icons from `lucide-react`. Mapped in `sidebar.tsx`:
```typescript
const iconMap = {
  LayoutDashboard, Users, Calendar, CalendarDays,
  CreditCard, UserCog, Bell, Settings,
  BellRing, Stethoscope, Sparkles, Brain,
};
```

## Responsive Design

- **Mobile:** Sidebar collapses to icons only, hamburger menu for marketing nav
- **Tablet:** Sidebar expanded, 2-column layouts
- **Desktop:** Full sidebar, multi-column layouts

Tailwind responsive prefixes (`sm:`, `md:`, `lg:`) used throughout.
