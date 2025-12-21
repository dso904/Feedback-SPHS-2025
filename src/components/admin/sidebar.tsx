"use client"

import { useSession, signOut } from "next-auth/react"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import {
    LayoutDashboard,
    MessageSquare,
    BookOpen,
    Settings,
    LogOut,
    ChevronRight,
    Menu,
    X,
    Zap,
    Shield,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"

const NAV_ITEMS = [
    { icon: LayoutDashboard, label: "Command Center", href: "/admin" },
    { icon: MessageSquare, label: "Data Stream", href: "/admin/feedback" },
    { icon: BookOpen, label: "Subjects", href: "/admin/subjects" },
    { icon: Shield, label: "Submission Logs", href: "/admin/logs" },
    { icon: Settings, label: "System Config", href: "/admin/settings" },
]

interface AdminSidebarProps {
    children: React.ReactNode
}

export function AdminSidebar({ children }: AdminSidebarProps) {
    const { data: session } = useSession()
    const pathname = usePathname()
    const [mobileOpen, setMobileOpen] = useState(false)

    const SidebarContent = () => (
        <div className="flex flex-col h-full">
            {/* Holographic Logo Section */}
            <div className="flex items-center gap-3 mb-8 p-2">
                {/* Animated logo container */}
                <div className="relative group">
                    {/* Outer glow ring */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-cyan-500 rounded-xl blur opacity-40 group-hover:opacity-70 transition-opacity duration-500 animate-pulse" />
                    {/* Logo container */}
                    <div className="relative w-12 h-12 rounded-xl bg-[#0a0a12] border border-cyan-500/30 flex items-center justify-center overflow-hidden">
                        <Image src="/logo.png" alt="Logo" width={36} height={36} className="rounded-lg relative z-10" />
                        {/* Scan line effect */}
                        <div className="absolute inset-0 bg-gradient-to-b from-cyan-400/20 via-transparent to-transparent animate-pulse" />
                    </div>
                </div>
                <div className="flex-1">
                    <h1 className="font-orbitron text-sm font-bold text-white tracking-wider">MISSION CTRL</h1>
                    <div className="flex items-center gap-1.5">
                        <div className="pulse-dot" style={{ width: '6px', height: '6px' }} />
                        <p className="font-mono text-[10px] text-cyan-400/80 uppercase tracking-widest">Online</p>
                    </div>
                </div>
                {/* Mobile close button */}
                <button
                    onClick={() => setMobileOpen(false)}
                    className="lg:hidden p-2 text-white/60 hover:text-cyan-400 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* System Status Bar */}
            <div className="px-2 mb-6">
                <div className="flex items-center justify-between text-[10px] font-mono text-white/40 mb-1">
                    <span>SYSTEM STATUS</span>
                    <span className="text-cyan-400">100%</span>
                </div>
                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-gradient-to-r from-cyan-500 to-purple-500"
                        initial={{ width: 0 }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                    />
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 px-2">
                <p className="text-[10px] font-mono text-white/30 uppercase tracking-widest mb-3 px-3">Navigation</p>
                {NAV_ITEMS.map((item, index) => {
                    const isActive = pathname === item.href ||
                        (item.href !== "/admin" && pathname.startsWith(item.href))

                    return (
                        <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}>
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className={`relative flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 group
                                    ${isActive
                                        ? "bg-gradient-to-r from-cyan-500/10 to-transparent border-l-2 border-cyan-400"
                                        : "hover:bg-white/5 border-l-2 border-transparent"
                                    }`}
                            >
                                {/* Active indicator glow */}
                                {isActive && (
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-cyan-400 rounded-r-full shadow-[0_0_10px_#00f0ff,0_0_20px_#00f0ff]" />
                                )}

                                {/* Icon */}
                                <div className={`relative ${isActive ? 'text-cyan-400' : 'text-white/50 group-hover:text-cyan-400'} transition-colors`}>
                                    <item.icon className="w-5 h-5" />
                                    {isActive && (
                                        <div className="absolute inset-0 blur-sm bg-cyan-400/50" />
                                    )}
                                </div>

                                {/* Label */}
                                <span className={`font-mono text-sm tracking-wide ${isActive ? 'text-white' : 'text-white/60 group-hover:text-white'} transition-colors`}>
                                    {item.label}
                                </span>

                                {/* Arrow indicator */}
                                {isActive && (
                                    <ChevronRight className="w-4 h-4 ml-auto text-cyan-400" />
                                )}
                            </motion.div>
                        </Link>
                    )
                })}
            </nav>

            {/* Power indicator */}
            <div className="px-4 py-3 mx-2 mb-4 rounded-lg bg-white/5 border border-white/5">
                <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-yellow-400" />
                    <span className="font-mono text-xs text-white/60">Power Core Active</span>
                </div>
            </div>

            {/* User section */}
            <div className="px-2 pt-4 border-t border-white/10">
                <div className="flex items-center gap-3 mb-4 p-2">
                    {/* Avatar with holographic ring */}
                    <div className="relative">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full blur-sm opacity-60 animate-pulse" />
                        <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-white font-orbitron font-bold text-sm border-2 border-[#0a0a12]">
                            {session?.user?.name?.[0]?.toUpperCase() || "A"}
                        </div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-mono text-sm text-white truncate">{session?.user?.name || "Admin"}</p>
                        <p className="font-mono text-[10px] text-cyan-400/60 truncate uppercase tracking-wider">
                            {session?.user?.email ? "Authorized" : "Guest"}
                        </p>
                    </div>
                </div>
                <Button
                    variant="ghost"
                    onClick={() => signOut({ callbackUrl: "/admin/login" })}
                    className="w-full justify-start font-mono text-xs text-white/50 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/30 transition-all"
                >
                    <LogOut className="w-4 h-4 mr-2" />
                    DISCONNECT
                </Button>
            </div>
        </div>
    )

    return (
        <div className="min-h-screen bg-[#0a0a12] flex">
            {/* Animated background grid for whole admin */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute inset-0 grid-bg opacity-50" />
                <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 via-transparent to-cyan-900/10" />
            </div>

            {/* Mobile menu button */}
            <button
                onClick={() => setMobileOpen(true)}
                className="lg:hidden fixed top-4 left-4 z-50 p-2.5 bg-[#12121f] rounded-lg text-cyan-400 border border-cyan-500/30 hover:border-cyan-400 transition-colors"
            >
                <Menu className="w-5 h-5" />
            </button>

            {/* Mobile overlay */}
            {mobileOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="lg:hidden fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Sidebar - Desktop */}
            <motion.aside
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="hidden lg:flex w-64 bg-[#0c0c16]/90 backdrop-blur-xl border-r border-cyan-500/10 p-4 flex-col relative z-10"
            >
                {/* Top edge glow */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
                <SidebarContent />
            </motion.aside>

            {/* Sidebar - Mobile */}
            <motion.aside
                initial={{ x: -300 }}
                animate={{ x: mobileOpen ? 0 : -300 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="lg:hidden fixed left-0 top-0 bottom-0 w-72 bg-[#0c0c16] z-50 p-4 flex flex-col border-r border-cyan-500/20"
            >
                <SidebarContent />
            </motion.aside>

            {/* Main Content */}
            <main className="flex-1 p-4 lg:p-6 overflow-auto lg:ml-0 mt-14 lg:mt-0 relative z-10">
                <div className="max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    )
}
