import type { UserRole } from "@/lib/types";

export function mapUserProfile(
  uid: string,
  data: Record<string, unknown>
) {
  return {
    uid,
    displayName: (data.displayName as string) ?? "",
    email: (data.email as string) ?? "",
    role: (data.role as UserRole) ?? "user",
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}
