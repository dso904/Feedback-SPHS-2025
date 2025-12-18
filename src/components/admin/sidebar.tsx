"use client"

import { useSession, signOut } from "next-auth/react"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import {
    LayoutDashboard,
    MessageSquare,
    FolderKanban,
    BookOpen,
    Settings,
    LogOut,
    ChevronRight,
    Menu,
    X,
    Sun,
    Moon,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { useTheme } from "next-themes"

const NAV_ITEMS = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
    { icon: MessageSquare, label: "Feedback", href: "/admin/feedback" },
    { icon: BookOpen, label: "Subjects", href: "/admin/subjects" },
    { icon: FolderKanban, label: "Projects", href: "/admin/projects" },
    { icon: Settings, label: "Settings", href: "/admin/settings" },
]

interface AdminSidebarProps {
    children: React.ReactNode
}

export function AdminSidebar({ children }: AdminSidebarProps) {
    const { data: session } = useSession()
    const pathname = usePathname()
    const [mobileOpen, setMobileOpen] = useState(false)
    const { theme, setTheme } = useTheme()

    const SidebarContent = () => (
        <>
            {/* Logo */}
            <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 p-[2px]">
                    <div className="w-full h-full rounded-xl bg-slate-900 dark:bg-slate-900 flex items-center justify-center">
                        <Image src="/logo.png" alt="Logo" width={28} height={28} className="rounded" />
                    </div>
                </div>
                <div className="flex-1">
                    <h1 className="text-white dark:text-white font-bold">Admin Panel</h1>
                    <p className="text-white/40 dark:text-white/40 text-xs">South Point School</p>
                </div>
                {/* Mobile close button */}
                <button
                    onClick={() => setMobileOpen(false)}
                    className="lg:hidden p-2 text-white/60 hover:text-white"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1">
                {NAV_ITEMS.map((item) => {
                    const isActive = pathname === item.href ||
                        (item.href !== "/admin" && pathname.startsWith(item.href))

                    return (
                        <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}>
                            <div
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                                    ? "bg-gradient-to-r from-purple-500/20 to-cyan-500/20 text-white border border-purple-500/30"
                                    : "text-white/60 hover:text-white hover:bg-white/5"
                                    }`}
                            >
                                <item.icon className="w-5 h-5" />
                                <span className="font-medium">{item.label}</span>
                                {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
                            </div>
                        </Link>
                    )
                })}
            </nav>

            {/* Theme Toggle */}
            <div className="py-4 border-t border-white/10">
                <Button
                    variant="ghost"
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                    className="w-full justify-start text-white/60 hover:text-white hover:bg-white/5"
                >
                    {theme === "dark" ? (
                        <>
                            <Sun className="w-4 h-4 mr-2" />
                            Light Mode
                        </>
                    ) : (
                        <>
                            <Moon className="w-4 h-4 mr-2" />
                            Dark Mode
                        </>
                    )}
                </Button>
            </div>

            {/* User section */}
            <div className="pt-4 border-t border-white/10">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-white font-bold">
                        {session?.user?.name?.[0] || "A"}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-white font-medium truncate">{session?.user?.name || "Admin"}</p>
                        <p className="text-white/40 text-xs truncate">{session?.user?.email}</p>
                    </div>
                </div>
                <Button
                    variant="ghost"
                    onClick={() => signOut({ callbackUrl: "/admin/login" })}
                    className="w-full justify-start text-white/60 hover:text-red-400 hover:bg-red-500/10"
                >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                </Button>
            </div>
        </>
    )

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 flex">
            {/* Mobile menu button */}
            <button
                onClick={() => setMobileOpen(true)}
                className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-slate-900 rounded-lg text-white"
            >
                <Menu className="w-6 h-6" />
            </button>

            {/* Mobile overlay */}
            {mobileOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/50 z-40"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Sidebar - Desktop */}
            <motion.aside
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="hidden lg:flex w-64 bg-slate-900/50 dark:bg-slate-900/50 border-r border-white/5 p-6 flex-col"
            >
                <SidebarContent />
            </motion.aside>

            {/* Sidebar - Mobile */}
            <motion.aside
                initial={{ x: -300 }}
                animate={{ x: mobileOpen ? 0 : -300 }}
                transition={{ type: "spring", damping: 20 }}
                className="lg:hidden fixed left-0 top-0 bottom-0 w-64 bg-slate-900 z-50 p-6 flex flex-col"
            >
                <SidebarContent />
            </motion.aside>

            {/* Main Content */}
            <main className="flex-1 p-4 lg:p-8 overflow-auto lg:ml-0 mt-14 lg:mt-0">
                <div className="max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    )
}
