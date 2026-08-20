# Feature: Billing & Invoicing

## Overview
Invoice generation, payment tracking, billing statistics. Dynamic line items with quick-add from treatment catalog.

## Files
- `src/server/actions/billing.ts` — 7 server actions
- `src/components/billing/invoice-list.tsx` — Invoice list with DataTable
- `src/components/billing/invoice-form-dialog.tsx` — Create/edit with line items
- `src/components/billing/payment-form-dialog.tsx` — Record payment
- `src/app/(dashboard)/billing/page.tsx` — Billing overview/stats
- `src/app/(dashboard)/billing/invoices/page.tsx` — Invoice list page
- `src/app/(dashboard)/billing/invoices/[id]/page.tsx` — Invoice detail page

## Invoice Fields
- **Core:** invoiceNumber (unique), date, dueDate, status
- **Amounts:** subtotal, taxAmount, discount, totalAmount
- **Relations:** patientId, clinicId
- **Items:** InvoiceItem[] (description, quantity, unitPrice, total)
- **Payments:** Payment[] (amount, method, status, reference, paidAt)

## Payment Methods
CASH, CARD, ONLINE, INSURANCE, BANK_TRANSFER

## Payment Status
PENDING, PAID, PARTIAL, REFUNDED, CANCELLED

## Server Actions
| Action | Purpose |
|--------|---------|
| `getInvoices` | List with filters (status, patient, date range) |
| `getInvoice` | Single invoice with items and payments |
| `createInvoice` | Create with line items |
| `updateInvoice` | Update invoice and items |
| `deleteInvoice` | Delete invoice |
| `recordPayment` | Record a payment against invoice |
| `getBillingStats` | Revenue stats (total, pending, paid, overdue) |

## Invoice Form Features
- Dynamic line items (add/remove)
- Quick-add from treatment catalog (auto-fills price)
- Tax rate calculation
- Discount amount
- Auto-calculated totals
- Patient selector

## Billing Stats
- Total revenue
- Pending amount
- Paid amount
- Overdue amount
- Revenue by month (chart)

## Known Gaps
- No invoice PDF generation
- No invoice numbering customization
- No recurring invoices
- No refund workflow (REFUNDED status exists but no UI)
- No insurance claim integration
