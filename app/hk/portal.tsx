"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  BarChart3,
  Camera,
  Printer,
  ShieldCheck,
  Sprout,
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  activities,
  categoryLabels,
  contract,
  curveDates,
  formatDate,
  formatNumber,
  phaseOneTotal,
  plannedProgress,
  truckCapacity,
} from "@/lib/project-data";
import { readEntries, subscribeEntries, type StoredEntry } from "@/lib/client-storage";

function actualProgress(entries: StoredEntry[], until?: string) {
  const latest = new Map<string, StoredEntry>();
  entries
    .filter((entry) => entry.category === "progress" && entry.wbsCode && (!until || entry.entryDate <= until))
    .sort((a, b) => a.entryDate.localeCompare(b.entryDate) || a.id - b.id)
    .forEach((entry) => latest.set(entry.wbsCode as string, entry));
  return activities.reduce((sum, activity) => sum + activity.weight * ((latest.get(activity.code)?.completion || 0) / 100), 0);
}

function Metric({ label, value, note, icon: Icon, tone = "default" }: { label: string; value: string; note: string; icon: typeof Truck; tone?: "default" | "good" | "warning" }) {
  return (
    <Card className="gap-3 rounded-md border-slate-200 py-5 shadow-none">
      <CardContent className="px-5">
        <div className="flex items-center justify-between"><span className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#232b2b]">{label}</span><Icon className="size-4" /></div>
        <div className="mt-4 font-serif text-3xl font-semibold">{value}</div>
        <p className="mt-2 text-xs leading-5 text-[#232b2b]" style={tone === "default" ? undefined : { borderLeft: `3px solid ${tone === "good" ? "#50b8e7" : "#e5a3a3"}`, background: tone === "good" ? "#eaf7fc" : "#faeaea", padding: "0.3rem 0.5rem" }}>{note}</p>
      </CardContent>
    </Card>
  );
}

