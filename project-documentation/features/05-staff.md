# Feature: Staff Management

## Overview
Staff CRUD with departments, schedules, attendance, and leave tracking. Stats dashboard.

## Files
- `src/server/actions/staff.ts` — 10 server actions
- `src/components/staff/staff-list.tsx` — Staff list with DataTable
- `src/components/staff/staff-form-dialog.tsx` — Create/edit form
- `src/app/(dashboard)/staff/page.tsx` — Staff list page
- `src/app/(dashboard)/staff/[id]/page.tsx` — Staff detail page

## Staff Fields
- **Core:** userId (unique), employeeId (unique), phone, specialization, licenseNumber, bio, avatar
- **Employment:** departmentId, joinDate, isActive, salary
- **Relations:** User (auth), Department, Consultation[], StaffSchedule[], Attendance[], Leave[], Appointment[]

## Critical: No clinicId on Staff
Staff links to Clinic via `Department.clinicId`. All staff queries filter by `department.clinicId`.

## Departments
Predefined: General Dentistry, Orthodontics, Pediatric Dentistry, Oral Surgery, Endodontics

## Server Actions
| Action | Purpose |
|--------|---------|
| `getStaff` | List with filters (department, role, status) |
| `getStaffMember` | Single staff with relations |
| `createStaff` | Create staff + user account |
| `updateStaff` | Update staff info |
| `deleteStaff` | Deactivate staff |
| `getDepartments` | List departments |
| `createDepartment` | Create department |
| `updateDepartment` | Update department |
| `deleteDepartment` | Delete department |
| `getStaffStats` | Staff statistics |

## Staff Detail Page
- Personal info
- Department and role
- Schedule (weekly)
- Attendance history
- Leave history
- Assigned appointments

## Known Gaps
- No shift scheduling UI
- No attendance clock-in/out
- No leave approval workflow
- No performance reviews
- No payroll integration
