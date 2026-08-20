import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { hasPermission, type Role } from "@/lib/permissions";

export async function requireSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function requirePermission(permission: string) {
  const session = await requireSession();
  const role = (session.user as Record<string, unknown>).role as Role;
  if (!hasPermission(role, permission)) {
    throw new Error("Forbidden: insufficient permissions");
  }
  return session;
}

export async function getOptionalSession() {
  try {
    return await auth.api.getSession({
      headers: await headers(),
    });
  } catch {
    return null;
  }
}
