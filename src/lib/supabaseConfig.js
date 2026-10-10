export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim() || "";
export const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() || "";

const containsPlaceholder =
  supabaseUrl.includes("your-project-ref") ||
  supabaseAnonKey.includes("your-supabase-publishable-or-anon-key");
const containsPrivilegedKey = /(service_role|secret)/i.test(supabaseAnonKey);

if (containsPrivilegedKey) {
  console.error("A privileged Supabase key was provided to frontend configuration. Remove it and rotate the key immediately.");
}

export const supabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey) && !containsPlaceholder && !containsPrivilegedKey;