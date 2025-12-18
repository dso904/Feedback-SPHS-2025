import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

// GET all subjects
export async function GET() {
    const { data: subjects, error } = await supabase
        .from("subjects")
        .select("*")
        .order("name", { ascending: true })

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(subjects)
}

// POST create new subject
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { name, icon } = body

        if (!name) {
            return NextResponse.json(
                { error: "Subject name is required" },
                { status: 400 }
            )
        }

        const { data: subject, error } = await supabase
            .from("subjects")
            .insert([{ name, icon: icon || "📚" }])
            .select()
            .single()

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json(subject, { status: 201 })
    } catch {
        return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
    }
}
