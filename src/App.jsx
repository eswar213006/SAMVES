import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowDown,
  ArrowDownToLine,
  ArrowUp,
  ArrowRight,
  Award,
  Check,
  Code2,
  ExternalLink,
  Eye,
  FileText,
  FolderPlus,
  Github,
  Image,
  Menu,
  Pencil,
  Plus,
  ShieldCheck,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { supabaseConfigured } from "./lib/supabaseConfig.js";
import "./App.css";

const initialProfiles = [
  { id: "software", name: "Software Development", theme: "ember", mark: "🧑‍💻" },
  { id: "security", name: "Cybersecurity", theme: "ice", mark: "🛡️" },
  { id: "projects", name: "Projects", theme: "copper", mark: "🧑‍🚀" },
  { id: "all", name: "All Access", theme: "aurora", mark: "🤖" },
];

const profileThemes = [
  { id: "ember", label: "Ember", color: "#f35d70" },
  { id: "ice", label: "Ice", color: "#6bc4d2" },
  { id: "copper", label: "Copper", color: "#e3a365" },
  { id: "aurora", label: "Aurora", color: "#a99be9" },
];

const initialCategories = [
  { id: "software", name: "Software Development" },
  { id: "cybersecurity", name: "Cybersecurity" },
];

const initialCodingPlatforms = [
  { id: "leetcode", name: "LeetCode", mark: "LC", profileUrl: "", solvedCount: null, notes: "", stats: "" },
  { id: "geeksforgeeks", name: "GeeksforGeeks", mark: "GFG", profileUrl: "", solvedCount: null, notes: "", stats: "" },
  { id: "codechef", name: "CodeChef", mark: "CC", profileUrl: "", solvedCount: null, notes: "", stats: "" },
  { id: "hackerrank", name: "HackerRank", mark: "HR", profileUrl: "", solvedCount: null, notes: "", stats: "" },
];

const portfolioNavigation = [
  ["Summary", "summary"],
  ["Projects", "projects"],
  ["Coding Journey", "coding-journey"],
  ["Resume", "resume"],
  ["Certifications", "certifications"],
];

function makeId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function LiquidGlassCard({
  as = "div",
  children,
  className = "",
  hoverTilt = 5,
  floating = false,
  floatDuration = 7,
  floatDelay = 0,
  idleRotation = 0,
  highlightIntensity = 0.2,
  selected = false,
  onClick,
  motionProps = {},
  style = {},
  ...rest
}) {
  const prefersReducedMotion = useReducedMotion();
  const MotionTag = {
    article: motion.article,
    header: motion.header,
    section: motion.section,
  }[as] || motion.div;

  function handlePointerMove(event) {
    if (prefersReducedMotion || event.pointerType === "touch" || hoverTilt <= 0) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return;

    const pointerX = Math.min(1, Math.max(0, (event.clientX - bounds.left) / bounds.width));
    const pointerY = Math.min(1, Math.max(0, (event.clientY - bounds.top) / bounds.height));
    const rotateX = Math.min(8, Math.max(-8, (0.5 - pointerY) * 2 * hoverTilt));
    const rotateY = Math.min(8, Math.max(-8, (pointerX - 0.5) * 2 * hoverTilt));

    event.currentTarget.style.setProperty("--glass-mouse-x", `${pointerX * 100}%`);
    event.currentTarget.style.setProperty("--glass-mouse-y", `${pointerY * 100}%`);
    event.currentTarget.style.setProperty("--glass-tilt-x", `${rotateX}deg`);
    event.currentTarget.style.setProperty("--glass-tilt-y", `${rotateY}deg`);
    event.currentTarget.style.setProperty("--glass-highlight-opacity", "1");
  }

  function handlePointerLeave(event) {
    event.currentTarget.style.setProperty("--glass-mouse-x", "50%");
    event.currentTarget.style.setProperty("--glass-mouse-y", "50%");
    event.currentTarget.style.setProperty("--glass-tilt-x", "0deg");
    event.currentTarget.style.setProperty("--glass-tilt-y", "0deg");
    event.currentTarget.style.setProperty("--glass-highlight-opacity", "0");
  }

  return (
    <MotionTag
      className={`liquid-glass-card${floating && !prefersReducedMotion ? " is-floating" : ""}${selected ? " is-selected" : ""}${className ? ` ${className}` : ""}`}
      data-selected={selected || undefined}
      style={{
        ...style,
        "--glass-highlight-intensity": highlightIntensity,
        "--liquid-float-duration": `${floatDuration}s`,
        "--liquid-float-delay": `${floatDelay}s`,
        "--liquid-idle-rotation": `${idleRotation}deg`,
      }}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onClick={onClick}
      {...motionProps}
      {...rest}
    >
      {children}
    </MotionTag>
  );
}

const localFileUrls = new WeakMap();

function localFileUrl(file) {
  if (!file) return "";
  if (!localFileUrls.has(file)) localFileUrls.set(file, URL.createObjectURL(file));
  return localFileUrls.get(file);
}

function openLocalFile(file, disposition = "inline") {
  if (!file) return;
  const objectUrl = localFileUrl(file);
  if (disposition === "download") {
    const anchor = document.createElement("a");
    anchor.href = objectUrl;
    anchor.download = file.name;
    anchor.click();
    return;
  }
  window.open(objectUrl, "_blank", "noopener,noreferrer");
}

