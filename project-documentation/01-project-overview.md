# SmileOS — Project Overview

## What is SmileOS?

SmileOS is a **production-quality Dental Practice Management SaaS platform**. It is the operating system for modern dental practices, providing a full-stack web application that handles every aspect of running a dental clinic — from patient management and appointment scheduling to billing, staff administration, notifications, and AI-powered insights.

## Domain

Dental practice management. The platform is designed for dental clinics that need:
- A centralized patient CRM with full medical/dental history
- Appointment scheduling with calendar views, chair management, and conflict detection
- Invoice generation, payment tracking, and billing statistics
- Staff management with departments, schedules, attendance, and leave tracking
- Multi-channel notifications (email, SMS, WhatsApp, push, in-app)
- A patient-facing portal for self-service (viewing appointments, invoices, treatments, profile)
- An AI assistant for diagnosis suggestions, treatment planning, schedule optimization, and a conversational chatbot
- A marketing website (landing page) to attract new patients

## Target Users

| Role | Description |
|------|-------------|
| **Admin** | Full system access. Manages staff, clinics, settings, billing, and AI features. |
| **Dentist** | Views patients, manages appointments, writes prescriptions, views medical records. |
| **Receptionist** | Manages patient intake, appointments, billing, and front-desk operations. |
| **Assistant** | Read-only access to patients, appointments, medical records, and treatments. |
| **Patient** | Uses the patient portal to view their own appointments, invoices, treatments, and profile. |

## Current State

The project is **actively under development** with 6 major phases completed:

| Phase | Status | What was built |
|-------|--------|----------------|
| Phase 0 — Foundation | ✅ Complete | Next.js 16, Tailwind v4, shadcn/ui (24 components), Prisma 7 schema (30+ models), Better Auth, RBAC, dashboard, login, 404, seed data |
| Phase 1 — Patient CRM | ✅ Complete | Patient list, create/edit form, detail page (7 tabs), DataTable with search/sort/pagination/bulk actions/CSV export |
| Phase 2 — Appointment System | ✅ Complete | Appointment list, create/edit form, calendar view (FullCalendar v6.1.21), conflict detection, drag-and-drop |
| Phase 3a — Marketing Website | ✅ Complete | Landing page, MarketingNav (sticky, mobile), MarketingFooter (4-column, HIPAA/SOC2), Hero/Features/Pricing/Testimonials |
| Phase 3b — Billing Module | ✅ Complete | Invoice list/form/payment dialogs, billing stats, full CRUD with line items and payments |
| Phase 3c — Staff Management | ✅ Complete | Staff list/form dialogs, department management, stats dashboard |
| Phase 4 — Notifications | ✅ Complete | NotificationCenter in Topbar, NotificationList page with filters/bulk actions, mark read/archive, auto-refresh |
| Phase 5 — Patient Portal | ✅ Complete | Separate route group (`/portal/`), own layout/sidebar/topbar, dashboard, appointments, invoices, treatments (tabbed), profile |
| Phase 6 — AI Features | ✅ Complete | Database models (AIConversation, AIMessage, AIInsight), server actions, 5 UI components, AI dashboard page, AI chat page, Intelligence nav group |
| Phase 7 — Testing | ⏳ Pending | |
| Phase 8 — Deployment | ⏳ Pending | |

## Build Status

- **Routes:** 23
- **Build errors:** 0
- **Prisma models:** 30+
- **Database tables:** 35+ (including AI models)
- **UI components:** 24 shadcn/ui + 5 custom shared components + 20+ feature-specific components
- **Server action files:** 6 (patient, appointment, billing, staff, notifications, AI)

## Key Architectural Decisions

1. **Next.js 16 App Router** — File-based routing with route groups, layouts, and server components
2. **Prisma 7 + PostgreSQL (Supabase)** — Type-safe ORM with driver adapter (PrismaPg), hosted on Supabase
3. **Better Auth** — Lightweight, extensible auth library with email/password + social providers
4. **shadcn/ui v4 (base-nova, @base-ui/react)** — NOT Radix. Uses `render` prop instead of `asChild`
5. **Server Actions** — All data mutations via Next.js server actions (no separate API routes for CRUD)
6. **Tailwind CSS v4** — Utility-first styling with `oklch` color system, CSS variables for dark/light mode
7. **TypeScript throughout** — Full type safety from database schema to UI components

## Links

- **Repository:** Not yet on GitHub (local development)
- **Staging/Production:** Not deployed yet
- **Database:** Supabase PostgreSQL (`db.iptuwixtpzdwscsbzvnd.supabase.co`)
