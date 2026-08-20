# File: src/components/layout/topbar.tsx

**Path:** `src/components/layout/topbar.tsx`
**Purpose:** Top navigation bar with NotificationCenter dropdown

## What It Does
Renders the top bar with the NotificationCenter component (real-time unread badge, notification dropdown). Shows user info and provides logout functionality.

## Key Features
- **NotificationCenter:** Dropdown with recent notifications, unread count badge
- **Auto-refresh:** Updates notification count every 30 seconds
- **User display:** Shows current user name and role
- **Logout:** Sign out button

## Related Files
- `src/components/notifications/notification-center.tsx` — The actual notification dropdown
- `src/components/layout/app-shell.tsx` — Combines topbar with sidebar
- `src/components/layout/sidebar.tsx` — Companion sidebar
