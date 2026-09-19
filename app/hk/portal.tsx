"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  AlertTriangle,
  CalendarDays,
  Camera,
  ClipboardCheck,
  FileText,
  Loader2,
  Printer,
  RefreshCw,
  ShieldCheck,
  Truck,
} from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { activities, categoryLabels, formatDate, plannedProgress, soilTargets, truckCapacity } from "@/lib/project-data";
import { readEntries, subscribeEntries } from "@/lib/client-storage";

type Entry = {
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
  workers: number;
  notes: string;
  photoKey: string | null;
  hkVisible: boolean;
};

const curveDates = [
  "2026-01-01", "2026-01-08", "2026-01-15", "2026-01-22", "2026-01-29",
  "2026-02-05", "2026-02-12", "2026-02-19", "2026-02-28",
];

function Metric({ label, value, note, icon: Icon, tone = "default" }: { label: string; value: string; note: string; icon: typeof Truck; tone?: "default" | "good" | "warning" }) {
  return (
    <Card className="gap-3 rounded-md border-slate-200 py-5 shadow-none">
      <CardContent className="px-5">
        <div className="flex items-center justify-between text-[#232b2b]">
          <span className="text-xs font-semibold uppercase tracking-[0.12em]">{label}</span>
          <Icon className="size-4 text-[#0e1111]" />
        </div>
        <div className="mt-5 font-serif text-3xl font-semibold text-[#0e1111]">{value}</div>
        <p
          className="mt-1 text-xs font-medium leading-5 text-[#232b2b]"
          style={tone === "default" ? undefined : {
            borderLeft: `3px solid ${tone === "good" ? "#50b8e7" : "#e5a3a3"}`,
            backgroundColor: tone === "good" ? "#eaf7fc" : "#faeaea",
            padding: "0.25rem 0.45rem",
          }}
        >
          {note}
        </p>
      </CardContent>
    </Card>
  );
}

