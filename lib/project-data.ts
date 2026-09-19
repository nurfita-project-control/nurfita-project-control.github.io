export type Wing = "Selatan" | "Utara" | "Umum";

export type Activity = {
  code: string;
  wing: Wing;
  name: string;
  start: string;
  finish: string;
  weight: number;
};

// Data ini sengaja berupa contoh aman untuk repository publik.
// Baseline, volume, biaya, dan identitas kontrak produksi akan dibaca dari
// Supabase setelah pengguna berhasil masuk.
export const activities: Activity[] = [
  { code: "D-01", wing: "Umum", name: "Persiapan administrasi", start: "2026-01-01", finish: "2026-01-07", weight: 10 },
  { code: "D-02", wing: "Umum", name: "Submittal dan persetujuan", start: "2026-01-04", finish: "2026-01-14", weight: 15 },
  { code: "D-03", wing: "Selatan", name: "Pelaksanaan area A", start: "2026-01-08", finish: "2026-01-31", weight: 25 },
  { code: "D-04", wing: "Utara", name: "Pelaksanaan area B", start: "2026-01-15", finish: "2026-02-14", weight: 25 },
  { code: "D-05", wing: "Umum", name: "Penyelesaian dan pemeriksaan", start: "2026-02-01", finish: "2026-02-25", weight: 20 },
  { code: "D-06", wing: "Umum", name: "Serah terima", start: "2026-02-26", finish: "2026-02-28", weight: 5 },
];

export const soilTargets = { Selatan: 100, Utara: 100 } as const;
export const truckCapacity = 1;

export const categoryLabels: Record<string, string> = {
  progress: "Progres pekerjaan",
  soil: "Material curah masuk",
  material: "Material / tanaman",
  manpower: "Tenaga kerja dan alat",
  constraint: "Kendala / instruksi",
  expense: "Biaya internal",
};

export const zones = [
  "Area A",
  "Area B",
  "Area vertikal",
  "Area kerja umum",
];

export function plannedProgress(at = new Date()) {
  const value = activities.reduce((total, activity) => {
    const start = new Date(`${activity.start}T00:00:00Z`).getTime();
    const finish = new Date(`${activity.finish}T23:59:59Z`).getTime();
    const now = at.getTime();
    if (now < start) return total;
    if (now >= finish) return total + activity.weight;
    return total + activity.weight * ((now - start) / (finish - start));
  }, 0);
  return Math.min(100, Math.max(0, value));
}

export function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}
