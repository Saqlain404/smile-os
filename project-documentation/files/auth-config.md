# File: src/lib/auth.ts

**Path:** `src/lib/auth.ts`
**Lines:** 25
**Purpose:** Better Auth server configuration

## What It Does
Configures Better Auth with Prisma adapter, email/password authentication, Google OAuth (configured), and session management.

## Code Breakdown

### Imports (Lines 1-3)
```typescript
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/lib/prisma";
```

### Auth Config (Lines 5-23)
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

### Session Type Export (Line 25)
```typescript
export type Session = typeof auth.$Infer.Session;
```
Inferred session type for use throughout the app.

## Configuration Details

### Database
Uses Prisma adapter with PostgreSQL provider. Maps Better Auth's internal tables to the `users`, `sessions`, `accounts`, `verifications` tables in the schema.

### Email/Password
Enabled. Passwords hashed with scrypt (via `@better-auth/utils/password`). Format: `salt:key`.

### Google OAuth
Configured but credentials may be empty strings. Requires `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` environment variables.

### Sessions
- **Expiry:** 7 days (604800 seconds)
- **Refresh:** Every 24 hours (86400 seconds)
- Stored in HTTP-only cookies

### Trusted Origins
Only `http://localhost:3000` for development. Must add production domain for deployment.

## Related Files
- `src/lib/auth-client.ts` — Client-side auth hooks
- `src/app/api/auth/[...all]/route.ts` — API catch-all route
- `src/lib/prisma.ts` — Database client
- `prisma/schema.prisma` — User/Session/Account models
