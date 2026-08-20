# Feature: Notifications

## Overview
Multi-channel notification system with in-app notifications, read/unread tracking, archive, and bulk actions.

## Files
- `src/server/actions/notifications.ts` — 9 server actions
- `src/components/notifications/notification-center.tsx` — Topbar dropdown
- `src/components/notifications/notification-list.tsx` — Full page list
- `src/app/(dashboard)/notifications/page.tsx` — Notifications page

## Notification Fields
- **Core:** userId, title, message, type, status, link, metadata
- **Type:** EMAIL, SMS, WHATSAPP, PUSH, IN_APP
- **Status:** UNREAD, READ, ARCHIVED

## Server Actions
| Action | Purpose |
|--------|---------|
| `getNotifications` | List with filters (type, status) |
| `getUnreadCount` | Count unread notifications |
| `getRecentNotifications` | Top 10 for dropdown |
| `markAsRead` | Mark single as read |
| `markAllAsRead` | Mark all as read |
| `archiveNotification` | Archive notification |
| `deleteNotification` | Delete notification |
| `createNotification` | Create new notification |
| `getNotificationStats` | Stats (total, unread, by type) |

## NotificationCenter Features
- Real-time unread badge (auto-refreshes every 30 seconds)
- Recent notifications dropdown
- Mark as read on click
- Mark all as read button
- Link to full notifications page

## NotificationList Features
- Type filter (EMAIL, SMS, WHATSAPP, PUSH, IN_APP)
- Status filter (UNREAD, READ, ARCHIVED)
- Select all checkbox
- Bulk actions (mark read, archive, delete)
- Pagination
- Status badges with colors

## Known Gaps
- No actual email/SMS/push sending (only in-app)
- No notification preferences per user
- No notification templates
- No scheduled notifications
- No real-time updates (polling-based)
