"use client"

import { SessionProvider } from "next-auth/react"
import { usePathname } from "next/navigation"
import { AuthGuard } from "@/components/admin/auth-guard"

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()
    const isLoginPage = pathname === "/admin/login"

    return (
        <SessionProvider>
            {isLoginPage ? children : <AuthGuard>{children}</AuthGuard>}
        </SessionProvider>
    )
}
