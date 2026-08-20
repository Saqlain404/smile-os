# SmileOS — Tech Stack

## Core Framework

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 16.3.1 | Full-stack React framework (App Router, Server Components, Server Actions) |
| **React** | 19.2.8 | UI library |
| **React DOM** | 19.2.8 | DOM rendering |
| **TypeScript** | ^5 | Type safety |

## Styling

| Technology | Version | Purpose |
|------------|---------|---------|
| **Tailwind CSS** | ^4 | Utility-first CSS framework |
| **@tailwindcss/postcss** | ^4 | PostCSS plugin for Tailwind |
| **tw-animate-css** | ^1.4.0 | Animation utilities |
| **tailwind-merge** | ^3.6.0 | Intelligent Tailwind class merging |
| **clsx** | ^2.1.1 | Conditional class names |
| **class-variance-authority** | ^0.7.1 | Component variant management |

**Color system:** `oklch` with CSS variables for dark/light mode.

## UI Components

| Technology | Version | Purpose |
|------------|---------|---------|
| **shadcn/ui** | ^4.18.0 | Component library (base-nova preset, @base-ui/react) |
| **@base-ui/react** | ^1.7.0 | Headless UI primitives (NOT Radix) |
| **lucide-react** | ^1.31.0 | Icon library |
| **cmdk** | ^1.1.1 | Command palette |
| **react-day-picker** | ^10.0.1 | Date picker |
| **framer-motion** | ^13.1.0 | Animations |
| **sonner** | ^2.0.8 | Toast notifications |
| **recharts** | ^3.10.1 | Charts (dashboard, billing stats) |

**Critical note:** shadcn/ui v4 uses `@base-ui/react` (NOT Radix). Key API differences:
- `Button` has **no `asChild`** prop — use `render` prop on `DropdownMenuItem`
- `TooltipProvider` uses `delay` not `delayDuration`
- Form components use standard React patterns

## Database

| Technology | Version | Purpose |
|------------|---------|---------|
| **Prisma** | ^7.9.1 | ORM (schema, migrations, client) |
| **@prisma/client** | ^7.9.1 | Generated Prisma client |
| **@prisma/adapter-pg** | ^7.9.1 | PostgreSQL driver adapter (PrismaPg) |
| **pg** | ^8.23.0 | PostgreSQL client |
| **@types/pg** | ^8.21.0 | TypeScript types for pg |
| **Supabase** | hosted | PostgreSQL database hosting |

**Prisma 7 specifics:**
- Requires `PrismaPg` adapter passed to `PrismaClient` constructor
- `url` not in `schema.prisma` — comes from `prisma.config.ts`
- Generator output: `../src/generated/prisma` (custom path)

## Authentication

| Technology | Version | Purpose |
|------------|---------|---------|
| **better-auth** | ^1.6.29 | Auth library (email/password + social providers) |
| **@better-auth/utils** | (included) | Password hashing (scrypt: `salt:key` format) |

**Auth features:** Email/password login, session management (7-day expiry, 24-hour refresh), Google OAuth (configured but not active), role-based access.

## Forms & Validation

| Technology | Version | Purpose |
|------------|---------|---------|
| **react-hook-form** | ^7.85.0 | Form state management |
| **@hookform/resolvers** | ^5.9.1 | Zod resolver for react-hook-form |
| **zod** | ^4.4.3 | Schema validation |

## Calendar

| Technology | Version | Purpose |
|------------|---------|---------|
| **@fullcalendar/core** | ^6.1.21 | Calendar engine |
| **@fullcalendar/react** | ^6.1.21 | React wrapper |
| **@fullcalendar/daygrid** | ^6.1.21 | Month view plugin |
| **@fullcalendar/timegrid** | ^6.1.21 | Week/day view plugin |
| **@fullcalendar/interaction** | ^6.1.21 | Drag & drop plugin |
| **@fullcalendar/list** | ^6.1.21 | List view plugin |

**Critical:** All FullCalendar packages MUST be the same version (6.1.21). v7 changed architecture and plugins are incompatible.

## Date Handling

| Technology | Version | Purpose |
|------------|---------|---------|
| **date-fns** | ^4.4.0 | Date utility library |

## Tooling

| Technology | Version | Purpose |
|------------|---------|---------|
| **@paralleldrive/cuid2** | ^3.3.0 | Unique ID generation |
| **dotenv** | ^17.4.2 | Environment variable loading |
| **ESLint** | ^9 | Code linting |
| **eslint-config-next** | 16.3.1 | Next.js ESLint rules |

## Monitoring & Analytics

| Technology | Version | Purpose |
|------------|---------|---------|
| **@sentry/nextjs** | ^10.70.0 | Error tracking |
| **posthog-js** | ^1.417.1 | Product analytics |
| **resend** | ^6.20.0 | Email sending (configured but not active) |

## Build & Compilation

| Technology | Version | Purpose |
|------------|---------|---------|
| **babel-plugin-react-compiler** | ^1.0.0 | React Compiler (automatic memoization) |
| **@tailwindcss/postcss** | ^4 | PostCSS integration |

## Dev/Build Scripts

```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "eslint"
}
```

**Install command:** `npm install --legacy-peer-deps --ignore-scripts`

**Node version:** System default is v18.20.3, but Prisma 7.9.1 requires Node 20.19+/22.12+. Use `source ~/.nvm/nvm.sh && nvm use 22.23.1` before prisma commands.
