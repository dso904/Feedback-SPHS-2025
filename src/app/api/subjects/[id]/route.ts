import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

// DELETE subject
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params

    const { error } = await supabase
        .from("subjects")
        .delete()
        .eq("id", id)

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
}

// PUT update subject
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
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
            .update({ name, icon: icon || "📚" })
            .eq("id", id)
            .select()
            .single()

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json(subject)
    } catch {
        return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
    }
}
