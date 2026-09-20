"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  CalendarDays,
  Camera,
  ClipboardList,
  FileText,
  ImageIcon,
  Loader2,
  MapPinned,
  Plus,
  Printer,
  Save,
  ShieldCheck,
  Sprout,
  Truck,
} from "lucide-react";
import Image from "next/image";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { BrandLogo } from "@/components/brand-logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  activities,
  categoryLabels,
  contract,
  curveDates,
  formatDate,
  formatNumber,
  phaseOneAreas,
  phaseOnePlants,
  phaseOneTotal,
  plannedProgress,
  polybagTotal,
  treeTotal,
  truckCapacity,
  zones,
} from "@/lib/project-data";
import {
  fileToDataUrl,
  readEntries,
  saveEntry,
  subscribeEntries,
  type StoredEntry,
} from "@/lib/client-storage";

type TabValue = "dashboard" | "input" | "recap" | "report";
type IconType = typeof BarChart3;

const navItems: Array<{ value: TabValue; label: string; icon: IconType }> = [
  { value: "dashboard", label: "Ringkasan", icon: BarChart3 },
  { value: "input", label: "Input Harian", icon: Plus },
  { value: "recap", label: "Rekap Tahap 1", icon: Sprout },
  { value: "report", label: "Laporan HK", icon: FileText },
];

const emptyForm = {
  entryDate: contract.fieldStart,
  category: "preparation",
  wing: "Selatan" as const,
  zone: phaseOneAreas[0] as string,
  wbsCode: "P1-01",
  itemName: "Toolbox meeting dan mobilisasi lapangan",
  quantity: "0",
  unit: "kegiatan",
  completion: "0",
  workers: "0",
  status: "Dilaksanakan",
  notes: "",
  hkVisible: true,
};

function cx(...values: Array<string | false | undefined>) {
  return values.filter(Boolean).join(" ");
}

