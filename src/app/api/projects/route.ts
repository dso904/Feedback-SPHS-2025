import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

// GET all projects
export async function GET() {
    const { data: projects, error } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false })

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(projects)
}

// POST create new project
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { name, subject } = body

        if (!name || !subject) {
            return NextResponse.json(
                { error: "Name and subject are required" },
                { status: 400 }
            )
        }

        const { data: project, error } = await supabase
            .from("projects")
            .insert([{ name, subject }])
            .select()
            .single()

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json(project, { status: 201 })
    } catch {
        return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
    }
}
