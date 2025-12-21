-- =====================================================
-- ENHANCED FEEDBACK PROTECTION: Submission Logs Table
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- =====================================================

-- Create submission_logs table for IP and fingerprint tracking
-- This table logs all feedback submission attempts (both allowed and blocked)
CREATE TABLE IF NOT EXISTS submission_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    -- Tracking data
    ip_address TEXT NOT NULL,
    fingerprint_hash TEXT NOT NULL,
    user_agent TEXT,
    
    -- Reference to actual feedback (NULL if blocked)
    feedback_id UUID REFERENCES feedback(id) ON DELETE SET NULL,
    
    -- Status
    blocked BOOLEAN DEFAULT FALSE,
    block_reason TEXT, -- 'ip_fingerprint_match', 'fingerprint_match', 'rate_limit', etc.
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES: Optimize lookups for duplicate checking
-- =====================================================

-- Fast IP lookup
CREATE INDEX IF NOT EXISTS idx_submission_logs_ip 
    ON submission_logs(ip_address);

-- Fast fingerprint lookup (critical for cross-IP detection)
CREATE INDEX IF NOT EXISTS idx_submission_logs_fingerprint 
    ON submission_logs(fingerprint_hash);

-- Combined index for the most common query pattern
CREATE INDEX IF NOT EXISTS idx_submission_logs_ip_fingerprint 
    ON submission_logs(ip_address, fingerprint_hash);

-- Time-based queries (for admin panel, cleanup)
CREATE INDEX IF NOT EXISTS idx_submission_logs_created_at 
    ON submission_logs(created_at DESC);

-- Blocked attempts filter
CREATE INDEX IF NOT EXISTS idx_submission_logs_blocked 
    ON submission_logs(blocked) WHERE blocked = TRUE;

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on the table
ALTER TABLE submission_logs ENABLE ROW LEVEL SECURITY;

-- Policy: API can insert logs (for recording submissions)
CREATE POLICY "API can insert submission logs" 
    ON submission_logs 
    FOR INSERT 
    WITH CHECK (true);

-- Policy: Anyone can read logs (needed for checking duplicates)
-- Note: In production, you might want to restrict this to service role only
CREATE POLICY "Allow reading submission logs" 
    ON submission_logs 
    FOR SELECT 
    USING (true);

-- Policy: Admins can delete logs (for cleanup/maintenance)
CREATE POLICY "Allow deleting submission logs" 
    ON submission_logs 
    FOR DELETE 
    USING (true);

-- =====================================================
-- COMMENTS: Document the table structure
-- =====================================================

COMMENT ON TABLE submission_logs IS 'Logs all feedback submission attempts for duplicate prevention';
COMMENT ON COLUMN submission_logs.ip_address IS 'Client IP address extracted from request headers';
COMMENT ON COLUMN submission_logs.fingerprint_hash IS 'Device fingerprint hash from FingerprintJS';
COMMENT ON COLUMN submission_logs.user_agent IS 'Browser user agent string for additional context';
COMMENT ON COLUMN submission_logs.feedback_id IS 'References actual feedback if submission was allowed';
COMMENT ON COLUMN submission_logs.blocked IS 'TRUE if this submission attempt was blocked';
COMMENT ON COLUMN submission_logs.block_reason IS 'Reason for blocking: ip_fingerprint_match, fingerprint_match, etc.';
