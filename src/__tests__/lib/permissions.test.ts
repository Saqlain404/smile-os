import { describe, it, expect } from "vitest";
import { hasPermission, hasAnyPermission, ROLES, type Role } from "@/lib/permissions";

describe("ROLES", () => {
  it("should define 4 roles", () => {
    expect(Object.keys(ROLES)).toHaveLength(4);
    expect(ROLES.ADMIN).toBeDefined();
    expect(ROLES.DENTIST).toBeDefined();
    expect(ROLES.RECEPTIONIST).toBeDefined();
    expect(ROLES.ASSISTANT).toBeDefined();
  });

  it("ADMIN should have wildcard permission", () => {
    expect(ROLES.ADMIN.permissions).toContain("*");
  });

  it("DENTIST should have clinical permissions", () => {
    expect(ROLES.DENTIST.permissions).toContain("patients:read");
    expect(ROLES.DENTIST.permissions).toContain("patients:write");
    expect(ROLES.DENTIST.permissions).toContain("appointments:read");
    expect(ROLES.DENTIST.permissions).toContain("appointments:write");
    expect(ROLES.DENTIST.permissions).toContain("medical_records:read");
    expect(ROLES.DENTIST.permissions).toContain("medical_records:write");
    expect(ROLES.DENTIST.permissions).toContain("prescriptions:read");
    expect(ROLES.DENTIST.permissions).toContain("prescriptions:write");
  });

  it("RECEPTIONIST should have front desk permissions", () => {
    expect(ROLES.RECEPTIONIST.permissions).toContain("patients:read");
    expect(ROLES.RECEPTIONIST.permissions).toContain("patients:write");
    expect(ROLES.RECEPTIONIST.permissions).toContain("billing:read");
    expect(ROLES.RECEPTIONIST.permissions).toContain("billing:write");
  });

  it("ASSISTANT should have read-only permissions", () => {
    expect(ROLES.ASSISTANT.permissions).toContain("patients:read");
    expect(ROLES.ASSISTANT.permissions).toContain("appointments:read");
    expect(ROLES.ASSISTANT.permissions).not.toContain("patients:write");
    expect(ROLES.ASSISTANT.permissions).not.toContain("billing:write");
  });
});

describe("hasPermission", () => {
  it("should return true for admin with any permission", () => {
    expect(hasPermission("ADMIN", "patients:read")).toBe(true);
    expect(hasPermission("ADMIN", "patients:write")).toBe(true);
    expect(hasPermission("ADMIN", "billing:write")).toBe(true);
    expect(hasPermission("ADMIN", "nonexistent:permission")).toBe(true);
  });

  it("should return true for dentist with matching permission", () => {
    expect(hasPermission("DENTIST", "patients:read")).toBe(true);
    expect(hasPermission("DENTIST", "patients:write")).toBe(true);
    expect(hasPermission("DENTIST", "appointments:read")).toBe(true);
  });

  it("should return false for dentist with non-matching permission", () => {
    expect(hasPermission("DENTIST", "billing:write")).toBe(false);
    expect(hasPermission("DENTIST", "staff:write")).toBe(false);
  });

  it("should return true for receptionist with billing permissions", () => {
    expect(hasPermission("RECEPTIONIST", "billing:read")).toBe(true);
    expect(hasPermission("RECEPTIONIST", "billing:write")).toBe(true);
  });

  it("should return false for receptionist with medical record permissions", () => {
    expect(hasPermission("RECEPTIONIST", "medical_records:read")).toBe(false);
    expect(hasPermission("RECEPTIONIST", "medical_records:write")).toBe(false);
  });

  it("should return false for assistant with write permissions", () => {
    expect(hasPermission("ASSISTANT", "patients:write")).toBe(false);
    expect(hasPermission("ASSISTANT", "appointments:write")).toBe(false);
    expect(hasPermission("ASSISTANT", "billing:write")).toBe(false);
  });

  it("should return true for assistant with read permissions", () => {
    expect(hasPermission("ASSISTANT", "patients:read")).toBe(true);
    expect(hasPermission("ASSISTANT", "appointments:read")).toBe(true);
    expect(hasPermission("ASSISTANT", "medical_records:read")).toBe(true);
  });

  it("should return false for unknown role", () => {
    expect(hasPermission("UNKNOWN" as Role, "patients:read")).toBe(false);
  });

  it("should return false for empty permission", () => {
    expect(hasPermission("DENTIST", "")).toBe(false);
  });
});

describe("hasAnyPermission", () => {
  it("should return true if role has at least one permission", () => {
    expect(hasAnyPermission("DENTIST", ["patients:read", "billing:write"])).toBe(true);
    expect(hasAnyPermission("RECEPTIONIST", ["nonexistent", "billing:read"])).toBe(true);
  });

  it("should return false if role has none of the permissions", () => {
    expect(hasAnyPermission("ASSISTANT", ["billing:write", "staff:write"])).toBe(false);
  });

  it("should return true for admin with any permissions", () => {
    expect(hasAnyPermission("ADMIN", ["nonexistent:perm"])).toBe(true);
  });

  it("should return false for unknown role", () => {
    expect(hasAnyPermission("UNKNOWN" as Role, ["patients:read"])).toBe(false);
  });

  it("should return false for empty permissions array", () => {
    expect(hasAnyPermission("DENTIST", [])).toBe(false);
  });
});
