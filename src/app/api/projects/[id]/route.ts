import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

// DELETE a project
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params

    const { error } = await supabase
        .from("projects")
        .delete()
        .eq("id", id)

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
}

// PUT update a project
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params

    try {
        const body = await request.json()
        const { name, subject } = body

        const { data: project, error } = await supabase
            .from("projects")
            .update({ name, subject })
            .eq("id", id)
            .select()
            .single()

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json(project)
    } catch {
        return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
    }
}
