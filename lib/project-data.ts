export type Wing = "Selatan" | "Utara" | "Umum";

export type Activity = {
  code: string;
  wing: Wing;
  name: string;
  start: string;
  finish: string;
  weight: number;
};

export type PlantTarget = {
  name: string;
  quantity: number;
  unit: "batang" | "polybag";
};

export const contract = {
  start: "2026-09-07",
  fieldStart: "2026-09-21",
  finish: "2026-12-06",
};

export const phaseOneAreas = [
  "Taman Luar Sisi Barat",
  "Taman Luar Memanjang Sisi Utara",
  "Taman Luar Sudut Timur Laut",
  "Taman Utama Sisi Tenggara",
  "Taman Dalam Tipe B4",
] as const;

export const phaseOnePlants: PlantTarget[] = [
  { name: "Damar", quantity: 10, unit: "batang" },
  { name: "Cengal Pasir", quantity: 10, unit: "batang" },
  { name: "Pule", quantity: 16, unit: "batang" },
  { name: "Parahyba", quantity: 3, unit: "batang" },
  { name: "Palem Chamaedorea", quantity: 6, unit: "batang" },
  { name: "Dracaena Merah Hijau", quantity: 17, unit: "batang" },
  { name: "Philodendron", quantity: 2664, unit: "polybag" },
  { name: "Ubi Hias", quantity: 108207, unit: "polybag" },
  { name: "Ophiopogon Daun Panjang", quantity: 27600, unit: "polybag" },
  { name: "Ophiopogon Kucai Mini", quantity: 1679, unit: "polybag" },
  { name: "Spathiphyllum", quantity: 1640, unit: "polybag" },
  { name: "Aglaonema", quantity: 5113, unit: "polybag" },
  { name: "Sirih", quantity: 64, unit: "polybag" },
  { name: "Landep", quantity: 1566, unit: "polybag" },
];

export const phaseOneTotal = phaseOnePlants.reduce((sum, item) => sum + item.quantity, 0);
export const treeTotal = phaseOnePlants.filter((item) => item.unit === "batang").reduce((sum, item) => sum + item.quantity, 0);
export const polybagTotal = phaseOnePlants.filter((item) => item.unit === "polybag").reduce((sum, item) => sum + item.quantity, 0);

// Bobot operasional Tahap 1 untuk dashboard lapangan. Bobot kontrak penuh
// tetap berada pada Master Schedule Excel.
export const activities: Activity[] = [
  { code: "P1-01", wing: "Selatan", name: "Toolbox meeting, mobilisasi dan area release", start: "2026-09-21", finish: "2026-09-21", weight: 5 },
  { code: "P1-02", wing: "Selatan", name: "Joint survey, foto 0% dan setting out", start: "2026-09-21", finish: "2026-09-22", weight: 5 },
  { code: "P1-03", wing: "Selatan", name: "Pengukuran tanah dan validasi akses dump truck", start: "2026-09-21", finish: "2026-09-22", weight: 5 },
  { code: "P1-04", wing: "Selatan", name: "Pengiriman tanah bertahap harian", start: "2026-09-22", finish: "2026-10-06", weight: 20 },
  { code: "P1-05", wing: "Selatan", name: "Pembersihan, urugan dan grading", start: "2026-09-21", finish: "2026-10-23", weight: 15 },
  { code: "P1-06", wing: "Selatan", name: "Penanaman pohon, palem dan Dracaena", start: "2026-09-24", finish: "2026-10-30", weight: 15 },
  { code: "P1-07", wing: "Selatan", name: "Penanaman semak dan groundcover", start: "2026-09-24", finish: "2026-10-23", weight: 25 },
  { code: "P1-08", wing: "Selatan", name: "Penanaman Taman Dalam Tipe B4", start: "2026-09-28", finish: "2026-11-06", weight: 10 },
];

export const truckCapacity = 7;
export const soilTarget: number | null = null;

export const categoryLabels: Record<string, string> = {
  preparation: "Persiapan / area release",
  progress: "Progres pekerjaan",
  soil: "Tanah masuk",
  plant_delivery: "Tanaman diterima",
  plant_installation: "Tanaman terpasang",
  manpower: "Tenaga kerja",
  equipment: "Alat / logistik",
  constraint: "Kendala / instruksi",
  documentation: "Dokumentasi",
};

export const zones = [...phaseOneAreas, "Area kerja umum"];

export const curveDates = [
  "2026-09-21",
  "2026-09-27",
  "2026-10-04",
  "2026-10-11",
  "2026-10-18",
  "2026-10-25",
  "2026-11-01",
  "2026-11-06",
];

export function plannedProgress(at = new Date()) {
  const value = activities.reduce((total, activity) => {
    const start = new Date(`${activity.start}T00:00:00+07:00`).getTime();
    const finish = new Date(`${activity.finish}T23:59:59+07:00`).getTime();
    const now = at.getTime();
    if (now < start) return total;
    if (now >= finish) return total + activity.weight;
    return total + activity.weight * ((now - start) / (finish - start));
  }, 0);
  return Math.min(100, Math.max(0, value));
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00+07:00`));
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat("id-ID").format(value);
}
