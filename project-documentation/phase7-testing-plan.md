# Phase 7: Testing & Quality — Implementation Plan

## Objective
Add comprehensive test coverage to SmileOS. The codebase currently has **zero test infrastructure** — no test files, no test dependencies, no test configuration. This phase establishes the foundation and covers the highest-value test targets.

---

## Step 1: Install Test Dependencies

### Framework Choice: **Vitest** (not Jest)
- Vitest is the standard for modern Next.js projects
- Native ESM support (no extra config needed)
- Faster than Jest (especially with TypeScript)
- Compatible with React Testing Library
- Built-in coverage via c8

### Dependencies to Install

```bash
# Unit/Component testing
npm install -D vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom

# E2E testing
npm install -D @playwright/test

# Coverage
npm install -D @vitest/coverage-v8

# Prisma test helpers (optional — mock Prisma instead)
# No testcontainers needed — we'll mock Prisma for unit tests
```

**Total:** 8 new devDependencies

---

## Step 2: Configure Vitest

### Create `vitest.config.ts` at project root

```typescript
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/__tests__/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["src/**/*.ts", "src/**/*.tsx"],
      exclude: ["src/**/*.test.*", "src/**/*.spec.*", "src/generated/**", "src/__tests__/setup.ts"],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

### Create `src/__tests__/setup.ts`

```typescript
import "@testing-library/jest-dom/vitest";
```

### Update `package.json` scripts

```json
{
  "test": "vitest run",
  "test:watch": "vitest",
  "test:coverage": "vitest run --coverage",
  "test:e2e": "playwright test"
}
```

---

## Step 3: Create Test Directory Structure

```
src/
├── __tests__/
│   ├── setup.ts                          # Test setup (jest-dom matchers)
│   ├── lib/
│   │   ├── utils.test.ts                 # cn() utility
│   │   ├── permissions.test.ts           # hasPermission, hasAnyPermission
│   │   └── constants.test.ts             # TIME_SLOTS, DURATIONS, color maps
│   ├── validations/
│   │   └── index.test.ts                 # All Zod schemas
│   ├── server/
│   │   └── actions/
│   │       ├── patient.test.ts           # Patient CRUD
│   │       ├── appointment.test.ts       # Appointment CRUD + conflict detection
│   │       ├── billing.test.ts           # Invoice CRUD + payment logic
│   │       ├── staff.test.ts             # Staff CRUD + department logic
│   │       ├── notifications.test.ts     # Notification CRUD
│   │       └── ai.test.ts               # AI insight generation + diagnosis
│   ├── hooks/
│   │   └── use-debounce.test.ts          # Debounce hook
│   └── components/
│       ├── shared/
│       │   └── data-table.test.ts        # DataTable component
│       └── billing/
│           └── invoice-form.test.ts      # Invoice form calculations
```

---

## Step 4: Write Unit Tests (Priority 1 — Pure Functions)

### 4a. `src/__tests__/lib/permissions.test.ts`
Test `hasPermission()` and `hasAnyPermission()`:
- Admin has all permissions (wildcard `*`)
- Dentist has correct permissions
- Receptionist has correct permissions
- Assistant has correct permissions
- Unknown role returns false
- `hasAnyPermission` returns true if any match
- `hasAnyPermission` returns false if none match

### 4b. `src/__tests__/lib/constants.test.ts`
- `TIME_SLOTS` has 48 entries
- First slot is "00:00", last is "23:30"
- Slots are in 30-minute increments
- `DURATIONS` array is correct
- Status color maps have all expected keys

### 4c. `src/__tests__/lib/utils.test.ts`
- `cn()` merges Tailwind classes correctly
- `cn()` handles conflicts (last wins)
- `cn()` handles conditional classes

### 4d. `src/__tests__/validations/index.test.ts`
Test all 6 Zod schemas:
- **patientSchema:** Valid data passes, missing firstName fails, invalid email fails, default country is "US"
- **appointmentSchema:** Valid data passes, missing patientId fails, duration minimum is 5, default status is "BOOKED"
- **treatmentSchema:** Valid data passes, negative price fails, default duration is 30
- **invoiceSchema:** Valid data passes, empty items fails, discount default is 0
- **loginSchema:** Valid email/password passes, short password fails
- **staffSchema:** Valid data passes, invalid role fails

---

## Step 5: Write Unit Tests (Priority 2 — Server Actions with Mocked Prisma)

### Mocking Strategy

Create `src/__tests__/__mocks__/prisma.ts`:
```typescript
// Mock Prisma client for unit tests
export const mockPrisma = {
  patient: { findMany: vi.fn(), findUnique: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn(), count: vi.fn() },
  appointment: { findMany: vi.fn(), findUnique: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn(), count: vi.fn() },
  invoice: { findMany: vi.fn(), findUnique: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn(), count: vi.fn(), aggregate: vi.fn() },
  // ... etc
};
```

Then mock `@/lib/prisma` in each test file using `vi.mock()`.

### 5a. `src/__tests__/server/actions/billing.test.ts`
Most testable business logic:
- **Invoice number generation:** First invoice → "INV-01001", subsequent → increment
- **Subtotal calculation:** quantity × unitPrice for each item
- **Tax calculation:** subtotal × (taxRate / 100)
- **Discount application:** totalAmount = subtotal + taxAmount - discount
- **Payment overflow validation:** Cannot pay more than remaining balance
- **Auto-status update:** PAID when fully paid, PARTIAL when partially paid
- **Empty clinic handling:** Returns zeros when no clinic found

### 5b. `src/__tests__/server/actions/ai.test.ts`
Rich rule-based logic:
- **Insight generation thresholds:**
  - noShowRate > 15% → HIGH severity RISK insight
  - noShowRate > 10% → MEDIUM severity RISK insight
  - cancelRate > 20% → HIGH severity RISK insight
  - pendingInvoices > 5 → MEDIUM severity REVENUE insight
  - appointmentCompletionRate > 85% → LOW severity OPTIMIZATION insight
- **Diagnosis suggestions:**
  - Patient with allergies → Safety Alert (high priority)
  - Patient with diabetes → Diabetes Management (high priority)
  - Patient with cardiac history → Cardiac History (high priority)
  - Patient over 60 → Age-Related Considerations (low priority)
  - No risk factors → Routine Checkup (low priority)
- **Treatment plan generation:**
  - Cavity diagnosis → Filling recommendation
  - Root canal diagnosis → Root canal recommendation
  - No recent checkup → Checkup recommendation
  - No recent cleaning → Cleaning recommendation

### 5c. `src/__tests__/server/actions/appointment.test.ts`
- Conflict detection logic
- Status color mapping (`getAptColor`)
- Calendar date transformation

### 5d. `src/__tests__/server/actions/staff.test.ts`
- Email uniqueness check
- Employee ID generation
- Department delete guard (staff count check)

### 5e. `src/__tests__/server/actions/patient.test.ts`
- Search filter building
- Tag synchronization
- Stats calculation

---

## Step 6: Write Hook Tests (Priority 3)

### `src/__tests__/hooks/use-debounce.test.ts`
- Returns initial value immediately
- Returns debounced value after delay
- Cleans up timer on unmount
- Updates timer on value change

---

## Step 7: Write Component Tests (Priority 4)

### `src/__tests__/components/shared/data-table.test.ts`
- Renders table with columns and data
- Displays search input
- Handles search input changes
- Handles sort column click
- Handles pagination
- Handles bulk selection
- Shows empty state when no data
- CSV export triggers download

---

## Step 8: Configure Playwright for E2E

### Create `playwright.config.ts`

```typescript
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "e2e",
  timeout: 30000,
  retries: 1,
  use: {
    baseURL: "http://localhost:3000",
    headless: true,
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "chromium", use: { browserName: "chromium" } },
  ],
  webServer: {
    command: "npm run dev",
    port: 3000,
    reuseExistingServer: true,
  },
});
```

### Create `e2e/` directory with critical flow tests

```
e2e/
├── auth.spec.ts          # Login/logout flow
├── patients.spec.ts      # Patient CRUD flow
├── appointments.spec.ts  # Appointment creation flow
└── billing.spec.ts       # Invoice creation flow
```

### `e2e/auth.spec.ts`
- Login with valid credentials → redirects to dashboard
- Login with invalid credentials → shows error
- Logout → redirects to login

### `e2e/patients.spec.ts`
- Navigate to patients page → shows patient list
- Click "Add Patient" → opens form dialog
- Fill form and submit → patient appears in list
- Click patient row → navigates to detail page

---

## Step 9: Coverage Targets

| Category | Target |
|----------|--------|
| Utility functions (cn, permissions, constants) | 100% |
| Zod validation schemas | 100% |
| Server actions (pure logic paths) | 80%+ |
| Custom hooks | 100% |
| Key components (DataTable, forms) | 60%+ |
| E2E critical flows | All happy paths |
| **Overall** | **70%+** |

---

## Step 10: Verification

After all tests are written:

```bash
# Run unit tests
npm run test

