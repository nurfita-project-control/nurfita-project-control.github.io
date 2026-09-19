export type StoredEntry = {
  id: number;
  entryDate: string;
  category: string;
  wing: "Selatan" | "Utara" | "Umum";
  zone: string;
  wbsCode: string | null;
  itemName: string;
  quantity: number;
  unit: string;
  completion: number;
  amount: number;
  workers: number;
  status: string;
  vendor: string;
  notes: string;
  photoKey: string | null;
  photoName: string | null;
  hkVisible: boolean;
  createdBy: string;
  createdAt: string;
};

const STORAGE_KEY = "nurfita-project-control.entries.v1";

export function readEntries(): StoredEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredEntry[]) : [];
  } catch {
    return [];
  }
}

export function saveEntry(entry: StoredEntry) {
  const entries = [entry, ...readEntries()];
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  window.dispatchEvent(new Event("nurfita-entries-updated"));
}

export function subscribeEntries(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener("nurfita-entries-updated", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("nurfita-entries-updated", callback);
  };
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Foto gagal dibaca"));
    reader.readAsDataURL(file);
  });
}
