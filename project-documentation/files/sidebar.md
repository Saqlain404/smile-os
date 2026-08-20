# File: src/components/layout/sidebar.tsx

**Path:** `src/components/layout/sidebar.tsx`
**Purpose:** Collapsible sidebar navigation with icon mapping

## What It Does
Renders the main navigation sidebar with collapsible/expanded states. Maps icon names from constants to actual Lucide React components. Highlights active route. Supports dark/light mode.

## Key Features
- **Collapsible:** Toggle between expanded (labels visible) and collapsed (icons only)
- **Active route highlighting:** Current path gets highlighted background
- **Icon mapping:** Converts string icon names to Lucide components
- **Responsive:** Adapts to mobile (hamburger menu) and desktop
- **Navigation groups:** Renders 6 groups from NAV_ITEMS

## Icon Map
```typescript
const iconMap = {
  LayoutDashboard, Users, Calendar, CalendarDays,
  CreditCard, UserCog, Bell, Settings,
  BellRing, Stethoscope, Sparkles, Brain,
};
```

## Navigation Structure
Renders `NAV_ITEMS` from constants. Each group has a label and items. Items link to routes and display icons.

## Related Files
- `src/lib/constants.ts` — NAV_ITEMS definition
- `src/components/layout/app-shell.tsx` — Wraps sidebar with topbar
- `src/components/layout/topbar.tsx` — Companion topbar