# Run with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e

# Run build (ensure tests don't break build)
npm run build
```

**Expected results:**
- All unit tests pass
- Coverage report shows 70%+ overall
- E2E tests pass for critical flows
- Build still succeeds (23 routes, 0 errors)

---

## Files to Create

| File | Type | Tests |
|------|------|-------|
| `vitest.config.ts` | Config | Vitest configuration |
| `playwright.config.ts` | Config | Playwright configuration |
| `src/__tests__/setup.ts` | Setup | Test setup (jest-dom) |
| `src/__tests__/__mocks__/prisma.ts` | Mock | Prisma client mock |
| `src/__tests__/lib/utils.test.ts` | Unit | cn() utility |
| `src/__tests__/lib/permissions.test.ts` | Unit | RBAC functions |
| `src/__tests__/lib/constants.test.ts` | Unit | Constants and color maps |
| `src/__tests__/validations/index.test.ts` | Unit | All 6 Zod schemas |
| `src/__tests__/server/actions/billing.test.ts` | Unit | Billing logic |
| `src/__tests__/server/actions/ai.test.ts` | Unit | AI insight/diagnosis logic |
| `src/__tests__/server/actions/appointment.test.ts` | Unit | Appointment logic |
| `src/__tests__/server/actions/staff.test.ts` | Unit | Staff logic |
| `src/__tests__/server/actions/patient.test.ts` | Unit | Patient logic |
| `src/__tests__/server/actions/notifications.test.ts` | Unit | Notification logic |
| `src/__tests__/hooks/use-debounce.test.ts` | Unit | Debounce hook |
| `src/__tests__/components/shared/data-table.test.ts` | Component | DataTable |
| `e2e/auth.spec.ts` | E2E | Login/logout |
| `e2e/patients.spec.ts` | E2E | Patient CRUD |
| `e2e/appointments.spec.ts` | E2E | Appointment flow |
| `e2e/billing.spec.ts` | E2E | Invoice flow |

**Total:** 20 new files (3 config + 17 test files)

---

## Execution Order

1. Install dependencies (`vitest`, `@testing-library/*`, `playwright`, etc.)
2. Create config files (`vitest.config.ts`, `playwright.config.ts`)
3. Create test setup and mocks
4. Write pure function tests (permissions, constants, utils, validations)
5. Write server action tests (billing, AI, appointments, staff, patient, notifications)
6. Write hook tests
7. Write component tests (DataTable)
8. Write E2E tests (auth, patients, appointments, billing)
9. Run full test suite, fix any failures
10. Generate coverage report
11. Verify build still passes
