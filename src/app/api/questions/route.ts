import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

// GET questions from database
export async function GET() {
    const { data: questions, error } = await supabase
        .from("questions")
        .select("*")
        .limit(1)
        .single()

    if (error) {
        // Return default questions if not found in database
        return NextResponse.json({
            q1: "Topic Selection",
            q2: "Communication & Presentation Skills",
            q3: "Originality & Creativity",
            q4: "Clarity",
            q5: "Enthusiasm for the subject",
            q6: "Overall rating",
        })
    }

    return NextResponse.json(questions)
}
