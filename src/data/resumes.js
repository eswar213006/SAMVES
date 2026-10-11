// Configured resumes
// You can use:
//   - A local PDF:       filePath: "/resumes/MyResume.pdf"   (drop file in public/resumes/)
//   - A Google Drive link: paste the share URL exactly as Google gives you — the app converts it automatically.
//     Example: "https://drive.google.com/file/d/FILEID/view?usp=sharing"

export const resumes = [
  {
    id: "software-resume",
    title: "Software Engineering Resume",
    targetRole: "Full-Stack & Software Developer",
    description: "Focuses on web application engineering, modern frameworks, system design, and algorithmic problem solving.",
    filePath: "https://drive.google.com/file/d/1tYIUfI2t_9yJjXdSFnzFCYe5aLTwgkhh/view?usp=sharing",
    downloadName: "Software_Engineering_Resume.pdf",
    assignedRoles: ["software", "projects", "all"]
  },
  {
    id: "cybersecurity-resume",
    title: "Cybersecurity Resume",
    targetRole: "Security Analyst & Defense",
    description: "Highlights technical security coursework, defensive tools, system auditing, and secure coding practices.",
    filePath: "", // Paste a Google Drive link or "/resumes/Cybersecurity_Resume.pdf"
    downloadName: "Cybersecurity_Resume.pdf",
    assignedRoles: ["security", "projects", "all"]
  }
];