function EntryDialog({ title, fields, initial = {}, onClose, onSave }) {
  const [values, setValues] = useState(initial);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  function handleSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const result = {};
    fields.forEach((field) => {
      if (field.type === "file") {
        const uploaded = formData.get(field.name);
        result[field.name] = uploaded?.name ? uploaded : values[field.name] || null;
      } else if (field.type === "textarea" && field.name === "technologies") {
        result[field.name] = String(formData.get(field.name) || "")
          .split(",")
          .map((value) => value.trim())
          .filter(Boolean);
      } else if (field.type === "number") {
        const numberValue = String(formData.get(field.name) || "").trim();
        result[field.name] = numberValue === "" ? null : Math.max(0, Number(numberValue));
      } else {
        result[field.name] = String(formData.get(field.name) || "").trim();
      }
    });
    onSave(result);
  }

  return (
    <motion.div
      className="dialog-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: prefersReducedMotion ? 0.01 : 0.2 }}
      onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}
    >
      <LiquidGlassCard
        as="section"
        className="entry-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="entry-dialog-title"
        hoverTilt={0}
        highlightIntensity={0.1}
        motionProps={{
          initial: { opacity: 0, y: 16, scale: 0.98 },
          animate: { opacity: 1, y: 0, scale: 1 },
          exit: { opacity: 0, y: 10, scale: 0.99 },
          transition: { duration: prefersReducedMotion ? 0.01 : 0.2 },
        }}
      >
        <header className="dialog-heading">
          <h2 id="entry-dialog-title">{title}</h2>
          <button className="icon-button" type="button" aria-label="Close dialog" onClick={onClose}><X size={18} /></button>
        </header>
        <form onSubmit={handleSubmit}>
          <div className="dialog-fields">
            {fields.map((field) => (
              <label className="dialog-field" key={field.name}>
                <span>{field.label}{field.required ? " *" : ""}</span>
                {field.type === "textarea" ? (
                  <textarea
                    name={field.name}
                    rows={field.rows || 3}
                    required={field.required}
                    defaultValue={Array.isArray(values[field.name]) ? values[field.name].join(", ") : values[field.name] || ""}
                    placeholder={field.placeholder || ""}
                  />
                ) : field.type === "file" ? (
                  <>
                    <input
                      name={field.name}
                      type="file"
                      accept={field.accept}
                      required={field.required && !values[field.name]}
                      onChange={(event) => setValues((current) => ({ ...current, [field.name]: event.target.files?.[0] || null }))}
                    />
                    <small>{values[field.name]?.name || field.help}</small>
                  </>
                ) : (
                  <input
                    name={field.name}
                    type={field.type || "text"}
                    required={field.required}
                    maxLength={field.maxLength || 180}
                    min={field.min}
                    step={field.step}
                    defaultValue={values[field.name] ?? ""}
                    placeholder={field.placeholder || ""}
                  />
                )}
              </label>
            ))}
          </div>
          <p className="dialog-note">Changes stay in this browser session. Files are selected locally and are not uploaded or permanently stored.</p>
          <footer className="dialog-actions">
            <button className="quiet-button" type="button" onClick={onClose}>Cancel</button>
            <button className="solid-button" type="submit">Save</button>
          </footer>
        </form>
      </LiquidGlassCard>
    </motion.div>
  );
}

function EmptyState({ icon: Icon, title, action, onAction, note }) {
  return (
    <div className="empty-state">
      <span className="empty-icon"><Icon size={21} /></span>
      <h3>{title}</h3>
      {note && <p>{note}</p>}
      {action && <button className="quiet-button" type="button" onClick={onAction}><Plus size={15} />{action}</button>}
    </div>
  );
}

function ShelfCard({ title, meta, icon: Icon, image, artTheme = "default", onClick, onEdit, onDelete }) {
  return (
    <LiquidGlassCard as="article" className="shelf-card" hoverTilt={4} highlightIntensity={0.16}>
      <button className="shelf-card-open" type="button" onClick={onClick} aria-label={`Open ${title}`}>
        <span className={`shelf-art shelf-art-${artTheme}`}>
          {image ? <img src={localFileUrl(image)} alt="" /> : <span className="shelf-art-orbit"><Icon size={30} strokeWidth={1.4} /></span>}
          <span className="shelf-art-shine" />
        </span>
        <span className="shelf-card-title">{title}</span>
        {meta && <span className="shelf-card-meta">{meta}</span>}
      </button>
      <div className="shelf-card-tools">
        <button className="icon-button" type="button" aria-label={`Edit ${title}`} onClick={onEdit}><Pencil size={14} /></button>
        <button className="icon-button danger-button" type="button" aria-label={`Delete ${title}`} onClick={onDelete}><Trash2 size={14} /></button>
      </div>
    </LiquidGlassCard>
  );
}

