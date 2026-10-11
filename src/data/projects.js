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
    title: "SAMVES Portfolio Architecture",
    description: "A dark Neo Glass recruiter portfolio featuring 360-degree interactive 3D rotation, real-time lighting physics, and role-based filtering.",
    technologies: ["React 19", "Vite", "Framer Motion", "Vanilla CSS", "3D Transforms"],
    githubUrl: "https://github.com",
    demoUrl: "",
    image: null,
    assignedRoles: ["software", "projects", "all"]
  },
  {
    id: "security-audit-toolkit",
    categoryId: "cybersecurity",
    title: "Automated Security Audit & Hardening",
    description: "Scripted environment scanning and policy validation toolkit for Linux systems to inspect permissions, open ports, and configuration drift.",
    technologies: ["Bash", "Python", "Linux Security", "Network Auditing"],
    githubUrl: "https://github.com",
    demoUrl: "",
    image: null,
    assignedRoles: ["security", "projects", "all"]
  }
];
