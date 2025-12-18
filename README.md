<div align="center">

# 🎓 South Point High School Feedback System

### Modern, Beautiful & Secure Exhibition Feedback Platform

[![Next.js](https://img.shields.io/badge/Next.js-16.0-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)

[🌐 Live Demo](https://feedback-sphs-2025.vercel.app) · [📝 Give Feedback](https://feedback-sphs-2025.vercel.app/feedback) · [🔐 Admin Panel](https://feedback-sphs-2025.vercel.app/admin)

</div>

---

## ✨ Features

### 🎯 For Visitors
- **4-Step Feedback Wizard** - Intuitive, guided feedback submission
- **Role Selection** - Guardian, Student, Teacher, Ex-Student, Guest
- **Dynamic Subjects** - Admin-managed subject list
- **Star Ratings** - Rate 6 different aspects (1-5 stars)
- **reCAPTCHA Protection** - Bot prevention before submission
- **Beautiful Thank You Screen** - Animated confirmation with auto-close

### 🛡️ For Administrators
- **Secure Login** - NextAuth.js authentication
- **Analytics Dashboard** - Charts, stats, and recent activity
- **Subject Management** - Add/delete subjects with emoji icons
- **Feedback Viewer** - Search, filter, and export feedback
- **CSV Export** - Download all feedback data
- **Password Management** - Change password securely

### 🎨 Design & UX
- **Dark/Light Mode** - Toggle between themes
- **Responsive Design** - Works on mobile, tablet, and desktop
- **Glassmorphism UI** - Modern frosted glass aesthetic
- **Smooth Animations** - Framer Motion transitions
- **Confetti Celebration** - On successful submission

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **Next.js 16** | React Framework (App Router) |
| **TypeScript** | Type Safety |
| **Tailwind CSS** | Styling |
| **shadcn/ui** | UI Components |
| **Framer Motion** | Animations |
| **Supabase** | Database & Auth |
| **NextAuth.js** | Admin Authentication |
| **Recharts** | Dashboard Charts |
| **reCAPTCHA** | Bot Prevention |
| **Vercel** | Hosting |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/Feedback-SPHS-2025.git

# Navigate to project
cd Feedback-SPHS-2025

# Install dependencies
npm install

# Copy environment variables
cp env.example .env.local

# Run development server
npm run dev
```

### Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
NEXTAUTH_SECRET=your_secret_key
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_recaptcha_site_key
```

---

## 📊 Database Setup

Run this SQL in your Supabase SQL Editor:

```sql
-- Projects table
CREATE TABLE projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    subject TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subjects table
CREATE TABLE subjects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    icon TEXT DEFAULT '📚',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Feedback table
CREATE TABLE feedback (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID REFERENCES projects(id),
    subject TEXT,
    user_role TEXT NOT NULL,
    q1 INTEGER NOT NULL,
    q2 INTEGER NOT NULL,
    q3 INTEGER NOT NULL,
    q4 INTEGER NOT NULL,
    q5 INTEGER NOT NULL,
    q6 INTEGER NOT NULL,
    total INTEGER GENERATED ALWAYS AS (q1 + q2 + q3 + q4 + q5 + q6) STORED,
    percent INTEGER GENERATED ALWAYS AS (ROUND((q1 + q2 + q3 + q4 + q5 + q6)::NUMERIC / 30 * 100)) STORED,
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Admins table
CREATE TABLE admins (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default admin
INSERT INTO admins (email, password_hash, name) 
VALUES ('admin@southpoint.edu', 'admin123', 'Admin');
```

---

## 📱 Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/feedback` | 4-step feedback wizard |
| `/admin/login` | Admin login page |
| `/admin` | Dashboard with analytics |
| `/admin/subjects` | Manage subjects |
| `/admin/feedback` | View all feedback |
| `/admin/projects` | Manage projects |
| `/admin/settings` | Change password |

---

## 🔒 Security

- ✅ Password-protected admin area
- ✅ NextAuth.js session management
- ✅ Supabase Row Level Security
- ✅ Google reCAPTCHA verification
- ✅ Environment variables for secrets
- ✅ No credentials exposed in frontend

---

## 📦 Deployment

### Deploy to Vercel

1. Push code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables
4. Deploy!

### Post-Deployment

1. Update `NEXTAUTH_URL` in Vercel to your domain
2. Update Supabase **Site URL** to your domain
3. Add subjects via Admin Panel

---

## 🎨 Screenshots

<div align="center">

| Feedback Form | Admin Dashboard |
|---------------|-----------------|
| 4-step wizard with animations | Analytics and charts |

| Subject Selection | Thank You Screen |
|-------------------|------------------|
| Dynamic from database | Auto-closes after 5 seconds |

</div>

---

## 👨‍💻 Developer

Built with ❤️ for **South Point High School** Exhibition 2025

---

## 📄 License

This project is proprietary software for South Point High School.

---

<div align="center">

**⭐ Star this repository if you found it helpful! ⭐**

</div>
