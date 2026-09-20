"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { KeyRound, Loader2, LogOut, Plus, ShieldCheck, UserCog, UsersRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DEFAULT_USER_PASSWORD, canManageUsers, initials, roleDefinition, roleDefinitions, type RoleLevel, type UserProfile } from "@/lib/auth";
import { getSupabaseClient } from "@/lib/supabase-client";

type Props = {
  configured: boolean;
  profile: UserProfile | null;
};

export function UserDashboard({ configured, profile }: Props) {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [roleLevel, setRoleLevel] = useState<RoleLevel>(2);
  const [newPassword, setNewPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const level = profile?.role_level || 5;
  const mayManage = canManageUsers(level);
  const currentRole = roleDefinition(level);
  const allowedRoles = useMemo(() => roleDefinitions.filter((role) => role.level <= level), [level]);

  const loadProfiles = useCallback(async () => {
    const supabase = getSupabaseClient();
    if (!supabase || !mayManage) return;
    const { data } = await supabase.from("profiles").select("id,email,full_name,role_level,active,created_at,updated_at").order("role_level", { ascending: false }).order("full_name");
    setProfiles((data as UserProfile[] | null) || []);
  }, [mayManage]);

  useEffect(() => {
    const timer = window.setTimeout(() => { void loadProfiles(); }, 0);
    return () => window.clearTimeout(timer);
  }, [loadProfiles]);

  const createUser = async (event: FormEvent) => {
    event.preventDefault();
    const supabase = getSupabaseClient();
    if (!supabase) { setMessage("Koneksi Supabase belum aktif."); return; }
    setBusy(true);
    setMessage("");
    const { data, error } = await supabase.functions.invoke("admin-users", {
      body: { action: "create", email: email.trim().toLowerCase(), full_name: fullName.trim(), role_level: roleLevel },
    });
    setBusy(false);
    if (error || data?.error) { setMessage(data?.error || error?.message || "Pengguna gagal dibuat."); return; }
    setMessage(`Akun ${email.trim()} sudah dibuat. Password awal: ${DEFAULT_USER_PASSWORD}`);
    setFullName(""); setEmail(""); setRoleLevel(2);
    loadProfiles();
  };

  const changePassword = async (event: FormEvent) => {
    event.preventDefault();
    const supabase = getSupabaseClient();
    if (!supabase || newPassword.length < 8) { setMessage("Password baru minimal 8 karakter."); return; }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setBusy(false);
    setMessage(error ? error.message : "Password akun sudah diperbarui.");
    if (!error) setNewPassword("");
  };

  const signOut = async () => {
    const supabase = getSupabaseClient();
    if (!supabase) return;
    setBusy(true);
    await supabase.auth.signOut();
    setBusy(false);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <div><p className="eyebrow">Dashboard pengguna</p><h1 className="page-title">Akun & Hak Akses</h1><p className="mt-2 text-sm leading-6 text-[#232b2b]">Kelola identitas, level akses, password, dan peserta proyek.</p></div>

      <Card className="rounded-md border-slate-200 shadow-none"><CardContent className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center"><div className="grid size-16 shrink-0 place-items-center rounded-full bg-[#17365d] font-serif text-xl font-bold text-white">{initials(profile?.full_name, profile?.email)}</div><div className="min-w-0 flex-1"><p className="font-serif text-xl font-semibold">{profile?.full_name || "Project Control & Administrasi"}</p><p className="mt-1 break-all text-sm text-[#232b2b]">{profile?.email || "Mode pratinjau"}</p><div className="mt-3 flex flex-wrap gap-2"><Badge className="rounded-sm bg-[#17365d]">Level {level}</Badge><Badge variant="outline" className="rounded-sm">{currentRole.name}</Badge></div></div><Button type="button" variant="outline" onClick={signOut} disabled={!configured || busy} className="min-h-11 rounded-sm"><LogOut className="size-4" /> Keluar</Button></CardContent></Card>

      {!configured && <div className="rounded-sm border border-[#e5a3a3] bg-[#fff6f6] p-4 text-sm leading-6"><ShieldCheck className="mr-2 inline size-4" />Mode pratinjau aktif. Form login dan pengelolaan pengguna akan berjalan setelah publishable key Supabase dipasang.</div>}
      {message && <div className="rounded-sm border border-[#50b8e7] bg-[#eef9fd] p-4 text-sm leading-6">{message}</div>}

      <div className="grid gap-5 lg:grid-cols-2">
        {mayManage && <Card className="rounded-md border-slate-200 shadow-none"><CardHeader className="border-b border-slate-100"><CardTitle className="flex items-center gap-2 font-serif text-xl"><UserCog className="size-5" /> Tambah Pengguna</CardTitle><CardDescription>Email, nama, dan level akses. Sistem memakai password awal 12345678.</CardDescription></CardHeader><CardContent><form onSubmit={createUser} className="space-y-4"><div className="space-y-2"><Label htmlFor="new-full-name">Nama lengkap</Label><Input id="new-full-name" value={fullName} onChange={(event) => setFullName(event.target.value)} className="field-control" required /></div><div className="space-y-2"><Label htmlFor="new-email">Email login</Label><Input id="new-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="field-control" required /></div><div className="space-y-2"><Label>Role level</Label><Select value={String(roleLevel)} onValueChange={(value) => setRoleLevel(Number(value) as RoleLevel)}><SelectTrigger className="field-control"><SelectValue /></SelectTrigger><SelectContent>{allowedRoles.map((role) => <SelectItem key={role.level} value={String(role.level)}>Level {role.level} · {role.name}</SelectItem>)}</SelectContent></Select></div><Button type="submit" disabled={busy || !configured} className="min-h-12 w-full rounded-sm bg-[#17365d] hover:bg-[#102946]">{busy ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />} Buat akun</Button></form></CardContent></Card>}

        <Card className="rounded-md border-slate-200 shadow-none"><CardHeader className="border-b border-slate-100"><CardTitle className="flex items-center gap-2 font-serif text-xl"><KeyRound className="size-5" /> Ganti Password</CardTitle><CardDescription>Gunakan minimal 8 karakter setelah login pertama.</CardDescription></CardHeader><CardContent><form onSubmit={changePassword} className="space-y-4"><div className="space-y-2"><Label htmlFor="new-password">Password baru</Label><Input id="new-password" type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} className="field-control" minLength={8} autoComplete="new-password" required /></div><Button type="submit" variant="outline" disabled={busy || !configured} className="min-h-12 w-full rounded-sm">Simpan password baru</Button></form></CardContent></Card>
      </div>

      <Card className="rounded-md border-slate-200 shadow-none"><CardHeader className="border-b border-slate-100"><CardTitle className="flex items-center gap-2 font-serif text-xl"><UsersRound className="size-5" /> Matriks Akses</CardTitle><CardDescription>Level akses proyek yang berlaku.</CardDescription></CardHeader><CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">{roleDefinitions.map((role) => <div key={role.level} className="rounded-sm border border-slate-200 bg-white p-3"><Badge className="rounded-sm bg-[#17365d]">Level {role.level}</Badge><p className="mt-3 font-semibold">{role.name}</p><p className="mt-1 text-xs leading-5 text-[#232b2b]">{role.description}</p></div>)}</CardContent></Card>

      {mayManage && configured && <Card className="rounded-md border-slate-200 shadow-none"><CardHeader className="border-b border-slate-100"><CardTitle className="font-serif text-xl">Pengguna Terdaftar</CardTitle><CardDescription>{profiles.length} akun tersambung ke proyek.</CardDescription></CardHeader><CardContent className="space-y-2">{profiles.map((item) => <div key={item.id} className="flex items-center gap-3 rounded-sm border border-slate-200 p-3"><div className="grid size-10 shrink-0 place-items-center rounded-full bg-slate-100 text-xs font-bold">{initials(item.full_name, item.email)}</div><div className="min-w-0 flex-1"><p className="truncate font-semibold">{item.full_name}</p><p className="truncate text-xs text-[#232b2b]">{item.email}</p></div><Badge variant="outline" className="shrink-0 rounded-sm">L{item.role_level}</Badge></div>)}</CardContent></Card>}
    </div>
  );
}
