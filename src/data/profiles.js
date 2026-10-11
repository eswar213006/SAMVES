// Configuration for browsing profiles
// Edit names, accent colors, marks or themes directly here.

export const initialProfiles = [
  {
    id: "software",
    slug: "software",
    name: "Software Development",
    roleLabel: "Full-Stack & Software Engineering",
    theme: "ember",
    mark: "🧑‍💻",
    accentColor: "#f35d70",
    description: "Modern web applications, scalable software architectures, and algorithmic problem solving."
  },
  {
    id: "security",
    slug: "security",
    name: "Cybersecurity",
    roleLabel: "Security Analysis & Defense",
    theme: "ice",
    mark: "🛡️",
    accentColor: "#6bc4d2",
    description: "Security assessments, vulnerability research, defensive systems, and secure coding practices."
  },
  {
    id: "projects",
    slug: "projects",
    name: "Projects",
    roleLabel: "Technical Project Showcase",
    theme: "copper",
    mark: "🧑‍🚀",
    accentColor: "#e3a365",
    description: "Curated collection across all software development and cybersecurity engineering works."
  },
  {
    id: "all",
    slug: "all",
    name: "All Access",
    roleLabel: "Complete Engineering Portfolio",
    theme: "aurora",
    mark: "🤖",
    accentColor: "#a99be9",
    description: "Full access to all engineering tracks, practice logs, credentials, and achievements.",
    isAllAccess: true
  }
];

export const profileThemes = [
  { id: "ember", label: "Ember", color: "#f35d70" },
  { id: "ice", label: "Ice", color: "#6bc4d2" },
  { id: "copper", label: "Copper", color: "#e3a365" },
  { id: "aurora", label: "Aurora", color: "#a99be9" }
];
