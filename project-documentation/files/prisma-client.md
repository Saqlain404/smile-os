# File: src/lib/prisma.ts

**Path:** `src/lib/prisma.ts`
**Lines:** 23
**Purpose:** PrismaClient singleton with PrismaPg driver adapter

## What It Does
Creates and caches a single PrismaClient instance. Uses the PrismaPg adapter (required by Prisma 7) to connect to PostgreSQL. Caches in `globalThis` to prevent multiple instances during Next.js hot reload in development.

## Code Breakdown

### Imports (Lines 1-2)
```typescript
import { PrismaClient } from "@/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
```
- `@/generated/prisma` — Custom output path (not default `@prisma/client`)
- `@prisma/adapter-pg` — PostgreSQL driver adapter (Prisma 7 requirement)

### Global Cache (Line 4)
```typescript
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
```
Extends `globalThis` with a `prisma` property. Type assertion needed because TypeScript doesn't know about this custom property.

### Client Factory (Lines 6-17)
```typescript
function createPrismaClient() {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
  });
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development"
      ? ["error", "warn"]
      : ["error"],
  });
}
```
- Creates PrismaPg adapter with connection string
- Passes adapter to PrismaClient (Prisma 7 pattern)
- Logs errors + warnings in dev, errors only in prod

### Export & Cache (Lines 19-23)
```typescript
export const prisma = globalForPrisma.prisma || createPrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```
- Reuse cached instance or create new one
- Only cache in development (production has single instance)

## Why This Pattern
Next.js hot reloads modules in development. Without caching, each reload creates a new PrismaClient, exhausting database connections. `globalThis` persists across reloads.

## Related Files
- `prisma.config.ts` — Provides DATABASE_URL
- `prisma/schema.prisma` — Defines the schema
- `src/generated/prisma/` — Generated client code