function CodingPlatformCard({ platform, isManaging, onEdit, onDelete }) {
  const profileReady = Boolean(platform.profileUrl);
  const content = (
    <>
      <span className={`platform-mark platform-${platform.id}`} aria-hidden="true">{platform.mark || "< />"}</span>
      <span className="platform-card-copy">
        <span className="platform-name">{platform.name}</span>
        <span className="platform-count-label">Questions solved / practiced</span>
        <strong className="platform-count">{Number.isFinite(platform.solvedCount) ? platform.solvedCount : "—"}</strong>
      </span>
      <span className="platform-card-action">{profileReady ? "Open profile" : "Profile link not added"}{profileReady && <ExternalLink size={14} />}</span>
    </>
  );

  return (
    <LiquidGlassCard as="article" className={`coding-platform-card${profileReady ? " has-profile" : ""}`} hoverTilt={4} highlightIntensity={0.15}>
      {profileReady ? (
        <a className="coding-platform-link" href={platform.profileUrl} target="_blank" rel="noopener noreferrer" aria-label={`Open ${platform.name} profile in a new tab`}>
          {content}
        </a>
      ) : (
        <div className="coding-platform-link is-unconfigured" aria-disabled="true">{content}</div>
      )}
      {(platform.notes || platform.stats) && (
        <div className="platform-details">
          {platform.notes && <p>{platform.notes}</p>}
          {platform.stats && <p><span>Additional stats</span>{platform.stats}</p>}
        </div>
      )}
      {isManaging && (
        <div className="platform-card-tools">
          <button className="icon-button" type="button" aria-label={`Edit ${platform.name}`} onClick={onEdit}><Pencil size={14} /></button>
          <button className="icon-button danger-button" type="button" aria-label={`Delete ${platform.name}`} onClick={onDelete}><Trash2 size={14} /></button>
        </div>
      )}
    </LiquidGlassCard>
  );
}

function ProfileAvatar({ profile }) {
  return (
    <span className={`avatar-scene theme-${profile.theme}`} aria-hidden="true">
      <span className="avatar-halo" />
      <span className="avatar-orbit" />
      <span className="avatar-core">
        <span className="avatar-face" />
        <span className="avatar-mark">{profile.mark}</span>
      </span>
      <span className="avatar-shadow" />
    </span>
  );
}

