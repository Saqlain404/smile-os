# SmileOS — Learning Guide

## For New Developers

This guide helps you understand the SmileOS codebase from scratch. Follow the sections in order.

---

## Step 1: Understand the Domain

SmileOS is a **dental practice management system**. Think of it as the operating system for a dental clinic. It handles:

1. **Patients** — Store patient info, medical history, dental history, insurance, family members
2. **Appointments** — Schedule appointments, manage calendars, detect conflicts, track chairs
3. **Treatments** — Define treatment catalog (cleaning, filling, root canal, etc.) with prices
4. **Billing** — Generate invoices, record payments, track revenue
5. **Staff** — Manage dentists, receptionists, assistants, departments, schedules
6. **Notifications** — Send reminders via email, SMS, WhatsApp, push, in-app
7. **AI** — Get insights, diagnosis suggestions, treatment plans, schedule optimization
8. **Patient Portal** — Let patients view their own data (appointments, invoices, treatments)
9. **Marketing** — Landing page to attract new patients

---

## Step 2: Understand the Tech Stack

| Technology | What It Does | Where to Learn |
|------------|--------------|----------------|
| **Next.js 16** | Full-stack React framework (routing, server components, server actions) | https://nextjs.org/docs |
| **React 19** | UI library | https://react.dev |
| **TypeScript** | Type safety | https://typescriptlang.org |
| **Tailwind CSS 4** | Utility-first styling | https://tailwindcss.com |
| **shadcn/ui 4** | UI component library (NOT Radix) | https://ui.shadcn.com |
| **Prisma 7** | Database ORM | https://prisma.io/docs |
| **PostgreSQL** | Relational database | https://postgresql.org/docs |
| **Better Auth** | Authentication library | https://better-auth.com |
| **Zod** | Schema validation | https://zod.dev |
| **react-hook-form** | Form management | https://react-hook-form.com |
| **Recharts** | Charts | https://recharts.org |
| **FullCalendar** | Calendar widget | https://fullcalendar.io |
| **date-fns** | Date utilities | https://date-fns.org |

---

## Step 3: Understand the Architecture

### Request Flow

```
Browser → Next.js Server → Server Action → Prisma → PostgreSQL
   ↑                                                      ↓
   └──────────────── Revalidate Path ←────────────────────┘
```

1. User clicks button in browser
2. Client component calls a server action (function with `"use server"`)
3. Server action validates input with Zod
4. Server action executes Prisma query
5. After mutation, `revalidatePath()` tells Next.js to refresh the page
6. Next.js re-fetches data and re-renders server components
7. Updated UI sent to browser

### Component Types

- **Server Component** (default) — Runs on server, can access database directly, no interactivity
- **Client Component** (`"use client"`) — Runs in browser, can use `useState`, `useEffect`, event handlers
- **Server Action** (`"use server"`) — Runs on server, called from client components

---

## Step 4: Explore the Codebase

### Start Here

1. **`src/lib/constants.ts`** — See all navigation items and app configuration
2. **`prisma/schema.prisma`** — Understand the data model (30+ tables)
3. **`src/app/(dashboard)/dashboard/page.tsx`** — See how a page fetches data and renders
4. **`src/server/actions/patient.ts`** — See how server actions work (CRUD operations)
5. **`src/components/patients/patient-list.tsx`** — See how a feature component uses DataTable
6. **`src/components/ui/button.tsx`** — See how shadcn/ui components work

### Key Files to Read

| File | What You'll Learn |
|------|-------------------|
| `src/lib/prisma.ts` | How the database client is configured |
| `src/lib/auth.ts` | How authentication works |
| `src/lib/permissions.ts` | How RBAC is implemented |
| `src/lib/validations/index.ts` | How form validation works |
| `src/components/layout/sidebar.tsx` | How navigation works |
| `src/components/layout/app-shell.tsx` | How the app layout is structured |
| `src/components/shared/data-table/index.tsx` | How data tables work |
| `src/components/ai/ai-chatbot.tsx` | How AI features are built |

---

## Step 5: Common Tasks

### Adding a New Page

