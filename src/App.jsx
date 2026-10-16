import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowDown,
  ArrowDownToLine,
  ArrowRight,
  Award,
  Check,
  Code2,
  ExternalLink,
  Eye,
  FileText,
  FolderPlus,
  Github,
  Globe,
  Linkedin,
  Mail,
  Medal,
  Menu,
  Pencil,

  ShieldCheck,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";

import { initialProfiles, profileThemes } from "./data/profiles.js";
import { summaries, heroConfig } from "./data/summaries.js";
import { projectCategories, projects as initialProjects } from "./data/projects.js";
import { codingPlatforms as initialCodingPlatforms } from "./data/codingJourney.js";
import { resumes as initialResumes } from "./data/resumes.js";
import { certifications as initialCertifications, badges as initialBadges } from "./data/certifications.js";
import { contactDetails } from "./data/contact.js";

import "./App.css";

// -------------------------------------------------------------
// PRIMARY NAVIGATION (Strict Section 5 order)
// 1. Summary, 2. Projects, 3. Coding Journey, 4. Resume, 5. Certifications, 6. Contact / About
// -------------------------------------------------------------
const primaryNavigation = [
  ["Summary", "summary"],
  ["Projects", "projects"],
  ["Coding Journey", "coding-journey"],
  ["Resume", "resume"],
  ["Certifications", "certifications"],
  ["Contact / About", "contact"],
];

// -------------------------------------------------------------
// GOOGLE DRIVE LINK HELPER
// Converts any Drive share URL to a viewable / downloadable URL.
// Safe to call with local paths — they pass through unchanged.
// -------------------------------------------------------------
function gdriveViewUrl(raw) {
  if (!raw) return "";
  const m = raw.match(/\/d\/([-\w]+)/);
  if (!m) return raw; // not a Drive link, return as-is
  return `https://drive.google.com/file/d/${m[1]}/preview`;
}
function gdriveDownloadUrl(raw) {
  if (!raw) return "";
  const m = raw.match(/\/d\/([-\w]+)/);
  if (!m) return raw;
  return `https://drive.google.com/uc?export=download&id=${m[1]}`;
}


// -------------------------------------------------------------
// NEO GLASS CARD with Localized Pointer Tracking
// -------------------------------------------------------------
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

// -------------------------------------------------------------
// PROFILE CARD (simple, no 360° rotation)
// -------------------------------------------------------------
function ProfileCard({
  profile,
  index,
  isSelected,
  isEditing,
  onSelect,
  onNameChange,
  onThemeChange,
}) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <LiquidGlassCard
      as="article"
      className="profile-card"
      hoverTilt={4}
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
        onClick={() => onSelect(profile.slug || profile.id)}
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
}

// -------------------------------------------------------------
// PROFILE AVATAR with Dimensional Orbit Layers (No human silhouette)
// -------------------------------------------------------------
function ProfileAvatar({ profile }) {
  const themeClass = profile.theme || ({ software: "burgundy", security: "wine", projects: "garnet", all: "crimson" }[profile.slug || profile.id] || "burgundy");
  return (
    <span className={`avatar-scene theme-${themeClass}`} aria-hidden="true" style={{ "--profile-accent": profile.accentColor }}>
      <span className="avatar-halo" />
      <span className="avatar-orbit" />
      <span className="avatar-core">
        <span className="avatar-mark">{profile.mark || profile.name?.slice(0, 2).toUpperCase()}</span>
      </span>
      <span className="avatar-shadow" />
    </span>
  );
}