function ProfileSelection({
  profiles,
  selectedProfileId,
  isEditing,
  onSelect,
  onToggleEditing,
  onNameChange,
  onThemeChange,
  onContinue,
  profileDataStatus,
  profileLoadError,
  onRetryProfiles,
}) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.main
      className="profile-screen"
      initial={{ opacity: 1, y: prefersReducedMotion ? 0 : 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: prefersReducedMotion ? 0 : -8 }}
      transition={{ duration: prefersReducedMotion ? 0.01 : 0.45 }}
    >
      <header className="profile-topbar">
        <div className="profile-wordmark" aria-label="SAMVES">SAMVES<span>.</span></div>
      </header>

      <section className="profile-content" aria-labelledby="profile-heading">
        <div className="profile-intro">
          <span className="profile-kicker">A SPACE FOR EVERY SIDE</span>
          <h1 id="profile-heading">Who's exploring?</h1>
          <p>Choose a profile to enter</p>
          {profileDataStatus === "preview" && <p className="backend-state-note" role="status">Preview mode: content changes are not persistent until Supabase is configured.</p>}
          {profileDataStatus === "ready" && <p className="backend-state-note" role="status">Profiles are connected to Supabase. Other portfolio content remains preview-only until its admin editors are connected.</p>}
          {profileDataStatus === "loading" && <p className="backend-state-note" role="status">Loading published profiles…</p>}
          {profileDataStatus === "error" && (
            <p className="backend-state-note is-error" role="alert">
              Published profiles could not be loaded: {profileLoadError}
              <button className="quiet-button" type="button" onClick={onRetryProfiles}>Retry</button>
            </p>
          )}
        </div>

        <div className="profile-grid" role="group" aria-label="Choose a browsing profile">
          {profiles.map((profile, index) => {
            const isSelected = selectedProfileId === profile.id;

            return (
              <LiquidGlassCard
                as="article"
                className="profile-card"
                key={profile.id}
                hoverTilt={4.5}
                floating
                floatDuration={7 + index * 0.55}
                floatDelay={-index * 1.25}
                idleRotation={index % 2 === 0 ? 0.28 : -0.28}
                highlightIntensity={0.25}
                selected={isSelected}
                motionProps={{
                  initial: { opacity: 0, y: prefersReducedMotion ? 0 : 16 },
                  animate: { opacity: 1, y: 0 },
                  transition: {
                    duration: prefersReducedMotion ? 0.01 : 0.35,
                    delay: prefersReducedMotion ? 0 : index * 0.07,
                  },
                }}
              >
                <button
                  className="profile-select"
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => onSelect(profile.id)}
                >
                  <span className="profile-check" aria-hidden="true"><Check size={16} /></span>
                  <ProfileAvatar profile={profile} />
                  <span className="profile-name">{profile.name}</span>
                </button>

                {isEditing && (
                  <div className="profile-edit-controls">
                    <label className="profile-name-label" htmlFor={`profile-name-${profile.id}`}>
                      Display name
                    </label>
                    <input
                      id={`profile-name-${profile.id}`}
                      type="text"
                      maxLength={28}
                      value={profile.name}
                      onChange={(event) => onNameChange(profile.id, event.target.value)}
                    />
                    <span className="profile-name-label">Visual theme</span>
                    <div className="theme-options" role="group" aria-label={`Visual theme for ${profile.name}`}>
                      {profileThemes.map((theme) => (
                        <button
                          className={`theme-swatch${profile.theme === theme.id ? " is-active" : ""}`}
                          key={theme.id}
                          type="button"
                          style={{ "--swatch": theme.color }}
                          aria-label={`Set ${theme.label} theme for ${profile.name}`}
                          aria-pressed={profile.theme === theme.id}
                          onClick={() => onThemeChange(profile.id, theme.id)}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </LiquidGlassCard>
            );
          })}
        </div>
      </section>

      <footer className="profile-actions">
        <button
          className={`profile-edit-button${isEditing ? " is-active" : ""}`}
          type="button"
          aria-pressed={isEditing}
          onClick={onToggleEditing}
        >
          {isEditing ? <Check size={15} /> : <Pencil size={15} />}
          {isEditing ? "Done editing" : "Edit Profiles"}
        </button>
        <button
          className="profile-continue"
          type="button"
          disabled={!selectedProfileId}
          onClick={onContinue}
        >
          Continue <ArrowRight size={16} />
        </button>
      </footer>
    </motion.main>
  );
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profiles, setProfiles] = useState(supabaseConfigured ? [] : initialProfiles);
  const [profileDataStatus, setProfileDataStatus] = useState(supabaseConfigured ? "loading" : "preview");
  const [profileLoadError, setProfileLoadError] = useState("");
  const [profileReloadKey, setProfileReloadKey] = useState(0);
  const [selectedProfileId, setSelectedProfileId] = useState(null);
  const [isEditingProfiles, setIsEditingProfiles] = useState(false);
  const [hasEntered, setHasEntered] = useState(false);
  const [categories, setCategories] = useState(initialCategories);
  const [isManagingCategories, setIsManagingCategories] = useState(false);
  const [codingPlatforms, setCodingPlatforms] = useState(initialCodingPlatforms);
  const [isManagingCodingPlatforms, setIsManagingCodingPlatforms] = useState(false);
  const [projects, setProjects] = useState([]);
  const [resumes, setResumes] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [summary, setSummary] = useState("");
  const [isEditingSummary, setIsEditingSummary] = useState(false);
  const [summaryDraft, setSummaryDraft] = useState("");
  const [dialog, setDialog] = useState(null);
  const [detail, setDetail] = useState(null);
  const prefersReducedMotion = useReducedMotion();

  const selectedProfile = profiles.find((profile) => profile.id === selectedProfileId);
  const profileCategoryId = selectedProfileId === "software"
    ? "software"
    : selectedProfileId === "security" ? "cybersecurity" : null;
  const visibleCategories = isManagingCategories || !profileCategoryId
    ? categories
    : categories.filter((category) => category.id === profileCategoryId);

  useEffect(() => {
    if (!supabaseConfigured) return undefined;

    let active = true;
    import("./lib/supabase.js")
      .then(({ loadPublishedProfiles }) => loadPublishedProfiles())
      .then((publishedProfiles) => {
        if (!active) return;
        setProfiles(publishedProfiles);
        setProfileLoadError("");
        setProfileDataStatus("ready");
      })
      .catch((loadError) => {
        if (!active) return;
        setProfiles([]);
        setProfileLoadError(loadError.message || "A database request failed.");
        setProfileDataStatus("error");
      });

    return () => { active = false; };
  }, [profileReloadKey]);

  useEffect(() => {
    if (!hasEntered) {
      window.scrollTo(0, 0);
      return undefined;
    }

    const landingSection = selectedProfileId === "all" ? "summary" : "projects";
    const landingDelay = prefersReducedMotion ? 80 : 550;
    const timeoutId = window.setTimeout(() => {
      document.getElementById(landingSection)?.scrollIntoView({
        behavior: prefersReducedMotion ? "auto" : "smooth",
        block: "start",
      });
    }, landingDelay);

    return () => window.clearTimeout(timeoutId);
  }, [hasEntered, prefersReducedMotion, selectedProfileId]);

  function switchToProfiles() {
    window.history.replaceState(null, "", window.location.pathname + window.location.search);
    setHasEntered(false);
  }

  function retryPublishedProfiles() {
    setProfileLoadError("");
    setProfileDataStatus("loading");
    setProfileReloadKey((key) => key + 1);
  }

  function updateProfile(profileId, updates) {
    setProfiles((currentProfiles) =>
      currentProfiles.map((profile) =>
        profile.id === profileId ? { ...profile, ...updates } : profile
      )
    );
  }

  function saveDialog(values) {
    if (!dialog) return;
    if (dialog.type === "category-add") {
      setCategories((items) => [...items, { id: makeId(), name: values.name }]);
    } else if (dialog.type === "category-edit") {
      setCategories((items) => items.map((item) => item.id === dialog.id ? { ...item, name: values.name } : item));
    } else if (dialog.type === "project-add") {
      setProjects((items) => [...items, { ...values, id: makeId(), categoryId: dialog.categoryId }]);
    } else if (dialog.type === "project-edit") {
      setProjects((items) => items.map((item) => item.id === dialog.id ? { ...item, ...values } : item));
    } else if (dialog.type === "coding-platform-add") {
      const mark = values.name.split(/\s+/).map((part) => part[0]).join("").toUpperCase().slice(0, 3);
      setCodingPlatforms((items) => [...items, { ...values, id: makeId(), mark }]);
    } else if (dialog.type === "coding-platform-edit") {
      setCodingPlatforms((items) => items.map((item) => item.id === dialog.id ? { ...item, ...values } : item));
    } else if (dialog.type === "resume-add") {
      setResumes((items) => [...items, { ...values, id: makeId() }]);
    } else if (dialog.type === "resume-edit") {
      setResumes((items) => items.map((item) => item.id === dialog.id ? { ...item, ...values } : item));
    } else if (dialog.type === "certification-add") {
      setCertifications((items) => [...items, { ...values, id: makeId() }]);
    } else if (dialog.type === "certification-edit") {
      setCertifications((items) => items.map((item) => item.id === dialog.id ? { ...item, ...values } : item));
    }
    setDialog(null);
  }

  function removeProject(project) {
    if (window.confirm(`Delete ${project.title}?`)) {
      setProjects((items) => items.filter((item) => item.id !== project.id));
    }
  }

  function removeCategory(category) {
    if (window.confirm(`Delete ${category.name} and its projects?`)) {
      setCategories((items) => items.filter((item) => item.id !== category.id));
      setProjects((items) => items.filter((item) => item.categoryId !== category.id));
    }
  }

  function removeCodingPlatform(platform) {
    if (window.confirm(`Delete ${platform.name}?`)) {
      setCodingPlatforms((items) => items.filter((item) => item.id !== platform.id));
    }
  }

  function reorderCategory(categoryId, offset) {
    setCategories((items) => {
      const index = items.findIndex((item) => item.id === categoryId);
      const nextIndex = index + offset;
      if (index < 0 || nextIndex < 0 || nextIndex >= items.length) return items;
      const reordered = [...items];
      [reordered[index], reordered[nextIndex]] = [reordered[nextIndex], reordered[index]];
      return reordered;
    });
  }

  const projectFields = [
    { name: "title", label: "Title", required: true },
    { name: "description", label: "Description", type: "textarea" },
    { name: "technologies", label: "Technologies (comma separated)", type: "textarea" },
    { name: "image", label: "Optional image", type: "file", accept: "image/*", help: "Optional image selected from this device." },
    { name: "githubUrl", label: "GitHub URL", type: "url" },
    { name: "liveDemoUrl", label: "Live demo URL", type: "url" },
    { name: "metadata", label: "Other metadata", type: "textarea" },
  ];
  const resumeFields = [
    { name: "title", label: "Resume title", required: true },
    { name: "targetRole", label: "Target role" },
    { name: "file", label: "PDF file", type: "file", accept: "application/pdf,.pdf", help: "Optional local PDF. It is not uploaded." },
    { name: "description", label: "Description", type: "textarea" },
  ];
  const certificationFields = [
    { name: "title", label: "Certification title", required: true },
    { name: "issuer", label: "Issuer" },
    { name: "issueDate", label: "Issue date", type: "date" },
    { name: "credentialUrl", label: "Credential URL", type: "url" },
    { name: "attachment", label: "Optional certificate image or PDF", type: "file", accept: "image/*,application/pdf,.pdf", help: "Optional local file. It is not uploaded." },
  ];
  const codingPlatformFields = [
    { name: "name", label: "Platform name", required: true },
    { name: "profileUrl", label: "Profile URL", type: "url" },
    { name: "notes", label: "Notes", type: "textarea" },
    { name: "stats", label: "Additional statistics", type: "textarea" },
  ];

  const dialogConfig = dialog ? (() => {
    const config = {
      "category-add": { title: "Add category", fields: [{ name: "name", label: "Category name", required: true }] },
      "category-edit": { title: "Rename category", fields: [{ name: "name", label: "Category name", required: true }] },
      "project-add": { title: "Add project", fields: projectFields },
      "project-edit": { title: "Edit project", fields: projectFields },
      "coding-platform-add": { title: "Add coding platform", fields: codingPlatformFields },
      "coding-platform-edit": { title: "Edit coding platform", fields: codingPlatformFields },
      "resume-add": { title: "Add resume", fields: resumeFields },
      "resume-edit": { title: "Edit resume", fields: resumeFields },
      "certification-add": { title: "Add certification", fields: certificationFields },
      "certification-edit": { title: "Edit certification", fields: certificationFields },
    }[dialog.type];
    const collection = dialog.type.startsWith("category") ? categories
      : dialog.type.startsWith("project") ? projects
        : dialog.type.startsWith("coding-platform") ? codingPlatforms
          : dialog.type.startsWith("resume") ? resumes : certifications;
    return { ...config, initial: collection.find((item) => item.id === dialog.id) || {} };
  })() : null;

  return (
    <AnimatePresence mode="wait">
      {!hasEntered ? (
        <ProfileSelection
          key="profiles"
          profiles={profiles}
          selectedProfileId={selectedProfileId}
          isEditing={isEditingProfiles}
          onSelect={setSelectedProfileId}
          onToggleEditing={() => setIsEditingProfiles((editing) => !editing)}
          onNameChange={(profileId, name) => updateProfile(profileId, { name })}
          onThemeChange={(profileId, theme) => updateProfile(profileId, { theme })}
          onContinue={() => setHasEntered(true)}
          profileDataStatus={profileDataStatus}
          profileLoadError={profileLoadError}
          onRetryProfiles={retryPublishedProfiles}
        />
      ) : (
        <motion.div
          key="portfolio"
          className="site-shell portfolio-shell"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: prefersReducedMotion ? 0.01 : 0.5 }}
        >
          <div className="profile-session">
            <span>Browsing as <strong>{selectedProfile?.name}</strong></span>
            <span className="preview-session-label">{supabaseConfigured ? "Profiles: Supabase · content: preview only" : "Preview only · changes are not saved"}</span>
            <button type="button" onClick={switchToProfiles}>Switch profile</button>
          </div>
          <LiquidGlassCard as="header" className="navbar" hoverTilt={0.8} highlightIntensity={0.08}>
            <a className="brand" href="#summary" aria-label="SAMVES summary">
              <span className="brand-icon">S</span>
              <span>SAMVES<span className="accent">.</span></span>
            </a>
            <nav className={menuOpen ? "nav-links nav-open" : "nav-links"} aria-label="Main navigation">
              {portfolioNavigation.map(([label, id]) => (
                <a key={id} href={`#${id}`} onClick={() => setMenuOpen(false)}>{label}</a>
              ))}
            </nav>
            <button
              className="menu-toggle"
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X /> : <Menu />}
            </button>
          </LiquidGlassCard>

          <main>
            <section className="hero summary-hero" id="summary" aria-labelledby="summary-title">
              <div className="hero-glow" />
              <div className="hero-copy">
                <div className="eyebrow availability"><span className="status-dot" />SAMVES / SUMMARY</div>
                <h1 id="summary-title">Summary<span className="accent">.</span></h1>
                {isEditingSummary ? (
                  <div className="summary-editor">
                    <label className="visually-hidden" htmlFor="summary-input">Summary text</label>
                    <textarea id="summary-input" value={summaryDraft} onChange={(event) => setSummaryDraft(event.target.value)} rows={5} />
                    <div className="summary-editor-actions">
                      <button className="quiet-button" type="button" onClick={() => setIsEditingSummary(false)}>Cancel</button>
                      <button className="solid-button" type="button" onClick={() => { setSummary(summaryDraft.trim()); setIsEditingSummary(false); }}>Save summary</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="hero-description summary-copy">{summary || "Summary not added"}</p>
                    <button className="button button-secondary summary-edit" type="button" onClick={() => { setSummaryDraft(summary); setIsEditingSummary(true); }}>
                      <Pencil size={15} /> {summary ? "Edit summary" : "Add summary"}
                    </button>
                  </>
                )}
                <div className="hero-footnote"><span>SUMMARY</span><span>PROJECTS</span><span>PORTFOLIO</span></div>
              </div>
              <div className="hero-visual" aria-label="Abstract SAMVES portfolio artwork">
                <div className="visual-ring ring-a" />
                <div className="visual-ring ring-b" />
                <div className="visual-orb">
                  <div className="orb-core" />
                  <div className="orb-loop loop-a" />
                  <div className="orb-loop loop-b" />
                  <span className="orb-node node-a" /><span className="orb-node node-b" />
                  <span className="orb-node node-c" /><span className="orb-node node-d" />
                </div>
                <div className="float-panel float-top"><Sparkles size={18} /><span><b>SAMVES</b><small>portfolio</small></span></div>
                <div className="float-panel float-bottom"><Code2 size={18} /><span><b>Projects</b><small>collection</small></span></div>
                <span className="visual-caption">PERSONAL PORTFOLIO</span>
              </div>
              <a className="scroll-cue" href="#projects"><ArrowDown size={15} /> Browse projects</a>
            </section>

            <section className="portfolio-section projects-section" id="projects" aria-labelledby="projects-title">
              <div className="section-title-row">
                <div>
                  <span className="eyebrow">{profileCategoryId && !isManagingCategories ? "SELECTED COLLECTION" : "COLLECTIONS"}</span>
                  <h2 id="projects-title">Projects<span className="accent">.</span></h2>
                  {profileCategoryId && !isManagingCategories && <span className="profile-mode-label">{categories.find((category) => category.id === profileCategoryId)?.name}</span>}
                </div>
                <div className="collection-actions">
                  <button className="quiet-button" type="button" aria-pressed={isManagingCategories} onClick={() => setIsManagingCategories((managing) => !managing)}>
                    {isManagingCategories ? <Check size={15} /> : <Pencil size={15} />}
                    {isManagingCategories ? "Done" : "Manage shelves"}
                  </button>
                  {isManagingCategories && <button className="solid-button" type="button" onClick={() => setDialog({ type: "category-add" })}><FolderPlus size={15} />Add category</button>}
                </div>
              </div>
              {visibleCategories.length === 0 ? (
                <EmptyState
                  icon={FolderPlus}
                  title={profileCategoryId ? "This collection is not configured" : "No project categories"}
                  action={isManagingCategories ? "Add category" : undefined}
                  onAction={() => setDialog({ type: "category-add" })}
                />
              ) : (
                <div className="category-list">
                  {visibleCategories.map((category, index) => {
                    const categoryProjects = projects.filter((project) => project.categoryId === category.id);
                    return (
                      <section className="category-shelf" key={category.id} aria-labelledby={`category-${category.id}`}>
                        <header className="shelf-heading">
                          <div><h3 id={`category-${category.id}`}>{category.name}</h3><span>{categoryProjects.length} {categoryProjects.length === 1 ? "project" : "projects"}</span></div>
                          {isManagingCategories && <div className="shelf-heading-tools">
                            <button className="icon-button" type="button" aria-label={`Move ${category.name} up`} disabled={index === 0} onClick={() => reorderCategory(category.id, -1)}><ArrowUp size={15} /></button>
                            <button className="icon-button" type="button" aria-label={`Move ${category.name} down`} disabled={index === categories.length - 1} onClick={() => reorderCategory(category.id, 1)}><ArrowDown size={15} /></button>
                            <button className="icon-button" type="button" aria-label={`Rename ${category.name}`} onClick={() => setDialog({ type: "category-edit", id: category.id })}><Pencil size={14} /></button>
                            <button className="icon-button danger-button" type="button" aria-label={`Delete ${category.name}`} onClick={() => removeCategory(category)}><Trash2 size={14} /></button>
                            <button className="quiet-button shelf-add" type="button" onClick={() => setDialog({ type: "project-add", categoryId: category.id })}><Plus size={15} />Add project</button>
                          </div>}
                        </header>
                        {categoryProjects.length === 0 ? (
                          <EmptyState icon={category.id === "cybersecurity" ? ShieldCheck : Code2} title="Nothing here yet" note="This collection is ready for your projects." action={isManagingCategories ? "Add project" : undefined} onAction={() => setDialog({ type: "project-add", categoryId: category.id })} />
                        ) : (
                          <div className="shelf-row" aria-label={`${category.name} projects`}>
                            {categoryProjects.map((project) => (
                              <ShelfCard
                                key={project.id}
                                title={project.title}
                                meta={project.technologies?.slice(0, 2).join(" · ")}
                                icon={category.id === "cybersecurity" ? ShieldCheck : Code2}
                                artTheme={category.id === "cybersecurity" ? "security" : "software"}
                                image={project.image}
                                onClick={() => setDetail({ type: "project", entry: project, category })}
                                onEdit={() => setDialog({ type: "project-edit", id: project.id })}
                                onDelete={() => removeProject(project)}
                              />
                            ))}
                          </div>
                        )}
                      </section>
                    );
                  })}
                </div>
              )}
            </section>

            <section className="portfolio-section coding-journey-section" id="coding-journey" aria-labelledby="coding-journey-title">
              <div className="section-title-row">
                <div><span className="eyebrow">PRACTICE LOG</span><h2 id="coding-journey-title">Coding Journey<span className="accent">.</span></h2></div>
                <div className="collection-actions">
                  <button className="quiet-button" type="button" aria-pressed={isManagingCodingPlatforms} onClick={() => setIsManagingCodingPlatforms((managing) => !managing)}>
                    {isManagingCodingPlatforms ? <Check size={15} /> : <Pencil size={15} />}
                    {isManagingCodingPlatforms ? "Done" : "Manage platforms"}
                  </button>
                  {isManagingCodingPlatforms && <button className="solid-button" type="button" onClick={() => setDialog({ type: "coding-platform-add" })}><Plus size={15} />Add platform</button>}
                </div>
              </div>
              <p className="section-note coding-data-note">Statistics are entered manually and do not update from platform APIs.</p>
              {codingPlatforms.length === 0 ? (
                <EmptyState icon={Code2} title="No coding platforms" action={isManagingCodingPlatforms ? "Add platform" : undefined} onAction={() => setDialog({ type: "coding-platform-add" })} />
              ) : (
                <div className="coding-platform-grid">
                  {codingPlatforms.map((platform) => (
                    <CodingPlatformCard
                      key={platform.id}
                      platform={platform}
                      isManaging={isManagingCodingPlatforms}
                      onEdit={() => setDialog({ type: "coding-platform-edit", id: platform.id })}
                      onDelete={() => removeCodingPlatform(platform)}
                    />
                  ))}
                </div>
              )}
            </section>

            <section className="portfolio-section collection-section" id="resume" aria-labelledby="resume-title">
              <div className="section-title-row">
                <div><span className="eyebrow">LOCAL COLLECTION</span><h2 id="resume-title">Resume<span className="accent">.</span></h2></div>
                <button className="quiet-button" type="button" onClick={() => setDialog({ type: "resume-add" })}><Plus size={16} />Add resume</button>
              </div>
              <p className="section-note">Files selected here stay in this browser session. They are not uploaded or permanently stored.</p>
              {resumes.length === 0 ? (
                <EmptyState icon={FileText} title="No resume entries" note="Add a title and optional local PDF when you are ready." action="Add resume" onAction={() => setDialog({ type: "resume-add" })} />
              ) : (
                <div className="shelf-row collection-row">
                  {resumes.map((resume) => (
                    <ShelfCard key={resume.id} title={resume.title} meta={resume.targetRole || resume.file?.name || "Resume"} icon={FileText}
                      onClick={() => setDetail({ type: "resume", entry: resume })}
                      onEdit={() => setDialog({ type: "resume-edit", id: resume.id })}
                      onDelete={() => { if (window.confirm(`Delete ${resume.title}?`)) setResumes((items) => items.filter((item) => item.id !== resume.id)); }} />
                  ))}
                </div>
              )}
            </section>

            <section className="portfolio-section collection-section" id="certifications" aria-labelledby="certifications-title">
              <div className="section-title-row">
                <div><span className="eyebrow">CREDENTIALS</span><h2 id="certifications-title">Certifications<span className="accent">.</span></h2></div>
                <button className="quiet-button" type="button" onClick={() => setDialog({ type: "certification-add" })}><Plus size={16} />Add certification</button>
              </div>
              {certifications.length === 0 ? (
                <EmptyState icon={Award} title="No certifications" note="Certification details can be added when you are ready." action="Add certification" onAction={() => setDialog({ type: "certification-add" })} />
              ) : (
                <div className="shelf-row collection-row">
                  {certifications.map((certification) => (
                    <ShelfCard key={certification.id} title={certification.title} meta={[certification.issuer, certification.issueDate].filter(Boolean).join(" · ")} icon={Award} image={certification.attachment?.type?.startsWith("image/") ? certification.attachment : null}
                      onClick={() => setDetail({ type: "certification", entry: certification })}
                      onEdit={() => setDialog({ type: "certification-edit", id: certification.id })}
                      onDelete={() => { if (window.confirm(`Delete ${certification.title}?`)) setCertifications((items) => items.filter((item) => item.id !== certification.id)); }} />
                  ))}
                </div>
              )}
            </section>
          </main>

          <footer className="footer portfolio-footer">
            <a href="#summary" className="brand"><span className="brand-icon">S</span>SAMVES<span className="accent">.</span></a>
            <span>Portfolio workspace</span>
            <a href="#summary" className="back-top">Back to summary ↑</a>
          </footer>

          <AnimatePresence>
            {dialogConfig && (
              <EntryDialog
                key={dialog.type + dialog.id}
                title={dialogConfig.title}
                fields={dialogConfig.fields}
                initial={dialogConfig.initial}
                onClose={() => setDialog(null)}
                onSave={saveDialog}
              />
            )}
            {detail && (
              <motion.div className="dialog-backdrop" role="presentation" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: prefersReducedMotion ? 0.01 : 0.2 }} onMouseDown={(event) => { if (event.target === event.currentTarget) setDetail(null); }}>
                <LiquidGlassCard as="section" className="entry-dialog detail-dialog" role="dialog" aria-modal="true" aria-labelledby="detail-title" hoverTilt={0} highlightIntensity={0.1} motionProps={{ initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: 10 }, transition: { duration: prefersReducedMotion ? 0.01 : 0.2 } }}>
                  <header className="dialog-heading"><h2 id="detail-title">{detail.entry.title}</h2><button className="icon-button" type="button" aria-label="Close details" onClick={() => setDetail(null)}><X size={18} /></button></header>
                  {detail.type === "project" && <>
                    <p className="detail-eyebrow">{detail.category.name}</p>
                    {detail.entry.image && <img className="detail-image" src={localFileUrl(detail.entry.image)} alt={`${detail.entry.title} preview`} />}
                    {detail.entry.description && <p className="detail-copy">{detail.entry.description}</p>}
                    {detail.entry.technologies?.length > 0 && <div className="tags">{detail.entry.technologies.map((technology) => <span key={technology}>{technology}</span>)}</div>}
                    {detail.entry.metadata && <p className="detail-copy">{detail.entry.metadata}</p>}
                    <div className="detail-links">
                      {detail.entry.githubUrl && <a className="quiet-button" href={detail.entry.githubUrl} target="_blank" rel="noreferrer"><Github size={15} />GitHub <ExternalLink size={13} /></a>}
                      {detail.entry.liveDemoUrl && <a className="quiet-button" href={detail.entry.liveDemoUrl} target="_blank" rel="noreferrer">Live demo <ExternalLink size={13} /></a>}
                    </div>
                  </>}
                  {detail.type === "resume" && <>
                    {detail.entry.targetRole && <p className="detail-eyebrow">{detail.entry.targetRole}</p>}
                    {detail.entry.description && <p className="detail-copy">{detail.entry.description}</p>}
                    <div className="detail-links">
                      {detail.entry.file && <>
                        <button className="quiet-button" type="button" onClick={() => openLocalFile(detail.entry.file)}><Eye size={15} />Preview PDF</button>
                        <button className="solid-button" type="button" onClick={() => openLocalFile(detail.entry.file, "download")}><ArrowDownToLine size={15} />Download</button>
                      </>}
                    </div>
                    <p className="dialog-note">{detail.entry.file ? `Local file: ${detail.entry.file.name}. This file is available only in this browser session.` : "No local PDF selected. Edit this entry to select one from this device."}</p>
                  </>}
                  {detail.type === "certification" && <>
                    {detail.entry.issuer && <p className="detail-eyebrow">{detail.entry.issuer}{detail.entry.issueDate ? ` · ${detail.entry.issueDate}` : ""}</p>}
                    {detail.entry.credentialUrl && <p><a className="credential-link" href={detail.entry.credentialUrl} target="_blank" rel="noreferrer">Open credential <ExternalLink size={14} /></a></p>}
                    {detail.entry.attachment && <div className="detail-links">
                      {detail.entry.attachment.type?.startsWith("image/") && <a className="quiet-button" href={localFileUrl(detail.entry.attachment)} target="_blank" rel="noreferrer"><Image size={15} />View certificate</a>}
                      {detail.entry.attachment.type === "application/pdf" && <button className="quiet-button" type="button" onClick={() => openLocalFile(detail.entry.attachment)}><Eye size={15} />Preview PDF</button>}
                    </div>}
                  </>}
                </LiquidGlassCard>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default App;
