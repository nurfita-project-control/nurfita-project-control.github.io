"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  BarChart3,
  BriefcaseBusiness,
  CalendarDays,
  Camera,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  FileText,
  ImageIcon,
  Loader2,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Printer,
  ReceiptText,
  RefreshCw,
  Save,
  ShieldCheck,
  Truck,
  UserCog,
  UserRound,
  Users,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  activities,
  categoryLabels,
  formatDate,
  formatRupiah,
  plannedProgress,
  soilTargets,
  truckCapacity,
  zones,
} from "@/lib/project-data";
import { fileToDataUrl, readEntries, saveEntry, subscribeEntries } from "@/lib/client-storage";

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

type TabValue = "dashboard" | "input" | "schedule" | "report" | "cost";

const navItems: { value: TabValue; label: string; icon: typeof BarChart3 }[] = [
  { value: "dashboard", label: "Dashboard", icon: BarChart3 },
  { value: "input", label: "Laporan Harian", icon: Plus },
  { value: "schedule", label: "Master Schedule", icon: CalendarDays },
  { value: "report", label: "Laporan HK", icon: FileText },
  { value: "cost", label: "Biaya Internal", icon: ReceiptText },
];

const initialCosts: Array<{ label: string; week1: number; week2: number }> = [];

const curveDates = [
  "2026-01-01",
  "2026-01-08",
  "2026-01-15",
  "2026-01-22",
  "2026-01-29",
  "2026-02-05",
  "2026-02-12",
  "2026-02-19",
  "2026-02-28",
];

function cx(...values: Array<string | false | undefined>) {
  return values.filter(Boolean).join(" ");
}

function ProgressLine({ value }: { value: number }) {
  return (
    <div className="flex min-w-[150px] items-center gap-3">
      <Progress value={value} className="h-1.5 bg-slate-200 [&_[data-slot=progress-indicator]]:bg-[#50b8e7]" />
      <span className="w-10 text-right font-mono text-xs tabular-nums">{value.toFixed(1)}%</span>
    </div>
  );
}

