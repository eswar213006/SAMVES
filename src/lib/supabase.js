import { createClient } from "@supabase/supabase-js";
import { supabaseAnonKey, supabaseConfigured, supabaseUrl } from "./supabaseConfig.js";

export { supabaseConfigured };

export const supabase = supabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        detectSessionInUrl: true,
        persistSession: true,
      },
    })
  : null;

export function requireSupabase() {
  if (!supabaseConfigured || !supabase) {
    throw new Error("Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable persistent portfolio data.");
  }
  return supabase;
}

export async function loadPublishedProfiles() {
  const client = requireSupabase();
  const { data, error } = await client
    .from("portfolio_profiles")
    .select("id,slug,name,description,label,icon,artwork_path,accent_color,settings,section_visibility,display_order,is_all_access")
    .eq("is_published", true)
    .eq("is_archived", false)
    .order("display_order", { ascending: true });

  if (error) throw error;

  return (data || []).map((profile) => ({
    ...profile,
    id: profile.slug,
    theme: profile.settings?.avatar_theme || ({ software: "ember", security: "ice", projects: "copper", all: "aurora" }[profile.slug] || "aurora"),
    mark: profile.icon || profile.name.slice(0, 2).toUpperCase(),
  }));
}