export default function HKPortal() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [start, setStart] = useState("2026-01-01");
  const [finish, setFinish] = useState(new Date().toISOString().slice(0, 10));

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      setEntries(readEntries().filter((entry) => entry.hkVisible));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Data belum tersedia");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const sync = () => {
      setEntries(readEntries().filter((entry) => entry.hkVisible));
      setLoading(false);
    };
    sync();
    return subscribeEntries(sync);
  }, []);

  const latestByWbs = useMemo(() => {
    const result = new Map<string, Entry>();
    [...entries]
      .filter((entry) => entry.category === "progress" && entry.wbsCode)
      .sort((a, b) => a.entryDate.localeCompare(b.entryDate) || a.id - b.id)
      .forEach((entry) => result.set(entry.wbsCode as string, entry));
    return result;
  }, [entries]);

  const actual = activities.reduce((sum, activity) => sum + activity.weight * ((latestByWbs.get(activity.code)?.completion || 0) / 100), 0);
  const plan = plannedProgress(new Date());
  const soilSouth = entries.filter((entry) => entry.category === "soil" && entry.wing === "Selatan").reduce((sum, entry) => sum + entry.quantity, 0);
  const soilNorth = entries.filter((entry) => entry.category === "soil" && entry.wing === "Utara").reduce((sum, entry) => sum + entry.quantity, 0);
  const periodEntries = entries.filter((entry) => entry.entryDate >= start && entry.entryDate <= finish);

  const chartData = curveDates.map((date) => {
    const snapshots = new Map<string, Entry>();
    entries
      .filter((entry) => entry.category === "progress" && entry.wbsCode && entry.entryDate <= date)
      .sort((a, b) => a.entryDate.localeCompare(b.entryDate) || a.id - b.id)
      .forEach((entry) => snapshots.set(entry.wbsCode as string, entry));
    return {
      date: new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short" }).format(new Date(`${date}T00:00:00`)),
      plan: Number(plannedProgress(new Date(`${date}T23:59:59Z`)).toFixed(2)),
      actual: Number(activities.reduce((sum, item) => sum + item.weight * ((snapshots.get(item.code)?.completion || 0) / 100), 0).toFixed(2)),
    };
  });

  return (
    <main className="min-h-screen bg-[#f4f3ef] text-[#0e1111]">
      <header className="print-hidden border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <BrandLogo className="h-9 w-16" priority />
            <div><div className="font-serif text-lg font-semibold text-[#0e1111]">Portal Laporan Eksternal</div><div className="hidden text-[11px] uppercase tracking-[0.15em] text-[#232b2b] sm:block">Project reporting system</div></div>
          </div>
          <Badge variant="outline" className="rounded-sm border-slate-300 bg-slate-50"><ShieldCheck className="size-3" /> Read only</Badge>
        </div>
      </header>

      <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
        <div className="print-hidden rounded-sm border border-[#50b8e7] bg-[#eef9fd] px-4 py-3 text-sm leading-6 text-[#0e1111]">
          <ShieldCheck className="mr-2 inline size-4" /> Mode demo aman. Laporan produksi tersedia melalui akses pengguna terotorisasi.
        </div>
        <div className="print-hidden flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="eyebrow">Informasi proyek</p><h1 className="page-title">Progress Monitoring</h1><p className="mt-2 text-sm text-[#232b2b]">Data terverifikasi yang dipublikasikan oleh PT Nurfita Karya Mandiri.</p></div>
          <Button variant="outline" className="rounded-sm bg-white" onClick={load} disabled={loading}>{loading ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />} Perbarui data</Button>
        </div>

        {error && <div className="rounded-sm border border-[#e5a3a3] bg-[#faeaea] p-3 text-sm text-[#0e1111]"><AlertTriangle className="mr-2 inline size-4" />{error}</div>}

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="print-hidden h-auto w-full justify-start overflow-x-auto rounded-sm border border-slate-200 bg-white p-1 sm:w-auto">
            <TabsTrigger value="overview" className="rounded-sm px-4">Ringkasan</TabsTrigger>
            <TabsTrigger value="activity" className="rounded-sm px-4">Aktivitas</TabsTrigger>
            <TabsTrigger value="photos" className="rounded-sm px-4">Dokumentasi</TabsTrigger>
            <TabsTrigger value="report" className="rounded-sm px-4">Laporan Mingguan</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Metric label="Rencana" value={`${plan.toFixed(2)}%`} note="Baseline kontrak sampai hari ini" icon={CalendarDays} />
              <Metric label="Realisasi" value={`${actual.toFixed(2)}%`} note={`${actual - plan >= 0 ? "+" : ""}${(actual - plan).toFixed(2)}% terhadap rencana`} icon={ClipboardCheck} tone={actual >= plan ? "good" : "warning"} />
              <Metric label="Tanah masuk" value={`${soilSouth + soilNorth} m³`} note={`${Math.ceil((soilSouth + soilNorth) / truckCapacity)} rit tercatat`} icon={Truck} />
              <Metric label="Update lapangan" value={`${entries.length}`} note="Catatan yang dipublikasikan untuk HK" icon={FileText} />
            </div>

            <div className="grid gap-5 lg:grid-cols-[1.5fr_.8fr]">
              <Card className="rounded-md border-slate-200 shadow-none"><CardHeader className="border-b border-slate-100"><CardTitle className="font-serif text-xl text-[#0e1111]">Kurva S</CardTitle><CardDescription>Rencana dan realisasi kumulatif berdasarkan bobot master schedule.</CardDescription></CardHeader><CardContent className="h-80 px-2 sm:px-5"><ResponsiveContainer width="100%" height="100%"><LineChart data={chartData} margin={{ top: 14, right: 20, bottom: 5, left: -18 }}><CartesianGrid stroke="#e2e8f0" strokeDasharray="2 4" vertical={false} /><XAxis dataKey="date" tick={{ fill: "#232b2b", fontSize: 11 }} tickLine={false} minTickGap={28} /><YAxis domain={[0, 100]} unit="%" tick={{ fill: "#232b2b", fontSize: 11 }} tickLine={false} axisLine={false} /><Tooltip formatter={(value) => `${Number(value).toFixed(2)}%`} /><Line type="monotone" dataKey="plan" name="Rencana" stroke="#232b2b" strokeWidth={2.5} dot={false} /><Line type="monotone" dataKey="actual" name="Realisasi" stroke={actual >= plan ? "#50b8e7" : "#e5a3a3"} strokeWidth={2.5} dot={{ r: 2 }} /></LineChart></ResponsiveContainer></CardContent></Card>
              <Card className="rounded-md border-slate-200 shadow-none"><CardHeader className="border-b border-slate-100"><CardTitle className="font-serif text-xl text-[#0e1111]">Rekap Material Curah</CardTitle><CardDescription>Angka contoh untuk pratinjau antarmuka.</CardDescription></CardHeader><CardContent className="space-y-6">{(["Selatan", "Utara"] as const).map((wing) => { const received = wing === "Selatan" ? soilSouth : soilNorth; const target = soilTargets[wing]; return <div key={wing}><div className="mb-2 flex justify-between text-sm"><strong>{wing}</strong><span className="font-mono text-xs">{received} / {target} unit</span></div><Progress value={Math.min(100, received / target * 100)} className="h-2 bg-slate-200 [&_[data-slot=progress-indicator]]:bg-[#50b8e7]" /><p className="mt-2 text-xs text-[#232b2b]">Sisa contoh {Math.max(0, Math.ceil((target - received) / truckCapacity))} pengiriman</p></div>; })}</CardContent></Card>
            </div>
          </TabsContent>

          <TabsContent value="activity">
            <Card className="rounded-md border-slate-200 shadow-none"><CardHeader className="border-b border-slate-100"><CardTitle className="font-serif text-xl text-[#0e1111]">Aktivitas Lapangan</CardTitle><CardDescription>Seluruh catatan yang telah ditandai untuk laporan HK.</CardDescription></CardHeader><CardContent className="px-0">{loading ? <div className="grid h-52 place-items-center"><Loader2 className="size-6 animate-spin text-[#232b2b]" /></div> : entries.length === 0 ? <div className="p-10 text-center text-sm text-[#232b2b]">Belum ada catatan yang dipublikasikan.</div> : <Table><TableHeader><TableRow className="bg-slate-50"><TableHead className="pl-6">Tanggal</TableHead><TableHead>Sayap</TableHead><TableHead>Kategori</TableHead><TableHead className="min-w-64">Uraian</TableHead><TableHead>Volume</TableHead><TableHead className="pr-6">Progres</TableHead></TableRow></TableHeader><TableBody>{entries.map((entry) => <TableRow key={entry.id}><TableCell className="pl-6 text-xs">{formatDate(entry.entryDate)}</TableCell><TableCell><Badge variant="outline" className="rounded-sm">{entry.wing}</Badge></TableCell><TableCell className="text-xs">{categoryLabels[entry.category]}</TableCell><TableCell className="whitespace-normal"><strong>{entry.itemName}</strong>{entry.notes && <p className="mt-1 text-xs leading-5 text-[#232b2b]">{entry.notes}</p>}</TableCell><TableCell className="font-mono text-xs">{entry.quantity || "—"} {entry.unit}</TableCell><TableCell className="pr-6 font-mono text-xs">{entry.completion ? `${entry.completion}%` : "—"}</TableCell></TableRow>)}</TableBody></Table>}</CardContent></Card>
          </TabsContent>

          <TabsContent value="photos">
            <Card className="rounded-md border-slate-200 shadow-none"><CardHeader className="border-b border-slate-100"><CardTitle className="font-serif text-xl text-[#0e1111]">Dokumentasi Progres</CardTitle><CardDescription>Foto yang telah dipilih untuk dokumentasi HK.</CardDescription></CardHeader><CardContent><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{entries.filter((entry) => entry.photoKey).map((entry) => <figure key={entry.id} className="overflow-hidden rounded-sm border border-slate-200"><div className="relative aspect-[4/3]"><Image src={entry.photoKey || ""} alt={entry.itemName} fill unoptimized className="object-cover" /></div><figcaption className="p-3 text-xs"><strong>{formatDate(entry.entryDate)} · {entry.wing}</strong><span className="mt-1 block leading-5 text-[#232b2b]">{entry.itemName}</span></figcaption></figure>)}{entries.every((entry) => !entry.photoKey) && <div className="col-span-full grid min-h-56 place-items-center rounded-sm border border-dashed border-slate-300 text-center text-sm text-[#232b2b]"><span><Camera className="mx-auto mb-2 size-7" />Dokumentasi belum dipublikasikan.</span></div>}</div></CardContent></Card>
          </TabsContent>

          <TabsContent value="report" className="space-y-5">
            <Card className="print-hidden rounded-md border-slate-200 shadow-none"><CardContent className="grid gap-4 py-5 sm:grid-cols-[1fr_1fr_auto]"><div className="space-y-2"><Label>Dari tanggal</Label><Input type="date" value={start} onChange={(event) => setStart(event.target.value)} className="rounded-sm" /></div><div className="space-y-2"><Label>Sampai tanggal</Label><Input type="date" value={finish} onChange={(event) => setFinish(event.target.value)} className="rounded-sm" /></div><Button onClick={() => window.print()} className="self-end rounded-sm bg-[#17365d] hover:bg-[#102946]"><Printer className="size-4" /> Cetak PDF</Button></CardContent></Card>
            <section className="report-sheet rounded-sm border border-slate-300 bg-white p-5 sm:p-8"><div className="flex items-start justify-between gap-4 border-b-2 border-[#17365d] pb-5 sm:gap-6"><div><div className="text-xs font-semibold uppercase tracking-[0.18em] text-[#232b2b]">PT Nurfita Karya Mandiri</div><h2 className="mt-2 font-serif text-2xl font-bold text-[#0e1111]">Laporan Progres Mingguan</h2><p className="mt-1 text-sm text-[#232b2b]">Identitas pekerjaan dimuat dari basis data terproteksi.</p></div><BrandLogo className="h-12 w-24 sm:h-14 sm:w-28" /></div><div className="mt-5 grid gap-x-10 gap-y-2 text-sm sm:grid-cols-2"><div className="flex justify-between border-b border-slate-100 py-1.5"><span className="text-[#232b2b]">Periode</span><strong>{formatDate(start)} — {formatDate(finish)}</strong></div><div className="flex justify-between border-b border-slate-100 py-1.5"><span className="text-[#232b2b]">Kontrak</span><strong>Data terproteksi</strong></div><div className="flex justify-between border-b border-slate-100 py-1.5"><span className="text-[#232b2b]">Rencana</span><strong>{plan.toFixed(2)}%</strong></div><div className="flex justify-between border-b border-slate-100 py-1.5"><span className="text-[#232b2b]">Realisasi</span><strong>{actual.toFixed(2)}%</strong></div></div><h3 className="report-heading mt-7">Aktivitas Periode</h3>{periodEntries.length === 0 ? <div className="rounded-sm border border-dashed border-slate-300 p-8 text-center text-sm text-[#232b2b]">Belum ada catatan pada periode ini.</div> : <Table><TableHeader><TableRow className="bg-slate-100"><TableHead>Tanggal</TableHead><TableHead>Lokasi</TableHead><TableHead className="min-w-64">Uraian</TableHead><TableHead>Volume</TableHead></TableRow></TableHeader><TableBody>{periodEntries.map((entry) => <TableRow key={entry.id}><TableCell className="text-xs">{formatDate(entry.entryDate)}</TableCell><TableCell className="text-xs">{entry.wing}<br /><span className="text-[#232b2b]">{entry.zone}</span></TableCell><TableCell className="whitespace-normal"><strong>{entry.itemName}</strong>{entry.notes && <p className="mt-1 text-xs text-[#232b2b]">{entry.notes}</p>}</TableCell><TableCell className="font-mono text-xs">{entry.quantity || "—"} {entry.unit}</TableCell></TableRow>)}</TableBody></Table>}<div className="mt-12 grid grid-cols-2 gap-12 text-center text-sm"><div><p>Dibuat oleh,<br />PT Nurfita Karya Mandiri</p><div className="h-20" /><div className="border-t border-slate-400 pt-2">Project Control & Administration</div></div><div><p>Diperiksa oleh,<br />Pemberi Kerja</p><div className="h-20" /><div className="border-t border-slate-400 pt-2">Site Representative</div></div></div></section>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
