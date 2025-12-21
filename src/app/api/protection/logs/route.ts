import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"

/**
 * GET /api/protection/logs
 * 
 * Get submission logs for admin panel
 * Query params: limit, offset, blocked (filter)
 */
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const limit = parseInt(searchParams.get("limit") || "50")
        const offset = parseInt(searchParams.get("offset") || "0")
        const blockedFilter = searchParams.get("blocked")

        let query = supabaseAdmin
            .from("submission_logs")
            .select("*", { count: "exact" })
            .order("created_at", { ascending: false })
            .range(offset, offset + limit - 1)

        // Filter by blocked status if specified
        if (blockedFilter === "true") {
            query = query.eq("blocked", true)
        } else if (blockedFilter === "false") {
            query = query.eq("blocked", false)
        }

        const { data: logs, count, error } = await query

        if (error) {
            console.error("Error fetching logs:", error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        // Format logs for display (no IP masking - show full IP)
        const formattedLogs = logs?.map(log => ({
            ...log,
            fingerprint_display: log.fingerprint_hash?.slice(0, 12) + "..."
        }))

        return NextResponse.json({
            logs: formattedLogs,
            total: count,
            limit,
            offset
        })
    } catch (error) {
        console.error("Logs fetch error:", error)
        return NextResponse.json({ error: "Failed to fetch logs" }, { status: 500 })
    }
}

/**
 * DELETE /api/protection/logs
 * 
 * Clear submission logs (for admin)
 * Body: { ids: string[] } or { clearAll: true, olderThan?: string }
 */
export async function DELETE(request: NextRequest) {
    try {
        const body = await request.json()
        const { ids, clearAll, olderThan } = body

        if (clearAll) {
            // Clear all logs, optionally older than a date
            let query = supabaseAdmin.from("submission_logs").delete()

            if (olderThan) {
                query = query.lt("created_at", olderThan)
            } else {
                // Safety: require at least some filter or explicit confirmation
                query = query.neq("id", "00000000-0000-0000-0000-000000000000") // This deletes all
            }

            const { error } = await query

            if (error) {
                return NextResponse.json({ error: error.message }, { status: 500 })
            }

            return NextResponse.json({ success: true, message: "Logs cleared" })
        }

        if (ids && Array.isArray(ids) && ids.length > 0) {
            const { error } = await supabaseAdmin
                .from("submission_logs")
                .delete()
                .in("id", ids)

            if (error) {
                return NextResponse.json({ error: error.message }, { status: 500 })
            }

            return NextResponse.json({ success: true, deleted: ids.length })
        }

        return NextResponse.json(
            { error: "Either 'ids' array or 'clearAll' flag is required" },
            { status: 400 }
        )
    } catch (error) {
        console.error("Delete logs error:", error)
        return NextResponse.json({ error: "Failed to delete logs" }, { status: 400 })
    }
}
