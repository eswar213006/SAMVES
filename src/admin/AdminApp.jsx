import { useEffect, useState } from "react";
import { supabase, supabaseConfigured } from "../lib/supabase.js";
import "./admin.css";

const emptyProfile = {
  name: "",
  slug: "",
  label: "",
  description: "",
  icon: "",
  accent_color: "#bd85ff",
  display_order: 0,
  is_all_access: false,
  is_published: false,
  section_visibility: {
    summary: true,
    projects: true,
    codingJourney: true,
    resume: true,
    certifications: true,
    badges: true,
  },
};

const editableSections = [
  ["summary", "Summary"],
  ["projects", "Projects"],
  ["codingJourney", "Coding Journey"],
  ["resume", "Resume"],
  ["certifications", "Certifications"],
  ["badges", "Badges"],
];

function toSlug(value) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export default function AdminApp() {
  const [authState, setAuthState] = useState(supabaseConfigured ? "loading" : "unconfigured");
  const [user, setUser] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [profileDraft, setProfileDraft] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function loadProfiles() {
    if (!supabase) return;
    const { data, error: queryError } = await supabase
      .from("portfolio_profiles")
      .select("id,slug,name,description,label,icon,artwork_path,accent_color,settings,section_visibility,display_order,is_all_access,is_published,is_archived")
      .order("display_order", { ascending: true });
    if (queryError) throw queryError;
    setProfiles(data || []);
  }

  async function verifyAndLoad(session) {
    if (!supabase || !session?.user) {
      setUser(null);
      setProfiles([]);
      setAuthState("signed-out");
      return;
    }

    const { data: isAdmin, error: permissionError } = await supabase.rpc("is_portfolio_admin");
    if (permissionError) throw permissionError;
    if (isAdmin !== true) {
      await supabase.auth.signOut();
      setUser(null);
      setProfiles([]);
      setAuthState("signed-out");
      setError("This account is not authorized for SAMVES administration.");
      return;
    }

    setUser(session.user);
    await loadProfiles();
    setAuthState("authorized");
  }

  useEffect(() => {
    if (!supabase) return undefined;

    let active = true;
    supabase.auth.getSession()
      .then(({ data, error: sessionError }) => {
        if (sessionError) throw sessionError;
        return verifyAndLoad(data.session);
      })
      .catch((loadError) => {
        if (!active) return;
        setError(loadError.message || "Could not verify the admin session.");
        setAuthState("signed-out");
      });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      queueMicrotask(() => {
        verifyAndLoad(session).catch((loadError) => {
          if (!active) return;
          setError(loadError.message || "Could not verify the admin session.");
          setAuthState("signed-out");
        });
      });
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  async function handleSignIn(event) {
    event.preventDefault();
    if (!supabase) return;
    setBusy(true);
    setError("");
    setNotice("");
    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (signInError) {
      setError(signInError.message);
      return;
    }
    try {
      await verifyAndLoad(data.session);
    } catch (permissionError) {
      await supabase.auth.signOut();
      setAuthState("signed-out");
      setError(permissionError.message || "Could not verify administrator access.");
    }
    setPassword("");
  }

  async function handleSignOut() {
    if (!supabase) return;
    setBusy(true);
    const { error: signOutError } = await supabase.auth.signOut();
    setBusy(false);
    if (signOutError) {
      setError(signOutError.message);
      return;
    }
    setProfiles([]);
    setUser(null);
    setAuthState("signed-out");
    setNotice("Signed out.");
  }

  async function saveProfile(event) {
    event.preventDefault();
    if (!supabase || !profileDraft) return;
    setBusy(true);
    setError("");
    setNotice("");
    const payload = {
      name: profileDraft.name.trim(),
      slug: toSlug(profileDraft.slug || profileDraft.name),
      label: profileDraft.label.trim(),
      description: profileDraft.description.trim(),
      icon: profileDraft.icon.trim(),
      accent_color: profileDraft.accent_color,
      display_order: Math.max(0, Number(profileDraft.display_order) || 0),
      is_all_access: Boolean(profileDraft.is_all_access),
      is_published: Boolean(profileDraft.is_published),
      section_visibility: profileDraft.section_visibility,
    };

    const query = profileDraft.id
      ? supabase.from("portfolio_profiles").update(payload).eq("id", profileDraft.id)
      : supabase.from("portfolio_profiles").insert(payload);
    const { error: saveError } = await query;
    if (saveError) {
      setBusy(false);
      setError(saveError.message);
      return;
    }
    try {
      await loadProfiles();
      setProfileDraft(null);
      setNotice("Profile saved to Supabase.");
    } catch (loadError) {
      setError(loadError.message || "Saved, but the profile list could not refresh.");
    }
    setBusy(false);
  }

  async function toggleProfile(profile) {
    if (!supabase) return;
    setBusy(true);
    setError("");
    const { error: updateError } = await supabase
      .from("portfolio_profiles")
      .update({ is_published: !profile.is_published })
      .eq("id", profile.id);
    if (updateError) {
      setError(updateError.message);
    } else {
      setNotice(profile.is_published ? "Profile unpublished." : "Profile published.");
      await loadProfiles();
    }
    setBusy(false);
  }

  async function archiveProfile(profile) {
    if (!supabase || !window.confirm(`Archive ${profile.name}? It will disappear from the public profile chooser.`)) return;
    setBusy(true);
    setError("");
    const { error: archiveError } = await supabase
      .from("portfolio_profiles")
      .update({ is_archived: true, is_published: false })
      .eq("id", profile.id);
    if (archiveError) setError(archiveError.message);
    else {
      setNotice("Profile archived.");
      await loadProfiles();
    }
    setBusy(false);
  }

  if (authState === "unconfigured") {
    return (
      <main className="admin-shell">
        <section className="admin-panel admin-notice">
          <p className="admin-eyebrow">SAMVES / ADMIN</p>
          <h1>Supabase is not configured</h1>
          <p>The public portfolio is still using its in-memory preview data. Admin sign-in and persistent changes are unavailable until the Supabase project is configured.</p>
          <ol>
            <li>Copy <code>.env.example</code> to <code>.env.local</code>.</li>
            <li>Set the Supabase project URL and public anon key.</li>
            <li>Apply the migration in <code>supabase/migrations</code> and authorize an admin account.</li>
          </ol>
          <a className="admin-back-link" href="/">Back to portfolio</a>
        </section>
      </main>
    );
  }

  if (authState === "loading") {
    return <main className="admin-shell"><p className="admin-status">Checking secure admin session…</p></main>;
  }

  if (authState !== "authorized" || !user) {
    return (
      <main className="admin-shell">
        <section className="admin-panel admin-auth-panel">
          <p className="admin-eyebrow">SAMVES / ADMIN</p>
          <h1>Administrator sign in</h1>
          <p>Access is limited to accounts authorized in the database. Public registration is not available here.</p>
          {error && <p className="admin-message is-error" role="alert">{error}</p>}
          {notice && <p className="admin-message" role="status">{notice}</p>}
          <form onSubmit={handleSignIn} className="admin-form">
            <label>Email<input autoComplete="username" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
            <label>Password<input autoComplete="current-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required /></label>
            <button className="admin-primary" type="submit" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button>
          </form>
          <a className="admin-back-link" href="/">Back to portfolio</a>
        </section>
      </main>
    );
  }

  return (
    <main className="admin-shell admin-dashboard">
      <header className="admin-header">
        <div><p className="admin-eyebrow">SAMVES / ADMIN</p><h1>Portfolio control room</h1><span>{user.email}</span></div>
        <button className="admin-secondary" type="button" disabled={busy} onClick={handleSignOut}>Sign out</button>
      </header>
      <div className="admin-layout">
        <aside className="admin-sidebar" aria-label="Admin sections">
          <a className="is-current" href="#profiles">Profiles</a>
          <a href="#content-model">Content model</a>
          <a href="#storage">Storage</a>
          <a href="/">View public site</a>
        </aside>
        <section className="admin-content" id="profiles">
          <div className="admin-section-heading"><div><p className="admin-eyebrow">PUBLISHED CONTENT ROUTING</p><h2>Profiles</h2></div><button className="admin-primary" type="button" disabled={busy} onClick={() => setProfileDraft({ ...emptyProfile })}>Add profile</button></div>
          <p className="admin-help">Profiles are persistent database records. New profiles start as drafts and only appear publicly after publishing.</p>
          {error && <p className="admin-message is-error" role="alert">{error}</p>}
          {notice && <p className="admin-message" role="status">{notice}</p>}
          <div className="admin-profile-list">
            {profiles.map((profile) => (
              <article className="admin-profile-row" key={profile.id}>
                <span className="admin-profile-icon" style={{ "--profile-accent": profile.accent_color }}>{profile.icon || "◇"}</span>
                <div className="admin-profile-info"><strong>{profile.name}</strong><span>/{profile.slug} · Order {profile.display_order}</span></div>
                <span className={`admin-badge${profile.is_published ? " is-published" : ""}`}>{profile.is_archived ? "Archived" : profile.is_published ? "Published" : "Draft"}</span>
                <div className="admin-row-actions">
                  {!profile.is_archived && <button className="admin-secondary" type="button" disabled={busy} onClick={() => toggleProfile(profile)}>{profile.is_published ? "Unpublish" : "Publish"}</button>}
                  <button className="admin-secondary" type="button" disabled={busy || profile.is_archived} onClick={() => setProfileDraft({ ...profile })}>Edit</button>
                  {!profile.is_archived && <button className="admin-danger" type="button" disabled={busy} onClick={() => archiveProfile(profile)}>Archive</button>}
                </div>
              </article>
            ))}
            {profiles.length === 0 && <p className="admin-empty">No profiles loaded. Confirm the migration has been applied and RLS is configured.</p>}
          </div>

          {profileDraft && (
            <div className="admin-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setProfileDraft(null); }}>
              <section className="admin-panel admin-editor" role="dialog" aria-modal="true" aria-labelledby="profile-editor-title">
                <header><h2 id="profile-editor-title">{profileDraft.id ? "Edit profile" : "New profile"}</h2><button className="admin-secondary" type="button" onClick={() => setProfileDraft(null)}>Close</button></header>
                <form className="admin-form" onSubmit={saveProfile}>
                  <label>Display name<input value={profileDraft.name} onChange={(event) => setProfileDraft((current) => ({ ...current, name: event.target.value }))} required maxLength={80} /></label>
                  <label>URL slug<input value={profileDraft.slug} onChange={(event) => setProfileDraft((current) => ({ ...current, slug: event.target.value }))} placeholder="Generated from name when blank" maxLength={80} /></label>
                  <label>Short label<input value={profileDraft.label} onChange={(event) => setProfileDraft((current) => ({ ...current, label: event.target.value }))} maxLength={60} /></label>
                  <label>Description<textarea rows={3} value={profileDraft.description} onChange={(event) => setProfileDraft((current) => ({ ...current, description: event.target.value }))} /></label>
                  <label>Icon or emoji<input value={profileDraft.icon} onChange={(event) => setProfileDraft((current) => ({ ...current, icon: event.target.value }))} maxLength={40} /></label>
                  <label>Accent color<input type="color" value={profileDraft.accent_color} onChange={(event) => setProfileDraft((current) => ({ ...current, accent_color: event.target.value }))} /></label>
                  <label>Display order<input type="number" min="0" step="1" value={profileDraft.display_order} onChange={(event) => setProfileDraft((current) => ({ ...current, display_order: event.target.value }))} /></label>
                  <label className="admin-checkbox"><input type="checkbox" checked={profileDraft.is_all_access} onChange={(event) => setProfileDraft((current) => ({ ...current, is_all_access: event.target.checked }))} /> All Access profile</label>
                  <fieldset className="admin-section-checks"><legend>Visible sections</legend>{editableSections.map(([key, label]) => <label className="admin-checkbox" key={key}><input type="checkbox" checked={profileDraft.section_visibility?.[key] !== false} onChange={(event) => setProfileDraft((current) => ({ ...current, section_visibility: { ...current.section_visibility, [key]: event.target.checked } }))} />{label}</label>)}</fieldset>
                  <label className="admin-checkbox"><input type="checkbox" checked={profileDraft.is_published} onChange={(event) => setProfileDraft((current) => ({ ...current, is_published: event.target.checked }))} /> Publish immediately</label>
                  <p className="admin-help">Profile artwork upload and content assignments will be enabled after the Storage and relationship-management phase.</p>
                  <footer><button className="admin-secondary" type="button" onClick={() => setProfileDraft(null)}>Cancel</button><button className="admin-primary" type="submit" disabled={busy}>{busy ? "Saving…" : "Save profile"}</button></footer>
                </form>
              </section>
            </div>
          )}
        </section>
      </div>
      <section className="admin-followup" id="content-model"><h2>Content and publishing</h2><p>Database tables and row-level security are defined in the migration but are not installed until you apply it. Project, summary, Coding Journey, resume, certification, badge and design-settings editors are the next integration phase; the existing public in-memory controls do not persist yet.</p></section>
      <section className="admin-followup" id="storage"><h2>Private file storage</h2><p>The migration creates a private, size-limited storage bucket. Upload, replacement and public signed-file delivery are not enabled until their server-side authorization flow is configured.</p></section>
    </main>
  );
}
