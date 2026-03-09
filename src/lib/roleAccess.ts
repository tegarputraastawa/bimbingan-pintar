type AppRole = "owner" | "admin" | "tutor";

interface NavItem {
  to: string;
  label: string;
  icon: any;
  roles: AppRole[]; // which roles can see this menu
}

// Check if a role can access a given path
export function canAccess(role: AppRole | null, path: string): boolean {
  if (!role) return false;
  if (role === "owner" || role === "admin") return true;

  // Tutor can only access jadwal (view only) and perkembangan
  const tutorPaths = ["/", "/jadwal", "/perkembangan", "/display"];
  return tutorPaths.some((p) => path === p || path.startsWith(p + "/"));
}

// Check if a role can perform write actions on a given resource
export function canWrite(role: AppRole | null, resource: string): boolean {
  if (!role) return false;
  if (role === "owner" || role === "admin") return true;
  // Tutor cannot write to jadwal, but can write to perkembangan
  if (role === "tutor" && resource === "perkembangan") return true;
  return false;
}

export const ALL_ROLES: AppRole[] = ["owner", "admin", "tutor"];
export const ADMIN_ROLES: AppRole[] = ["owner", "admin"];
