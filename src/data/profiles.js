// Configuration for browsing profiles
// Edit names, accent colors, marks or themes directly here.

export const initialProfiles = [
  {
    id: "software",
    slug: "software",
    name: "Software Development",
    roleLabel: "Full-Stack & Software Engineering",
    theme: "burgundy",
    mark: "◈",
    accentColor: "#a81e38",
    description: "Modern web applications, scalable software architectures, and algorithmic problem solving."
  },
  {
    id: "security",
    slug: "security",
    name: "Cybersecurity",
    roleLabel: "Security Analysis & Defense",
    theme: "wine",
    mark: "🛡️",
    accentColor: "#7e1529",
    description: "Security assessments, vulnerability research, defensive systems, and secure coding practices."
  },
  {
    id: "projects",
    slug: "projects",
    name: "Projects",
    roleLabel: "Technical Project Showcase",
    theme: "garnet",
    mark: "⚡",
    accentColor: "#9c243b",
    description: "Curated collection across all software development and cybersecurity engineering works."
  },
  {
    id: "all",
    slug: "all",
    name: "All Access",
    roleLabel: "Complete Engineering Portfolio",
    theme: "crimson",
    mark: "✦",
    accentColor: "#bf2a48",
    description: "Full access to all engineering tracks, practice logs, credentials, and achievements.",
    isAllAccess: true
  }
];

export const profileThemes = [
  { id: "burgundy", label: "Burgundy", color: "#a81e38" },
  { id: "wine", label: "Wine", color: "#7e1529" },
  { id: "garnet", label: "Garnet", color: "#9c243b" },
  { id: "crimson", label: "Crimson", color: "#bf2a48" }
];