function StatCard({
  label,
  value,
  note,
  icon: Icon,
  tone = "default",
}: {
  label: string;
  value: string;
  note: string;
  icon: typeof Truck;
  tone?: "default" | "good" | "warning";
}) {
  return (
    <Card className="gap-4 rounded-md border-slate-200 py-5 shadow-none">
      <CardContent className="px-5">
        <div className="mb-5 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[#232b2b]">{label}</span>
          <span className="grid size-8 place-items-center rounded-sm bg-slate-100 text-[#0e1111]">
            <Icon className="size-4" />
          </span>
        </div>
        <div className="font-serif text-3xl font-semibold tracking-tight text-[#0e1111]">{value}</div>
        <p
          className="mt-1.5 text-xs font-medium leading-5 text-[#232b2b]"
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

function EmptyEntries({ action }: { action: () => void }) {
  return (
    <div className="grid min-h-52 place-items-center rounded-md border border-dashed border-slate-300 bg-slate-50/60 p-8 text-center">
      <div>
        <ClipboardList className="mx-auto size-8 text-[#232b2b]" />
        <p className="mt-3 font-semibold text-[#0e1111]">Belum ada catatan lapangan</p>
        <p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-[#232b2b]">
          Mulai dari administrasi, mobilisasi, pengiriman tanah, atau progres pekerjaan hari ini.
        </p>
        <Button onClick={action} className="mt-4 rounded-sm bg-[#17365d] hover:bg-[#102946]">
          <Plus className="size-4" /> Catat aktivitas
        </Button>
      </div>
    </div>
  );
}

type UserIdentity = {
  name: string;
  email: string;
  role: string;
};

export default function ProjectControl({ user }: { user?: UserIdentity }) {
  const [active, setActive] = useState<TabValue>("dashboard");
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [accessOpen, setAccessOpen] = useState(false);
  const [reportStart, setReportStart] = useState("2026-01-01");
  const [reportFinish, setReportFinish] = useState("2026-01-14");
  const currentUser: UserIdentity = user || {
    name: "Pengguna Demo",
    email: "Akses produksi melalui Supabase",
    role: "Project Control & Administration",
  };

  const loadEntries = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setEntries(readEntries());
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Data gagal dibaca");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const sync = () => {
      setEntries(readEntries());
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

  const actualProgress = useMemo(
    () =>
      activities.reduce((total, activity) => {
        const entry = latestByWbs.get(activity.code);
        return total + activity.weight * ((entry?.completion || 0) / 100);
      }, 0),
    [latestByWbs],
  );

  const planToday = plannedProgress(new Date());
  const soilEntries = entries.filter((entry) => entry.category === "soil");
  const soilSouth = soilEntries.filter((entry) => entry.wing === "Selatan").reduce((sum, entry) => sum + entry.quantity, 0);
  const soilNorth = soilEntries.filter((entry) => entry.wing === "Utara").reduce((sum, entry) => sum + entry.quantity, 0);
  const actualCost = entries.filter((entry) => entry.category === "expense" && entry.status === "actual").reduce((sum, entry) => sum + entry.amount, 0);
  const plannedCost = entries.filter((entry) => entry.category === "expense" && entry.status === "plan").reduce((sum, entry) => sum + entry.amount, 0);

  const chartData = useMemo(
    () =>
      curveDates.map((date) => {
        const progressEntries = entries
          .filter((entry) => entry.category === "progress" && entry.wbsCode && entry.entryDate <= date)
          .sort((a, b) => a.entryDate.localeCompare(b.entryDate) || a.id - b.id);
        const snapshots = new Map<string, Entry>();
        progressEntries.forEach((entry) => snapshots.set(entry.wbsCode as string, entry));
        const actual = activities.reduce(
          (sum, activity) => sum + activity.weight * ((snapshots.get(activity.code)?.completion || 0) / 100),
          0,
        );
        return {
          date: new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short" }).format(new Date(`${date}T00:00:00`)),
          plan: Number(plannedProgress(new Date(`${date}T23:59:59Z`)).toFixed(2)),
          actual: Number(actual.toFixed(2)),
        };
      }),
    [entries],
  );

  const reportEntries = entries.filter(
    (entry) => entry.hkVisible && entry.entryDate >= reportStart && entry.entryDate <= reportFinish,
  );

  const navigate = (value: TabValue) => {
    setActive(value);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const currentPage = navItems.find((item) => item.value === active) || navItems[0];
  const CurrentPageIcon = currentPage.icon;

  const navigation = (compact = false) => (
    <nav className="space-y-1" aria-label="Menu utama">
      {navItems.map((item) => (
        <button
          key={item.value}
          type="button"
          onClick={() => navigate(item.value)}
          title={compact ? item.label : undefined}
          className={cx(
            "flex h-11 w-full items-center rounded-sm text-sm font-medium transition-colors",
            compact ? "justify-center px-2" : "gap-3 px-3",
            active === item.value
              ? "bg-[#e9eef4] text-[#0e1111]"
              : "text-[#232b2b] hover:bg-slate-50 hover:text-[#0e1111]",
          )}
        >
          <item.icon className="size-[18px] shrink-0" />
          {!compact && <span>{item.label}</span>}
        </button>
      ))}
    </nav>
  );

  const documentStatus = (compact = false) => compact ? null : (
    <div className="mt-7 rounded-sm border border-slate-200 bg-[#faf9f6] p-4">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.1em] text-[#232b2b]">
        <ShieldCheck className="size-4 text-[#232b2b]" /> Status Dokumen
      </div>
      <div className="mt-3 space-y-2 text-sm">
        <div className="flex items-center justify-between gap-3"><span>Kontrak</span><Badge className="rounded-sm bg-slate-700">Proses</Badge></div>
        <div className="flex items-center justify-between gap-3"><span>Jaminan</span><Badge variant="outline" className="rounded-sm">Review</Badge></div>
        <div className="flex items-center justify-between gap-3"><span>Shop drawing</span><Badge variant="outline" className="rounded-sm">Submittal</Badge></div>
      </div>
    </div>
  );

  return (
    <div className={cx("min-h-screen bg-[#f4f3ef] text-[#0e1111] lg:grid", sidebarCollapsed ? "lg:grid-cols-[84px_minmax(0,1fr)]" : "lg:grid-cols-[260px_minmax(0,1fr)]")}>
      <aside className={cx("print-hidden sticky top-0 hidden h-screen flex-col border-r border-slate-200 bg-white lg:flex", sidebarCollapsed ? "px-3" : "px-5")}>
        <div className={cx("flex h-20 items-center border-b border-slate-100", sidebarCollapsed ? "justify-center" : "gap-3")}>
          <BrandLogo className={sidebarCollapsed ? "h-9 w-[60px]" : "h-9 w-14"} priority />
          {!sidebarCollapsed && <div className="min-w-0"><div className="font-serif text-base font-semibold leading-5 text-[#0e1111]">Nurfita Project Control</div><div className="mt-1 text-[11px] uppercase tracking-[0.11em] text-[#232b2b]">Project reporting system</div></div>}
        </div>
        <div className="flex-1 overflow-y-auto py-5">
          {!sidebarCollapsed && <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#232b2b]">Menu proyek</p>}
          {navigation(sidebarCollapsed)}
          {documentStatus(sidebarCollapsed)}
        </div>
        <div className={cx("mb-4 border-t border-slate-100 pt-4", sidebarCollapsed ? "flex justify-center" : "") }>
          {sidebarCollapsed ? <div className="grid size-9 place-items-center rounded-full bg-slate-100 text-xs font-bold text-[#0e1111]">PC</div> : <div className="flex items-center gap-3"><div className="grid size-9 shrink-0 place-items-center rounded-full bg-slate-100 text-xs font-bold text-[#0e1111]">PC</div><div className="min-w-0"><p className="truncate text-sm font-semibold">{currentUser.name}</p><p className="truncate text-xs text-[#232b2b]">{currentUser.role}</p></div></div>}
        </div>
      </aside>

      <section className="min-w-0">
        <header className="print-hidden sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-2.5">
              <BrandLogo className="h-8 w-14 lg:hidden" priority />
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#232b2b]"><CurrentPageIcon className="size-4" /> Area Kerja</div>
                <div className="truncate font-serif text-lg font-semibold text-[#0e1111]">{currentPage.label}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="hidden rounded-sm border-slate-300 bg-white px-3 py-1 text-[#232b2b] md:inline-flex">Mode Demo Aman</Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button type="button" className="flex h-10 items-center gap-2 rounded-sm border border-slate-200 bg-white px-2.5 text-left hover:bg-slate-50" aria-label="Buka profil pengguna">
                    <span className="grid size-7 place-items-center rounded-full bg-[#17365d] text-[11px] font-bold text-white">PC</span>
                    <span className="hidden max-w-32 sm:block"><span className="block truncate text-xs font-semibold">{currentUser.name}</span><span className="block truncate text-[11px] text-[#232b2b]">{currentUser.role}</span></span>
                    <ChevronDown className="hidden size-3.5 text-[#232b2b] sm:block" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 rounded-sm">
                  <DropdownMenuLabel className="p-3"><span className="block text-sm font-semibold">{currentUser.name}</span><span className="mt-0.5 block truncate text-xs font-normal text-[#232b2b]">{currentUser.email}</span></DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={() => setAccessOpen(true)}><UserCog className="size-4" /> Pengguna & akses</DropdownMenuItem>
                  <DropdownMenuItem asChild><a href="/hk/"><FileText className="size-4" /> Portal laporan HK</a></DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <button type="button" onClick={() => setSidebarCollapsed((value) => !value)} className="hidden size-10 place-items-center rounded-sm border border-slate-200 bg-white text-[#232b2b] hover:bg-slate-50 lg:grid" aria-label={sidebarCollapsed ? "Perluas menu" : "Ringkas menu"}>{sidebarCollapsed ? <PanelLeftOpen className="size-5" /> : <PanelLeftClose className="size-5" />}</button>
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild><button type="button" className="grid size-10 place-items-center rounded-sm border border-slate-200 bg-white text-[#232b2b] lg:hidden" aria-label="Buka menu"><Menu className="size-5" /></button></SheetTrigger>
                <SheetContent side="left" className="w-[86vw] max-w-[320px] gap-0 bg-white p-0">
                  <SheetHeader className="border-b border-slate-100 p-5 text-left"><SheetTitle className="flex items-center gap-3 font-serif text-lg text-[#0e1111]"><BrandLogo className="h-10 w-[72px]" priority /><span>Nurfita Project Control</span></SheetTitle><SheetDescription>Landscape Integrated Building</SheetDescription></SheetHeader>
                  <div className="flex-1 overflow-y-auto p-4"><p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#232b2b]">Menu proyek</p>{navigation(false)}{documentStatus(false)}</div>
                  <div className="border-t border-slate-100 p-4"><div className="flex items-center gap-3"><div className="grid size-9 place-items-center rounded-full bg-slate-100 text-xs font-bold text-[#0e1111]">PC</div><div className="min-w-0"><p className="truncate text-sm font-semibold">{currentUser.name}</p><p className="truncate text-xs text-[#232b2b]">{currentUser.role}</p></div></div></div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </header>

        <main className="min-w-0 p-4 sm:p-6 lg:p-8">
          <div className="mb-5 rounded-sm border border-[#50b8e7] bg-[#eef9fd] px-4 py-3 text-sm leading-6 text-[#0e1111]">
            <ShieldCheck className="mr-2 inline size-4" /> Mode demo aman. Data produksi akan tampil setelah koneksi Supabase dan login diaktifkan.
          </div>
          {error && (
            <div className="mb-5 flex items-start justify-between gap-4 rounded-sm border border-[#e5a3a3] bg-[#faeaea] px-4 py-3 text-sm text-[#0e1111]">
              <span><AlertTriangle className="mr-2 inline size-4" />{error}</span>
              <Button variant="ghost" size="sm" onClick={loadEntries}><RefreshCw className="size-4" /></Button>
            </div>
          )}

          {active === "dashboard" && <DashboardView entries={entries} loading={loading} actualProgress={actualProgress} planToday={planToday} soilSouth={soilSouth} soilNorth={soilNorth} chartData={chartData} onInput={() => navigate("input")} />}
          {active === "input" && <InputView onSaved={(entry) => { setEntries((current) => [entry, ...current]); navigate("dashboard"); }} />}
          {active === "schedule" && <ScheduleView latestByWbs={latestByWbs} chartData={chartData} />}
          {active === "report" && <ReportView entries={reportEntries} start={reportStart} finish={reportFinish} setStart={setReportStart} setFinish={setReportFinish} actualProgress={actualProgress} planToday={planToday} />}
          {active === "cost" && <CostView entries={entries} actualCost={actualCost} plannedCost={plannedCost} onInput={() => navigate("input")} />}
        </main>
      </section>

      <Dialog open={accessOpen} onOpenChange={setAccessOpen}>
        <DialogContent className="max-w-2xl rounded-sm">
          <DialogHeader><DialogTitle className="font-serif text-2xl text-[#0e1111]">Pengguna & Akses</DialogTitle><DialogDescription>Struktur hak akses sudah disiapkan untuk pemakaian beberapa akun.</DialogDescription></DialogHeader>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { icon: UserCog, title: "Admin", text: "Dashboard, input, jadwal, laporan, biaya, dan pengaturan pengguna." },
              { icon: Users, title: "Tim Lapangan", text: "Input harian, foto, material, tenaga kerja, dan kendala lapangan." },
              { icon: UserRound, title: "Viewer HK", text: "Ringkasan progres, Kurva S, foto publikasi, dan laporan mingguan." },
            ].map((role) => <div key={role.title} className="rounded-sm border border-slate-200 p-4"><role.icon className="size-5 text-[#0e1111]" /><p className="mt-3 font-semibold">{role.title}</p><p className="mt-1 text-sm leading-6 text-[#232b2b]">{role.text}</p></div>)}
          </div>
          <div className="rounded-sm border border-[#d8c9a8] bg-[#f8f5ed] p-4 text-sm leading-6 text-[#232b2b]">Aktivasi pengguna dilakukan menggunakan alamat email. Setiap orang masuk memakai akun masing-masing dan menerima menu sesuai perannya.</div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function DashboardView({ entries, loading, actualProgress, planToday, soilSouth, soilNorth, chartData, onInput }: { entries: Entry[]; loading: boolean; actualProgress: number; planToday: number; soilSouth: number; soilNorth: number; chartData: Array<{ date: string; plan: number; actual: number }>; onInput: () => void }) {
  const totalRit = Math.ceil((soilSouth + soilNorth) / truckCapacity);
  const deviation = actualProgress - planToday;
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Ringkasan pengendalian proyek</p>
          <h1 className="page-title">Dashboard Proyek</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#232b2b]">Kendali progres, pasokan tanah, dokumen, dan biaya dalam satu catatan lapangan.</p>
        </div>
        <Button onClick={onInput} className="rounded-sm bg-[#17365d] hover:bg-[#102946]"><Plus className="size-4" /> Input hari ini</Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Rencana hari ini" value={`${planToday.toFixed(2)}%`} note="Baseline contoh untuk pratinjau antarmuka" icon={CalendarDays} />
        <StatCard label="Realisasi tercatat" value={`${actualProgress.toFixed(2)}%`} note={`${deviation >= 0 ? "+" : ""}${deviation.toFixed(2)}% terhadap rencana`} icon={BarChart3} tone={deviation >= 0 ? "good" : "warning"} />
        <StatCard label="Material masuk" value={`${soilSouth + soilNorth} unit`} note={`${totalRit} pengiriman contoh tercatat`} icon={Truck} />
        <StatCard label="Catatan lapangan" value={`${entries.length}`} note="Progres, material, tenaga, kendala, dan biaya" icon={ClipboardList} />
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,.75fr)]">
        <Card className="rounded-md border-slate-200 shadow-none">
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="font-serif text-xl text-[#0e1111]">Kurva S</CardTitle>
            <CardDescription>Perbandingan kumulatif rencana dan realisasi berdasarkan bobot WBS.</CardDescription>
          </CardHeader>
          <CardContent className="h-[320px] px-2 pb-2 sm:px-5">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 14, right: 20, bottom: 5, left: -18 }}>
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="2 4" vertical={false} />
                <XAxis dataKey="date" tick={{ fill: "#232b2b", fontSize: 11 }} tickLine={false} axisLine={{ stroke: "#cbd5e1" }} minTickGap={28} />
                <YAxis domain={[0, 100]} tick={{ fill: "#232b2b", fontSize: 11 }} tickLine={false} axisLine={false} unit="%" />
                <Tooltip formatter={(value) => [`${Number(value).toFixed(2)}%`]} contentStyle={{ borderRadius: 4, borderColor: "#cbd5e1", fontSize: 12 }} />
                <Line type="monotone" dataKey="plan" name="Rencana" stroke="#232b2b" strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="actual" name="Realisasi" stroke={deviation >= 0 ? "#50b8e7" : "#e5a3a3"} strokeWidth={2.5} dot={{ r: 2 }} connectNulls />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="rounded-md border-slate-200 shadow-none">
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="font-serif text-xl text-[#0e1111]">Perhatian Minggu Ini</CardTitle>
            <CardDescription>Agenda kontrol yang perlu ditutup oleh tim.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              ["Administrasi", "Lengkapi dokumen proyek", "Tinggi"],
              ["Engineering", "Tinjau submittal dan persetujuan material", "Tinggi"],
              ["Lapangan", "Perbarui progres dan dokumentasi harian", "Aktif"],
              ["Koordinasi", "Catat kendala serta tindak lanjut", "Pantau"],
            ].map(([label, text, status], index) => (
              <div key={label} className="flex gap-3 border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-sm bg-slate-100 font-mono text-xs text-[#0e1111]">0{index + 1}</span>
                <div className="min-w-0 flex-1"><p className="text-xs font-semibold uppercase tracking-wider text-[#232b2b]">{label}</p><p className="mt-1 text-sm leading-5 text-[#0e1111]">{text}</p></div>
                <Badge variant="outline" className="h-6 rounded-sm text-[10px]">{status}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-5 xl:grid-cols-[.78fr_1.22fr]">
        <Card className="rounded-md border-slate-200 shadow-none">
          <CardHeader><CardTitle className="font-serif text-xl text-[#0e1111]">Material Curah</CardTitle><CardDescription>Angka contoh untuk pratinjau tampilan mobile.</CardDescription></CardHeader>
          <CardContent className="space-y-5">
            {(["Selatan", "Utara"] as const).map((wing) => {
              const actual = wing === "Selatan" ? soilSouth : soilNorth;
              const target = soilTargets[wing];
              return <div key={wing}><div className="mb-2 flex justify-between text-sm"><span className="font-semibold">Sayap {wing}</span><span className="font-mono text-xs">{actual} / {target} m³ · {Math.ceil((target - actual) / truckCapacity)} rit sisa</span></div><ProgressLine value={Math.min(100, actual / target * 100)} /></div>;
            })}
            <div className="rounded-sm bg-[#f4f1e9] p-3 text-xs leading-5 text-[#232b2b]">Target produksi dan kapasitas angkut tersimpan pada basis data terproteksi.</div>
          </CardContent>
        </Card>

        <Card className="rounded-md border-slate-200 shadow-none">
          <CardHeader className="border-b border-slate-100"><CardTitle className="font-serif text-xl text-[#0e1111]">Aktivitas Terbaru</CardTitle><CardDescription>Catatan paling baru dari lapangan dan kantor proyek.</CardDescription></CardHeader>
          <CardContent className="px-0">
            {loading ? <div className="grid h-52 place-items-center"><Loader2 className="size-6 animate-spin text-[#232b2b]" /></div> : entries.length === 0 ? <div className="px-6"><EmptyEntries action={onInput} /></div> : (
              <div className="divide-y divide-slate-100">
                {entries.slice(0, 6).map((entry) => <div key={entry.id} className="flex items-center gap-4 px-6 py-3"><span className="grid size-9 shrink-0 place-items-center rounded-sm bg-slate-100 text-[#0e1111]">{entry.category === "soil" ? <Truck className="size-4" /> : entry.category === "expense" ? <ReceiptText className="size-4" /> : entry.category === "manpower" ? <Users className="size-4" /> : <ClipboardList className="size-4" />}</span><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{entry.itemName}</p><p className="mt-0.5 text-xs text-[#232b2b]">{formatDate(entry.entryDate)} · {entry.wing} · {categoryLabels[entry.category]}</p></div>{entry.quantity > 0 && <span className="font-mono text-xs">{entry.quantity} {entry.unit}</span>}<ChevronRight className="size-4 text-slate-300" /></div>)}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function InputView({ onSaved }: { onSaved: (entry: Entry) => void }) {
  const [category, setCategory] = useState("progress");
  const [wing, setWing] = useState("Selatan");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const today = new Date().toISOString().slice(0, 10);
  const options = activities.filter((activity) => activity.wing === wing || activity.wing === "Umum");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    const form = event.currentTarget;
    const payload = new FormData(form);
    payload.set("category", category);
    payload.set("wing", wing);
    try {
      const photo = payload.get("photo");
      if (photo instanceof File && photo.size > 2_500_000) {
        throw new Error("Foto tahap awal maksimal 2,5 MB. Penyimpanan Supabase akan mendukung ukuran lebih besar.");
      }
      const photoKey = photo instanceof File && photo.size > 0 ? await fileToDataUrl(photo) : null;
      const entry: Entry = {
        id: Date.now(),
        entryDate: String(payload.get("entryDate") || today),
        category,
        wing: wing as Entry["wing"],
        zone: String(payload.get("zone") || "Area kerja umum"),
        wbsCode: payload.get("wbsCode") ? String(payload.get("wbsCode")) : null,
        itemName: String(payload.get("itemName") || "Catatan lapangan"),
        quantity: Number(payload.get("quantity") || 0),
        unit: String(payload.get("unit") || ""),
        completion: Number(payload.get("completion") || 0),
        amount: Number(payload.get("amount") || 0),
        workers: Number(payload.get("workers") || 0),
        status: String(payload.get("status") || "actual"),
        vendor: String(payload.get("vendor") || ""),
        notes: String(payload.get("notes") || ""),
        photoKey,
        photoName: photo instanceof File && photo.size > 0 ? photo.name : null,
        hkVisible: payload.get("hkVisible") === "true",
        createdBy: String(payload.get("createdBy") || "Tim Nurfita"),
        createdAt: new Date().toISOString(),
      };
      saveEntry(entry);
      form.reset();
      onSaved(entry);
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : "Catatan gagal disimpan");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div><p className="eyebrow">Daily site record</p><h1 className="page-title">Input Harian</h1><p className="mt-2 text-sm leading-6 text-[#232b2b]">Satu formulir untuk progres, tanah, material, tenaga kerja, kendala, dan biaya.</p></div>
      <Card className="rounded-md border-slate-200 shadow-none">
        <CardHeader className="border-b border-slate-100"><CardTitle className="font-serif text-xl text-[#0e1111]">Catatan Baru</CardTitle><CardDescription>Isi data yang dapat diverifikasi. Foto akan tersimpan bersama tanggal dan lokasi.</CardDescription></CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-6">
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2"><Label htmlFor="entryDate">Tanggal</Label><Input id="entryDate" name="entryDate" type="date" defaultValue={today} required className="rounded-sm" /></div>
              <div className="space-y-2"><Label>Kategori catatan</Label><Select value={category} onValueChange={setCategory}><SelectTrigger className="w-full rounded-sm"><SelectValue /></SelectTrigger><SelectContent>{Object.entries(categoryLabels).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-2"><Label>Sayap / area kerja</Label><Select value={wing} onValueChange={setWing}><SelectTrigger className="w-full rounded-sm"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Selatan">Area Selatan</SelectItem><SelectItem value="Utara">Area Utara</SelectItem><SelectItem value="Umum">Umum / Administrasi</SelectItem></SelectContent></Select></div>
              <div className="space-y-2"><Label>Zona</Label><Select name="zone" defaultValue="Area kerja umum"><SelectTrigger className="w-full rounded-sm"><SelectValue /></SelectTrigger><SelectContent>{zones.map((zone) => <SelectItem key={zone} value={zone}>{zone}</SelectItem>)}</SelectContent></Select></div>
            </div>

            {(category === "progress" || category === "soil") && <div className="space-y-2"><Label>WBS / item master schedule</Label><Select name="wbsCode"><SelectTrigger className="w-full rounded-sm"><SelectValue placeholder="Pilih item jadwal" /></SelectTrigger><SelectContent>{options.map((activity) => <SelectItem key={activity.code} value={activity.code}>{activity.code} · {activity.name}</SelectItem>)}</SelectContent></Select></div>}

            <div className="space-y-2"><Label htmlFor="itemName">Uraian aktivitas / barang</Label><Input id="itemName" name="itemName" required defaultValue={category === "soil" ? "Material curah masuk" : ""} placeholder="Contoh: Pekerjaan area A" className="rounded-sm" /></div>

            <div className="grid gap-5 sm:grid-cols-3">
              <div className="space-y-2"><Label htmlFor="quantity">Jumlah</Label><Input id="quantity" name="quantity" type="number" step="0.01" min="0" defaultValue={category === "soil" ? truckCapacity : 0} className="rounded-sm" /></div>
              <div className="space-y-2"><Label htmlFor="unit">Satuan</Label><Input id="unit" name="unit" defaultValue={category === "soil" ? "m³" : category === "manpower" ? "orang" : ""} placeholder="m³, batang, unit" className="rounded-sm" /></div>
              <div className="space-y-2"><Label htmlFor="completion">Progres kumulatif WBS (%)</Label><Input id="completion" name="completion" type="number" min="0" max="100" step="0.01" defaultValue="0" disabled={category !== "progress"} className="rounded-sm" /></div>
            </div>

            {category === "manpower" && <div className="space-y-2"><Label htmlFor="workers">Jumlah tenaga hadir</Label><Input id="workers" name="workers" type="number" min="0" defaultValue="0" className="rounded-sm" /></div>}

            {category === "expense" && <div className="grid gap-5 sm:grid-cols-3"><div className="space-y-2 sm:col-span-2"><Label htmlFor="amount">Nilai biaya (Rp)</Label><Input id="amount" name="amount" type="number" min="0" step="1000" placeholder="0" className="rounded-sm" /></div><div className="space-y-2"><Label>Status biaya</Label><Select name="status" defaultValue="actual"><SelectTrigger className="w-full rounded-sm"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="plan">Rencana</SelectItem><SelectItem value="actual">Realisasi</SelectItem></SelectContent></Select></div><div className="space-y-2 sm:col-span-3"><Label htmlFor="vendor">Vendor / penerima</Label><Input id="vendor" name="vendor" placeholder="Nama supplier atau penerima pembayaran" className="rounded-sm" /></div></div>}

            <div className="space-y-2"><Label htmlFor="notes">Catatan lapangan</Label><Textarea id="notes" name="notes" rows={4} placeholder="Lokasi detail, kondisi, instruksi HK, kendala, dan tindak lanjut..." className="rounded-sm" /></div>

            <div className="grid gap-5 sm:grid-cols-2">
              <label className="group grid min-h-36 cursor-pointer place-items-center rounded-sm border border-dashed border-slate-300 bg-slate-50 p-5 text-center hover:border-[#17365d] hover:bg-slate-100"><input type="file" name="photo" accept="image/*" capture="environment" className="sr-only" /><span><Camera className="mx-auto size-7 text-[#232b2b] group-hover:text-[#0e1111]" /><span className="mt-2 block text-sm font-semibold">Ambil atau pilih foto</span><span className="mt-1 block text-xs text-[#232b2b]">JPG/PNG, maksimal 8 MB</span></span></label>
              <div className="rounded-sm border border-slate-200 p-5"><p className="text-sm font-semibold">Kontrol publikasi</p><label className="mt-4 flex cursor-pointer items-start gap-3"><Checkbox name="hkVisible" value="true" defaultChecked /><span><span className="block text-sm">Masukkan ke laporan HK</span><span className="mt-1 block text-xs leading-5 text-[#232b2b]">Biaya internal dan catatan sensitif dapat dikeluarkan dari laporan eksternal.</span></span></label><div className="mt-4 space-y-2"><Label htmlFor="createdBy">Diinput oleh</Label><Input id="createdBy" name="createdBy" defaultValue="Tim Nurfita" className="rounded-sm" /></div></div>
            </div>

            {message && <p className="rounded-sm border border-[#e5a3a3] bg-[#faeaea] p-3 text-sm text-[#0e1111]">{message}</p>}
            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end"><Button type="reset" variant="outline" className="rounded-sm">Kosongkan</Button><Button type="submit" disabled={saving} className="rounded-sm bg-[#17365d] hover:bg-[#102946]">{saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />} Simpan catatan</Button></div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function ScheduleView({ latestByWbs, chartData }: { latestByWbs: Map<string, Entry>; chartData: Array<{ date: string; plan: number; actual: number }> }) {
  const [filter, setFilter] = useState("Semua");
  const list = activities.filter((activity) => filter === "Semua" || activity.wing === filter);
  const today = new Date().toISOString().slice(0, 10);
  const currentIndex = Math.max(0, curveDates.reduce((index, date, candidate) => date <= today ? candidate : index, 0));
  const currentCurve = chartData[currentIndex];
  const actualStroke = currentCurve && currentCurve.actual >= currentCurve.plan ? "#50b8e7" : "#e5a3a3";
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="eyebrow">Baseline proyek</p><h1 className="page-title">Master Schedule & Kurva S</h1><p className="mt-2 text-sm leading-6 text-[#232b2b]">Data contoh untuk validasi tampilan. Baseline produksi tersedia setelah login.</p></div><Select value={filter} onValueChange={setFilter}><SelectTrigger className="w-full rounded-sm bg-white sm:w-48"><SelectValue /></SelectTrigger><SelectContent>{["Semua", "Umum", "Selatan", "Utara"].map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}</SelectContent></Select></div>
      <Card className="rounded-md border-slate-200 shadow-none"><CardHeader className="border-b border-slate-100"><CardTitle className="font-serif text-xl text-[#0e1111]">Kurva S Baseline</CardTitle><CardDescription>Realisasi mengikuti entri progres kumulatif per WBS.</CardDescription></CardHeader><CardContent className="h-72 px-2"><ResponsiveContainer width="100%" height="100%"><LineChart data={chartData} margin={{ top: 10, right: 22, bottom: 6, left: -18 }}><CartesianGrid stroke="#e2e8f0" strokeDasharray="2 4" vertical={false} /><XAxis dataKey="date" tick={{ fill: "#232b2b", fontSize: 11 }} minTickGap={25} tickLine={false} /><YAxis domain={[0, 100]} unit="%" tick={{ fill: "#232b2b", fontSize: 11 }} tickLine={false} axisLine={false} /><Tooltip formatter={(value) => `${Number(value).toFixed(2)}%`} /><Line type="monotone" dataKey="plan" name="Rencana" stroke="#232b2b" strokeWidth={2.5} dot={false} /><Line type="monotone" dataKey="actual" name="Realisasi" stroke={actualStroke} strokeWidth={2.5} dot={false} /></LineChart></ResponsiveContainer></CardContent></Card>
      <Card className="rounded-md border-slate-200 shadow-none"><CardHeader className="border-b border-slate-100"><CardTitle className="font-serif text-xl text-[#0e1111]">Daftar WBS</CardTitle><CardDescription>Wood panel dan vertical garden ditempatkan pada fase akhir pekerjaan sesuai arahan proyek.</CardDescription></CardHeader><CardContent className="px-0"><Table><TableHeader><TableRow className="bg-slate-50"><TableHead className="pl-6">WBS</TableHead><TableHead>Sayap</TableHead><TableHead className="min-w-64">Uraian</TableHead><TableHead>Mulai</TableHead><TableHead>Selesai</TableHead><TableHead>Bobot</TableHead><TableHead className="min-w-48 pr-6">Realisasi item</TableHead></TableRow></TableHeader><TableBody>{list.map((activity) => { const entry = latestByWbs.get(activity.code); const today = new Date().toISOString().slice(0, 10); const status = entry?.completion === 100 ? "Selesai" : today < activity.start ? "Belum mulai" : today > activity.finish ? "Perlu update" : "Berjalan"; return <TableRow key={activity.code}><TableCell className="pl-6 font-mono font-semibold text-[#0e1111]">{activity.code}</TableCell><TableCell><Badge variant="outline" className="rounded-sm">{activity.wing}</Badge></TableCell><TableCell className="whitespace-normal font-medium">{activity.name}<div className="mt-1 text-[11px] text-[#232b2b]">{status}</div></TableCell><TableCell className="text-xs">{formatDate(activity.start)}</TableCell><TableCell className="text-xs">{formatDate(activity.finish)}</TableCell><TableCell className="font-mono text-xs">{activity.weight.toFixed(2)}%</TableCell><TableCell className="pr-6"><ProgressLine value={entry?.completion || 0} /></TableCell></TableRow>; })}</TableBody></Table></CardContent></Card>
    </div>
  );
}

function ReportView({ entries, start, finish, setStart, setFinish, actualProgress, planToday }: { entries: Entry[]; start: string; finish: string; setStart: (value: string) => void; setFinish: (value: string) => void; actualProgress: number; planToday: number }) {
  const soil = entries.filter((entry) => entry.category === "soil").reduce((sum, entry) => sum + entry.quantity, 0);
  const workers = entries.filter((entry) => entry.category === "manpower").reduce((sum, entry) => sum + entry.workers, 0);
  return (
    <div className="space-y-6">
      <div className="print-hidden flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="eyebrow">Dokumen eksternal</p><h1 className="page-title">Laporan Mingguan HK</h1><p className="mt-2 text-sm leading-6 text-[#232b2b]">Isi laporan berasal dari catatan yang berstatus “Masukkan ke laporan HK”.</p></div><Button onClick={() => window.print()} className="rounded-sm bg-[#17365d] hover:bg-[#102946]"><Printer className="size-4" /> Cetak / Simpan PDF</Button></div>
      <Card className="print-hidden rounded-md border-slate-200 shadow-none"><CardContent className="grid gap-4 py-5 sm:grid-cols-[1fr_1fr_auto]"><div className="space-y-2"><Label>Dari tanggal</Label><Input type="date" value={start} onChange={(event) => setStart(event.target.value)} className="rounded-sm" /></div><div className="space-y-2"><Label>Sampai tanggal</Label><Input type="date" value={finish} onChange={(event) => setFinish(event.target.value)} className="rounded-sm" /></div><Button variant="outline" className="self-end rounded-sm" onClick={() => { setStart("2026-09-07"); setFinish(new Date().toISOString().slice(0, 10)); }}><RefreshCw className="size-4" /> Perbarui</Button></CardContent></Card>
      <section className="report-sheet rounded-sm border border-slate-300 bg-white p-5 sm:p-8">
        <div className="flex items-start justify-between gap-4 border-b-2 border-[#17365d] pb-5 sm:gap-6"><div><div className="text-xs font-semibold uppercase tracking-[0.18em] text-[#232b2b]">PT Nurfita Karya Mandiri</div><h2 className="mt-2 font-serif text-2xl font-bold text-[#0e1111]">Laporan Progres Mingguan</h2><p className="mt-1 text-sm text-[#232b2b]">Identitas pekerjaan dimuat dari basis data terproteksi.</p></div><BrandLogo className="h-12 w-24 sm:h-14 sm:w-28" /></div>
        <div className="mt-5 grid gap-x-10 gap-y-2 text-sm sm:grid-cols-2"><div className="flex justify-between border-b border-slate-100 py-1.5"><span className="text-[#232b2b]">Periode</span><strong>{formatDate(start)} — {formatDate(finish)}</strong></div><div className="flex justify-between border-b border-slate-100 py-1.5"><span className="text-[#232b2b]">Kontrak</span><strong>Data terproteksi</strong></div><div className="flex justify-between border-b border-slate-100 py-1.5"><span className="text-[#232b2b]">Rencana kumulatif</span><strong>{planToday.toFixed(2)}%</strong></div><div className="flex justify-between border-b border-slate-100 py-1.5"><span className="text-[#232b2b]">Realisasi kumulatif</span><strong>{actualProgress.toFixed(2)}%</strong></div></div>
        <div className="my-6 grid gap-3 sm:grid-cols-3"><div className="report-kpi"><span>Catatan periode</span><strong>{entries.length}</strong></div><div className="report-kpi"><span>Tanah masuk</span><strong>{soil} m³</strong></div><div className="report-kpi"><span>Akumulasi tenaga</span><strong>{workers} OH</strong></div></div>
        <h3 className="report-heading">A. Ringkasan Aktivitas</h3>
        {entries.length === 0 ? <div className="rounded-sm border border-dashed border-slate-300 p-8 text-center text-sm text-[#232b2b]">Belum ada catatan HK pada periode ini.</div> : <Table><TableHeader><TableRow className="bg-slate-100"><TableHead>Tanggal</TableHead><TableHead>Lokasi</TableHead><TableHead className="min-w-64">Uraian</TableHead><TableHead>Volume</TableHead><TableHead>Progres</TableHead></TableRow></TableHeader><TableBody>{entries.map((entry) => <TableRow key={entry.id}><TableCell className="text-xs">{formatDate(entry.entryDate)}</TableCell><TableCell className="text-xs">{entry.wing}<br /><span className="text-[#232b2b]">{entry.zone}</span></TableCell><TableCell className="whitespace-normal"><span className="font-medium">{entry.itemName}</span>{entry.notes && <p className="mt-1 text-xs leading-5 text-[#232b2b]">{entry.notes}</p>}</TableCell><TableCell className="font-mono text-xs">{entry.quantity || "—"} {entry.unit}</TableCell><TableCell className="font-mono text-xs">{entry.completion ? `${entry.completion}%` : "—"}</TableCell></TableRow>)}</TableBody></Table>}
        <h3 className="report-heading mt-7">B. Dokumentasi</h3>
        <div className="grid gap-4 sm:grid-cols-2">{entries.filter((entry) => entry.photoKey).slice(0, 6).map((entry) => <figure key={entry.id} className="overflow-hidden rounded-sm border border-slate-200"><div className="relative aspect-[4/3]"><Image src={entry.photoKey || ""} alt={entry.itemName} fill unoptimized className="object-cover" /></div><figcaption className="p-3 text-xs"><strong>{formatDate(entry.entryDate)} · {entry.wing}</strong><span className="mt-1 block text-[#232b2b]">{entry.itemName}</span></figcaption></figure>)}{entries.every((entry) => !entry.photoKey) && <div className="col-span-full grid h-32 place-items-center rounded-sm border border-dashed border-slate-300 text-center text-sm text-[#232b2b]"><span><ImageIcon className="mx-auto mb-2 size-6" />Belum ada foto pada periode ini</span></div>}</div>
        <h3 className="report-heading mt-7">C. Kendala dan Tindak Lanjut</h3>
        <div className="space-y-2">{entries.filter((entry) => entry.category === "constraint").map((entry) => <div key={entry.id} className="rounded-sm border border-slate-200 p-3 text-sm"><strong>{entry.itemName}</strong><p className="mt-1 text-[#232b2b]">{entry.notes || "Menunggu tindak lanjut."}</p></div>)}{!entries.some((entry) => entry.category === "constraint") && <p className="rounded-sm bg-slate-50 p-3 text-sm text-[#232b2b]">Belum ada kendala yang dipublikasikan pada periode ini.</p>}</div>
        <div className="mt-12 grid grid-cols-2 gap-12 text-center text-sm"><div><p>Dibuat oleh,<br />PT Nurfita Karya Mandiri</p><div className="h-20" /><div className="border-t border-slate-400 pt-2">Project Control & Administration</div></div><div><p>Diperiksa oleh,<br />Pemberi Kerja</p><div className="h-20" /><div className="border-t border-slate-400 pt-2">Site Representative</div></div></div>
      </section>
    </div>
  );
}

function CostView({ entries, actualCost, plannedCost, onInput }: { entries: Entry[]; actualCost: number; plannedCost: number; onInput: () => void }) {
  const expenseEntries = entries.filter((entry) => entry.category === "expense");
  const forecast1 = initialCosts.reduce((sum, item) => sum + item.week1, 0);
  const forecast2 = initialCosts.reduce((sum, item) => sum + item.week2, 0);
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="eyebrow">Khusus internal Nurfita</p><h1 className="page-title">Biaya & Rencana 2 Minggu</h1><p className="mt-2 text-sm leading-6 text-[#232b2b]">Kontrol kas untuk operasional dan bahan pembahasan dengan investor.</p></div><Button onClick={onInput} className="rounded-sm bg-[#17365d] hover:bg-[#102946]"><Plus className="size-4" /> Catat biaya</Button></div>
      <div className="grid gap-3 sm:grid-cols-3"><StatCard label="Rencana tercatat" value={formatRupiah(plannedCost)} note="Entri biaya berstatus rencana" icon={ClipboardList} /><StatCard label="Realisasi tercatat" value={formatRupiah(actualCost)} note="Pengeluaran aktual yang sudah diinput" icon={ReceiptText} /><StatCard label="Forecast awal 2 minggu" value={formatRupiah(forecast1 + forecast2)} note="Angka kerja untuk pembahasan internal" icon={BriefcaseBusiness} /></div>
      <Card className="rounded-md border-slate-200 shadow-none"><CardHeader className="border-b border-slate-100"><CardTitle className="font-serif text-xl text-[#0e1111]">Plan Kebutuhan Dana</CardTitle><CardDescription>Rencana kebutuhan dana produksi dimuat setelah pengguna masuk.</CardDescription></CardHeader><CardContent className="p-6 text-sm text-[#232b2b]">Belum ada data produksi pada mode demo.</CardContent></Card>
      <Card className="rounded-md border-slate-200 shadow-none"><CardHeader className="border-b border-slate-100"><CardTitle className="font-serif text-xl text-[#0e1111]">Buku Pengeluaran</CardTitle><CardDescription>Catatan internal ini tidak tampil pada laporan mingguan HK.</CardDescription></CardHeader><CardContent className="px-0">{expenseEntries.length === 0 ? <div className="p-6"><EmptyEntries action={onInput} /></div> : <Table><TableHeader><TableRow className="bg-slate-50"><TableHead className="pl-6">Tanggal</TableHead><TableHead>Uraian</TableHead><TableHead>Penerima</TableHead><TableHead>Status</TableHead><TableHead className="pr-6 text-right">Nilai</TableHead></TableRow></TableHeader><TableBody>{expenseEntries.map((entry) => <TableRow key={entry.id}><TableCell className="pl-6 text-xs">{formatDate(entry.entryDate)}</TableCell><TableCell className="whitespace-normal font-medium">{entry.itemName}</TableCell><TableCell>{entry.vendor || "—"}</TableCell><TableCell><Badge variant="outline" className="rounded-sm">{entry.status === "plan" ? "Rencana" : "Realisasi"}</Badge></TableCell><TableCell className="pr-6 text-right font-mono text-xs font-semibold">{formatRupiah(entry.amount)}</TableCell></TableRow>)}</TableBody></Table>}</CardContent></Card>
    </div>
  );
}