function numberOf(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function actualProgress(entries: StoredEntry[], until?: string) {
  const latest = new Map<string, StoredEntry>();
  entries
    .filter((entry) => entry.category === "progress" && entry.wbsCode && (!until || entry.entryDate <= until))
    .sort((a, b) => a.entryDate.localeCompare(b.entryDate) || a.id - b.id)
    .forEach((entry) => latest.set(entry.wbsCode as string, entry));
  return activities.reduce(
    (sum, activity) => sum + activity.weight * ((latest.get(activity.code)?.completion || 0) / 100),
    0,
  );
}

function plantTotals(entries: StoredEntry[], category: "plant_delivery" | "plant_installation") {
  const totals = new Map<string, number>();
  entries
    .filter((entry) => entry.category === category)
    .forEach((entry) => totals.set(entry.itemName, (totals.get(entry.itemName) || 0) + entry.quantity));
  return totals;
}

function Metric({
  label,
  value,
  note,
  icon: Icon,
  tone = "default",
}: {
  label: string;
  value: string;
  note: string;
  icon: IconType;
  tone?: "default" | "good" | "warning";
}) {
  return (
    <Card className="gap-3 rounded-md border-slate-200 py-5 shadow-none">
      <CardContent className="px-5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#232b2b]">{label}</span>
          <span className="grid size-9 place-items-center rounded-sm bg-slate-100 text-[#0e1111]">
            <Icon className="size-4" />
          </span>
        </div>
        <div className="mt-4 font-serif text-3xl font-semibold text-[#0e1111]">{value}</div>
        <p
          className="mt-2 text-xs font-medium leading-5 text-[#232b2b]"
          style={
            tone === "default"
              ? undefined
              : {
                  borderLeft: `3px solid ${tone === "good" ? "#50b8e7" : "#e5a3a3"}`,
                  background: tone === "good" ? "#eaf7fc" : "#faeaea",
                  padding: "0.3rem 0.5rem",
                }
          }
        >
          {note}
        </p>
      </CardContent>
    </Card>
  );
}

export default function ProjectControl() {
  const [active, setActive] = useState<TabValue>("dashboard");
  const [entries, setEntries] = useState<StoredEntry[]>([]);

  useEffect(() => {
    const sync = () => setEntries(readEntries());
    sync();
    return subscribeEntries(sync);
  }, []);

  const plan = plannedProgress(new Date());
  const actual = useMemo(() => actualProgress(entries), [entries]);
  const deviation = actual - plan;
  const soilM3 = entries.filter((entry) => entry.category === "soil").reduce((sum, entry) => sum + entry.quantity, 0);
  const soilRit = soilM3 > 0 ? Math.ceil(soilM3 / truckCapacity) : 0;
  const delivered = useMemo(() => plantTotals(entries, "plant_delivery"), [entries]);
  const installed = useMemo(() => plantTotals(entries, "plant_installation"), [entries]);
  const deliveredTotal = [...delivered.values()].reduce((sum, value) => sum + value, 0);
  const installedTotal = [...installed.values()].reduce((sum, value) => sum + value, 0);

  const chartData = useMemo(
    () =>
      curveDates.map((date) => ({
        date: new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short" }).format(
          new Date(`${date}T00:00:00+07:00`),
        ),
        plan: Number(plannedProgress(new Date(`${date}T23:59:59+07:00`)).toFixed(2)),
        actual: Number(actualProgress(entries, date).toFixed(2)),
      })),
    [entries],
  );

  const go = (value: TabValue) => {
    setActive(value);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const current = navItems.find((item) => item.value === active) || navItems[0];
  const CurrentIcon = current.icon;

  return (
    <div className="min-h-screen bg-[#f4f3ef] text-[#0e1111] lg:grid lg:grid-cols-[260px_minmax(0,1fr)]">
      <aside className="print-hidden sticky top-0 hidden h-screen flex-col border-r border-slate-200 bg-white px-5 lg:flex">
        <div className="flex h-20 items-center gap-3 border-b border-slate-100">
          <BrandLogo className="h-10 w-[72px]" priority />
          <div>
            <div className="font-serif text-base font-semibold">Nurfita Project Control</div>
            <div className="mt-1 text-[10px] uppercase tracking-[0.14em] text-[#232b2b]">Field reporting</div>
          </div>
        </div>
        <div className="flex-1 py-5">
          <p className="mb-3 px-3 text-[11px] font-bold uppercase tracking-[0.14em] text-[#232b2b]">Menu lapangan</p>
          <nav className="space-y-1">
            {navItems.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => go(item.value)}
                className={cx(
                  "flex h-12 w-full items-center gap-3 rounded-sm px-3 text-left text-sm font-semibold transition-colors",
                  active === item.value ? "bg-[#e9eef4] text-[#0e1111]" : "text-[#232b2b] hover:bg-slate-50",
                )}
              >
                <item.icon className="size-[18px]" /> {item.label}
              </button>
            ))}
          </nav>
          <div className="mt-7 rounded-sm border border-slate-200 bg-[#faf9f6] p-4 text-sm">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#232b2b]">
              <MapPinned className="size-4" /> Tahap 1
            </div>
            <p className="mt-3 font-semibold">Sayap Selatan</p>
            <p className="mt-1 text-xs leading-5 text-[#232b2b]">Mulai lapangan 21 September 2026 · 5 area kerja.</p>
          </div>
        </div>
      </aside>

      <section className="min-w-0">
        <header className="print-hidden sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="flex min-h-16 items-center justify-between gap-3 px-4 py-2 sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <BrandLogo className="h-9 w-16 lg:hidden" priority />
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#232b2b]">
                  <CurrentIcon className="size-4" /> Area kerja
                </div>
                <div className="truncate font-serif text-lg font-semibold">{current.label}</div>
              </div>
            </div>
            <a
              href="/hk/"
              className="inline-flex min-h-11 items-center gap-2 rounded-sm border border-slate-300 bg-white px-3 text-xs font-semibold text-[#0e1111] hover:bg-slate-50"
            >
              <ShieldCheck className="size-4" />
              <span className="hidden sm:inline">Lihat Portal HK</span>
              <span className="sm:hidden">HK</span>
            </a>
          </div>
        </header>

        <main className="min-w-0 space-y-5 p-4 pb-28 sm:p-6 lg:p-8 lg:pb-8">
          <div className="rounded-sm border border-[#50b8e7] bg-[#eef9fd] px-4 py-3 text-sm leading-6">
            <ShieldCheck className="mr-2 inline size-4" />
            Versi uji lapangan aktif. Data tersimpan di perangkat ini dan dapat dicetak menjadi laporan HK.
          </div>

          {active === "dashboard" && (
            <Dashboard
              entries={entries}
              plan={plan}
              actual={actual}
              deviation={deviation}
              soilM3={soilM3}
              soilRit={soilRit}
              deliveredTotal={deliveredTotal}
              installedTotal={installedTotal}
              chartData={chartData}
              onInput={() => go("input")}
            />
          )}
          {active === "input" && <DailyInput onSaved={(entry) => { setEntries((currentEntries) => [entry, ...currentEntries]); go("dashboard"); }} />}
          {active === "recap" && <PhaseOneRecap entries={entries} delivered={delivered} installed={installed} />}
          {active === "report" && <HKReport entries={entries.filter((entry) => entry.hkVisible)} plan={plan} actual={actual} />}
        </main>
      </section>

      <nav className="print-hidden fixed inset-x-0 bottom-0 z-50 grid grid-cols-4 border-t border-slate-200 bg-white/98 px-1 pb-[max(.4rem,env(safe-area-inset-bottom))] pt-1 shadow-[0_-6px_20px_rgba(15,23,42,.08)] lg:hidden">
        {navItems.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => go(item.value)}
            className={cx(
              "flex min-h-14 flex-col items-center justify-center gap-1 rounded-sm px-1 text-[10px] font-semibold",
              active === item.value ? "bg-[#e9eef4] text-[#0e1111]" : "text-[#232b2b]",
            )}
          >
            <item.icon className="size-5" /> {item.label}
          </button>
        ))}
      </nav>
    </div>
  );
}

