export const ROLES = {
  ADMIN: {
    label: "Admin",
    permissions: ["*"] as string[],
  },
  DENTIST: {
    label: "Dentist",
    permissions: [
      "patients:read",
      "patients:write",
      "appointments:read",
      "appointments:write",
      "medical_records:read",
      "medical_records:write",
      "prescriptions:read",
      "prescriptions:write",
      "treatments:read",
      "billing:read",
      "dashboard:read",
      "staff:read",
    ],
  },
  RECEPTIONIST: {
    label: "Receptionist",
    permissions: [
      "patients:read",
      "patients:write",
      "appointments:read",
      "appointments:write",
      "billing:read",
      "billing:write",
      "dashboard:read",
      "staff:read",
      "treatments:read",
    ],
  },
  ASSISTANT: {
    label: "Assistant",
    permissions: [
      "patients:read",
      "appointments:read",
      "medical_records:read",
      "treatments:read",
      "dashboard:read",
    ],
  },
} as const;

export type Role = keyof typeof ROLES;
export type Permission = string;

export function hasPermission(role: Role, permission: string): boolean {
  const roleConfig = ROLES[role];
  if (!roleConfig) return false;
  const perms = roleConfig.permissions as readonly string[];
  if (perms.includes("*")) return true;
  return perms.includes(permission);
}

export function hasAnyPermission(
  role: Role,
  permissions: string[]
): boolean {
  return permissions.some((p) => hasPermission(role, p));
}
