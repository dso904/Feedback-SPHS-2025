import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

// GET export feedback as CSV
export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams
    const projectId = searchParams.get("project_id")

    let query = supabase
        .from("feedback")
        .select(`
      *,
      project:projects(name, subject)
    `)
        .order("created_at", { ascending: false })

    if (projectId) {
        query = query.eq("project_id", projectId)
    }

    const { data: feedback, error } = await query

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Generate CSV
    const headers = [
        "ID",
        "Project Name",
        "Subject",
        "User Role",
        "Q1 (Topic Selection)",
        "Q2 (Communication)",
        "Q3 (Creativity)",
        "Q4 (Clarity)",
        "Q5 (Enthusiasm)",
        "Q6 (Overall)",
        "Total",
        "Percent",
        "Comment",
        "Date"
    ]

    const rows = feedback?.map(f => [
        f.id,
        f.project?.name || "",
        f.project?.subject || "",
        f.user_role,
        f.q1,
        f.q2,
        f.q3,
        f.q4,
        f.q5,
        f.q6,
        f.total,
        f.percent,
        f.comment?.replace(/,/g, ";") || "",
        new Date(f.created_at).toLocaleDateString("en-IN")
    ])

    const csvContent = [
        headers.join(","),
        ...(rows?.map(row => row.join(",")) || [])
    ].join("\n")

    return new NextResponse(csvContent, {
        headers: {
            "Content-Type": "text/csv",
            "Content-Disposition": `attachment; filename="feedback-export-${new Date().toISOString().split("T")[0]}.csv"`
        }
    })
}
