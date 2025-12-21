import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { getClientIP } from "@/lib/get-client-ip"

const SETTINGS_KEY = "feedback_protection_enabled"

/**
 * POST /api/protection/check
 * 
 * Pre-submission protection check
 * Checks if the user (based on IP + fingerprint) has already submitted feedback
 * 
 * Body: { fingerprint: string }
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

        // 2. Get fingerprint from request body
        const body = await request.json()
        const { fingerprint } = body

        if (!fingerprint) {
            return NextResponse.json(
                { error: "Fingerprint is required" },
                { status: 400 }
            )
        }

        // 3. Extract client IP
        const clientIP = getClientIP(request)

        // 4. Check submission_logs for existing entries
        // Logic:
        // - Same fingerprint (regardless of IP) = BLOCK (same device, VPN/network change)
        // - Same IP + Same fingerprint = BLOCK (exact duplicate)
        // Note: Same IP + Different fingerprint = ALLOW (shared network)

        const { data: existingLogs, error: fetchError } = await supabaseAdmin
            .from("submission_logs")
            .select("id, ip_address, fingerprint_hash, blocked")
            .eq("fingerprint_hash", fingerprint)
            .eq("blocked", false) // Only check successful submissions
            .limit(1)

        if (fetchError) {
            console.error("Error checking submission logs:", fetchError)
            // On error, allow submission (fail open for better UX)
            return NextResponse.json({
                allowed: true,
                reason: "check_error"
            })
        }

        // 5. If fingerprint exists in logs, block
        if (existingLogs && existingLogs.length > 0) {
            const existingEntry = existingLogs[0]

            // Log the blocked attempt
            await supabaseAdmin
                .from("submission_logs")
                .insert({
                    ip_address: clientIP,
                    fingerprint_hash: fingerprint,
                    user_agent: request.headers.get("user-agent") || "unknown",
                    blocked: true,
                    block_reason: existingEntry.ip_address === clientIP
                        ? "ip_fingerprint_match"
                        : "fingerprint_match"
                })

            return NextResponse.json({
                allowed: false,
                reason: existingEntry.ip_address === clientIP
                    ? "duplicate_device_ip"
                    : "duplicate_device"
            })
        }

        // 6. No matching fingerprint found - allow submission
        return NextResponse.json({
            allowed: true,
            reason: "new_submission"
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