// -------------------------------------------------------------
// SHELF CARD FOR PROJECTS, RESUMES, CERTIFICATIONS
// -------------------------------------------------------------
function ShelfCard({ title, meta, badgeText, icon: Icon, image, artTheme = "default", onClick, actionButton, onEdit, onDelete }) {
  return (
    <LiquidGlassCard as="article" className="shelf-card" hoverTilt={4} highlightIntensity={0.16}>
      <button className="shelf-card-open" type="button" onClick={onClick} aria-label={`Open ${title}`}>
        <span className={`shelf-art shelf-art-${artTheme}`}>
          {image ? (
            <img src={image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <span className="shelf-art-orbit"><Icon size={30} strokeWidth={1.4} /></span>
          )}
          <span className="shelf-art-shine" />
        </span>
        <span className="shelf-card-title">{title}</span>
        <div className="shelf-card-meta-row">
          {meta && <span className="shelf-card-meta">{meta}</span>}
          {badgeText && <span className="shelf-card-badge">{badgeText}</span>}
        </div>
      </button>
      {actionButton && (
        <div style={{ padding: "0 14px 14px", display: "flex", justifyContent: "flex-start" }}>
          {actionButton}
        </div>
      )}
      {(onEdit || onDelete) && (
        <div className="shelf-card-tools">
          {onEdit && <button className="icon-button" type="button" aria-label={`Edit ${title}`} onClick={onEdit}><Pencil size={14} /></button>}
          {onDelete && <button className="icon-button danger-button" type="button" aria-label={`Delete ${title}`} onClick={onDelete}><Trash2 size={14} /></button>}
        </div>
      )}
    </LiquidGlassCard>
  );
}

// -------------------------------------------------------------
// CODING PLATFORM CARD
// -------------------------------------------------------------
function CodingPlatformCard({ platform }) {
  const profileReady = Boolean(platform.profileUrl);
  const count = Number.isFinite(platform.solvedCount) ? platform.solvedCount : "—";

  const content = (
    <>
      <span className={`platform-mark platform-${platform.id || "custom"}`} aria-hidden="true">
        {platform.mark || platform.name?.slice(0, 2).toUpperCase() || "< />"}
      </span>
      <span className="platform-card-copy">
        <span className="platform-name">{platform.name}</span>
        <span className="platform-count-label">Questions solved / practiced</span>
        <strong className="platform-count">{count}</strong>
      </span>
      <span className="platform-card-action">
        {profileReady ? "Open profile" : "Profile link not configured"}
        {profileReady && <ExternalLink size={14} />}
      </span>
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
      {platform.notes && (
        <div className="platform-details">
          <p>{platform.notes}</p>
        </div>
      )}
    </LiquidGlassCard>
  );
}

// -------------------------------------------------------------
// PROFILE SELECTION SCREEN ("Who's exploring?")
// -------------------------------------------------------------
function ProfileSelection({
  profiles,
  selectedProfileId,
  isEditing,
  onSelect,
  onToggleEditing,
  onNameChange,
  onThemeChange,
  onContinue,
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
          <p>Choose a profile to enter your personalised portfolio view</p>
        </div>

        <div className="profile-grid" role="group" aria-label="Choose a browsing profile">
          {profiles.map((profile, index) => {
            const isSelected = selectedProfileId === (profile.slug || profile.id);

            return (
              <ProfileCard
                key={profile.id || profile.slug}
                profile={profile}
                index={index}
                isSelected={isSelected}
                isEditing={isEditing}
                onSelect={onSelect}
                onNameChange={onNameChange}
                onThemeChange={onThemeChange}
              />
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
          {isEditing ? "Done editing" : "Quick Edit"}
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

// -------------------------------------------------------------
// MAIN APP COMPONENT
// -------------------------------------------------------------
export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profiles, setProfiles] = useState(initialProfiles);

  // Initialize selected profile and entry state directly from URL query param (?profile=software)
  const [selectedProfileId, setSelectedProfileId] = useState(() => {
    if (typeof window === "undefined") return "software";
    const urlParams = new URLSearchParams(window.location.search);
    const profileParam = urlParams.get("profile");
    if (!profileParam) return "software";
    const matched = initialProfiles.find((p) => p.slug === profileParam || p.id === profileParam);
    return matched ? (matched.slug || matched.id) : "software";
  });

  const [hasEntered, setHasEntered] = useState(() => {
    if (typeof window === "undefined") return false;
    const urlParams = new URLSearchParams(window.location.search);
    return Boolean(urlParams.get("profile"));
  });

  const [isEditingProfiles, setIsEditingProfiles] = useState(false);

  // Data collections (pure client-side, loaded from src/data/)
  const [projects] = useState(initialProjects);
  const [categories] = useState(projectCategories);
  const [platforms] = useState(initialCodingPlatforms);
  const [resumesList] = useState(initialResumes);
  const [certsList] = useState(initialCertifications);
  const [badgesList] = useState(initialBadges);

  const [detail, setDetail] = useState(null);
  const prefersReducedMotion = useReducedMotion();

  const selectedProfile = profiles.find((p) => (p.slug || p.id) === selectedProfileId) || profiles[0];
  const activeRole = selectedProfile?.slug || selectedProfile?.id || "software";
  const isAllAccess = activeRole === "all";

  // Filter content based on active role
  const isRoleApplicable = (assignedRoles) => {
    if (isAllAccess) return true;
    if (!assignedRoles || assignedRoles.length === 0) return true;
    return assignedRoles.includes(activeRole);
  };

  const filteredCategories = categories.filter((c) => isRoleApplicable(c.assignedRoles));
  const filteredProjects = projects.filter((p) => isRoleApplicable(p.assignedRoles));
  const filteredPlatforms = platforms.filter((cp) => isRoleApplicable(cp.assignedRoles));
  const filteredResumes = resumesList.filter((r) => isRoleApplicable(r.assignedRoles));
  const filteredCertifications = certsList.filter((cert) => isRoleApplicable(cert.assignedRoles));
  const filteredBadges = badgesList.filter((b) => isRoleApplicable(b.assignedRoles));

  // Role-specific summary
  const activeSummary = summaries[activeRole] || summaries.software;

  // Calculate total verified questions solved
  const totalQuestionsSolved = filteredPlatforms.reduce(
    (sum, p) => sum + (Number(p.solvedCount) || 0),
    0
  );

  useEffect(() => {
    if (!hasEntered) {
      window.scrollTo(0, 0);
      return undefined;
    }

    const landingSection = selectedProfileId === "all" ? "summary" : "projects";
    const landingDelay = prefersReducedMotion ? 80 : 500;
    const timeoutId = window.setTimeout(() => {
      document.getElementById(landingSection)?.scrollIntoView({
        behavior: prefersReducedMotion ? "auto" : "smooth",
        block: "start",
      });
    }, landingDelay);

    return () => window.clearTimeout(timeoutId);
  }, [hasEntered, prefersReducedMotion, selectedProfileId]);

  function handleContinue() {
    if (!selectedProfileId) return;
    const targetSlug = selectedProfile?.slug || selectedProfileId;
    window.history.replaceState(null, "", `?profile=${targetSlug}`);
    setHasEntered(true);
  }

  function switchToProfiles() {
    window.history.replaceState(null, "", window.location.pathname);
    setHasEntered(false);
  }

  function updateProfile(profileId, updates) {
    setProfiles((current) =>
      current.map((p) => (p.id === profileId ? { ...p, ...updates } : p))
    );
  }

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
          onContinue={handleContinue}
        />
      ) : (
        <motion.div
          key="portfolio"
          className="site-shell portfolio-shell"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: prefersReducedMotion ? 0.01 : 0.5 }}
          style={{
            "--profile-accent": selectedProfile?.accentColor || "#bd85ff",
          }}
        >
          {/* Active Profile Bar */}
          <div className="profile-session">
            <span>Viewing: <strong>{selectedProfile?.name}</strong></span>
            <span className="preview-session-label">{selectedProfile?.roleLabel}</span>
            <button type="button" onClick={switchToProfiles}>Switch profile</button>
          </div>

          {/* Sticky Navigation Bar */}
          <LiquidGlassCard as="header" className="navbar" hoverTilt={0.8} highlightIntensity={0.08}>
            <a className="brand" href="#summary" aria-label="SAMVES summary">
              <span className="brand-icon">S</span>
              <span>SAMVES<span className="accent">.</span></span>
            </a>
            <nav className={menuOpen ? "nav-links nav-open" : "nav-links"} aria-label="Main navigation">
              {primaryNavigation.map(([label, id]) => (
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
            {/* ============================================================ */}
            {/* 1. SUMMARY SECTION (Cinematic Hero with Abstract Artwork)    */}
            {/* ============================================================ */}
            <section className="hero summary-hero" id="summary" aria-labelledby="summary-title">
              <div className="hero-glow" />
              <div className="hero-copy">
                <div className="eyebrow availability">
                  <span className="status-dot" />
                  {activeSummary.kicker}
                </div>
                <h1 id="summary-title">
                  {activeSummary.heading}
                  <span className="accent">.</span>
                </h1>
                <p className="hero-description summary-copy">
                  {activeSummary.body}
                </p>

                {activeSummary.highlights && (
                  <div className="interest-tags" style={{ margin: "16px 0 24px" }}>
                    {activeSummary.highlights.map((h) => (
                      <span className="interest-tag" key={h.label}>
                        <strong>{h.label}:</strong> {h.value}
                      </span>
                    ))}
                  </div>
                )}

                <div className="hero-actions">
                  <a className="button button-primary" href="#projects">
                    Explore My Work <ArrowRight size={15} />
                  </a>
                  <a className="button button-secondary" href="#contact">
                    About Me
                  </a>
                </div>

                <div className="hero-footnote">
                  <span>SUMMARY</span>
                  <span>PROJECTS</span>
                  <span>PORTFOLIO</span>
                </div>
              </div>

              {/* Spacious Visual Area (Abstract Burgundy Artwork or Configured Media Slot) */}
              <div className="hero-visual" aria-label="Visual artwork">
                {heroConfig.media?.src ? (
                  heroConfig.media.type === "video" ? (
                    <video
                      className="hero-media-element"
                      src={heroConfig.media.src}
                      autoPlay
                      loop
                      muted
                      playsInline
                    />
                  ) : (
                    <img
                      className="hero-media-element"
                      src={heroConfig.media.src}
                      alt={heroConfig.media.alt || "Hero visual"}
                    />
                  )
                ) : (
                  <div className="abstract-hero-sculpture">
                    <div className="atmospheric-aura" />
                    <div className="visual-ring ring-a" />
                    <div className="visual-ring ring-b" />
                    <div className="visual-orb">
                      <div className="orb-core" />
                      <div className="orb-loop loop-a" />
                      <div className="orb-loop loop-b" />
                      <span className="orb-node node-a" />
                      <span className="orb-node node-b" />
                      <span className="orb-node node-c" />
                      <span className="orb-node node-d" />
                    </div>
                    <div className="float-panel float-top">
                      <Sparkles size={16} />
                      <span><b>SAMVES</b><small>Cinematic Portfolio</small></span>
                    </div>
                    <div className="float-panel float-bottom">
                      <Code2 size={16} />
                      <span><b>{selectedProfile.name}</b><small>Active Discipline</small></span>
                    </div>
                    <span className="visual-caption">CINEMATIC INTERFACE</span>
                  </div>
                )}
              </div>
              <a className="scroll-cue" href="#projects"><ArrowDown size={15} /> View projects</a>
            </section>

            {/* ============================================================ */}
            {/* 2. PROJECTS SECTION (Unlimited Shelves & Items)               */}
            {/* ============================================================ */}
            <section className="portfolio-section projects-section" id="projects" aria-labelledby="projects-title">
              <div className="section-title-row">
                <div>
                  <span className="eyebrow">ENGINEERING COLLECTIONS</span>
                  <h2 id="projects-title">Projects<span className="accent">.</span></h2>
                </div>
              </div>

              {filteredCategories.length === 0 ? (
                <div className="empty-state">
                  <FolderPlus size={24} />
                  <h3>No project collections configured for this role</h3>
                </div>
              ) : (
                <div className="category-list">
                  {filteredCategories.map((category) => {
                    const categoryProjects = filteredProjects.filter(
                      (p) => p.categoryId === category.id || p.categoryId === category.slug
                    );

                    return (
                      <section className="category-shelf" key={category.id} aria-labelledby={`category-${category.id}`}>
                        <header className="shelf-heading">
                          <div>
                            <h3 id={`category-${category.id}`}>{category.name}</h3>
                            <span>{categoryProjects.length} {categoryProjects.length === 1 ? "project" : "projects"}</span>
                          </div>
                        </header>

                        {categoryProjects.length === 0 ? (
                          <div className="empty-state">
                            <Code2 size={20} />
                            <h3>No projects in this shelf yet</h3>
                            <p>Projects can be configured in <code>src/data/projects.js</code>.</p>
                          </div>
                        ) : (
                          <div className="shelf-row" aria-label={`${category.name} projects`}>
                            {categoryProjects.map((project) => (
                              <ShelfCard
                                key={project.id}
                                title={project.title}
                                meta={Array.isArray(project.technologies) ? project.technologies.slice(0, 2).join(" · ") : ""}
                                badgeText={project.status}
                                icon={category.id === "cybersecurity" ? ShieldCheck : Code2}
                                artTheme={category.id === "cybersecurity" ? "security" : "software"}
                                image={project.image}
                                onClick={() => setDetail({ type: "project", entry: project, category })}
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

            {/* ============================================================ */}
            {/* 3. CODING JOURNEY SECTION (Accurate Practice Logs)          */}
            {/* ============================================================ */}
            <section className="portfolio-section coding-journey-section" id="coding-journey" aria-labelledby="coding-journey-title">
              <div className="section-title-row">
                <div>
                  <span className="eyebrow">PRACTICE LOG</span>
                  <h2 id="coding-journey-title">Coding Journey<span className="accent">.</span></h2>
                </div>
                {totalQuestionsSolved > 0 && (
                  <span className="interest-tag">
                    Total Solved: <strong>{totalQuestionsSolved}</strong>
                  </span>
                )}
              </div>
              <p className="section-note coding-data-note">
                Practice statistics are manually logged. Open platform links to view verified public profiles.
              </p>

              <div className="coding-platform-grid">
                {filteredPlatforms.map((platform) => (
                  <CodingPlatformCard key={platform.id} platform={platform} />
                ))}
              </div>
            </section>

            {/* ============================================================ */}
            {/* 4. RESUME SECTION (Multiple Configurable PDFs)               */}
            {/* ============================================================ */}
            <section className="portfolio-section collection-section" id="resume" aria-labelledby="resume-title">
              <div className="section-title-row">
                <div>
                  <span className="eyebrow">RESUME ARCHIVE</span>
                  <h2 id="resume-title">Resume<span className="accent">.</span></h2>
                </div>
              </div>

              {filteredResumes.length === 0 ? (
                <div className="empty-state">
                  <FileText size={22} />
                  <h3>No resume entries configured</h3>
                  <p>Add PDF resume files to <code>public/</code> and configure in <code>src/data/resumes.js</code>.</p>
                </div>
              ) : (
                <div className="shelf-row collection-row">
                  {filteredResumes.map((resume) => (
                    <ShelfCard
                      key={resume.id}
                      title={resume.title}
                      meta={resume.targetRole}
                      icon={FileText}
                      onClick={() => setDetail({ type: "resume", entry: resume })}
                      actionButton={resume.filePath ? (
                        <a
                          className="quiet-button"
                          href={gdriveViewUrl(resume.filePath)}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          style={{ fontSize: "11px", padding: "4px 8px", display: "inline-flex", alignItems: "center", gap: "4px" }}
                        >
                          <Eye size={12} /> View PDF
                        </a>
                      ) : null}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* ============================================================ */}
            {/* 5. CERTIFICATIONS & BADGES SECTION                          */}
            {/* ============================================================ */}
            <section className="portfolio-section collection-section" id="certifications" aria-labelledby="certifications-title">
              <div className="section-title-row">
                <div>
                  <span className="eyebrow">CREDENTIALS & HONORS</span>
                  <h2 id="certifications-title">Certifications & Badges<span className="accent">.</span></h2>
                </div>
              </div>

              {filteredCertifications.length === 0 && filteredBadges.length === 0 ? (
                <div className="empty-state">
                  <Award size={22} />
                  <h3>No certifications or badges configured</h3>
                  <p>Credentials can be added in <code>src/data/certifications.js</code>.</p>
                </div>
              ) : (
                <div className="shelf-row collection-row">
                  {filteredCertifications.map((cert) => (
                    <ShelfCard
                      key={cert.id}
                      title={cert.title}
                      meta={[cert.issuer, cert.issueDate].filter(Boolean).join(" · ")}
                      icon={Award}
                      onClick={() => setDetail({ type: "certification", entry: cert })}
                    />
                  ))}
                  {filteredBadges.map((badge) => (
                    <ShelfCard
                      key={badge.id}
                      title={badge.title}
                      meta={badge.issuer}
                      icon={Medal}
                      onClick={() => setDetail({ type: "badge", entry: badge })}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* ============================================================ */}
            {/* 6. CONTACT / ABOUT SECTION (Final Primary Section)          */}
            {/* ============================================================ */}
            <section className="portfolio-section contact-section" id="contact" aria-labelledby="contact-title">
              <span id="about" style={{ display: "block", position: "relative", top: "-90px", visibility: "hidden" }} />
              <div className="section-title-row">
                <div>
                  <span className="eyebrow">RECRUITER OUTREACH & DOSSIER</span>
                  <h2 id="contact-title">Contact / About<span className="accent">.</span></h2>
                </div>
              </div>

              <div className="contact-editorial-layout">
                {/* Left Column: Abstract Visual Panel or Future Media Slot (Hidden if empty) */}
                <div className="about-visual-panel">
                  {contactDetails.mediaSlot?.src ? (
                    contactDetails.mediaSlot.type === "video" ? (
                      <video
                        className="about-media-element"
                        src={contactDetails.mediaSlot.src}
                        autoPlay
                        loop
                        muted
                        playsInline
                      />
                    ) : (
                      <img
                        className="about-media-element"
                        src={contactDetails.mediaSlot.src}
                        alt={contactDetails.mediaSlot.alt || "Engineer portrait"}
                      />
                    )
                  ) : (
                    <div className="about-abstract-panel">
                      <div className="about-abstract-glow" />
                      <div className="about-abstract-lattice" />
                      <div className="about-abstract-mark">SAMVES<span>.</span></div>
                      <div className="about-abstract-tag">[ 01 / EDITORIAL DOSSIER ]</div>
                      <div className="about-abstract-quote">
                        Engineered for resilience, precision, and architectural clarity.
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column: Biography, Interests & Direct Verified Channels */}
                <div className="about-content-column">
                  <div className="contact-card">
                    <h3>About the Engineer</h3>
                    <p className="contact-bio">{contactDetails.shortBio}</p>
                    <div>
                      <h4 style={{ margin: "0 0 10px", fontSize: "12px", color: "#d896a8" }}>Key Interests</h4>
                      <div className="interest-tags">
                        {contactDetails.interests.map((interest) => (
                          <span className="interest-tag" key={interest}>{interest}</span>
                        ))}
                      </div>
                    </div>
                    <div style={{ fontSize: "12px", color: "#a597a8", marginTop: "16px" }}>
                      <span>Status: <strong>{contactDetails.status}</strong></span>
                      <br />
                      <span>Location: {contactDetails.location}</span>
                    </div>
                  </div>

                  <div className="contact-card">
                    <h3>Direct Channels</h3>
                    <div className="contact-channels">
                      {contactDetails.email ? (
                        <a className="contact-channel-item" href={`mailto:${contactDetails.email}`}>
                          <div className="contact-channel-left">
                            <Mail size={16} />
                            <span>Email: {contactDetails.email}</span>
                          </div>
                          <ExternalLink size={13} />
                        </a>
                      ) : null}

                      {contactDetails.links.github ? (
                        <a className="contact-channel-item" href={contactDetails.links.github} target="_blank" rel="noopener noreferrer">
                          <div className="contact-channel-left">
                            <Github size={16} />
                            <span>GitHub Profile</span>
                          </div>
                          <ExternalLink size={13} />
                        </a>
                      ) : null}

                      {contactDetails.links.linkedin ? (
                        <a className="contact-channel-item" href={contactDetails.links.linkedin} target="_blank" rel="noopener noreferrer">
                          <div className="contact-channel-left">
                            <Linkedin size={16} />
                            <span>LinkedIn Connection</span>
                          </div>
                          <ExternalLink size={13} />
                        </a>
                      ) : null}

                      {contactDetails.links.portfolio ? (
                        <a className="contact-channel-item" href={contactDetails.links.portfolio} target="_blank" rel="noopener noreferrer">
                          <div className="contact-channel-left">
                            <Globe size={16} />
                            <span>Personal Site</span>
                          </div>
                          <ExternalLink size={13} />
                        </a>
                      ) : null}

                      {!contactDetails.email && !contactDetails.links.linkedin && (
                        <p style={{ margin: "6px 0 0", fontSize: "11px", color: "#8a7e8e" }}>
                          Verified direct channels. Additional contacts can be configured in <code>src/data/contact.js</code>.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </main>

          {/* Footer */}
          <footer className="footer portfolio-footer">
            <a href="#summary" className="brand"><span className="brand-icon">S</span>SAMVES<span className="accent">.</span></a>
            <span>Recruiter Portfolio Workspace · Vercel Production</span>
            <a href="#summary" className="back-top">Back to top ↑</a>
          </footer>

          {/* Polished Detail Modals */}
          <AnimatePresence>
            {detail && (
              <motion.div
                className="dialog-backdrop"
                role="presentation"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: prefersReducedMotion ? 0.01 : 0.2 }}
                onMouseDown={(event) => { if (event.target === event.currentTarget) setDetail(null); }}
              >
                <LiquidGlassCard
                  as="section"
                  className="entry-dialog detail-dialog"
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="detail-title"
                  hoverTilt={0}
                  highlightIntensity={0.1}
                  motionProps={{
                    initial: { opacity: 0, y: 16 },
                    animate: { opacity: 1, y: 0 },
                    exit: { opacity: 0, y: 10 },
                    transition: { duration: prefersReducedMotion ? 0.01 : 0.2 },
                  }}
                >
                  <header className="dialog-heading">
                    <h2 id="detail-title">{detail.entry.title}</h2>
                    <button className="icon-button" type="button" aria-label="Close details" onClick={() => setDetail(null)}><X size={18} /></button>
                  </header>

                  {/* Project Modal */}
                  {detail.type === "project" && (
                    <>
                      {detail.category && <p className="detail-eyebrow">{detail.category.name}</p>}
                      {detail.entry.image && (
                        <img className="detail-image" src={detail.entry.image} alt={`${detail.entry.title} preview`} />
                      )}
                      {detail.entry.description && <p className="detail-copy">{detail.entry.description}</p>}
                      {detail.entry.technologies?.length > 0 && (
                        <div className="tags">
                          {detail.entry.technologies.map((t) => <span key={t}>{t}</span>)}
                        </div>
                      )}
                      <div className="detail-links">
                        {detail.entry.githubUrl && (
                          <a className="quiet-button" href={detail.entry.githubUrl} target="_blank" rel="noreferrer">
                            <Github size={15} />GitHub <ExternalLink size={13} />
                          </a>
                        )}
                        {detail.entry.demoUrl && (
                          <a className="quiet-button" href={detail.entry.demoUrl} target="_blank" rel="noreferrer">
                            Live demo <ExternalLink size={13} />
                          </a>
                        )}
                      </div>
                    </>
                  )}

                  {/* Resume Modal */}
                  {detail.type === "resume" && (
                    <>
                      <p className="detail-eyebrow">{detail.entry.targetRole}</p>
                      {detail.entry.description && <p className="detail-copy">{detail.entry.description}</p>}
                      <div className="detail-links">
                        {detail.entry.filePath ? (
                          <>
                            <a className="quiet-button" href={gdriveViewUrl(detail.entry.filePath)} target="_blank" rel="noreferrer">
                              <Eye size={15} />Preview PDF
                            </a>
                            <a className="solid-button" href={gdriveDownloadUrl(detail.entry.filePath)} target="_blank" rel="noreferrer">
                              <ArrowDownToLine size={15} />Download
                            </a>
                          </>
                        ) : (
                          <p style={{ fontSize: "12px", color: "#b9a7c6" }}>
                            Place your PDF file in <code>public/resumes/</code> and update <code>filePath</code> in <code>src/data/resumes.js</code>.
                          </p>
                        )}
                      </div>
                    </>
                  )}

                  {/* Certification Modal */}
                  {detail.type === "certification" && (
                    <>
                      <p className="detail-eyebrow">
                        {detail.entry.issuer} {detail.entry.issueDate ? `· ${detail.entry.issueDate}` : ""}
                      </p>
                      {detail.entry.credentialUrl ? (
                        <p>
                          <a className="credential-link" href={detail.entry.credentialUrl} target="_blank" rel="noreferrer">
                            Verify Credential <ExternalLink size={14} />
                          </a>
                        </p>
                      ) : (
                        <p style={{ fontSize: "12px", color: "#b9a7c6" }}>
                          Verification link can be configured in <code>src/data/certifications.js</code>.
                        </p>
                      )}
                    </>
                  )}

                  {/* Badge Modal */}
                  {detail.type === "badge" && (
                    <>
                      <p className="detail-eyebrow">{detail.entry.issuer}</p>
                      {detail.entry.description && <p className="detail-copy">{detail.entry.description}</p>}
                      {detail.entry.verificationUrl && (
                        <p>
                          <a className="credential-link" href={detail.entry.verificationUrl} target="_blank" rel="noreferrer">
                            Verify Badge <ExternalLink size={14} />
                          </a>
                        </p>
                      )}
                    </>
                  )}
                </LiquidGlassCard>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