function Dashboard({
  entries,
  plan,
  actual,
  deviation,
  soilM3,
  soilRit,
  deliveredTotal,
  installedTotal,
  chartData,
  onInput,
}: {
  entries: StoredEntry[];
  plan: number;
  actual: number;
  deviation: number;
  soilM3: number;
  soilRit: number;
  deliveredTotal: number;
  installedTotal: number;
  chartData: Array<{ date: string; plan: number; actual: number }>;
  onInput: () => void;
}) {
  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Tahap 1 · Sayap Selatan</p>
          <h1 className="page-title">Laporan Lapangan</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#232b2b]">
            Kontrol harian untuk lima area merah, tanaman, tanah, tenaga kerja, kendala, dan dokumentasi.
          </p>
        </div>
        <Button onClick={onInput} className="min-h-12 rounded-sm bg-[#17365d] px-5 hover:bg-[#102946]">
          <Plus className="size-4" /> Input laporan hari ini
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Rencana Tahap 1" value={`${plan.toFixed(2)}%`} note="Bobot operasional sampai hari ini" icon={CalendarDays} />
        <Metric label="Realisasi" value={`${actual.toFixed(2)}%`} note={`${deviation >= 0 ? "+" : ""}${deviation.toFixed(2)}% terhadap rencana`} icon={BarChart3} tone={deviation >= 0 ? "good" : "warning"} />
        <Metric label="Tanah Masuk" value={`${formatNumber(soilM3)} m³`} note={`${soilRit} rit tercatat · truck 7 m³`} icon={Truck} />
        <Metric label="Tanaman Terpasang" value={formatNumber(installedTotal)} note={`${formatNumber(deliveredTotal)} diterima dari target ${formatNumber(phaseOneTotal)}`} icon={Sprout} />
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(300px,.75fr)]">
        <Card className="min-w-0 rounded-md border-slate-200 shadow-none">
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="font-serif text-xl">Kurva Progres Tahap 1</CardTitle>
            <CardDescription>Rencana dan realisasi kumulatif berdasarkan delapan aktivitas lapangan.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] min-w-0 px-2 pb-3 sm:px-5">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 18, right: 18, bottom: 4, left: -18 }}>
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="2 4" vertical={false} />
                <XAxis dataKey="date" tick={{ fill: "#232b2b", fontSize: 10 }} tickLine={false} axisLine={{ stroke: "#cbd5e1" }} minTickGap={24} />
                <YAxis domain={[0, 100]} unit="%" tick={{ fill: "#232b2b", fontSize: 10 }} tickLine={false} axisLine={false} />
                <Tooltip formatter={(value) => `${Number(value).toFixed(2)}%`} />
                <Line type="monotone" dataKey="plan" name="Rencana" stroke="#232b2b" strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="actual" name="Realisasi" stroke={deviation >= 0 ? "#50b8e7" : "#e5a3a3"} strokeWidth={2.5} dot={{ r: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="rounded-md border-slate-200 shadow-none">
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="font-serif text-xl">Hari Pertama · 21 Sep</CardTitle>
            <CardDescription>Checklist minimum sebelum pekerjaan produksi.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              "Toolbox meeting dan induksi K3",
              "Joint survey serta area release",
              "Foto kondisi awal 0% setiap area",
              "Setting out batas dan titik tanam",
              "Pengukuran kebutuhan tanah",
              "Validasi akses truck 7 m³",
            ].map((item, index) => (
              <div key={item} className="flex gap-3 border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                <span className="grid size-7 shrink-0 place-items-center rounded-sm bg-slate-100 font-mono text-xs">{index + 1}</span>
                <p className="text-sm leading-5">{item}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-md border-slate-200 shadow-none">
        <CardHeader className="border-b border-slate-100">
          <CardTitle className="font-serif text-xl">Catatan Terbaru</CardTitle>
          <CardDescription>Urutan input terakhir pada perangkat ini.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {entries.length === 0 ? (
            <div className="grid min-h-44 place-items-center p-8 text-center text-sm text-[#232b2b]">
              <span><ClipboardList className="mx-auto mb-2 size-7" />Belum ada laporan. Gunakan tombol “Input laporan hari ini”.</span>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {entries.slice(0, 5).map((entry) => (
                <div key={entry.id} className="flex gap-3 p-4 sm:px-6">
                  <span className="grid size-9 shrink-0 place-items-center rounded-sm bg-slate-100"><ClipboardList className="size-4" /></span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2"><strong className="text-sm">{entry.itemName}</strong><Badge variant="outline" className="rounded-sm text-[10px]">{categoryLabels[entry.category]}</Badge></div>
                    <p className="mt-1 text-xs leading-5 text-[#232b2b]">{formatDate(entry.entryDate)} · {entry.zone}{entry.quantity > 0 ? ` · ${formatNumber(entry.quantity)} ${entry.unit}` : ""}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function DailyInput({ onSaved }: { onSaved: (entry: StoredEntry) => void }) {
  const [form, setForm] = useState(emptyForm);
  const [photo, setPhoto] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const isPlant = form.category === "plant_delivery" || form.category === "plant_installation";
  const isProgress = form.category === "progress";

  const chooseCategory = (category: string) => {
    if (category === "soil") {
      setForm((current) => ({ ...current, category, itemName: "Pengiriman tanah subur", unit: "m³", quantity: "0" }));
      return;
    }
    if (category === "plant_delivery" || category === "plant_installation") {
      const plant = phaseOnePlants[0];
      setForm((current) => ({ ...current, category, itemName: plant.name, unit: plant.unit, quantity: "0" }));
      return;
    }
    if (category === "manpower") {
      setForm((current) => ({ ...current, category, itemName: "Tenaga kerja hadir", unit: "orang", quantity: "0" }));
      return;
    }
    setForm((current) => ({ ...current, category, itemName: "", unit: "kegiatan", quantity: "0" }));
  };

  const choosePlant = (name: string) => {
    const plant = phaseOnePlants.find((item) => item.name === name);
    setForm((current) => ({ ...current, itemName: name, unit: plant?.unit || "polybag" }));
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!form.itemName.trim()) {
      setMessage("Uraian aktivitas atau nama tanaman perlu diisi.");
      return;
    }
    setSaving(true);
    setMessage("");
    try {
      const photoKey = photo ? await fileToDataUrl(photo) : null;
      const entry: StoredEntry = {
        id: Date.now(),
        entryDate: form.entryDate,
        category: form.category,
        wing: form.wing,
        zone: form.zone,
        wbsCode: isProgress ? form.wbsCode : null,
        itemName: form.itemName.trim(),
        quantity: numberOf(form.quantity),
        unit: form.unit,
        completion: numberOf(form.completion),
        amount: 0,
        workers: numberOf(form.workers),
        status: form.status,
        vendor: "",
        notes: form.notes.trim(),
        photoKey,
        photoName: photo?.name || null,
        hkVisible: form.hkVisible,
        createdBy: "Project Control",
        createdAt: new Date().toISOString(),
      };
      saveEntry(entry);
      onSaved(entry);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Laporan gagal disimpan.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div>
        <p className="eyebrow">Daily site record</p>
        <h1 className="page-title">Input Laporan Harian</h1>
        <p className="mt-2 text-sm leading-6 text-[#232b2b]">Satu formulir untuk pekerjaan, tanah, tanaman, tenaga, kendala, dan foto.</p>
      </div>

      <form onSubmit={submit}>
        <Card className="rounded-md border-slate-200 shadow-none">
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="font-serif text-xl">Catatan Baru</CardTitle>
            <CardDescription>Isi data yang sudah terverifikasi di lapangan.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-5 py-5 sm:grid-cols-2">
            <Field label="Tanggal">
              <Input type="date" value={form.entryDate} onChange={(event) => setForm({ ...form, entryDate: event.target.value })} className="field-control" required />
            </Field>
            <Field label="Kategori">
              <Select value={form.category} onValueChange={chooseCategory}>
                <SelectTrigger className="field-control w-full"><SelectValue /></SelectTrigger>
                <SelectContent>{Object.entries(categoryLabels).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Area / zona" wide>
              <Select value={form.zone} onValueChange={(value) => setForm({ ...form, zone: value })}>
                <SelectTrigger className="field-control w-full"><SelectValue /></SelectTrigger>
                <SelectContent>{zones.map((zone) => <SelectItem key={zone} value={zone}>{zone}</SelectItem>)}</SelectContent>
              </Select>
            </Field>

            {isProgress && (
              <Field label="Aktivitas Tahap 1" wide>
                <Select
                  value={form.wbsCode}
                  onValueChange={(value) => {
                    const activity = activities.find((item) => item.code === value);
                    setForm({ ...form, wbsCode: value, itemName: activity?.name || form.itemName });
                  }}
                >
                  <SelectTrigger className="field-control w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>{activities.map((activity) => <SelectItem key={activity.code} value={activity.code}>{activity.code} · {activity.name}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
            )}

            {isPlant ? (
              <Field label="Jenis tanaman" wide>
                <Select value={form.itemName} onValueChange={choosePlant}>
                  <SelectTrigger className="field-control w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>{phaseOnePlants.map((plant) => <SelectItem key={plant.name} value={plant.name}>{plant.name} · target {formatNumber(plant.quantity)} {plant.unit}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
            ) : (
              <Field label="Uraian aktivitas / barang" wide>
                <Input value={form.itemName} onChange={(event) => setForm({ ...form, itemName: event.target.value })} placeholder="Contoh: Joint survey dan foto kondisi awal" className="field-control" required />
              </Field>
            )}

            <Field label="Jumlah">
              <Input type="number" min="0" step="0.01" inputMode="decimal" value={form.quantity} onChange={(event) => setForm({ ...form, quantity: event.target.value })} className="field-control" />
            </Field>
            <Field label="Satuan">
              <Input value={form.unit} onChange={(event) => setForm({ ...form, unit: event.target.value })} className="field-control" />
            </Field>
            {isProgress && (
              <Field label="Progres aktivitas (%)">
                <Input type="number" min="0" max="100" inputMode="numeric" value={form.completion} onChange={(event) => setForm({ ...form, completion: event.target.value })} className="field-control" />
              </Field>
            )}
            <Field label="Jumlah pekerja">
              <Input type="number" min="0" inputMode="numeric" value={form.workers} onChange={(event) => setForm({ ...form, workers: event.target.value })} className="field-control" />
            </Field>
            <Field label="Status">
              <Select value={form.status} onValueChange={(value) => setForm({ ...form, status: value })}>
                <SelectTrigger className="field-control w-full"><SelectValue /></SelectTrigger>
                <SelectContent>{["Dilaksanakan", "Selesai", "Tertunda", "Perlu tindak lanjut"].map((status) => <SelectItem key={status} value={status}>{status}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Catatan / kendala / tindak lanjut" wide>
              <Textarea value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} placeholder="Cuaca, hasil inspeksi, kendala, instruksi HK, atau rencana besok." className="min-h-28 rounded-sm text-base sm:text-sm" />
            </Field>
            <Field label="Foto lapangan" wide>
              <label className="flex min-h-24 cursor-pointer items-center gap-4 rounded-sm border border-dashed border-slate-300 bg-slate-50 px-4 py-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-sm bg-white"><Camera className="size-5" /></span>
                <span className="min-w-0 text-sm"><strong className="block">Ambil atau pilih foto</strong><span className="mt-1 block truncate text-xs text-[#232b2b]">{photo?.name || "Kamera Android dapat dibuka dari tombol ini."}</span></span>
                <Input type="file" accept="image/*" capture="environment" className="sr-only" onChange={(event) => setPhoto(event.target.files?.[0] || null)} />
              </label>
            </Field>
            <div className="flex items-start gap-3 sm:col-span-2">
              <Checkbox id="hk-visible" checked={form.hkVisible} onCheckedChange={(checked) => setForm({ ...form, hkVisible: checked === true })} className="mt-0.5" />
              <Label htmlFor="hk-visible" className="text-sm leading-5">Masukkan catatan ini ke laporan HK.</Label>
            </div>
            {message && <div className="rounded-sm border border-[#e5a3a3] bg-[#faeaea] p-3 text-sm sm:col-span-2">{message}</div>}
            <div className="sm:col-span-2">
              <Button type="submit" disabled={saving} className="min-h-12 w-full rounded-sm bg-[#17365d] text-base hover:bg-[#102946]">
                {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />} Simpan laporan
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}

function Field({ label, wide = false, children }: { label: string; wide?: boolean; children: React.ReactNode }) {
  return <div className={cx("space-y-2", wide && "sm:col-span-2")}><Label>{label}</Label>{children}</div>;
}

function PhaseOneRecap({
  entries,
  delivered,
  installed,
}: {
  entries: StoredEntry[];
  delivered: Map<string, number>;
  installed: Map<string, number>;
}) {
  return (
    <div className="space-y-5">
      <div>
        <p className="eyebrow">Area merah · mulai 21 September 2026</p>
        <h1 className="page-title">Rekap Tahap 1</h1>
        <p className="mt-2 text-sm leading-6 text-[#232b2b]">Target lapangan: {formatNumber(phaseOneTotal)} unit — {formatNumber(treeTotal)} batang dan {formatNumber(polybagTotal)} polybag.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {phaseOneAreas.map((area, index) => {
          const count = entries.filter((entry) => entry.zone === area).length;
          return (
            <Card key={area} className="rounded-md border-slate-200 py-4 shadow-none">
              <CardContent className="px-4">
                <div className="flex items-start justify-between gap-3"><span className="grid size-7 shrink-0 place-items-center rounded-sm bg-slate-100 font-mono text-xs">0{index + 1}</span><Badge variant="outline" className="rounded-sm text-[10px]">{count} update</Badge></div>
                <p className="mt-3 text-sm font-semibold leading-5">{area}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="rounded-md border-slate-200 shadow-none">
        <CardHeader className="border-b border-slate-100">
          <CardTitle className="font-serif text-xl">Kontrol Tanaman</CardTitle>
          <CardDescription>Penerimaan dan pemasangan dihitung otomatis dari input harian.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader><TableRow className="bg-slate-50"><TableHead className="min-w-48 pl-5">Jenis</TableHead><TableHead>Target</TableHead><TableHead>Diterima</TableHead><TableHead>Terpasang</TableHead><TableHead>Sisa</TableHead><TableHead className="min-w-40 pr-5">Progres</TableHead></TableRow></TableHeader>
              <TableBody>
                {phaseOnePlants.map((plant) => {
                  const received = delivered.get(plant.name) || 0;
                  const placed = installed.get(plant.name) || 0;
                  const progress = Math.min(100, plant.quantity ? placed / plant.quantity * 100 : 0);
                  return (
                    <TableRow key={plant.name}>
                      <TableCell className="pl-5"><strong className="text-sm">{plant.name}</strong><span className="mt-0.5 block text-[11px] text-[#232b2b]">{plant.unit}</span></TableCell>
                      <TableCell className="font-mono text-xs">{formatNumber(plant.quantity)}</TableCell>
                      <TableCell className="font-mono text-xs">{formatNumber(received)}</TableCell>
                      <TableCell className="font-mono text-xs">{formatNumber(placed)}</TableCell>
                      <TableCell className="font-mono text-xs">{formatNumber(Math.max(0, plant.quantity - placed))}</TableCell>
                      <TableCell className="pr-5"><div className="flex items-center gap-2"><Progress value={progress} className="h-2 min-w-20 bg-slate-200 [&_[data-slot=progress-indicator]]:bg-[#50b8e7]" /><span className="w-11 text-right font-mono text-[11px]">{progress.toFixed(1)}%</span></div></TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-md border-[#e5a3a3] bg-[#fffafa] shadow-none">
        <CardContent className="flex flex-col gap-3 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div><p className="font-semibold">Volume tanah Tahap 1 menunggu hasil ukur.</p><p className="mt-1 text-sm text-[#232b2b]">Rit rencana dihitung dari volume final ÷ 7 m³ dan pengiriman dicatat bertahap setiap hari.</p></div>
          <Badge variant="outline" className="w-fit rounded-sm border-[#e5a3a3] bg-white">Belum ditetapkan</Badge>
        </CardContent>
      </Card>
    </div>
  );
}

function HKReport({ entries, plan, actual }: { entries: StoredEntry[]; plan: number; actual: number }) {
  const [start, setStart] = useState(contract.fieldStart);
  const [finish, setFinish] = useState("2026-09-27");
  const period = entries.filter((entry) => entry.entryDate >= start && entry.entryDate <= finish);
  const photos = period.filter((entry) => entry.photoKey);

  return (
    <div className="space-y-5">
      <div className="print-hidden">
        <p className="eyebrow">Publikasi Nurfita → HK</p>
        <h1 className="page-title">Laporan HK</h1>
        <p className="mt-2 text-sm leading-6 text-[#232b2b]">Hanya catatan yang dicentang “Masukkan ke laporan HK” yang tampil.</p>
      </div>
      <Card className="print-hidden rounded-md border-slate-200 shadow-none">
        <CardContent className="grid gap-4 py-5 sm:grid-cols-[1fr_1fr_auto]">
          <Field label="Dari tanggal"><Input type="date" value={start} onChange={(event) => setStart(event.target.value)} className="field-control" /></Field>
          <Field label="Sampai tanggal"><Input type="date" value={finish} onChange={(event) => setFinish(event.target.value)} className="field-control" /></Field>
          <Button onClick={() => window.print()} className="min-h-12 self-end rounded-sm bg-[#17365d] hover:bg-[#102946]"><Printer className="size-4" /> Cetak / Simpan PDF</Button>
        </CardContent>
      </Card>

      <section className="report-sheet rounded-sm border border-slate-300 bg-white p-5 sm:p-8">
        <div className="flex items-start justify-between gap-4 border-b-2 border-[#17365d] pb-5">
          <div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#232b2b]">PT Nurfita Karya Mandiri</p><h2 className="mt-2 font-serif text-2xl font-bold">Laporan Progres Lapangan</h2><p className="mt-1 text-sm text-[#232b2b]">Pekerjaan Landscape · Tahap 1 Sayap Selatan</p></div>
          <BrandLogo className="h-12 w-24" />
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-4">
          <ReportKpi label="Periode" value={`${formatDate(start)} — ${formatDate(finish)}`} />
          <ReportKpi label="Rencana" value={`${plan.toFixed(2)}%`} />
          <ReportKpi label="Realisasi" value={`${actual.toFixed(2)}%`} />
          <ReportKpi label="Update" value={String(period.length)} />
        </div>
        <h3 className="report-heading mt-7">Aktivitas Lapangan</h3>
        {period.length === 0 ? (
          <div className="rounded-sm border border-dashed border-slate-300 p-8 text-center text-sm text-[#232b2b]">Belum ada catatan pada periode ini.</div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader><TableRow className="bg-slate-100"><TableHead>Tanggal</TableHead><TableHead>Area</TableHead><TableHead>Kategori</TableHead><TableHead className="min-w-56">Uraian</TableHead><TableHead>Volume</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
              <TableBody>{period.map((entry) => <TableRow key={entry.id}><TableCell className="text-xs">{formatDate(entry.entryDate)}</TableCell><TableCell className="text-xs">{entry.zone}</TableCell><TableCell className="text-xs">{categoryLabels[entry.category]}</TableCell><TableCell className="whitespace-normal"><strong>{entry.itemName}</strong>{entry.notes && <p className="mt-1 text-xs leading-5 text-[#232b2b]">{entry.notes}</p>}</TableCell><TableCell className="font-mono text-xs">{entry.quantity > 0 ? `${formatNumber(entry.quantity)} ${entry.unit}` : "—"}</TableCell><TableCell className="text-xs">{entry.status}</TableCell></TableRow>)}</TableBody>
            </Table>
          </div>
        )}
        <h3 className="report-heading mt-7">Dokumentasi</h3>
        {photos.length === 0 ? <div className="rounded-sm border border-dashed border-slate-300 p-6 text-center text-sm text-[#232b2b]"><ImageIcon className="mx-auto mb-2 size-6" />Belum ada foto pada periode ini.</div> : <div className="grid gap-4 sm:grid-cols-2">{photos.map((entry) => <figure key={entry.id} className="overflow-hidden rounded-sm border border-slate-200"><div className="relative aspect-[4/3]"><Image src={entry.photoKey || ""} alt={entry.itemName} fill unoptimized className="object-cover" /></div><figcaption className="p-3 text-xs"><strong>{formatDate(entry.entryDate)} · {entry.zone}</strong><span className="mt-1 block text-[#232b2b]">{entry.itemName}</span></figcaption></figure>)}</div>}
        <div className="mt-12 grid grid-cols-2 gap-10 text-center text-xs sm:text-sm"><div><p>Dibuat oleh,<br />PT Nurfita Karya Mandiri</p><div className="h-16" /><div className="border-t border-slate-400 pt-2">Project Control</div></div><div><p>Diperiksa oleh,<br />PT Hutama Karya</p><div className="h-16" /><div className="border-t border-slate-400 pt-2">Site Representative</div></div></div>
      </section>
    </div>
  );
}

function ReportKpi({ label, value }: { label: string; value: string }) {
  return <div className="report-kpi"><span>{label}</span><strong className="text-sm sm:text-base">{value}</strong></div>;
}
