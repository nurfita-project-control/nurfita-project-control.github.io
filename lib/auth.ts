export type RoleLevel = 1 | 2 | 3 | 4 | 5;

export type UserProfile = {
  id: string;
  email: string;
  full_name: string;
  role_level: RoleLevel;
  active: boolean;
  created_at?: string;
  updated_at?: string;
};

export const DEFAULT_USER_PASSWORD = "12345678";

export const roleDefinitions: Array<{
  level: RoleLevel;
  name: string;
  description: string;
}> = [
  { level: 5, name: "Super Admin", description: "Seluruh fitur, pengaturan, dan pengelolaan semua level pengguna." },
  { level: 4, name: "Admin", description: "Seluruh fitur operasional dan tambah pengguna sampai level Admin." },
  { level: 3, name: "Reviewer", description: "Melihat dashboard, kebutuhan, dan seluruh laporan proyek." },
  { level: 2, name: "User Lapangan", description: "Input laporan harian dan melihat laporan pekerjaan." },
  { level: 1, name: "HK / Tamu", description: "Melihat laporan HK yang sudah dipublikasikan." },
];

export function roleDefinition(level?: number | null) {
  return roleDefinitions.find((item) => item.level === level) || roleDefinitions[4];
}

export function canManageUsers(level?: number | null) {
  return Boolean(level && level >= 4);
}

export function canAccessTab(level: number, tab: string) {
  if (tab === "account") return true;
  if (level >= 4) return true;
  if (level === 3) return ["dashboard", "recap", "report"].includes(tab);
  if (level === 2) return ["dashboard", "input", "recap", "report"].includes(tab);
  return tab === "report";
}

export function initials(name?: string | null, email?: string | null) {
  const source = (name || email || "PC").trim();
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length > 1) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return source.slice(0, 2).toUpperCase();
}
