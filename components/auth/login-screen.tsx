"use client";

import { FormEvent, useState } from "react";
import { Eye, EyeOff, Loader2, LockKeyhole, LogIn, Mail, ShieldCheck } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getSupabaseClient } from "@/lib/supabase-client";

export function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const supabase = getSupabaseClient();
    if (!supabase) return;
    setBusy(true);
    setMessage("");
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    setBusy(false);
    if (error) setMessage("Email atau password belum sesuai.");
  };

  return (
    <main className="grid min-h-screen place-items-center bg-[#f4f3ef] px-4 py-8 text-[#0e1111]">
      <div className="w-full max-w-md space-y-5">
        <div className="flex items-center justify-center gap-3">
          <BrandLogo className="h-12 w-24" priority />
          <div><p className="font-serif text-xl font-semibold">Nurfita Project Control</p><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#232b2b]">Project reporting system</p></div>
        </div>

        <Card className="overflow-hidden rounded-md border-slate-200 bg-white shadow-sm">
          <CardHeader className="border-b border-slate-100 px-5 py-6">
            <div className="mb-3 grid size-11 place-items-center rounded-sm bg-[#17365d] text-white"><ShieldCheck className="size-5" /></div>
            <CardTitle className="font-serif text-2xl">Masuk ke Aplikasi</CardTitle>
            <CardDescription>Gunakan email dan password yang dibuat oleh administrator.</CardDescription>
          </CardHeader>
          <CardContent className="px-5 py-6">
            <form onSubmit={submit} className="space-y-4">
              <div className="space-y-2"><Label htmlFor="login-email">Email</Label><div className="relative"><Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#232b2b]" /><Input id="login-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="field-control pl-10" autoComplete="username" placeholder="nama@perusahaan.com" required /></div></div>
              <div className="space-y-2"><Label htmlFor="login-password">Password</Label><div className="relative"><LockKeyhole className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#232b2b]" /><Input id="login-password" type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} className="field-control px-10" autoComplete="current-password" required /><button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-1 top-1/2 grid size-10 -translate-y-1/2 place-items-center" aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}>{showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button></div></div>
              {message && <div className="rounded-sm border border-[#e5a3a3] bg-[#fff6f6] p-3 text-sm">{message}</div>}
              <Button type="submit" disabled={busy} className="min-h-12 w-full rounded-sm bg-[#17365d] hover:bg-[#102946]">{busy ? <Loader2 className="size-4 animate-spin" /> : <LogIn className="size-4" />} {busy ? "Memeriksa…" : "Masuk"}</Button>
            </form>
            <p className="mt-5 text-center text-xs leading-5 text-[#232b2b]">Akun baru menggunakan password awal <strong>12345678</strong>.</p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
