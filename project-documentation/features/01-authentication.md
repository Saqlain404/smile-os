# Feature: Authentication & Authorization

## Overview
Better Auth with email/password + Google OAuth (configured). Role-based access control with 4 roles.

## Files
- `src/lib/auth.ts` — Server config
- `src/lib/auth-client.ts` — Client hooks
- `src/lib/permissions.ts` — RBAC roles/permissions
- `src/app/api/auth/[...all]/route.ts` — API catch-all
- `src/app/login/page.tsx` — Login UI

## Auth Flow
1. User submits email/password on `/login`
2. `signIn.email()` from Better Auth client
3. Validates against `accounts` table (scrypt hash)
4. Session created (7-day expiry, 24h refresh)
5. HTTP-only cookie stores token
6. `useSession()` provides user to components

## Roles & Permissions
| Role | Permissions |
|------|-------------|
| Admin | `*` (all) |
| Dentist | patients:read/write, appointments:read/write, medical_records:read/write, prescriptions:read/write, treatments:read, billing:read, dashboard:read, staff:read |
| Receptionist | patients:read/write, appointments:read/write, billing:read/write, dashboard:read, staff:read, treatments:read |
| Assistant | patients:read, appointments:read, medical_records:read, treatments:read, dashboard:read |

## Demo Credentials
- admin@smileos.com / password123
- sarah@smileos.com / password123
- anna@smileos.com / password123

## Known Gaps
- RBAC permissions defined but not enforced in server actions
- No password reset flow
- No email verification flow
- Google OAuth configured but not tested
