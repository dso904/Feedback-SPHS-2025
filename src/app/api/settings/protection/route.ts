import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { supabaseAdmin } from "@/lib/supabase-admin"

const SETTINGS_KEY = "feedback_protection_enabled"

// GET current protection setting
export async function GET() {
    try {
        const { data, error } = await supabase
            .from("settings")
            .select("value")
            .eq("key", SETTINGS_KEY)
            .single()

        if (error) {
            // If no setting exists, default to OFF (false) for testing
            if (error.code === "PGRST116") {
                return NextResponse.json({ enabled: false })
            }
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ enabled: data.value === "true" })
    } catch {
        return NextResponse.json({ enabled: false })
    }
}

// POST update protection setting
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { enabled } = body

        if (typeof enabled !== "boolean") {
            return NextResponse.json(
                { error: "enabled must be a boolean" },
                { status: 400 }
            )
        }

        // Upsert the setting using admin client (bypasses RLS)
        const { error } = await supabaseAdmin
            .from("settings")
            .upsert(
                { key: SETTINGS_KEY, value: enabled.toString() },
                { onConflict: "key" }
            )

        if (error) {
            console.error("Settings update error:", error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ enabled, message: "Setting updated successfully" })
    } catch (err) {
        console.error("Settings error:", err)
        return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
    }
}
