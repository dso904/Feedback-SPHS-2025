import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { supabase } from "@/lib/supabase"
import { authOptions } from "@/lib/auth"

// POST change password
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await request.json()
        const { currentPassword, newPassword } = body

        if (!currentPassword || !newPassword) {
            return NextResponse.json(
                { error: "Current and new passwords are required" },
                { status: 400 }
            )
        }

        if (newPassword.length < 6) {
            return NextResponse.json(
                { error: "New password must be at least 6 characters" },
                { status: 400 }
            )
        }

        // Get current admin
        const { data: admin, error: fetchError } = await supabase
            .from("admins")
            .select("*")
            .eq("email", session.user.email)
            .single()

        if (fetchError || !admin) {
            return NextResponse.json({ error: "Admin not found" }, { status: 404 })
        }

        // Verify current password (plain text comparison)
        if (currentPassword !== admin.password_hash) {
            return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 })
        }

        // Update password in database (plain text)
        const { error: updateError } = await supabase
            .from("admins")
            .update({ password_hash: newPassword })
            .eq("id", admin.id)

        if (updateError) {
            return NextResponse.json({ error: "Failed to update password" }, { status: 500 })
        }

        return NextResponse.json({ success: true, message: "Password updated successfully" })
    } catch {
        return NextResponse.json({ error: "Invalid request" }, { status: 400 })
    }
}
