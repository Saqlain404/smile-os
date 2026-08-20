# File: src/lib/permissions.ts

**Path:** `src/lib/permissions.ts`
**Lines:** 65
**Purpose:** Role-Based Access Control (RBAC) — roles, permissions, and checking functions

## What It Does
Defines 4 user roles with specific permission arrays, and provides functions to check if a role has a specific permission.

## Roles & Permissions

### Admin
- `["*"]` — Wildcard, has all permissions

### Dentist
```typescript
[
  "patients:read", "patients:write",
  "appointments:read", "appointments:write",
  "medical_records:read", "medical_records:write",
  "prescriptions:read", "prescriptions:write",
  "treatments:read",
  "billing:read",
  "dashboard:read",
  "staff:read",
]
```

### Receptionist
```typescript
[
  "patients:read", "patients:write",
  "appointments:read", "appointments:write",
  "billing:read", "billing:write",
  "dashboard:read",
  "staff:read",
  "treatments:read",
]
```

### Assistant
```typescript
[
  "patients:read",
  "appointments:read",
  "medical_records:read",
  "treatments:read",
  "dashboard:read",
]
```

## Functions

### `hasPermission(role, permission)`
Returns `true` if the role has the specified permission. Admin always returns `true` (wildcard).

### `hasAnyPermission(role, permissions)`
Returns `true` if the role has at least one of the specified permissions.

## Usage Pattern
```typescript
import { hasPermission, type Role } from "@/lib/permissions";

const userRole: Role = "DENTIST";
if (hasPermission(userRole, "patients:write")) {
  // Allow patient creation
}
```

## Known Gap
**Permissions are defined but NOT enforced.** Server actions do not check permissions before executing. Any authenticated user can perform any action. This needs to be added to all server actions.

## Related Files
- `prisma/schema.prisma` — `UserRole` enum
- `src/server/actions/*.ts` — Should use `hasPermission()` for authorization