export default function HKPortal() {
  const [entries, setEntries] = useState<StoredEntry[]>([]);
  const [start, setStart] = useState(contract.fieldStart);
  const [finish, setFinish] = useState("2026-09-27");

  useEffect(() => {
    const sync = () => setEntries(readEntries().filter((entry) => entry.hkVisible));
    sync();
    return subscribeEntries(sync);
  }, []);

  const plan = plannedProgress(new Date());
  const actual = useMemo(() => actualProgress(entries), [entries]);
  const soil = entries.filter((entry) => entry.category === "soil").reduce((sum, entry) => sum + entry.quantity, 0);
  const installed = entries.filter((entry) => entry.category === "plant_installation").reduce((sum, entry) => sum + entry.quantity, 0);
  const period = entries.filter((entry) => entry.entryDate >= start && entry.entryDate <= finish);
  const photos = period.filter((entry) => entry.photoKey);
  const chartData = curveDates.map((date) => ({
    date: new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short" }).format(new Date(`${date}T00:00:00+07:00`)),
    plan: Number(plannedProgress(new Date(`${date}T23:59:59+07:00`)).toFixed(2)),
    actual: Number(actualProgress(entries, date).toFixed(2)),
  }));

  return (
    <main className="min-h-screen bg-[#f4f3ef] text-[#0e1111]">
      <header className="print-hidden sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-3 px-4 py-2 sm:px-6">
          <div className="flex items-center gap-3"><BrandLogo className="h-9 w-16" priority /><div><div className="font-serif text-base font-semibold sm:text-lg">Portal Laporan HK</div><div className="text-[10px] uppercase tracking-[0.14em] text-[#232b2b]">PT Nurfita Karya Mandiri</div></div></div>
          <Badge variant="outline" className="rounded-sm border-slate-300 bg-slate-50"><ShieldCheck className="size-3" /> Read only</Badge>
        </div>
      </header>

      <div className="mx-auto max-w-7xl space-y-5 p-4 sm:p-6 lg:p-8">
        <div className="print-hidden rounded-sm border border-[#50b8e7] bg-[#eef9fd] px-4 py-3 text-sm leading-6">
          <ShieldCheck className="mr-2 inline size-4" /> Ringkasan Tahap 1 Sayap Selatan · mulai lapangan 21 September 2026.
        </div>
        <div className="print-hidden">
          <p className="eyebrow">Pekerjaan landscape</p>
          <h1 className="page-title">Progress Monitoring</h1>
          <p className="mt-2 text-sm leading-6 text-[#232b2b]">Catatan yang dipublikasikan oleh PT Nurfita Karya Mandiri untuk review PT Hutama Karya.</p>
        </div>

        <Tabs defaultValue="overview" className="space-y-5">
          <TabsList className="print-hidden h-auto w-full justify-start overflow-x-auto rounded-sm border border-slate-200 bg-white p-1 sm:w-auto">
            <TabsTrigger value="overview" className="min-h-10 rounded-sm px-4">Ringkasan</TabsTrigger>
            <TabsTrigger value="activity" className="min-h-10 rounded-sm px-4">Aktivitas</TabsTrigger>
            <TabsTrigger value="photos" className="min-h-10 rounded-sm px-4">Foto</TabsTrigger>
            <TabsTrigger value="report" className="min-h-10 rounded-sm px-4">Cetak Laporan</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Metric label="Rencana Tahap 1" value={`${plan.toFixed(2)}%`} note="Bobot operasional sampai hari ini" icon={BarChart3} />
              <Metric label="Realisasi" value={`${actual.toFixed(2)}%`} note={`${actual - plan >= 0 ? "+" : ""}${(actual - plan).toFixed(2)}% terhadap rencana`} icon={BarChart3} tone={actual >= plan ? "good" : "warning"} />
              <Metric label="Tanah Masuk" value={`${formatNumber(soil)} m³`} note={`${soil > 0 ? Math.ceil(soil / truckCapacity) : 0} rit truck 7 m³ tercatat`} icon={Truck} />
              <Metric label="Tanaman Terpasang" value={formatNumber(installed)} note={`Target Tahap 1: ${formatNumber(phaseOneTotal)} unit`} icon={Sprout} />
            </div>
            <Card className="min-w-0 rounded-md border-slate-200 shadow-none">
              <CardHeader className="border-b border-slate-100"><CardTitle className="font-serif text-xl">Kurva Progres Tahap 1</CardTitle><CardDescription>Rencana dan realisasi kumulatif.</CardDescription></CardHeader>
              <CardContent className="h-[300px] min-w-0 px-2 pb-3 sm:px-5"><ResponsiveContainer width="100%" height="100%"><LineChart data={chartData} margin={{ top: 18, right: 18, bottom: 4, left: -18 }}><CartesianGrid stroke="#e2e8f0" strokeDasharray="2 4" vertical={false} /><XAxis dataKey="date" tick={{ fill: "#232b2b", fontSize: 10 }} tickLine={false} minTickGap={24} /><YAxis domain={[0, 100]} unit="%" tick={{ fill: "#232b2b", fontSize: 10 }} tickLine={false} axisLine={false} /><Tooltip formatter={(value) => `${Number(value).toFixed(2)}%`} /><Line type="monotone" dataKey="plan" name="Rencana" stroke="#232b2b" strokeWidth={2.5} dot={false} /><Line type="monotone" dataKey="actual" name="Realisasi" stroke={actual >= plan ? "#50b8e7" : "#e5a3a3"} strokeWidth={2.5} dot={{ r: 2 }} /></LineChart></ResponsiveContainer></CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity">
            <EntryTable entries={entries} emptyText="Belum ada aktivitas yang dipublikasikan." />
          </TabsContent>

          <TabsContent value="photos">
            <Card className="rounded-md border-slate-200 shadow-none"><CardHeader className="border-b border-slate-100"><CardTitle className="font-serif text-xl">Dokumentasi Lapangan</CardTitle><CardDescription>Foto yang dipilih untuk laporan HK.</CardDescription></CardHeader><CardContent><PhotoGrid entries={entries.filter((entry) => entry.photoKey)} /></CardContent></Card>
          </TabsContent>

          <TabsContent value="report" className="space-y-5">
            <Card className="print-hidden rounded-md border-slate-200 shadow-none"><CardContent className="grid gap-4 py-5 sm:grid-cols-[1fr_1fr_auto]"><div className="space-y-2"><Label>Dari tanggal</Label><Input type="date" value={start} onChange={(event) => setStart(event.target.value)} className="field-control" /></div><div className="space-y-2"><Label>Sampai tanggal</Label><Input type="date" value={finish} onChange={(event) => setFinish(event.target.value)} className="field-control" /></div><Button onClick={() => window.print()} className="min-h-12 self-end rounded-sm bg-[#17365d] hover:bg-[#102946]"><Printer className="size-4" /> Cetak / Simpan PDF</Button></CardContent></Card>
            <section className="report-sheet rounded-sm border border-slate-300 bg-white p-5 sm:p-8">
              <div className="flex items-start justify-between gap-4 border-b-2 border-[#17365d] pb-5"><div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#232b2b]">PT Nurfita Karya Mandiri</p><h2 className="mt-2 font-serif text-2xl font-bold">Laporan Progres Lapangan</h2><p className="mt-1 text-sm text-[#232b2b]">Tahap 1 Sayap Selatan</p></div><BrandLogo className="h-12 w-24" /></div>
              <div className="mt-5 grid gap-3 sm:grid-cols-4"><ReportKpi label="Periode" value={`${formatDate(start)} — ${formatDate(finish)}`} /><ReportKpi label="Rencana" value={`${plan.toFixed(2)}%`} /><ReportKpi label="Realisasi" value={`${actual.toFixed(2)}%`} /><ReportKpi label="Update" value={String(period.length)} /></div>
              <h3 className="report-heading mt-7">Aktivitas Periode</h3><EntryTable entries={period} emptyText="Belum ada catatan pada periode ini." bare />
              <h3 className="report-heading mt-7">Dokumentasi</h3><PhotoGrid entries={photos} />
              <div className="mt-12 grid grid-cols-2 gap-10 text-center text-xs sm:text-sm"><div><p>Dibuat oleh,<br />PT Nurfita Karya Mandiri</p><div className="h-16" /><div className="border-t border-slate-400 pt-2">Project Control</div></div><div><p>Diperiksa oleh,<br />PT Hutama Karya</p><div className="h-16" /><div className="border-t border-slate-400 pt-2">Site Representative</div></div></div>
            </section>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}

function EntryTable({ entries, emptyText, bare = false }: { entries: StoredEntry[]; emptyText: string; bare?: boolean }) {
  const content = entries.length === 0 ? <div className="p-8 text-center text-sm text-[#232b2b]">{emptyText}</div> : <div className="overflow-x-auto"><Table><TableHeader><TableRow className="bg-slate-50"><TableHead>Tanggal</TableHead><TableHead>Area</TableHead><TableHead>Kategori</TableHead><TableHead className="min-w-56">Uraian</TableHead><TableHead>Volume</TableHead><TableHead>Status</TableHead></TableRow></TableHeader><TableBody>{entries.map((entry) => <TableRow key={entry.id}><TableCell className="text-xs">{formatDate(entry.entryDate)}</TableCell><TableCell className="text-xs">{entry.zone}</TableCell><TableCell className="text-xs">{categoryLabels[entry.category]}</TableCell><TableCell className="whitespace-normal"><strong>{entry.itemName}</strong>{entry.notes && <p className="mt-1 text-xs leading-5 text-[#232b2b]">{entry.notes}</p>}</TableCell><TableCell className="font-mono text-xs">{entry.quantity > 0 ? `${formatNumber(entry.quantity)} ${entry.unit}` : "—"}</TableCell><TableCell className="text-xs">{entry.status}</TableCell></TableRow>)}</TableBody></Table></div>;
  if (bare) return content;
  return <Card className="rounded-md border-slate-200 shadow-none"><CardHeader className="border-b border-slate-100"><CardTitle className="font-serif text-xl">Aktivitas Lapangan</CardTitle><CardDescription>Catatan terpublikasi untuk HK.</CardDescription></CardHeader><CardContent className="p-0">{content}</CardContent></Card>;
}

function PhotoGrid({ entries }: { entries: StoredEntry[] }) {
  if (entries.length === 0) return <div className="grid min-h-44 place-items-center rounded-sm border border-dashed border-slate-300 text-center text-sm text-[#232b2b]"><span><Camera className="mx-auto mb-2 size-7" />Dokumentasi belum tersedia.</span></div>;
  return <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{entries.map((entry) => <figure key={entry.id} className="overflow-hidden rounded-sm border border-slate-200"><div className="relative aspect-[4/3]"><Image src={entry.photoKey || ""} alt={entry.itemName} fill unoptimized className="object-cover" /></div><figcaption className="p-3 text-xs"><strong>{formatDate(entry.entryDate)} · {entry.zone}</strong><span className="mt-1 block leading-5 text-[#232b2b]">{entry.itemName}</span></figcaption></figure>)}</div>;
}

function ReportKpi({ label, value }: { label: string; value: string }) {
  return <div className="report-kpi"><span>{label}</span><strong className="text-sm sm:text-base">{value}</strong></div>;
}
