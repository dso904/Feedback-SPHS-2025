"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import {
    Shield,
    Loader2,
    RefreshCw,
    Trash2,
    CheckCircle,
    XCircle,
    Clock,
    Fingerprint,
    Globe,
    Filter
} from "lucide-react"
import { AdminSidebar } from "@/components/admin/sidebar"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface SubmissionLog {
    id: string
    ip_address: string
    fingerprint_hash: string
    fingerprint_display?: string
    user_agent: string
    feedback_id: string | null
    blocked: boolean
    block_reason: string | null
    created_at: string
}

export default function LogsPage() {
    const { status } = useSession()
    const router = useRouter()
    const [logs, setLogs] = useState<SubmissionLog[]>([])
    const [loading, setLoading] = useState(true)
    const [total, setTotal] = useState(0)
    const [filter, setFilter] = useState<"all" | "blocked" | "allowed">("all")
    const [refreshing, setRefreshing] = useState(false)

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/admin/login")
        }
    }, [status, router])

    useEffect(() => {
        fetchLogs()
    }, [filter])

    const fetchLogs = async () => {
        try {
            setLoading(true)
            let url = "/api/protection/logs?limit=100"
            if (filter !== "all") {
                url += `&blocked=${filter === "blocked"}`
            }
            const res = await fetch(url)
            const data = await res.json()
            setLogs(data.logs || [])
            setTotal(data.total || 0)
        } catch (error) {
            console.error("Failed to fetch logs:", error)
            toast.error("Failed to fetch submission logs")
        } finally {
            setLoading(false)
        }
    }

    const handleRefresh = async () => {
        setRefreshing(true)
        await fetchLogs()
        setRefreshing(false)
        toast.success("Logs refreshed")
    }

    const handleClearAll = async () => {
        if (!confirm("Are you sure you want to clear ALL submission logs? This cannot be undone.")) {
            return
        }

        try {
            const res = await fetch("/api/protection/logs", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ clearAll: true })
            })

            if (!res.ok) throw new Error("Failed to clear")

            toast.success("All logs cleared")
            fetchLogs()
        } catch {
            toast.error("Failed to clear logs")
        }
    }

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr)
        return date.toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            hour: "2-digit",
            minute: "2-digit"
        })
    }

    if (status === "loading" || loading) {
        return (
            <AdminSidebar>
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
                </div>
            </AdminSidebar>
        )
    }

    return (
        <AdminSidebar>
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                    <Shield className="w-5 h-5 text-cyan-400" />
                    <span className="font-mono text-xs text-cyan-400 uppercase tracking-widest">Protection System</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="font-orbitron text-2xl lg:text-3xl font-bold text-white tracking-wide">
                            SUBMISSION LOGS
                        </h1>
                        <p className="font-mono text-white/50 text-sm mt-1">
                            {total} total entries • IP + Fingerprint tracking
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleRefresh}
                            disabled={refreshing}
                            className="border-cyan-500/30 hover:border-cyan-400 text-cyan-400"
                        >
                            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleClearAll}
                            className="border-red-500/30 hover:border-red-400 text-red-400"
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Clear All
                        </Button>
                    </div>
                </div>
            </motion.div>

            {/* Filter Tabs */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex gap-2 mb-6"
            >
                {[
                    { key: "all", label: "All", icon: Filter },
                    { key: "allowed", label: "Allowed", icon: CheckCircle },
                    { key: "blocked", label: "Blocked", icon: XCircle },
                ].map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setFilter(tab.key as typeof filter)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-xs uppercase tracking-wider transition-all ${filter === tab.key
                                ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40"
                                : "bg-white/5 text-white/50 border border-white/10 hover:border-white/20"
                            }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                    </button>
                ))}
            </motion.div>

            {/* Logs Table */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="data-module overflow-hidden"
            >
                {logs.length === 0 ? (
                    <div className="text-center py-16">
                        <Shield className="w-16 h-16 mx-auto text-white/20 mb-4" />
                        <p className="font-mono text-white/40">No submission logs found</p>
                        <p className="font-mono text-xs text-white/30 mt-1">
                            Logs will appear when users submit feedback with protection enabled
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-white/10">
                                    <th className="text-left py-3 px-4 font-mono text-xs text-white/40 uppercase tracking-wider">Status</th>
                                    <th className="text-left py-3 px-4 font-mono text-xs text-white/40 uppercase tracking-wider">
                                        <div className="flex items-center gap-1">
                                            <Globe className="w-3 h-3" />
                                            IP Address
                                        </div>
                                    </th>
                                    <th className="text-left py-3 px-4 font-mono text-xs text-white/40 uppercase tracking-wider">
                                        <div className="flex items-center gap-1">
                                            <Fingerprint className="w-3 h-3" />
                                            Fingerprint
                                        </div>
                                    </th>
                                    <th className="text-left py-3 px-4 font-mono text-xs text-white/40 uppercase tracking-wider">
                                        <div className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            Time
                                        </div>
                                    </th>
                                    <th className="text-left py-3 px-4 font-mono text-xs text-white/40 uppercase tracking-wider">Reason</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.map((log, index) => (
                                    <motion.tr
                                        key={log.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.02 }}
                                        className="border-b border-white/5 hover:bg-white/5 transition-colors"
                                    >
                                        <td className="py-3 px-4">
                                            {log.blocked ? (
                                                <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-red-500/20 text-red-400 text-xs font-mono">
                                                    <XCircle className="w-3 h-3" />
                                                    BLOCKED
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-mono">
                                                    <CheckCircle className="w-3 h-3" />
                                                    ALLOWED
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-3 px-4 font-mono text-sm text-white/70">
                                            {log.ip_address}
                                        </td>
                                        <td className="py-3 px-4 font-mono text-sm text-white/70">
                                            {log.fingerprint_display || log.fingerprint_hash?.slice(0, 12) + "..."}
                                        </td>
                                        <td className="py-3 px-4 font-mono text-sm text-white/50">
                                            {formatDate(log.created_at)}
                                        </td>
                                        <td className="py-3 px-4">
                                            {log.block_reason ? (
                                                <span className="font-mono text-xs text-amber-400/80 bg-amber-500/10 px-2 py-1 rounded">
                                                    {log.block_reason.replace(/_/g, " ")}
                                                </span>
                                            ) : (
                                                <span className="font-mono text-xs text-white/30">—</span>
                                            )}
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </motion.div>

            {/* Info Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-6 p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/20"
            >
                <h3 className="font-mono text-xs text-cyan-400 uppercase tracking-wider mb-2">How Protection Works</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono text-white/60">
                    <div className="flex items-start gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5 shrink-0" />
                        <div>
                            <p className="text-white/80">Same IP + Same Fingerprint</p>
                            <p>Blocked (exact duplicate)</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5 shrink-0" />
                        <div>
                            <p className="text-white/80">Different IP + Same Fingerprint</p>
                            <p>Blocked (same device, VPN)</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5 shrink-0" />
                        <div>
                            <p className="text-white/80">Same IP + Different Fingerprint</p>
                            <p>Allowed (shared network)</p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </AdminSidebar>
    )
}
