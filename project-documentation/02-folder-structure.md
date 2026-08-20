# SmileOS — Folder Structure

```
smile-os/
├── .env                          # Environment variables (unencoded DB URL, overridden by .env.local)
├── .env.local                    # Environment variables (encoded DB URL with sslmode=no-verify, auth secrets)
├── .gitignore
├── .next/                        # Next.js build output (auto-generated)
├── .opencode/                    # OpenCode AI agent config
│   └── config.json
├── AGENTS.md                     # AI agent rules (Next.js breaking changes notice)
├── next-env.d.ts
├── next.config.ts                # Next.js config (React Compiler, instrumentation)
├── package.json                  # Dependencies and scripts
├── package-lock.json
├── postcss.config.mjs            # PostCSS config (Tailwind v4 plugin)
├── prisma/
│   ├── schema.prisma             # Database schema (30+ models, 12 enums)
│   ├── seed.ts                   # Database seeder (clinics, departments, staff, patients, appointments, billing, AI)
│   └── migrations/               # (empty — using `prisma db push`)
├── prisma.config.ts              # Prisma 7 config (DATABASE_URL from env, dotenv)
├── README.md
├── tailwind.config.ts            # Tailwind config (content paths, theme extensions)
├── tsconfig.json                 # TypeScript config (paths, strict mode)
├── next.config.ts
├── instrumentation.ts            # Sentry instrumentation
│
├── project-documentation/        # This documentation directory
│   ├── 01-project-overview.md
│   ├── 02-folder-structure.md
│   ├── 03-architecture.md
│   ├── 04-tech-stack.md
│   ├── 05-environment-setup.md
│   ├── 06-frontend.md
│   ├── 07-backend.md
│   ├── 08-database.md
│   ├── 09-code-walkthrough.md
│   ├── 10-learning-guide.md
│   ├── 11-improvements.md
│   ├── features/
│   └── files/
│
└── src/
    ├── app/                      # Next.js App Router pages
    │   ├── page.tsx              # Marketing landing page (/)
    │   ├── layout.tsx            # Root layout (Toaster, metadata, fonts)
    │   ├── not-found.tsx         # 404 page
    │   ├── login/
    │   │   └── page.tsx          # Login page
    │   ├── api/
    │   │   └── auth/
    │   │       └── [...all]/
    │   │           └── route.ts  # Better Auth API catch-all
    │   │
    │   ├── (dashboard)/          # Dashboard route group (AppShell layout)
    │   │   ├── layout.tsx        # Dashboard layout (AppShell wrapper)
    │   │   ├── dashboard/
    │   │   │   └── page.tsx      # Dashboard page (stats cards, charts, recent activity)
    │   │   ├── patients/
    │   │   │   ├── page.tsx              # Patient list page
    │   │   │   └── [id]/
    │   │   │       └── page.tsx          # Patient detail page (7 tabs)
    │   │   ├── appointments/
    │   │   │   └── page.tsx      # Appointment list page
    │   │   ├── calendar/
    │   │   │   └── page.tsx      # Calendar view (FullCalendar)
    │   │   ├── billing/
    │   │   │   ├── page.tsx              # Billing overview/stats
    │   │   │   └── invoices/
    │   │   │       ├── page.tsx          # Invoice list
    │   │   │       └── [id]/
    │   │   │           └── page.tsx      # Invoice detail
    │   │   ├── staff/
    │   │   │   ├── page.tsx              # Staff list
    │   │   │   └── [id]/
    │   │   │       └── page.tsx          # Staff detail
    │   │   ├── notifications/
    │   │   │   └── page.tsx      # Notifications list page
    │   │   ├── reception/
    │   │   │   └── page.tsx      # Reception desk (placeholder)
    │   │   ├── dentist/
    │   │   │   └── page.tsx      # Dentist view (placeholder)
    │   │   ├── settings/
    │   │   │   └── page.tsx      # Settings (placeholder)
    │   │   └── ai/
    │   │       ├── page.tsx              # AI Dashboard (stats, tabbed sections, insights)
    │   │       └── chat/
    │   │           └── page.tsx          # AI Chat page
    │   │
    │   └── portal/               # Patient Portal route group (separate layout)
    │       ├── layout.tsx        # Portal layout (own sidebar + topbar)
    │       ├── dashboard/
    │       │   └── page.tsx      # Portal dashboard (stats cards, recent appointments/invoices)
    │       ├── appointments/
    │       │   └── page.tsx      # Patient's appointments list
    │       ├── invoices/
    │       │   └── page.tsx      # Patient's invoices list
    │       ├── treatments/
    │       │   └── page.tsx      # Patient's treatments (tabbed: Consultations + Prescriptions)
    │       └── profile/
    │           └── page.tsx      # Patient profile (view + edit)
    │
    ├── components/
    │   ├── ui/                   # shadcn/ui components (24 files)
    │   │   ├── accordion.tsx
    │   │   ├── alert-dialog.tsx
    │   │   ├── alert.tsx
    │   │   ├── badge.tsx
    │   │   ├── breadcrumb.tsx
    │   │   ├── button.tsx
    │   │   ├── card.tsx
    │   │   ├── chart.tsx
    │   │   ├── checkbox.tsx       # Custom checkbox (NOT base-ui, pure HTML input)
    │   │   ├── command.tsx
    │   │   ├── date-picker.tsx
    │   │   ├── dialog.tsx
    │   │   ├── dropdown-menu.tsx
    │   │   ├── form.tsx
    │   │   ├── input.tsx
    │   │   ├── label.tsx
    │   │   ├── popover.tsx
    │   │   ├── select.tsx
    │   │   ├── separator.tsx
    │   │   ├── skeleton.tsx
    │   │   ├── table.tsx
    │   │   ├── tabs.tsx
    │   │   ├── textarea.tsx
    │   │   ├── tooltip.tsx
    │   │   └── avatar.tsx
    │   │
    │   ├── layout/               # Layout components
    │   │   ├── sidebar.tsx       # Collapsible sidebar (iconMap with Sparkles/Brain)
    │   │   ├── topbar.tsx        # Top bar (NotificationCenter dropdown)
    │   │   ├── app-shell.tsx     # AppShell (sidebar + topbar + main content)
    │   │   └── page-header.tsx   # PageHeader (title, description, actions — NO icon prop)
    │   │
    │   ├── shared/               # Reusable shared components
    │   │   ├── empty-state.tsx   # EmptyState (icon, title, description, action)
    │   │   ├── error-state.tsx   # ErrorState (error display, retry)
    │   │   ├── loading-skeleton.tsx  # LoadingSkeleton variants
    │   │   └── data-table/
    │   │       └── index.tsx     # DataTable (search, sort, pagination, bulk actions, CSV export)
    │   │
    │   ├── patients/             # Patient feature components
    │   │   ├── patient-list.tsx
    │   │   ├── patient-form-dialog.tsx
    │   │   └── patient-detail.tsx
    │   │
    │   ├── appointments/         # Appointment feature components
    │   │   ├── appointment-list.tsx
    │   │   ├── appointment-form-dialog.tsx
    │   │   └── calendar-view.tsx  # FullCalendar v6.1.21
    │   │
    │   ├── billing/              # Billing feature components
    │   │   ├── invoice-list.tsx
    │   │   ├── invoice-form-dialog.tsx
    │   │   └── payment-form-dialog.tsx
    │   │
    │   ├── staff/                # Staff feature components
    │   │   ├── staff-list.tsx
    │   │   └── staff-form-dialog.tsx
    │   │
    │   ├── notifications/        # Notification feature components
    │   │   ├── notification-center.tsx  # Topbar dropdown (real-time unread badge, auto-refresh 30s)
    │   │   └── notification-list.tsx    # Full page (type/status filters, bulk actions)
    │   │
    │   ├── patient-portal/       # Patient portal components
    │   │   ├── patient-sidebar.tsx
    │   │   └── patient-topbar.tsx
    │   │
    │   ├── ai/                   # AI feature components
    │   │   ├── ai-chatbot.tsx           # Conversational chatbot UI
    │   │   ├── ai-insights-panel.tsx    # Insights list (type/severity filters, mark read)
    │   │   ├── ai-diagnosis-panel.tsx   # AI diagnosis suggestions
    │   │   ├── ai-treatment-plan-panel.tsx  # AI treatment plan generation
    │   │   └── ai-schedule-panel.tsx    # AI schedule optimization
    │   │
    │   └── marketing/            # Marketing website components
    │       ├── marketing-nav.tsx # Sticky nav with mobile hamburger
    │       └── marketing-footer.tsx  # 4-column footer, HIPAA/SOC2 badges
    │
    ├── lib/                      # Shared libraries and utilities
    │   ├── prisma.ts             # PrismaClient singleton (PrismaPg adapter)
    │   ├── auth.ts               # Better Auth server config (prismaAdapter, emailPassword)
    │   ├── auth-client.ts        # Better Auth client (signIn, signUp, signOut, useSession)
    │   ├── permissions.ts        # RBAC: ROLES config, hasPermission, hasAnyPermission
    │   ├── constants.ts          # APP_NAME, NAV_ITEMS (6 groups), status colors, TIME_SLOTS, DURATIONS
    │   ├── validations/
    │   │   └── index.ts          # Zod schemas (patient, appointment, treatment, invoice, login, staff)
    │   └── utils.ts              # cn() helper (clsx + tailwind-merge)
    │
    ├── types/
    │   └── index.ts              # TypeScript types/interfaces
    │
    ├── hooks/
    │   └── use-debounce.ts       # Debounce hook
    │
    ├── server/
    │   └── actions/              # Server actions (all data mutations)
    │       ├── patient.ts        # Patient CRUD + tags + family + insurance + stats
    │       ├── appointment.ts    # Appointment CRUD, calendar, conflict detection
    │       ├── billing.ts        # Invoice CRUD, payments, billing stats
    │       ├── staff.ts          # Staff CRUD, departments, stats
    │       ├── notifications.ts  # Notification CRUD, mark read, archive, stats
    │       ├── patient-portal.ts # Patient portal data
    │       └── ai.ts             # AI insights, diagnosis, treatment, schedule, chatbot, global stats
    │
    └── generated/
        └── prisma/               # Auto-generated Prisma client (DO NOT EDIT)
            ├── client.js
            ├── client.d.ts
            └── ...
```

## Key Directories Explained

### `src/app/`
Next.js App Router. Routes are file-system based. Route groups `(dashboard)` and `portal` provide separate layouts without affecting the URL path.

### `src/components/`
All React components organized by feature domain. `ui/` contains the design system primitives (shadcn/ui). `layout/` contains the app shell (sidebar, topbar). Feature-specific components (patients, appointments, billing, etc.) contain the domain UI.

### `src/lib/`
Shared utilities, configurations, and singletons. This is where the Prisma client, auth setup, permissions, constants, and Zod schemas live.

### `src/server/actions/`
All server-side data mutations. These are Next.js Server Actions — functions that run on the server and are called directly from client components. No separate REST API routes.

### `prisma/`
Database schema (`schema.prisma`), seeder (`seed.ts`), and Prisma config (`prisma.config.ts`). The generated client lives in `src/generated/prisma/`.

### `project-documentation/`
Engineering-grade documentation for the entire project. This is what you're reading now.
