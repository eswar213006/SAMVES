# SAMVES — Cinematic Developer Portfolio

A dark editorial, static React + Vite portfolio featuring near-black backgrounds (`#050505`), restrained deep burgundy and wine lighting, Neo Glass card surfaces, role-specific recruiter views, and abstract atmospheric visuals.

No database, backend, or authentication required. Built for static deployment on **Vercel** with full client-side routing, touch & reduced-motion support, and configuration files.

---

## 📁 How to Update Your Content

All portfolio information is stored in clean, editable JavaScript files in `src/data/`:

| Section | Data File | What You Can Edit |
|---|---|---|
| **Profiles** | `src/data/profiles.js` | Role names, labels, accent colors, geometric marks (`◈`, `🛡️`, `⚡`, `✦`), themes |
| **Hero & Summaries** | `src/data/summaries.js` | Role-tailored narratives, headings, technical highlights, optional **Hero Media Slot** |
| **Projects & Shelves** | `src/data/projects.js` | Unlimited project categories, project cards, tech tags, status (`Product`/`Prototype`), GitHub/Demo links |
| **Coding Journey** | `src/data/codingJourney.js` | Platforms (LeetCode, GFG, CodeChef, HackerRank), profile links, practice logs |
| **Resumes** | `src/data/resumes.js` | PDF paths (local or Google Drive share link), target roles, descriptions, filenames |
| **Certifications & Badges** | `src/data/certifications.js` | Verifiable credential titles, issuers, dates, credential URLs, badge honors |
| **Contact / About** | `src/data/contact.js` | Professional bio, key interests, email, verified links, optional **About Media Slot** |

---

## 🎨 Configuring Future Images & Videos (No-Person Default)

By default, the portfolio uses lightweight, CSS-generated abstract burgundy light sculptures and editorial lattice panels without human stock images or person placeholders.

When you are ready to add your real portrait or video:

### 1. Hero Visual Media Slot (`src/data/summaries.js`)
Edit `heroConfig`:
```javascript
export const heroConfig = {
  media: {
    type: "image", // "image" | "video" | "abstract"
    src: "/assets/portrait.jpg", // Place your file in public/assets/
    alt: "Engineer portrait"
  }
};
```
*Leaving `src: ""` keeps the cinematic abstract artwork enabled.*

### 2. About Editorial Visual Slot (`src/data/contact.js`)
Edit `contactDetails.mediaSlot`:
```javascript
mediaSlot: {
  type: "image", // "image" | "video"
  src: "/assets/about-portrait.jpg", // Place your file in public/assets/
  alt: "Engineer portrait"
}
```
*Leaving `src: ""` keeps the abstract editorial graphic panel enabled.*

---

## 📄 Adding Local PDFs and Project Media

- **Resume PDFs**: Drop your PDF in `public/resumes/` (e.g. `public/resumes/Software_Resume.pdf`). In `src/data/resumes.js`, set `filePath: "/resumes/Software_Resume.pdf"`. Alternatively, paste a Google Drive share link directly.
- **Project Images**: Drop images in `public/projects/` and reference as `image: "/projects/screenshot.png"` in `src/data/projects.js`.

---

## 🚀 Local Development & Production Build

### 1. Start Local Dev Server
```powershell
npm run dev
```
Open [http://localhost:5173](http://localhost:5173).

### 2. Verify Production Build
```powershell
npm run build
```
Creates an optimized static bundle in `dist/`.

### 3. Deploy to Vercel
1. Commit and push changes:
   ```powershell
   git add .
   git commit -m "Update portfolio content"
   git push origin main
   ```
2. Vercel automatically deploys the updated static build.

---

## 🔗 Direct Recruiter Links

Share role-tailored links directly:
- **Software Development**: `https://yourdomain.com/?profile=software`
- **Cybersecurity**: `https://yourdomain.com/?profile=security`
- **Projects Showcase**: `https://yourdomain.com/?profile=projects`
- **All Access**: `https://yourdomain.com/?profile=all`
