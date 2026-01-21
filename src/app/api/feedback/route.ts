import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { getClientIP } from "@/lib/get-client-ip"

// GET all feedback
export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams
    const subject = searchParams.get("subject")

    let query = supabase
        .from("feedback")
        .select("*")
        .order("created_at", { ascending: false })

    if (subject) {
        query = query.eq("subject", subject)
    }

    const { data: feedback, error } = await query

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(feedback)
}

// POST submit feedback
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { user_role, subject, q1, q2, q3, q4, q5, q6, comment, fingerprint } = body

        // Validate required fields
        if (!user_role || !subject || !q1 || !q2 || !q3 || !q4 || !q5 || !q6) {
            return NextResponse.json(
                { error: "All fields are required" },
                { status: 400 }
            )
        }

        // Validate ratings are between 1-5
        const ratings = [q1, q2, q3, q4, q5, q6]
        if (ratings.some(r => r < 1 || r > 5)) {
            return NextResponse.json(
                { error: "Ratings must be between 1 and 5" },
                { status: 400 }
            )
        }

        // Final Security Check: Prevent duplicate subject submission
        if (fingerprint) {
            const { data: existingLogs } = await supabaseAdmin
                .from("submission_logs")
                .select("feedback_id")
                .eq("fingerprint_hash", fingerprint)
                .eq("blocked", false)
                .not("feedback_id", "is", null)

            if (existingLogs && existingLogs.length > 0) {
                const feedbackIds = existingLogs.map(l => l.feedback_id)
                // Check if any of these feedback entries match the current subject
                const { data: duplicate } = await supabaseAdmin
                    .from("feedback")
                    .select("id")
                    .in("id", feedbackIds)
                    .eq("subject", subject)
                    .maybeSingle()

                if (duplicate) {
                    // Log the blocked attempt (late rejection)
                    const clientIP = getClientIP(request)
                    try {
                        await supabaseAdmin
                            .from("submission_logs")
                            .insert({
                                ip_address: clientIP,
                                fingerprint_hash: fingerprint,
                                user_agent: request.headers.get("user-agent") || "unknown",
                                blocked: true,
                                block_reason: `duplicate_subject_late_reject:${subject}`
                            })
                    } catch (e) {
                        console.error("Failed to log late rejection:", e)
                    }

                    return NextResponse.json(
                        { error: "You have already submitted feedback for this subject" },
                        { status: 403 }
                    )
                }
            }
        }

        // Insert feedback
        const { data: feedback, error } = await supabase
            .from("feedback")
            .insert([{
                user_role,
                subject,
                q1,
                q2,
                q3,
                q4,
                q5,
                q6,
                comment: comment || null
            }])
            .select()
            .single()

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        // Log the submission for protection tracking (if fingerprint provided)
        if (fingerprint) {
            const clientIP = getClientIP(request)

            try {
                await supabaseAdmin
                    .from("submission_logs")
                    .insert({
                        ip_address: clientIP,
                        fingerprint_hash: fingerprint,
                        user_agent: request.headers.get("user-agent") || "unknown",
                        feedback_id: feedback.id,
                        blocked: false
                    })
            } catch (logError) {
                // Don't fail the submission if logging fails
                console.error("Failed to log submission:", logError)
            }
        }

        return NextResponse.json(feedback, { status: 201 })
    } catch {
        return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
    }
}

// DELETE bulk feedback
export async function DELETE(request: NextRequest) {
    try {
        const body = await request.json()
        const { ids } = body

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return NextResponse.json(
                { error: "ids array is required" },
                { status: 400 }
            )
        }

        // Use admin client to bypass RLS
        const { error } = await supabaseAdmin
            .from("feedback")
            .delete()
            .in("id", ids)

        if (error) {
            console.error("Delete error:", error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ success: true, deleted: ids.length })
    } catch (err) {
        console.error("Delete request error:", err)
        return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
    }
}
