# Feature: Dashboard

## Overview
Main dashboard showing key metrics, charts, and recent activity. Entry point after login.

## Files
- `src/app/(dashboard)/dashboard/page.tsx` — Dashboard page

## Dashboard Components

### Stats Cards
- Total Patients
- Today's Appointments
- Revenue (monthly)
- Pending Invoices

### Charts (Recharts)
- Revenue trend (line chart)
- Appointments by status (bar chart)
- Patient demographics (pie chart)

### Recent Activity
- Recent appointments
- Recent patients
- Recent payments

## Data Sources
All data fetched server-side:
- `prisma.patient.count()`
- `prisma.appointment.aggregate()` for today
- `prisma.invoice.aggregate()` for revenue
- `prisma.appointment.groupBy()` for status distribution

## Known Gaps
- No date range selector
- No export functionality
- No customizable widgets
- No real-time updates
