import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

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
        const { user_role, subject, q1, q2, q3, q4, q5, q6, comment } = body

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

        return NextResponse.json(feedback, { status: 201 })
    } catch {
        return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
    }
}