1. Create `src/app/(dashboard)/new-page/page.tsx`
2. Add navigation item to `src/lib/constants.ts` NAV_ITEMS
3. Add icon to `src/components/layout/sidebar.tsx` iconMap
4. Create server action in `src/server/actions/new-domain.ts`
5. Create components in `src/components/new-domain/`

### Adding a New Server Action

1. Open the relevant `src/server/actions/*.ts` file
2. Add `"use server"` at top (if not already)
3. Define function with Zod validation
4. Execute Prisma query
5. Call `revalidatePath()` after mutations
6. Return `{ success, data }` or `{ success: false, error }`

### Adding a New Form

1. Define Zod schema in `src/lib/validations/index.ts`
2. Create form component with `"use client"`
3. Use `useForm` from react-hook-form with `zodResolver`
4. Add form fields using shadcn/ui components
5. Call server action on submit
6. Show toast with sonner on success/error

### Adding a New Database Model

1. Add model to `prisma/schema.prisma`
2. Run `./node_modules/.bin/prisma generate`
3. Run `./node_modules/.bin/prisma db push`
4. Create server actions in `src/server/actions/`
5. Create UI components in `src/components/`
6. Create page in `src/app/(dashboard)/`

---

## Step 6: Debugging Tips

### Build Fails

```bash
# Check Node version
node --version  # Should be 22.23.1

# Clear cache
rm -rf .next/cache
npm cache clean --force

# Check disk space
df -h

# Try build again
npm run build
```

### Prisma Errors

```bash
# Regenerate client
source ~/.nvm/nvm.sh && nvm use 22.23.1
./node_modules/.bin/prisma generate

# Push schema changes
./node_modules/.bin/prisma db push

# Check database connection
./node_modules/.bin/prisma studio
```

### Auth Errors

- Password must be hashed with scrypt (not SHA-256)
- Re-seed database: `npx tsx prisma/seed.ts`
- Check `.env.local` has correct `BETTER_AUTH_SECRET`
- Check `BETTER_AUTH_URL` matches your dev server

### shadcn/ui Errors

- **No `asChild` prop** — Use `render` prop on DropdownMenuItem
- **`onValueChange` returns `string | null`** — Handle null explicitly
- **TooltipProvider uses `delay`** not `delayDuration`
- **Checkbox is custom** — Pure HTML input, not base-ui

### Database Connection Errors

- Ensure `sslmode=no-verify` in DATABASE_URL
- Check Supabase project is active (not paused)
- Verify DNS resolution: `nslookup db.iptuwixtpzdwscsbzvnd.supabase.co`

---

## Step 7: Project Conventions

### File Naming
- Components: `kebab-case` (patient-list.tsx)
- Server actions: `camelCase` functions in `kebab-case` files
- Pages: `page.tsx` (Next.js convention)
- Types: `PascalCase` interfaces

### Component Structure
```typescript
"use client";  // if needed

import { ... } from "...";

interface ComponentProps {
  // props
}

export function Component({ prop1, prop2 }: ComponentProps) {
  // hooks
  // handlers
  // render
}
```

### Server Action Structure
```typescript
"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { someSchema } from "@/lib/validations";

export async function actionName(data: SomeType) {
  const result = someSchema.safeParse(data);
  if (!result.success) {
    throw new Error("Validation failed");
  }

  try {
    const record = await prisma.model.create({ data: result.data });
    revalidatePath("/some-path");
    return { success: true, data: record };
  } catch (error) {
    console.error("Failed:", error);
    return { success: false, error: "Failed to perform action" };
  }
}
```

### CSS Classes
- Use Tailwind utility classes
- Use `cn()` for conditional classes
- Use CSS variables for theme colors (`bg-primary`, `text-muted-foreground`)
- Use `dark:` prefix for dark mode

---

## Step 8: Architecture Decisions

| Decision | Reason |
|----------|--------|
| Server Actions over REST | Type safety, no manual fetch, automatic caching |
| shadcn/ui over Radix | v4 uses @base-ui/react, better DX, copy-paste components |
| Prisma 7 over Drizzle | Type safety, schema-first, better DX |
| Better Auth over NextAuth | Lighter weight, simpler config, email/password focus |
| Feature-based organization | Easier to find related files, better code splitting |
| No global state management | Server components eliminate most state needs |
| Tailwind over CSS modules | Utility-first, consistent design, faster development |
