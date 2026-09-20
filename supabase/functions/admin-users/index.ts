import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { ...corsHeaders, "Content-Type": "application/json" },
});

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return json({ error: "Metode tidak diizinkan." }, 405);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const authorization = request.headers.get("Authorization");
  if (!supabaseUrl || !anonKey || !serviceKey || !authorization) return json({ error: "Konfigurasi server belum lengkap." }, 500);

  const caller = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authorization } } });
  const admin = createClient(supabaseUrl, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });
  const { data: authData, error: authError } = await caller.auth.getUser();
  if (authError || !authData.user) return json({ error: "Sesi pengguna tidak valid." }, 401);

  const { data: actor } = await admin.from("profiles").select("role_level,active").eq("id", authData.user.id).single();
  if (!actor?.active || actor.role_level < 4) return json({ error: "Akses administrator diperlukan." }, 403);

  let payload: { action?: string; email?: string; full_name?: string; role_level?: number };
  try { payload = await request.json(); } catch { return json({ error: "Data pengguna belum lengkap." }, 400); }
  if (payload.action !== "create") return json({ error: "Aksi belum didukung." }, 400);

  const email = String(payload.email || "").trim().toLowerCase();
  const fullName = String(payload.full_name || "").trim();
  const roleLevel = Number(payload.role_level);
  if (!/^\S+@\S+\.\S+$/.test(email) || fullName.length < 2 || !Number.isInteger(roleLevel) || roleLevel < 1 || roleLevel > 5) return json({ error: "Email, nama, atau role level belum sesuai." }, 400);
  if (roleLevel > actor.role_level) return json({ error: "Role tujuan melebihi level administrator." }, 403);
  if (actor.role_level === 4 && roleLevel === 5) return json({ error: "Level 5 hanya dapat dibuat oleh Super Admin." }, 403);

  const role = roleLevel === 5 ? "super_admin" : roleLevel === 4 ? "admin" : roleLevel === 3 ? "reviewer" : roleLevel === 2 ? "user" : "viewer_hk";
  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password: "12345678",
    email_confirm: true,
    user_metadata: { full_name: fullName, role_level: roleLevel },
  });
  if (createError || !created.user) return json({ error: createError?.message || "Akun gagal dibuat." }, 400);

  const { error: profileError } = await admin.from("profiles").upsert({
    id: created.user.id,
    email,
    full_name: fullName,
    role,
    role_level: roleLevel,
    active: true,
  });
  if (profileError) return json({ error: profileError.message }, 400);

  return json({ user: { id: created.user.id, email, full_name: fullName, role_level: roleLevel }, default_password: "12345678" }, 201);
});
