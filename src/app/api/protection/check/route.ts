import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { getClientIP } from "@/lib/get-client-ip"

const SETTINGS_KEY = "feedback_protection_enabled"
export const dynamic = 'force-dynamic'

/**
 * POST /api/protection/check
 * 
 * Pre-submission protection check
 * Checks if the user (based on fingerprint) has already submitted feedback FOR THIS SUBJECT
 * 
 * Body: { fingerprint: string, subject?: string }
 * Returns: { allowed: boolean, reason?: string }
 */
export async function POST(request: NextRequest) {
    try {
        // 1. First, check if protection is enabled
        const { data: settingData } = await supabase
            .from("settings")
            .select("value")
            .eq("key", SETTINGS_KEY)
            .single()

        const protectionEnabled = settingData?.value === "true"

        // If protection is disabled, always allow
        if (!protectionEnabled) {
            return NextResponse.json({
                allowed: true,
                reason: "protection_disabled"
            })
        }

        // 2. Get fingerprint and subject from request body
        const body = await request.json()
        const { fingerprint, subject } = body

        if (!fingerprint) {
            return NextResponse.json(
                { error: "Fingerprint is required" },
                { status: 400 }
            )
        }

        // CRITICAL UPDATE: If no subject is provided, we MUST allow.
        // This is to prevent the "page load" check from blocking the user globally.
        // We only check for duplicates when we know WHICH subject they are trying to submit.
        if (!subject) {
            return NextResponse.json({
                allowed: true,
                reason: "global_check_skipped"
            })
        }

        // 3. Check for existing submissions for THIS subject by THIS fingerprint
        // Strategy: 
        // a. Get all successful submission logs for this fingerprint
        // b. Get the feedback details for those submissions
        // c. Check if any matches the requested subject

        // Step A: Get logs
        const { data: existingLogs, error: logError } = await supabaseAdmin
            .from("submission_logs")
            .select("feedback_id")
            .eq("fingerprint_hash", fingerprint)
            .eq("blocked", false)
            .not("feedback_id", "is", null)

        if (logError) {
            console.error("Error checking submission logs:", logError)
            return NextResponse.json({ allowed: true, reason: "check_error" })
        }

        if (!existingLogs || existingLogs.length === 0) {
            // No previous submissions at all -> Allow
            return NextResponse.json({ allowed: true, reason: "new_visitor" })
        }

        const feedbackIds = existingLogs.map(log => log.feedback_id)

        // Step B: Check feedback table for subject match
        // We want to find IF there is any feedback with these IDs that has the SAME subject
        const { data: duplicateSubject, error: feedbackError } = await supabaseAdmin
            .from("feedback")
            .select("id")
            .in("id", feedbackIds)
            .eq("subject", subject)
            .maybeSingle()

        if (feedbackError) {
            console.error("Error checking feedback subject:", feedbackError)
            return NextResponse.json({ allowed: true, reason: "check_error" })
        }

        // 4. If duplicate found -> BLOCK
        if (duplicateSubject) {
            const clientIP = getClientIP(request)

            // Log the blocked attempt
            await supabaseAdmin
                .from("submission_logs")
                .insert({
                    ip_address: clientIP,
                    fingerprint_hash: fingerprint,
                    user_agent: request.headers.get("user-agent") || "unknown",
                    blocked: true,
                    block_reason: `duplicate_subject:${subject}`
                })

            return NextResponse.json({
                allowed: false,
                reason: "duplicate_subject"
            })
        }

        // 5. No duplicate for this subject found -> ALLOW
        return NextResponse.json({
            allowed: true,
            reason: "new_subject_submission"
        })

    } catch (error) {
        console.error("Protection check error:", error)
        // Fail open - allow on error
        return NextResponse.json({
            allowed: true,
            reason: "error"
        })
    }
}

/**
 * GET /api/protection/check
 * 
 * Get current protection status
 */
export async function GET() {
    try {
        const { data } = await supabase
            .from("settings")
            .select("value")
            .eq("key", SETTINGS_KEY)
            .single()

        return NextResponse.json({
            enabled: data?.value === "true"
        })
    } catch {
        return NextResponse.json({ enabled: false })
    }
}
