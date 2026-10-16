// Project categories and items
// Add unlimited categories and projects.
// Use assignedRoles to associate with specific profiles ('software', 'security', 'projects', 'all') or set isShared: true.

export const projectCategories = [
  {
    id: "software-development",
    slug: "software-development",
    name: "Software Development",
    description: "Full-stack web applications, frontend architectures, and software engineering solutions.",
    assignedRoles: ["software", "projects", "all"]
  },
  {
    id: "cybersecurity",
    slug: "cybersecurity",
    name: "Cybersecurity & Labs",
    description: "Security assessments, defensive scripts, CTF writeups, and network defense experiments.",
    assignedRoles: ["security", "projects", "all"]
  }
];

export const projects = [
  {
    id: "samves-portfolio",
    categoryId: "software-development",
    title: "SAMVES Cinematic Portfolio Architecture",
    description: "A dark editorial portfolio featuring near-black glass surfaces, burgundy atmospheric lighting, role-based recruiter views, and fluid responsive interactions.",
    status: "Product", // "Product" | "Prototype" | "In Development"
    technologies: ["React 19", "Vite", "Framer Motion", "Vanilla CSS", "Neo Glass"],
    githubUrl: "https://github.com/eswar213006/SAMVES",
    demoUrl: "",
    image: null,
    assignedRoles: ["software", "projects", "all"]
  },
  {
    id: "security-audit-toolkit",
    categoryId: "cybersecurity",
    title: "Automated Security Audit & Hardening",
    description: "Scripted environment scanning and policy validation toolkit for Linux systems to inspect permissions, open ports, and configuration drift.",
    status: "Prototype",
    technologies: ["Bash", "Python", "Linux Security", "Network Auditing"],
    githubUrl: "",
    demoUrl: "",
    image: null,
    assignedRoles: ["security", "projects", "all"]
  }
];
