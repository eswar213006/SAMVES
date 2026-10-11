# SAMVES — Personal Recruiter Portfolio

A human-crafted, static React + Vite portfolio featuring dark **Neo Glass** aesthetics, **360-degree interactive 3D rotation**, and role-specific filtering for recruiters.

No database, backend, or login required. Designed for immediate deployment on **Vercel** and direct maintenance via **VS Code & GitHub**.

---

## 📁 How to Update Your Content

All portfolio information is organized in clean, readable JavaScript files in `src/data/`:

| Section | Data File | What You Can Edit |
|---|---|---|
| **Profiles** | `src/data/profiles.js` | Profile names, role labels, accent colors, emoji marks, themes |
| **Summary** | `src/data/summaries.js` | Role-tailored narratives, headings, bulleted technical highlights |
| **Projects & Shelves** | `src/data/projects.js` | Unlimited project categories, project cards, tech tags, GitHub/Live demo links |
| **Coding Journey** | `src/data/codingJourney.js` | Platforms (LeetCode, GFG, CodeChef, HackerRank), profile links, question counts |
| **Resumes** | `src/data/resumes.js` | PDF paths, target roles, descriptions, download filenames |
| **Certifications & Badges**| `src/data/certifications.js`| Verified credential titles, issuers, issue dates, verification links, badge honors |
| **Contact / About** | `src/data/contact.js` | Professional bio, key interests, email, LinkedIn, GitHub, social links |

---

## 📄 Adding Local PDFs and Assets

- **Resume PDFs**: Put your PDF files in `public/resumes/` (e.g. `public/resumes/Software_Resume.pdf`). In `src/data/resumes.js`, set `filePath: "/resumes/Software_Resume.pdf"`.
- **Project Images**: Put images in `public/projects/` and reference them as `image: "/projects/project1.png"` in `src/data/projects.js`.

---

## 🚀 Local Development & Vercel Deployment

### 1. Test Locally
```powershell
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173).

### 2. Verify Build
```powershell
npm run build
```

### 3. Deploy to Vercel
1. Push your changes to your connected GitHub branch:
   ```powershell
   git add .
   git commit -m "Update portfolio content"
   git push origin main
   ```
2. Vercel automatically detects the push and deploys the new static build.
3. In the **Vercel Dashboard**, check **Deployments** to confirm the live build status.

---

## 🔗 Direct Recruiter Links

Share role-specific views directly with recruiters:
- **Software Development**: `https://yourdomain.com/?profile=software`
- **Cybersecurity**: `https://yourdomain.com/?profile=security`
- **Projects Showcase**: `https://yourdomain.com/?profile=projects`
- **All Access**: `https://yourdomain.com/?profile=all`
