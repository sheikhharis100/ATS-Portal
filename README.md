# ATS Portal — Multi-Branch Applicant Tracking System

A full-stack **Applicant Tracking System** for an organisation with multiple
branch offices. Candidates browse jobs, apply with a resume, and track their
application status. HR admins manage job postings, review applications, move
candidates through a hiring pipeline, schedule interviews, and administer branch
offices — all from one dashboard.

<p>
  <img alt="Next.js" src="https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs&logoColor=white">
  <img alt="React" src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black">
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white">
  <img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white">
  <img alt="Express" src="https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white">
  <img alt="MongoDB" src="https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white">
  <img alt="JWT" src="https://img.shields.io/badge/Auth-JWT-FF6C37?logo=jsonwebtokens&logoColor=white">
</p>

---

## Table of Contents

- [Live Demo](#live-demo)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Demo Accounts](#demo-accounts)
- [API Reference](#api-reference)
- [Data Model](#data-model)
- [Application Pipeline](#application-pipeline)
- [Deployment](#deployment)
- [Security Notes](#security-notes)
- [Troubleshooting](#troubleshooting)

---

## Live Demo

| Service | URL |
|---------|-----|
| Frontend | https://ats-portal-34fo.vercel.app |
| Backend API | https://ats-backend-6flb.onrender.com/api |
| Health check | https://ats-backend-6flb.onrender.com/api/health |

> The backend runs on Render's free tier, which spins down after 15 minutes of
> inactivity. **The first request after idle takes roughly 30–60 seconds** while
> the service wakes up. Subsequent requests are fast.

---

## Features

### Public
- Browse all open job listings
- Filter by branch, department, employment type, and experience level
- Full-text search across job titles and descriptions
- Job detail pages with salary range, required skills, seats, and deadline

### Candidate
- Register and log in (JWT-based sessions)
- Build a profile — phone, skills, experience, education
- Upload a profile picture and a resume (PDF)
- Write and store a reusable cover letter
- Apply to any open job with a per-application cover note
- Track every application and its live status
- View a timeline of status changes with HR notes
- See scheduled interview details (date, time, mode, location/link)

### Admin / HR
- Dashboard with counts by status, recent activity, and charts
- Create, edit, pause, close, and delete job postings
- Review every application, filtered by job or status
- Move applications through the hiring pipeline, attaching a note at each step
- Schedule, reschedule, and cancel interviews
- Manage branch offices (create, edit, delete)
- Automatic email notifications to candidates on status change and interview
  scheduling

---

## Tech Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| [Next.js](https://nextjs.org) | 16 (App Router, Turbopack) | React framework, routing, SSR/SSG |
| [React](https://react.dev) | 19 | UI library |
| [TypeScript](https://www.typescriptlang.org) | 5 | Static typing |
| [Tailwind CSS](https://tailwindcss.com) | 4 | Utility-first styling |
| [shadcn/ui](https://ui.shadcn.com) + [Radix UI](https://www.radix-ui.com) | — | Accessible component primitives |
| [Axios](https://axios-http.com) | 1.16 | HTTP client with auth interceptors |
| [TanStack Query](https://tanstack.com/query) | 5.82 | Server-state caching |
| [React Hook Form](https://react-hook-form.com) + [Zod](https://zod.dev) | 7.60 / 4.0 | Forms and schema validation |
| [Recharts](https://recharts.org) | 2.15 | Dashboard charts |
| [dnd kit](https://dndkit.com) | 6.3 | Drag-and-drop pipeline board |
| [Framer Motion](https://www.framer.com/motion/) | 12.23 | Animations |
| [Lucide](https://lucide.dev) | 0.525 | Icon set |
| [Sonner](https://sonner.emilkowal.ski) | 2.0 | Toast notifications |

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| [Node.js](https://nodejs.org) | 18+ (22 recommended) | Runtime |
| [Express](https://expressjs.com) | 4.18 | HTTP server and routing |
| [MongoDB](https://www.mongodb.com) + [Mongoose](https://mongoosejs.com) | 7.6 | Database and ODM |
| [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) | 9.0 | JWT issuing and verification |
| [bcryptjs](https://github.com/dcodeIO/bcrypt.js) | 2.4 | Password hashing (10 salt rounds) |
| [Multer](https://github.com/expressjs/multer) | 1.4 | Multipart file upload parsing |
| [Cloudinary](https://cloudinary.com) | 1.41 | File storage and CDN |
| [Nodemailer](https://nodemailer.com) | 6.10 | Transactional email over Gmail SMTP |
| [CORS](https://github.com/expressjs/cors) | 2.8 | Cross-origin policy |

### Infrastructure

| Layer | Service |
|-------|---------|
| Frontend hosting | Vercel |
| Backend hosting | Render (web service) |
| Database | MongoDB Atlas (M0 free tier) |
| File storage | Cloudinary |
| Email | Gmail SMTP |

---

## Architecture

The frontend and backend are **separate deployments**. The browser talks
directly to the Express API; Next.js does not proxy it.

```
                    ┌──────────────────────────────┐
                    │   Browser                    │
                    └───────────────┬──────────────┘
                                    │
          ┌─────────────────────────┴─────────────────────────┐
          │ HTML / JS                        JSON (XHR)       │
          ▼                                                   ▼
┌─────────────────────┐                      ┌────────────────────────────┐
│  Next.js 16         │                      │  Express API               │
│  (Vercel)           │                      │  (Render)                  │
│                     │                      │                            │
│  App Router pages   │                      │  /api/auth       public    │
│  Client components  │                      │  /api/jobs       mixed     │
│  Axios + JWT        │                      │  /api/branches   mixed     │
│  localStorage token │                      │  /api/candidate  candidate │
└─────────────────────┘                      │  /api/admin      admin     │
                                             └────────┬───────────────────┘
                                                      │
                            ┌─────────────────────────┼─────────────────────┐
                            ▼                         ▼                     ▼
                  ┌──────────────────┐     ┌──────────────────┐  ┌──────────────────┐
                  │ MongoDB Atlas    │     │ Cloudinary       │  │ Gmail SMTP       │
                  │ users, jobs,     │     │ resumes,         │  │ status-change    │
                  │ applications,    │     │ profile pictures │  │ notifications    │
                  │ branches,        │     │                  │  │                  │
                  │ interviews       │     │                  │  │                  │
                  └──────────────────┘     └──────────────────┘  └──────────────────┘
```

**Request flow for an authenticated call**

1. The client reads the JWT from `localStorage` and an Axios request
   interceptor attaches `Authorization: Bearer <token>`.
2. `protect` middleware verifies the token and loads the user onto `req.user`.
3. `authorize('admin')` / `authorize('candidate')` enforces the role.
4. The controller runs and returns `{ success, message, data }`.
5. A `401` response triggers a client-side logout and redirect to `/login`.

---

## Project Structure

```
ATS-Portal/
├── src/                              # Next.js frontend
│   ├── app/
│   │   ├── page.tsx                  # Landing page
│   │   ├── login/ · register/        # Auth pages
│   │   ├── jobs/                     # Public job list
│   │   │   └── [id]/                 # Job detail + apply
│   │   ├── candidate/
│   │   │   ├── dashboard/
│   │   │   ├── profile/              # Profile, resume, cover letter
│   │   │   └── applications/
│   │   │       └── [id]/             # Status timeline + interview
│   │   └── admin/
│   │       ├── dashboard/            # Stats and charts
│   │       ├── jobs/                 # Job CRUD
│   │       ├── applications/
│   │       │   └── [id]/             # Review, status, schedule
│   │       ├── interviews/
│   │       └── branches/             # Branch CRUD
│   ├── components/
│   │   └── ui/                       # shadcn/ui components
│   └── lib/
│       ├── api.ts                    # Axios instance + interceptors
│       ├── auth-context.tsx          # Auth provider, login/register/logout
│       └── utils.ts
│
├── mini-services/ats-backend/        # Express API
│   ├── index.js                      # Entry point, CORS, route mounting
│   ├── seed.js                       # Sample data loader
│   ├── config/
│   │   ├── db.js                     # Mongoose connection
│   │   └── cloudinary.js             # Cloudinary config + detection
│   ├── models/                       # User, Job, Application, Branch, Interview
│   ├── controllers/                  # auth, job, candidate, admin, branch
│   ├── routes/                       # One router per resource
│   ├── middleware/
│   │   ├── auth.js                   # protect — JWT verification
│   │   └── roleAuth.js               # authorize(...roles)
│   └── utils/
│       ├── cloudinaryUpload.js       # Upload/delete + local-disk fallback
│       └── emailService.js           # Nodemailer templates
│
├── render.yaml                       # Render Blueprint for the backend
├── start-ats.bat                     # Windows one-click launcher
└── next.config.ts
```

---

## Getting Started

### Prerequisites

- **Node.js 18 or newer** — https://nodejs.org (LTS installer)
- **A MongoDB database**, either:
  - **MongoDB Community Server** running locally — no account needed, or
  - **MongoDB Atlas** free M0 cluster — https://www.mongodb.com/cloud/atlas
- Cloudinary and Gmail accounts are **optional** — see
  [Environment Variables](#environment-variables).

### 1. Clone and install

```bash
git clone https://github.com/sheikhharis100/ATS-Portal.git
cd ATS-Portal

# Frontend (project root)
npm install

# Backend
cd mini-services/ats-backend
npm install
cd ../..
```

### 2. Configure the backend

```bash
cp mini-services/ats-backend/.env.example mini-services/ats-backend/.env
```

Edit it — at minimum set `MONGO_URI` and `JWT_SECRET`. See the
[reference table](#backend-minie-servicesats-backendenv) below.

### 3. Configure the frontend

Create `.env.local` in the **project root**:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

> **This is required.** Without it the app falls back to `/api` on its own
> origin, where nothing is listening, and every request silently returns the
> Next.js 404 page. The same variable must be set on Vercel, pointing at the
> deployed backend.

### 4. Seed the database

```bash
cd mini-services/ats-backend
node seed.js
```

Creates 4 branches, 1 admin, 2 candidates, and 5 sample jobs. Job deadlines are
generated relative to the run date, so seeded data never looks expired.

> `seed.js` **deletes all existing** users, jobs, branches, and applications
> before inserting. Do not run it against a database with real data.

### 5. Run both servers

**Terminal 1 — backend (port 5000):**
```bash
cd mini-services/ats-backend
node index.js
```

**Terminal 2 — frontend (port 3000):**
```bash
npm run dev
```

Open **http://localhost:3000**.

#### Windows shortcut

Double-click **`start-ats.bat`**. It starts a local MongoDB if one is installed,
seeds the database on first run, launches both servers in separate windows, and
opens the browser.

### Available scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Next.js in development mode on port 3000 |
| `npm run build` | Production build |
| `npm start` | Serve the production build on port 3000 |
| `npm run lint` | Run ESLint |
| `node index.js` | Start the API (from `mini-services/ats-backend`) |
| `node seed.js` | Reset and reseed the database |

---

## Environment Variables

### Backend — `mini-services/ats-backend/.env`

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | API port. Defaults to `5000`. Render overrides this. |
| `MONGO_URI` | **Yes** | MongoDB connection string. Local: `mongodb://127.0.0.1:27017/ats_db`. Atlas: `mongodb+srv://user:pass@cluster.xxxxx.mongodb.net/ats_db` |
| `JWT_SECRET` | **Yes** | Long random string used to sign tokens. Never reuse the local value in production. |
| `JWT_EXPIRE` | No | Token lifetime. Defaults to `7d`. |
| `CLIENT_URL` | No | Comma-separated list of allowed CORS origins. Defaults to `http://localhost:3000`. Any `*.vercel.app` origin is also permitted so preview deploys keep working. |
| `PUBLIC_API_URL` | No | Public base URL of the API, used to build upload URLs when Cloudinary is not configured. |
| `CLOUDINARY_CLOUD_NAME` | No* | Cloudinary cloud name. |
| `CLOUDINARY_API_KEY` | No* | Cloudinary API key. |
| `CLOUDINARY_API_SECRET` | No* | Cloudinary API secret. |
| `GMAIL_USER` | No | Gmail address used as the sender. |
| `GMAIL_PASS` | No | Gmail **App Password** (16 characters), not your account password. |

**\* Cloudinary is optional in development.** Leave all three blank and uploads
are written to `mini-services/ats-backend/uploads/` and served from `/uploads`.
**Set them in production** — Render and similar hosts wipe the filesystem on
every restart and deploy, so the local fallback would silently lose every
uploaded resume.

**Gmail is optional.** Leave both blank and email sending is skipped with a log
line instead of throwing.

### Frontend — `.env.local`

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_URL` | **Yes** | Full base URL of the API, including `/api`. |

> `NEXT_PUBLIC_*` values are inlined at **build time**. Changing this on Vercel
> requires a redeploy, not just a restart.

---

## Demo Accounts

Created by `node seed.js`:

| Role | Email | Password |
|------|-------|----------|
| Admin / HR | `admin@ats.com` | `admin123` |
| Candidate | `ali@example.com` | `candidate123` |
| Candidate | `sara@example.com` | `candidate123` |

> Registration through the UI always creates a **candidate**. Admin accounts are
> created by the seed script or promoted directly in the database — the API
> ignores any `role` sent in a registration request.

---

## API Reference

Base URL: `http://localhost:5000/api` (or your deployed backend + `/api`).

All responses share one envelope:

```jsonc
{
  "success": true,
  "message": "Human-readable message",
  "data": { }        // present on most successful reads
}
```

Protected routes require a header:

```
Authorization: Bearer <jwt>
```

### Auth — `/api/auth`

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `POST` | `/register` | Public | Create a candidate account; returns `{ token, user }` |
| `POST` | `/login` | Public | Authenticate; returns `{ token, user }` |
| `GET` | `/me` | Authenticated | Current user from the token |

### Jobs — `/api/jobs`

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET` | `/` | Public | List jobs. Query: `search`, `branch`, `department`, `employmentType`, `experienceLevel`, `status`, `page`, `limit` |
| `GET` | `/:id` | Public | Single job with its branch populated |
| `POST` | `/` | Admin | Create a job |
| `PUT` | `/:id` | Admin | Update a job |
| `DELETE` | `/:id` | Admin | Delete a job |

### Branches — `/api/branches`

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET` | `/` | Public | List branches |
| `GET` | `/:id` | Public | Single branch |
| `POST` | `/` | Admin | Create a branch |
| `PUT` | `/:id` | Admin | Update a branch |
| `DELETE` | `/:id` | Admin | Delete a branch |

### Candidate — `/api/candidate`

All routes require a **candidate** token.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/profile` | Current candidate's profile |
| `PUT` | `/profile` | Update name, phone, skills, experience, education |
| `PUT` | `/profile/picture` | Upload a profile image — `multipart/form-data`, field `profilePicture` |
| `PUT` | `/resume` | Upload a resume PDF — `multipart/form-data`, field `resume` |
| `PUT` | `/cover-letter` | Save a reusable cover letter (JSON body) |
| `POST` | `/apply/:jobId` | Apply to a job with an optional `coverNote` |
| `GET` | `/applications` | List own applications |
| `GET` | `/applications/:id` | Application detail, status history, interview |

### Admin — `/api/admin`

All routes require an **admin** token.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/dashboard` | Aggregate counts and recent activity |
| `GET` | `/applications` | All applications. Query: `job`, `status`, `page`, `limit` |
| `GET` | `/applications/:id` | Full application with candidate and job |
| `PUT` | `/applications/:id/status` | Change status; accepts a `note`, emails the candidate |
| `POST` | `/interviews` | Schedule an interview |
| `GET` | `/interviews` | List all interviews |
| `PUT` | `/interviews/:id` | Reschedule or edit |
| `DELETE` | `/interviews/:id` | Cancel |

### Health

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET` | `/api/health` | Public | Liveness probe; also used by Render |

### Status codes

| Code | Meaning |
|------|---------|
| `200` / `201` | Success |
| `400` | Validation error or duplicate email |
| `401` | Missing, invalid, or expired token |
| `403` | Authenticated but wrong role |
| `404` | Resource not found |
| `500` | Server error |

---

## Data Model

### User
`name`, `email` (unique), `password` (bcrypt, `select: false`), `role`
(`candidate` | `admin`), `phone`, `profilePicture`, `profilePicturePublicId`,
`resume`, `resumePublicId`, `coverLetter`, `skills[]`, `experience`,
`education`, `isActive`

### Branch
`name`, `location`, `city`, `contactPhone`, `contactEmail`, `isRemote`

### Job
`title`, `description`, `department`, `branch` → Branch, `employmentType`
(`Full-time` | `Part-time` | `Contract` | `Internship` | `Remote`),
`experienceLevel` (`Entry Level` | `Mid Level` | `Senior Level` | `Lead` |
`Manager`), `salaryMin`, `salaryMax`, `availableSeats`, `skills[]`, `deadline`,
`status` (`Open` | `Closed` | `Paused`), `createdBy` → User

### Application
`candidate` → User, `job` → Job, `status`, `coverNote`, `resumeSnapshot`,
`statusHistory[]` (`status`, `note`, `changedAt`), timestamps

### Interview
`application` → Application, `scheduledAt`, `mode`, `location`, `meetingLink`,
`notes`, `createdBy` → User

---

## Application Pipeline

```
Submitted ──► Under Review ──► Shortlisted ──► Interview Scheduled ──► Selected
    │              │                │                   │
    └──────────────┴────────────────┴───────────────────┴──────────► Rejected
```

Every transition appends to `statusHistory` with an optional HR note and sends
the candidate an email when Gmail credentials are configured.

---

## Deployment

### Database — MongoDB Atlas

1. Create a free **M0** cluster.
2. **Database Access** → add a user with `readWrite` on `ats_db`.
3. **Network Access** → add `0.0.0.0/0` so the backend host can connect.
4. Copy the `mongodb+srv://...` connection string.

### Backend — Render

`render.yaml` in the repo root defines the service. In the Render dashboard
choose **New → Blueprint** and select this repository, or create a web service
manually with:

| Setting | Value |
|---------|-------|
| Root directory | `mini-services/ats-backend` |
| Build command | `npm install` |
| Start command | `node index.js` |
| Health check path | `/api/health` |

Set the environment variables from the [table above](#backend--mini-servicesats-backendenv).
`CLIENT_URL` must be your Vercel URL, and `PUBLIC_API_URL` the Render URL.

> **Free tier behaviour:** a service spins down after 15 minutes without traffic
> and takes about a minute to wake. Each workspace gets 750 free instance hours
> per month; once exhausted, free services are suspended until the next month.
> The filesystem is wiped on every restart and deploy, which is why Cloudinary
> must be configured in production.

### Frontend — Vercel

1. Import the repository.
2. **Settings → Environment Variables** → add:

   | Variable | Value |
   |----------|-------|
   | `NEXT_PUBLIC_API_URL` | `https://<your-backend>.onrender.com/api` |

3. Redeploy — `NEXT_PUBLIC_*` is baked in at build time, so a restart is not
   enough.

---

## Security Notes

- **Passwords** are hashed with bcrypt (10 salt rounds) in a Mongoose
  `pre('save')` hook. The field is `select: false`, so it is never returned by a
  normal query.

  > Because the hook lives on `save`, bulk helpers that bypass middleware —
  > notably `insertMany()` — would store passwords in plain text. Always use
  > `create()` for users.

- **Role assignment is server-side.** `POST /api/auth/register` ignores any
  `role` in the request body and always creates a candidate. Without this,
  anyone could grant themselves admin access by adding `"role":"admin"` to the
  registration payload.

- **JWT** tokens are signed with `JWT_SECRET` and expire after `JWT_EXPIRE`.
  Generate a fresh secret per environment:

  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```

- **CORS** allows the origins in `CLIENT_URL` plus any `*.vercel.app` host.
  Tighten this if the API is ever used for something other than this frontend.

- **Uploads** are capped at 5 MB and restricted by MIME type. Resumes accept
  PDF; profile pictures accept common image formats.

- **Never commit `.env`.** It is already in `.gitignore`. If a secret is ever
  pushed, rotate it — rewriting history does not un-leak it.

---

## Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| Buttons do nothing; Network tab shows the HTML 404 page for `/api/*` | `NEXT_PUBLIC_API_URL` is unset | Set it and **redeploy** (it is inlined at build time) |
| `MongooseError: Operation ... buffering timed out after 10000ms` | The API cannot reach MongoDB | Check `MONGO_URI`, and add `0.0.0.0/0` under Atlas → Network Access |
| Backend exits immediately on boot | `connectDB()` calls `process.exit(1)` when Mongo is unreachable | Same as above — fix the connection string or whitelist |
| First production request takes ~60 s | Render free tier cold start | Expected. Keep the tab open or upgrade the plan |
| CORS error in the console | Origin not allowed | Add it to `CLIENT_URL` (comma-separated) and redeploy the backend |
| Seeded candidates cannot log in | Users were inserted with `insertMany`, skipping the bcrypt hook | Re-run `node seed.js` on current code, which uses `create()` |
| Uploaded resume 404s after a redeploy | Cloudinary not configured, so files went to ephemeral local disk | Set the three `CLOUDINARY_*` variables in production |
| `'tee'`/`'cp'` is not recognised on Windows | Older Unix-only npm scripts | Fixed — scripts are cross-platform |
| Port 3000 or 5000 already in use | Another process is bound | Stop it, or change `PORT` / `next dev -p` |

---

## License

Released for educational and portfolio use.

## Author

**Sheikh Haris** — [@sheikhharis100](https://github.com/sheikhharis100)
