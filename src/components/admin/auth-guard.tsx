"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useRef } from "react"
import { Loader2 } from "lucide-react"

interface AuthGuardProps {
    children: React.ReactNode
}

const SESSION_MARKER_KEY = "admin_session_marker"

export function AuthGuard({ children }: AuthGuardProps) {
    const { status } = useSession()
    const router = useRouter()
    const hasInitialized = useRef(false)

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/admin/login")
        }
    }, [status, router])

    // Refresh detection and session marker logic
    useEffect(() => {
        if (status !== "authenticated" || hasInitialized.current) return

        hasInitialized.current = true

        // Check if this is a page refresh (navigation type: reload)
        const isPageRefresh = performance.navigation?.type === 1 ||
            (performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming)?.type === "reload"

        const sessionMarker = sessionStorage.getItem(SESSION_MARKER_KEY)

        if (isPageRefresh && sessionMarker) {
            // User confirmed the form resubmission dialog - log them out
            sessionStorage.removeItem(SESSION_MARKER_KEY)
            signOut({ callbackUrl: "/admin/login" })
            return
        }

        // Set session marker on first authenticated load
        if (!sessionMarker) {
            sessionStorage.setItem(SESSION_MARKER_KEY, Date.now().toString())
        }

        // Cleanup session marker on tab/window close (but not on navigation)
        const handleBeforeUnload = () => {
            // Don't remove marker here - let the refresh detection handle it
        }

        window.addEventListener("beforeunload", handleBeforeUnload)

        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload)
        }
    }, [status])

    // Clean up session marker on logout
    useEffect(() => {
        if (status === "unauthenticated") {
            sessionStorage.removeItem(SESSION_MARKER_KEY)
        }
    }, [status])

    if (status === "loading") {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
                    <p className="text-white/60">Loading...</p>
                </div>
            </div>
        )
    }

    if (status === "unauthenticated") {
        return null
    }

    return <>{children}</>
}
