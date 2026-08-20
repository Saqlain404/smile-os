# File: src/components/shared/data-table/index.tsx

**Path:** `src/components/shared/data-table/index.tsx`
**Purpose:** Reusable data table with search, sort, pagination, bulk actions, and CSV export

## What It Does
A full-featured DataTable component that accepts columns and data, providing built-in search, sorting, pagination, row selection, bulk actions, and CSV export. Used across Patients, Appointments, Billing, Staff, and Notifications lists.

## Features
- **Search:** Client-side text filtering across all columns
- **Sort:** Click column headers to sort (asc/desc/none)
- **Pagination:** Page size selector (10, 20, 50, 100), page navigation
- **Bulk Actions:** Select all checkbox, individual row selection, bulk action buttons
- **CSV Export:** Download filtered data as CSV file
- **Empty State:** Shows EmptyState component when no data
- **Loading State:** Shows LoadingSkeleton when loading

## Props
- `columns` — Column definitions (header, accessorKey/accessorFn, cell renderer)
- `data` — Array of row data
- `searchKey` — Column key to search by default
- `searchPlaceholder` — Placeholder text for search input
- `onBulkAction` — Callback for bulk actions (delete, export, etc.)
- `bulkActions` — Array of bulk action definitions
- `emptyState` — Custom empty state config

## Related Files
- `src/components/shared/empty-state.tsx` — Empty state display
- `src/components/shared/loading-skeleton.tsx` — Loading states
- Used by: patient-list, appointment-list, invoice-list, staff-list, notification-list
