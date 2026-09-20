"use client";

import { useCallback, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import type { UserProfile } from "@/lib/auth";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase-client";

export function useProjectAuth() {
  const configured = isSupabaseConfigured();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(configured);

  const loadProfile = useCallback(async (nextUser: User | null) => {
    const supabase = getSupabaseClient();
    setUser(nextUser);
    if (!supabase || !nextUser) {
      setProfile(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data } = await supabase
      .from("profiles")
      .select("id,email,full_name,role_level,active,created_at,updated_at")
      .eq("id", nextUser.id)
      .maybeSingle();

    setProfile((data as UserProfile | null) || {
      id: nextUser.id,
      email: nextUser.email || "",
      full_name: String(nextUser.user_metadata?.full_name || "Pengguna"),
      role_level: 1,
      active: true,
    });
    setLoading(false);
  }, []);

  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    supabase.auth.getSession().then(({ data }) => loadProfile(data.session?.user || null));
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      window.setTimeout(() => loadProfile(session?.user || null), 0);
    });
    return () => data.subscription.unsubscribe();
  }, [loadProfile]);

  return { configured, user, profile, loading, refreshProfile: () => loadProfile(user) };
}
