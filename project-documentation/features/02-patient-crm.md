# Feature: Patient CRM

## Overview
Full patient management with create, read, update, delete operations. Patient detail page with 7 tabs. Tags, family members, insurance management.

## Files
- `src/server/actions/patient.ts` — 13 server actions
- `src/components/patients/patient-list.tsx` — Patient list with DataTable
- `src/components/patients/patient-form-dialog.tsx` — Create/edit form
- `src/components/patients/patient-detail.tsx` — Detail page (7 tabs)
- `src/app/(dashboard)/patients/page.tsx` — List page
- `src/app/(dashboard)/patients/[id]/page.tsx` — Detail page
- `src/lib/validations/index.ts` — patientSchema

## Patient Fields
- **Personal:** firstName, lastName, email, phone, dateOfBirth, gender
- **Address:** address, city, state, zipCode, country
- **Medical:** bloodGroup, allergies, medicalHistory, dentalHistory
- **Emergency:** emergencyContact, emergencyPhone
- **Other:** referredBy, notes, isActive, avatar

## Server Actions
| Action | Purpose |
|--------|---------|
| `getPatients` | List with search, sort, pagination |
| `getPatient` | Single patient with relations |
| `createPatient` | Create new patient |
| `updatePatient` | Update existing patient |
| `deletePatient` | Soft delete (set isActive=false) |
| `getPatientTags` | Get patient's tags |
| `addPatientTag` | Add tag to patient |
| `removePatientTag` | Remove tag |
| `getPatientFamilyMembers` | Get family members |
| `addFamilyMember` | Add family member |
| `updateFamilyMember` | Update family member |
| `removeFamilyMember` | Remove family member |
| `getPatientInsurance` | Get insurance info |
| `upsertInsurance` | Create or update insurance |
| `getPatientStats` | Patient statistics |

## Detail Page Tabs
1. **Overview** — Stats, recent activity, quick actions
2. **Appointments** — Appointment history
3. **Treatments** — Treatment history
4. **Prescriptions** — Prescription history
5. **Billing** — Invoice history
6. **Insurance** — Insurance details
7. **Family** — Family members

## Data Table Features
- Search by name, email, phone
- Sort by any column
- Pagination with page size selector
- Bulk selection and actions
- CSV export
- Status badges (active/inactive)
- Tag display with colors
