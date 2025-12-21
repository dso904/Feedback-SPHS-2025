<div align="center">

# 🚀 SPHS Feedback System

### 🌟 Biennial Exhibition of South Point School 2025 🌟

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js"/>
  <img src="https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind"/>
  <img src="https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase"/>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Framer_Motion-Animations-FF0055?style=flat-square&logo=framer" alt="Framer"/>
  <img src="https://img.shields.io/badge/NextAuth.js-Security-000?style=flat-square" alt="NextAuth"/>
  <img src="https://img.shields.io/badge/Vercel-Deployed-000?style=flat-square&logo=vercel" alt="Vercel"/>
  <img src="https://img.shields.io/badge/FingerprintJS-Protection-orange?style=flat-square" alt="FingerprintJS"/>
</p>

---

### 🔗 Quick Links

[🌐 **Live Site**](https://feedback-sphs-2025.vercel.app) • [📝 **Submit Feedback**](https://feedback-sphs-2025.vercel.app/feedback) • [🔐 **Admin Panel**](https://feedback-sphs-2025.vercel.app/admin)

---

*A futuristic, cyberpunk-themed feedback collection system built for South Point School's Biennial Exhibition 2025*

**Built with ❤️ by Team HackMinors**

</div>

---

## 📑 Table of Contents

- [✨ Features Overview](#-features-overview)
- [🎨 User Interface](#-user-interface)
- [🛡️ Protection System](#️-protection-system)
- [👨‍💼 Admin Panel](#-admin-panel)
- [🛠️ Tech Stack](#️-tech-stack)
- [📁 Project Structure](#-project-structure)
- [🚀 Getting Started](#-getting-started)
- [⚙️ Environment Variables](#️-environment-variables)
- [🗄️ Database Schema](#️-database-schema)
- [📡 API Reference](#-api-reference)
- [🔐 Authentication](#-authentication)
- [📱 Pages & Routes](#-pages--routes)
- [🎭 Theming](#-theming)
- [📦 Deployment](#-deployment)
- [👨‍💻 Credits](#-credits)

---

## ✨ Features Overview

<table>
<tr>
<td width="50%">

### 🎯 For Visitors
- **4-Step Guided Wizard** — Intuitive feedback flow
- **Role Selection** — Student, Guardian, Teacher, Ex-Student, Guest
- **Dynamic Subjects** — Admin-managed via dashboard
- **Star Ratings** — 6 questions with 1-5 star scale
- **Optional Comments** — Free-text feedback
- **reCAPTCHA v2** — Bot prevention
- **Beautiful Animations** — Framer Motion effects
- **Success Celebration** — Confetti animation
- **Team Advertisement** — Post-submission contact prompt

</td>
<td width="50%">

### 🛡️ For Security
- **Device Fingerprinting** — FingerprintJS integration
- **IP Tracking** — Server-side extraction
- **Multi-Layer Protection** — localStorage + fingerprint + IP
- **Duplicate Prevention** — Smart blocking logic
- **Admin Toggle** — Enable/disable protection
- **Submission Logs** — Track all attempts
- **VPN Detection** — Same fingerprint, different IP
- **Rate Limiting Ready** — Structure in place

</td>
</tr>
</table>

---

## 🎨 User Interface

### 🌌 Futuristic Cyberpunk Theme

The entire application features a stunning **Mission Control** aesthetic:

| Element | Style |
|---------|-------|
| **Color Palette** | Deep space blue `#050508` with cyan `#00f0ff` and purple `#a855f7` accents |
| **Typography** | Orbitron (headings) + JetBrains Mono (code/data) |
| **Effects** | Glassmorphism, glowing borders, scan lines |
| **Animations** | Fade-in, scale, slide, pulse effects |
| **Grid** | Subtle futuristic grid pattern backgrounds |

### 📱 Responsive Design

- ✅ Mobile-first approach
- ✅ Tablet optimization
- ✅ Desktop full experience
- ✅ Touch-friendly controls
- ✅ Collapsible mobile sidebar

---

## 🛡️ Protection System

### How It Works

```
┌─────────────────────────────────────────────────────────────────┐
│                    MULTI-LAYER PROTECTION                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   Layer 1: localStorage     ──→  Quick client-side check        │
│   Layer 2: Device Fingerprint ──→  FingerprintJS visitor ID     │
│   Layer 3: IP Address       ──→  Server-side extraction         │
│   Layer 4: Database Check   ──→  submission_logs table          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 🔒 Protection Logic Matrix

| Scenario | IP | Fingerprint | Result | Reason |
|----------|:--:|:-----------:|:------:|--------|
| Same device, same network | Same | Same | ❌ **BLOCKED** | Exact duplicate |
| Same device, different network (VPN) | Different | Same | ❌ **BLOCKED** | Device reuse detected |
| Different device, same network (shared WiFi) | Same | Different | ✅ **ALLOWED** | Different user |
| Different device, different network | Different | Different | ✅ **ALLOWED** | New user |

### 📊 Submission Logs

All feedback attempts are logged with:
- Full IP Address
- Device Fingerprint Hash
- User Agent String
- Timestamp
- Block Status & Reason

---

## 👨‍💼 Admin Panel

### 🎛️ Command Center Dashboard

<table>
<tr>
<td>

#### 📈 Analytics Cards
- Total Submissions Count
- Average Rating (%)
- Submissions Today
- Top Rated Subject

</td>
<td>

#### 📊 Charts
- Rating Distribution (Bar)
- Role Breakdown (Pie)
- Submissions Over Time (Line)
- Subject Comparison

</td>
</tr>
</table>

### 🧭 Navigation Menu

| Icon | Page | Description |
|:----:|------|-------------|
| 🏠 | **Command Center** | Analytics dashboard with live stats |
| 📨 | **Data Stream** | View all feedback entries |
| 📚 | **Subjects** | Add/remove/edit subjects |
| 🛡️ | **Submission Logs** | IP + fingerprint tracking |
| ⚙️ | **System Config** | Settings & protection toggle |

### 🔧 Admin Features

- **Bulk Delete** — Select multiple feedbacks to delete
- **CSV Export** — Download all data for analysis
- **Filter & Search** — By subject, role, date, rating
- **Real-time Updates** — Auto-refresh data
- **Password Change** — Secure password management
- **Defense Shield Toggle** — Enable/disable protection

---

## 🛠️ Tech Stack

<table>
<tr><th>Category</th><th>Technology</th><th>Purpose</th></tr>
<tr>
<td rowspan="3"><strong>🎨 Frontend</strong></td>
<td><img src="https://img.shields.io/badge/Next.js-15-black?logo=next.js" /></td>
<td>React framework with App Router</td>
</tr>
<tr>
<td><img src="https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript" /></td>
<td>Type-safe development</td>
</tr>
<tr>
<td><img src="https://img.shields.io/badge/Tailwind-3.4-38B2AC?logo=tailwindcss" /></td>
<td>Utility-first CSS</td>
</tr>
<tr>
<td rowspan="2"><strong>🎭 UI/UX</strong></td>
<td><img src="https://img.shields.io/badge/shadcn/ui-Components-000" /></td>
<td>Accessible UI primitives</td>
</tr>
<tr>
<td><img src="https://img.shields.io/badge/Framer_Motion-Animations-FF0055?logo=framer" /></td>
<td>Smooth animations</td>
</tr>
<tr>
<td rowspan="2"><strong>🗄️ Backend</strong></td>
<td><img src="https://img.shields.io/badge/Supabase-Database-3ECF8E?logo=supabase" /></td>
<td>PostgreSQL + RLS</td>
</tr>
<tr>
<td><img src="https://img.shields.io/badge/NextAuth.js-Auth-000" /></td>
<td>Admin authentication</td>
</tr>
<tr>
<td rowspan="2"><strong>🛡️ Security</strong></td>
<td><img src="https://img.shields.io/badge/FingerprintJS-Tracking-orange" /></td>
<td>Device fingerprinting</td>
</tr>
<tr>
<td><img src="https://img.shields.io/badge/reCAPTCHA-v2-blue?logo=google" /></td>
<td>Bot prevention</td>
</tr>
<tr>
<td><strong>📊 Analytics</strong></td>
<td><img src="https://img.shields.io/badge/Recharts-Charts-8884d8" /></td>
<td>Dashboard visualizations</td>
</tr>
<tr>
<td><strong>☁️ Hosting</strong></td>
<td><img src="https://img.shields.io/badge/Vercel-Deployment-000?logo=vercel" /></td>
<td>Edge deployment</td>
</tr>
</table>

---

## 📁 Project Structure

```
📦 Feedback-SPHS-2025
├── 📂 public/
│   ├── logo.png              # App logo
│   └── og-image.png          # Social media preview (1200x630)
│
├── 📂 src/
│   ├── 📂 app/
│   │   ├── 📂 admin/
│   │   │   ├── page.tsx          # Dashboard (Command Center)
│   │   │   ├── 📂 feedback/      # View all feedback
│   │   │   ├── 📂 subjects/      # Manage subjects
│   │   │   ├── 📂 logs/          # Submission logs viewer
│   │   │   ├── 📂 settings/      # System config
│   │   │   ├── 📂 login/         # Admin login
│   │   │   └── futuristic.css    # Admin theme styles
│   │   │
│   │   ├── 📂 api/
│   │   │   ├── 📂 feedback/      # CRUD for feedback
│   │   │   ├── 📂 subjects/      # CRUD for subjects
│   │   │   ├── 📂 protection/
│   │   │   │   ├── check/        # Pre-submission validation
│   │   │   │   └── logs/         # Submission logs API
│   │   │   ├── 📂 settings/      # Protection toggle
│   │   │   ├── 📂 export/        # CSV export
│   │   │   └── 📂 auth/          # NextAuth handlers
│   │   │
│   │   ├── 📂 feedback/          # 4-step feedback wizard
│   │   ├── 📂 complete/          # Post-submission page
│   │   ├── 📂 already-submitted/ # Duplicate attempt page
│   │   ├── page.tsx              # Landing page
│   │   ├── layout.tsx            # Root layout + metadata
│   │   └── globals.css           # Global styles
│   │
│   ├── 📂 components/
│   │   ├── 📂 admin/             # Admin-specific components
│   │   │   └── sidebar.tsx       # Navigation sidebar
│   │   ├── 📂 ui/                # shadcn/ui components
│   │   ├── success-animation.tsx # Confetti celebration
│   │   └── theme-provider.tsx    # Dark/light mode
│   │
│   └── 📂 lib/
│       ├── auth.ts               # NextAuth configuration
│       ├── supabase.ts           # Supabase client
│       ├── supabase-admin.ts     # Admin client (bypasses RLS)
│       ├── fingerprint.ts        # FingerprintJS integration
│       ├── get-client-ip.ts      # IP extraction utility
│       ├── feedback-guard.ts     # localStorage protection
│       ├── types.ts              # TypeScript interfaces
│       └── utils.ts              # Utility functions
│
├── 📂 supabase/
│   ├── schema.sql                # Main database schema
│   └── 📂 migrations/
│       └── add_submission_logs.sql  # Protection logs table
│
├── .env.example                  # Environment template
├── package.json
├── tailwind.config.ts
└── next.config.ts
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18.17 or later
- **npm** or **yarn** or **pnpm**
- **Supabase** account (free tier works)
- **Google reCAPTCHA** site key

### Installation

```bash
# 1. Clone repository
git clone https://github.com/your-username/Feedback-SPHS-2025.git
cd Feedback-SPHS-2025

# 2. Install dependencies
npm install

# 3. Setup environment variables
cp env.example .env.local
# Edit .env.local with your values

# 4. Run development server
npm run dev

# 5. Open http://localhost:3000
```

---

## ⚙️ Environment Variables

Create a `.env.local` file in the root directory:

```env
# ═══════════════════════════════════════════════════════
# 🗄️ SUPABASE - Database & Backend
# ═══════════════════════════════════════════════════════
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...your-anon-key
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...your-service-role-key

# ═══════════════════════════════════════════════════════
# 🔐 NEXTAUTH - Admin Authentication
# ═══════════════════════════════════════════════════════
NEXTAUTH_SECRET=your-super-secret-string-here-32chars
NEXTAUTH_URL=http://localhost:3000

# ═══════════════════════════════════════════════════════
# 🤖 RECAPTCHA - Bot Prevention
# ═══════════════════════════════════════════════════════
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=6Le...your-site-key

# ═══════════════════════════════════════════════════════
# 🌐 SITE URL - For Open Graph (production)
# ═══════════════════════════════════════════════════════
NEXT_PUBLIC_SITE_URL=https://feedback-sphs-2025.vercel.app
```

> ⚠️ **Important:** Never commit `.env.local` to version control!

---

## 🗄️ Database Schema

### Core Tables

```sql
-- 📋 FEEDBACK TABLE
CREATE TABLE feedback (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_role TEXT NOT NULL,      -- 'Student' | 'Guardian' | 'Teacher' | 'Ex-Student' | 'Guest'
    subject TEXT NOT NULL,        -- Subject/booth name
    q1 INTEGER NOT NULL,          -- Rating 1-5
    q2 INTEGER NOT NULL,
    q3 INTEGER NOT NULL,
    q4 INTEGER NOT NULL,
    q5 INTEGER NOT NULL,
    q6 INTEGER NOT NULL,
    comment TEXT,                 -- Optional feedback text
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 📚 SUBJECTS TABLE
CREATE TABLE subjects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    icon TEXT DEFAULT '📚',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 👤 ADMINS TABLE
CREATE TABLE admins (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ⚙️ SETTINGS TABLE
CREATE TABLE settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 🛡️ SUBMISSION LOGS TABLE (Protection System)
CREATE TABLE submission_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ip_address TEXT NOT NULL,
    fingerprint_hash TEXT NOT NULL,
    user_agent TEXT,
    feedback_id UUID REFERENCES feedback(id),
    blocked BOOLEAN DEFAULT FALSE,
    block_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_submission_logs_ip ON submission_logs(ip_address);
CREATE INDEX idx_submission_logs_fingerprint ON submission_logs(fingerprint_hash);
CREATE INDEX idx_submission_logs_created ON submission_logs(created_at DESC);
```

---

## 📡 API Reference

### Feedback Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/feedback` | Get all feedback (with optional filters) |
| `POST` | `/api/feedback` | Submit new feedback |
| `DELETE` | `/api/feedback` | Bulk delete feedback by IDs |

### Subject Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/subjects` | Get all subjects |
| `POST` | `/api/subjects` | Create new subject |
| `DELETE` | `/api/subjects/[id]` | Delete subject by ID |

### Protection Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/protection/check` | Pre-submission validation |
| `GET` | `/api/protection/logs` | Get submission logs (admin) |
| `DELETE` | `/api/protection/logs` | Clear logs (admin) |

### Settings Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/settings/protection` | Get protection status |
| `POST` | `/api/settings/protection` | Toggle protection on/off |

### Export Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/export/csv` | Export feedback as CSV |

---

## 🔐 Authentication

### Admin Login Flow

```
┌───────────────┐     ┌──────────────┐     ┌─────────────┐
│  Login Form   │ ──▶ │  NextAuth.js │ ──▶ │  Supabase   │
│ (email/pass)  │     │  Credentials │     │  DB Check   │
└───────────────┘     └──────────────┘     └─────────────┘
                              │
                              ▼
                      ┌──────────────┐
                      │   Session    │
                      │  JWT Token   │
                      └──────────────┘
```

### Protected Routes

All `/admin/*` routes are protected by the `AdminLayout` component:

```tsx
// Automatic redirect if not authenticated
if (status === "unauthenticated") {
    router.push("/admin/login")
}
```

---

## 📱 Pages & Routes

### Public Routes

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | `page.tsx` | Landing page with mission control theme |
| `/feedback` | `feedback/page.tsx` | 4-step feedback wizard |
| `/complete` | `complete/page.tsx` | Post-submission confirmation |
| `/already-submitted` | `already-submitted/page.tsx` | Duplicate attempt page |

### Admin Routes (Protected)

| Route | Component | Description |
|-------|-----------|-------------|
| `/admin` | `admin/page.tsx` | Dashboard with analytics |
| `/admin/login` | `admin/login/page.tsx` | Admin authentication |
| `/admin/feedback` | `admin/feedback/page.tsx` | View all feedback |
| `/admin/subjects` | `admin/subjects/page.tsx` | Manage subjects |
| `/admin/logs` | `admin/logs/page.tsx` | Submission logs |
| `/admin/settings` | `admin/settings/page.tsx` | System configuration |

---

## 🎭 Theming

### CSS Custom Properties

```css
/* Futuristic Theme Colors */
--cyber-bg: #050508;
--cyber-card: #0c0c16;
--cyber-border: rgba(0, 240, 255, 0.2);
--neon-cyan: #00f0ff;
--neon-purple: #a855f7;
--neon-pink: #ec4899;
```

### Custom CSS Classes

| Class | Effect |
|-------|--------|
| `.glass-card` | Glassmorphism with blur |
| `.cyber-border` | Glowing border animation |
| `.grid-bg` | Futuristic grid pattern |
| `.pulse-dot` | Animated status indicator |
| `.data-module` | Data panel styling |
| `.scan-line` | Moving scan line effect |

---

## 📦 Deployment

### Deploy to Vercel (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository

3. **Configure Environment Variables**
   - Add all variables from `.env.local`
   - Set `NEXTAUTH_URL` to your Vercel domain

4. **Deploy!**
   - Vercel automatically builds and deploys

### Post-Deployment Checklist

- [ ] Verify environment variables in Vercel dashboard
- [ ] Run database migrations in Supabase
- [ ] Update `NEXTAUTH_URL` to production domain
- [ ] Test feedback submission flow
- [ ] Test admin login and dashboard
- [ ] Verify reCAPTCHA is working
- [ ] Check OG image preview on social media

---

## 📊 Social Media Preview

The site includes Open Graph and Twitter Card metadata for rich link previews:

- **Image:** `public/og-image.png` (1200x630)
- **Title:** "Feedback - Biennial Exhibition of South Point School 2025"
- **Description:** Dynamically configured in `layout.tsx`

To test your previews:
- [Facebook Debugger](https://developers.facebook.com/tools/debug/)
- [Twitter Card Validator](https://cards-dev.twitter.com/validator)
- [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/)

---

## 🤝 Contributing

This is a private project for South Point School. For authorized contributors:

1. Clone the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 👨‍💻 Credits

<div align="center">

### Built by **Team HackMinors** 🚀

*Passionate students creating amazing digital experiences*

📧 **teamhackminors@gmail.com**

---

### For **South Point School**

Biennial Exhibition 2025

---

<sub>Made with ❤️, ☕, and countless hours of coding</sub>

</div>

---

## 📄 License

This project is **proprietary software** created exclusively for South Point School's Biennial Exhibition 2025. All rights reserved.

---

<div align="center">

**⭐ If you found this project helpful, consider giving it a star! ⭐**

<br>

[![forthebadge](https://forthebadge.com/images/badges/built-with-love.svg)](https://forthebadge.com)
[![forthebadge](https://forthebadge.com/images/badges/powered-by-coffee.svg)](https://forthebadge.com)

</div>
