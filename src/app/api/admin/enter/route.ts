import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// POST handler for admin entry - creates POST state for refresh detection
export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions)

    if (!session) {
        return NextResponse.redirect(new URL("/admin/login", request.url))
    }

    // Redirect to admin dashboard with POST state maintained
    // This enables the browser's "Confirm Form Resubmission" dialog on refresh
    return NextResponse.redirect(new URL("/admin", request.url), {
        status: 303, // See Other - commonly used for POST-Redirect-Get
    })
}
