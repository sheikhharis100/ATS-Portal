# Multi-Branch ATS Portal

A full-stack **Applicant Tracking System** for a multi-branch organization. Candidates can browse jobs, apply, and track their application status. HR Admins can manage jobs, review applications, schedule interviews, and manage branch offices — all from a single dashboard.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16 (App Router), Tailwind CSS, ShadCN UI |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas |
| File Storage | Cloudinary (resumes, profile pictures) |
| Auth | JWT (JSON Web Tokens) + Role-Based Access Control |
| Email | Nodemailer (Gmail SMTP) |

---

## Features

- **Public Portal** — Browse and search job listings by branch, type, and department
- **Candidate Portal** — Register, build profile, upload resume (PDF), apply to jobs, track application status
- **Admin Portal** — Manage jobs, review applications, update statuses, schedule interviews, manage branches, view dashboard analytics
- **Email Notifications** — Automatic emails to candidates on status changes and interview scheduling

---

## Local Setup

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free tier works)
- Cloudinary account (free tier works)

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd ats-project
```

### 2. Configure backend environment
Create `mini-services/ats-backend/.env`:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLIENT_URL=http://localhost:3000
GMAIL_USER=your_gmail@gmail.com
GMAIL_PASS=your_16_char_app_password
```

### 3. Install dependencies
```bash
# Backend
cd mini-services/ats-backend
npm install

# Frontend (from project root)
cd ../..
npm install
```

### 4. Seed the database
```bash
cd mini-services/ats-backend
node seed.js
```
This creates 4 branches, 1 admin account, 2 candidate accounts, and 5 sample jobs.

### 5. Start the servers

**Backend** (port 5000):
```bash
cd mini-services/ats-backend
node index.js
```

**Frontend** (port 3000):
```bash
npm run dev
```

Or just double-click **`start-ats.bat`** — it does all of the above automatically.

Open [http://localhost:3000](http://localhost:3000)

---

## Live Demo

| | URL |
|-|-----|
| Frontend | https://ats-portal-34fo.vercel.app |
| Backend API | https://ats-backend-6f1b.onrender.com |

---

## Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin / HR | admin@ats.com | admin123 |
| Candidate | ali@example.com | candidate123 |
| Candidate | sara@example.com | candidate123 |

---

## Project Structure

```
ats-project/
├── src/
│   ├── app/                  # Next.js pages (App Router)
│   │   ├── admin/            # Admin portal pages
│   │   ├── candidate/        # Candidate portal pages
│   │   ├── jobs/             # Public job listings
│   │   ├── login/
│   │   └── register/
│   ├── components/           # Reusable UI components
│   └── lib/                  # API client, auth context
└── mini-services/
    └── ats-backend/
        ├── controllers/      # Route handlers
        ├── models/           # Mongoose schemas
        ├── routes/           # Express routes
        ├── middleware/       # Auth & role middleware
        └── utils/            # Email service, helpers
```

---

## Application Status Pipeline

```
Submitted → Under Review → Shortlisted → Interview Scheduled → Selected
                                    └──────────────────────────→ Rejected
```
