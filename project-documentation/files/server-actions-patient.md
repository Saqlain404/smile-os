# File: src/server/actions/patient.ts

**Path:** `src/server/actions/patient.ts`
**Purpose:** Patient CRUD operations, tags, family members, insurance, and statistics

## What It Contains
13 server actions for managing patients and related data. All actions use Prisma for database operations and include input validation with Zod.

## Server Actions

### `getPatients(params)`
List patients with search, sort, pagination. Searches across firstName, lastName, email, phone. Includes tags and insurance relations.

### `getPatient(id)`
Get single patient with all relations (appointments, invoices, treatments, prescriptions, insurance, family, tags, medicalRecords, documents, consultationHistory).

### `createPatient(data)`
Validate with patientSchema, create patient with tags. Returns created patient.

### `updatePatient(id, data)`
Validate, update patient. Handles tag synchronization (delete old, create new).

### `deletePatient(id)`
Soft delete — sets `isActive: false`. Does not actually delete the record.

### `getPatientTags(patientId)`
Get all tags for a patient.

### `addPatientTag(patientId, name, color)`
Add a tag to a patient. Validates unique constraint.

### `removePatientTag(tagId)`
Remove a tag.

### `getPatientFamilyMembers(patientId)`
Get all family members.

### `addFamilyMember(patientId, data)`
Add a family member.

### `updateFamilyMember(id, data)`
Update a family member.

### `removeFamilyMember(id)`
Remove a family member.

### `getPatientInsurance(patientId)`
Get insurance info.

### `upsertInsurance(patientId, data)`
Create or update insurance (one per patient).

### `getPatientStats(clinicId)`
Get patient statistics (total, active, new this month, by gender).

## Patterns Used
- Zod validation before mutations
- `revalidatePath()` after mutations
- Try/catch with error logging
- Return `{ success, data }` or `{ success: false, error }`

## Related Files
- `src/lib/validations/index.ts` — patientSchema
- `src/components/patients/` — UI components
- `src/app/(dashboard)/patients/` — Pages
