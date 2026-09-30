# 🎓 Éclat Institute — Learning Management System (LMS)

> **100% Online Virtual Campus** for Technology, Software Engineering, Data Science, and Modern Languages.
> Live at → [eclat.institute](https://eclat.institute)

---

## 📌 What Is This?

This is the full web application (and desktop/mobile app) for **Éclat Institute**. It includes:

- 🌐 **Public landing page** — course catalog, intake adverts, about page
- 🎓 **Student portal** — enrolled courses, video lessons, transcripts, fee statements
- 👩‍🏫 **Teacher portal** — upload lessons, mark attendance, gradebook
- 🛡️ **Admin console** — manage users, courses, intakes, access codes, content moderation
- 💼 **Bursar desk** — fee invoices and payment tracking
- 📚 **E-Library** — digital resources, past papers, academic handbooks
- 📱 **Android / iOS app** — built with Capacitor
- 🖥️ **Windows desktop app** — built with Electron

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + TypeScript |
| Build Tool | Vite |
| Routing | React Router v7 |
| Server State | TanStack React Query |
| Forms | React Hook Form + Zod |
| Backend / DB | Supabase (PostgreSQL + Auth + Storage) |
| Styling | Plain CSS (custom design system) |
| Mobile | Capacitor (Android + iOS) |
| Desktop | Electron |
| Linting | Oxlint |

---

## 🚀 Getting Started (Local Development)

### 1. Clone the repo

```bash
git clone https://github.com/Smart-009/brent1_college.git
cd brent1_college/ECLAT-lms
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Copy the example env file and fill in the values:

```bash
cp .env.example .env
```

Open `.env` and set your **Supabase URL and Anon Key**. Contact the project owner for the production credentials.

### 4. Start the dev server

```bash
npm run dev
```

App runs at → **http://localhost:5173**

---

## 📁 Project Structure

```
ECLAT-lms/
├── src/
│   ├── features/           # All pages grouped by role
│   │   ├── admin/          # Admin console pages
│   │   ├── student/        # Student portal pages
│   │   ├── teacher/        # Teacher portal pages
│   │   ├── courses/        # Public course catalog
│   │   ├── landing/        # Home & public pages
│   │   ├── library/        # E-Library
│   │   ├── auth/           # Login, password change
│   │   └── ...             # Other modules
│   ├── components/         # Reusable UI components
│   │   ├── layout/         # Sidebar, PageWrapper, LayoutShell
│   │   └── ui/             # Buttons, Modals, Spinner, etc.
│   ├── config/
│   │   └── officialCourses.ts  # Master list of all 71 courses
│   ├── lib/
│   │   ├── supabase.ts     # Supabase client
│   │   ├── schoolData.ts   # Local school data store
│   │   └── database.types.ts  # TypeScript DB types
│   ├── hooks/              # Custom React hooks
│   ├── types/              # Shared TypeScript types
│   └── App.tsx             # All routes defined here
├── supabase/
│   └── migrations/         # SQL migration files
├── electron/               # Desktop app entry
├── android/                # Capacitor Android project
├── ios/                    # Capacitor iOS project
├── .env.example            # Environment variable template
└── package.json
```

---

## 🧑‍💻 User Roles

| Role | Access |
|---|---|
| `admin` | Full system access — users, courses, intakes, codes |
| `teacher` | Upload lessons, attendance, gradebook |
| `student` | View enrolled lessons, transcripts, fees |
| `igcse` | Cambridge/Edexcel student portal |
| `parent` | Ward overview, fees, transcripts |
| `bursar` | Fee management and admissions desk |

---

## 📜 Available Scripts

```bash
npm run dev            # Start local development server
npm run build          # Build for production
npm run preview        # Preview the production build locally
npm run test           # Run unit tests
npm run lint           # Run Oxlint linter

# Desktop (Electron)
npm run desktop        # Run desktop app in dev mode
npm run desktop:dist   # Build Windows installer (.exe)

# Mobile (Capacitor)
npm run android:open   # Build and open in Android Studio
npm run ios:open       # Build and open in Xcode
```

---

## 🌿 Branching & Contribution Guide

1. **Always branch off `main`** — never commit directly to `main`
2. Name your branch clearly: `feature/your-feature-name` or `fix/bug-description`
3. Keep commits focused and descriptive
4. Open a pull request and describe what changed and why

```bash
git checkout -b feature/your-feature-name
# make your changes
git add .
git commit -m "feat: describe what you did"
git push origin feature/your-feature-name
```

---

## 🔑 Key Files to Know

| File | Purpose |
|---|---|
| [`src/App.tsx`](src/App.tsx) | All route definitions |
| [`src/features/admin/AdminDashboard.tsx`](src/features/admin/AdminDashboard.tsx) | Admin home page |
| [`src/features/admin/ManageClasses.tsx`](src/features/admin/ManageClasses.tsx) | Course & subject management |
| [`src/config/officialCourses.ts`](src/config/officialCourses.ts) | Master course registry (71 courses) |
| [`src/lib/supabase.ts`](src/lib/supabase.ts) | Supabase client setup |
| [`src/lib/schoolData.ts`](src/lib/schoolData.ts) | Local data store (courses, departments) |
| [`supabase/migrations/`](supabase/migrations/) | All database migration files |

---

## ⚙️ Environment Variables

| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase public anon key |
| `VITE_ADMIN_USERNAME` | Admin login username (`Eclat@admin`) |
| `VITE_ADMIN_PASSWORD` | Admin login password |
| `VITE_INSTITUTION_NAME` | School name (for branding) |
| `VITE_WEBSITE_URL` | Production website URL |

> ⚠️ **Never commit your `.env` file to git.** It is already in `.gitignore`.

---

## 📞 Contact

**Éclat Institute**
- 🌐 [eclat.institute](https://eclat.institute)
- 📧 info.eclatinstitute@gmail.com
- 📞 +254 740 027 346
