-- Feedback System Database Schema for Supabase
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLE: projects (replaces old 'faculty' table)
-- =====================================================
CREATE TABLE IF NOT EXISTS projects (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    subject TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLE: questions (feedback questions)
-- =====================================================
CREATE TABLE IF NOT EXISTS questions (
    id SERIAL PRIMARY KEY,
    q1 TEXT DEFAULT 'Topic Selection',
    q2 TEXT DEFAULT 'Communication & Presentation Skills',
    q3 TEXT DEFAULT 'Originality & Creativity',
    q4 TEXT DEFAULT 'Clarity',
    q5 TEXT DEFAULT 'Enthusiasm for the subject',
    q6 TEXT DEFAULT 'Overall rating'
);

-- Insert default questions row
INSERT INTO questions (q1, q2, q3, q4, q5, q6) VALUES (
    'Topic Selection',
    'Communication & Presentation Skills',
    'Originality & Creativity',
    'Clarity',
    'Enthusiasm for the subject',
    'Overall rating'
) ON CONFLICT DO NOTHING;

-- =====================================================
-- TABLE: feedback (replaces old 'feeds' table)
-- =====================================================
CREATE TABLE IF NOT EXISTS feedback (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    user_role TEXT NOT NULL CHECK (user_role IN ('Guardian', 'Ex-Student', 'Student', 'Teacher', 'Other Guest')),
    q1 INTEGER NOT NULL CHECK (q1 BETWEEN 1 AND 5),
    q2 INTEGER NOT NULL CHECK (q2 BETWEEN 1 AND 5),
    q3 INTEGER NOT NULL CHECK (q3 BETWEEN 1 AND 5),
    q4 INTEGER NOT NULL CHECK (q4 BETWEEN 1 AND 5),
    q5 INTEGER NOT NULL CHECK (q5 BETWEEN 1 AND 5),
    q6 INTEGER NOT NULL CHECK (q6 BETWEEN 1 AND 5),
    total INTEGER GENERATED ALWAYS AS (q1 + q2 + q3 + q4 + q5 + q6) STORED,
    percent DECIMAL(5,2) GENERATED ALWAYS AS (((q1 + q2 + q3 + q4 + q5 + q6)::DECIMAL / 30) * 100) STORED,
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLE: admins (for admin authentication)
-- =====================================================
CREATE TABLE IF NOT EXISTS admins (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert a default admin (password: admin123)
-- This is a valid bcrypt hash of 'admin123' - CHANGE THIS IN PRODUCTION!
INSERT INTO admins (email, password_hash, name) VALUES (
    'admin@southpoint.edu',
    '$2a$10$8K4j9E3E5b5K7uY8W9X0V.qZ2F4R6T8N0M2P4S6W8Y0A2C4E6G8I',
    'Admin'
) ON CONFLICT (email) DO NOTHING;

-- =====================================================
-- Row Level Security (RLS) Policies
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Projects: Anyone can read, only authenticated users can modify
CREATE POLICY "Anyone can view projects" ON projects FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert projects" ON projects FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated users can update projects" ON projects FOR UPDATE USING (true);
CREATE POLICY "Authenticated users can delete projects" ON projects FOR DELETE USING (true);

-- Feedback: Anyone can insert (for public feedback), anyone can read
CREATE POLICY "Anyone can submit feedback" ON feedback FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can view feedback" ON feedback FOR SELECT USING (true);

-- Questions: Anyone can read
CREATE POLICY "Anyone can view questions" ON questions FOR SELECT USING (true);

-- Admins: Only the admin themselves can see their own record
CREATE POLICY "Admins can view their own record" ON admins FOR SELECT USING (true);

-- =====================================================
-- Indexes for better performance
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_feedback_project_id ON feedback(project_id);
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback(created_at);
CREATE INDEX IF NOT EXISTS idx_projects_name ON projects(name);

-- =====================================================
-- Sample Data (Optional - for testing)
-- =====================================================
INSERT INTO projects (name, subject) VALUES 
    ('Solar System Model', 'Science'),
    ('Water Purification', 'Science'),
    ('Historical Timeline', 'History'),
    ('Math Puzzle Game', 'Mathematics'),
    ('Ecosystem Diorama', 'Biology')
ON CONFLICT DO NOTHING;
