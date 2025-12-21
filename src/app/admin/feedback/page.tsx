"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState, useMemo, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Download,
    Eye,
    Star,
    Search,
    Filter,
    Printer,
    X,
    ChevronLeft,
    ChevronRight,
    Trash2,
    Loader2,
    Database,
    Activity,
    Zap,
} from "lucide-react"
import Link from "next/link"
import { AdminSidebar } from "@/components/admin/sidebar"
import { TableSkeleton } from "@/components/admin/skeletons"
import { EmptyState } from "@/components/admin/empty-state"
import type { Feedback } from "@/lib/types"
import { formatDate } from "@/lib/utils"
import { toast } from "sonner"

const ITEMS_PER_PAGE = 10

export default function FeedbackPage() {
    const { status } = useSession()
    const router = useRouter()
    const [feedback, setFeedback] = useState<Feedback[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null)
    const [search, setSearch] = useState("")
    const [roleFilter, setRoleFilter] = useState<string>("all")
    const [currentPage, setCurrentPage] = useState(1)
    const printRef = useRef<HTMLDivElement>(null)

    // Multi-select state
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const [deleting, setDeleting] = useState(false)

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/admin/login")
        }
    }, [status, router])

    useEffect(() => {
        fetchFeedback()
    }, [])

    const fetchFeedback = async () => {
        try {
            const res = await fetch("/api/feedback")
            const data = await res.json()
            setFeedback(data || [])
        } catch (error) {
            console.error("Failed to fetch feedback:", error)
        } finally {
            setLoading(false)
        }
    }

    // Filtered feedback
    const filteredFeedback = useMemo(() => {
        return feedback.filter((f) => {
            const matchesSearch = search === "" ||
                f.subject?.toLowerCase().includes(search.toLowerCase()) ||
                f.project?.name?.toLowerCase().includes(search.toLowerCase()) ||
                f.comment?.toLowerCase().includes(search.toLowerCase())
            const matchesRole = roleFilter === "all" || f.user_role === roleFilter
            return matchesSearch && matchesRole
        })
    }, [feedback, search, roleFilter])

    // Pagination
    const totalPages = Math.ceil(filteredFeedback.length / ITEMS_PER_PAGE)
    const paginatedFeedback = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE
        return filteredFeedback.slice(start, start + ITEMS_PER_PAGE)
    }, [filteredFeedback, currentPage])

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1)
    }, [search, roleFilter])

    // Clear selection when filters change
    useEffect(() => {
        setSelectedIds(new Set())
    }, [search, roleFilter, currentPage])

    const getRatingBadge = (percent: number) => {
        if (percent >= 80) return { class: "badge-futuristic-green", label: "EXCELLENT" }
        if (percent >= 60) return { class: "badge-futuristic", label: "GOOD" }
        if (percent >= 40) return { class: "badge-futuristic-purple", label: "FAIR" }
        return { class: "badge-futuristic-pink", label: "LOW" }
    }

    // Multi-select handlers
    const toggleSelectAll = () => {
        if (selectedIds.size === paginatedFeedback.length) {
            setSelectedIds(new Set())
        } else {
            setSelectedIds(new Set(paginatedFeedback.map(f => f.id)))
        }
    }

    const toggleSelect = (id: string, e: React.MouseEvent) => {
        e.stopPropagation()
        const newSelected = new Set(selectedIds)
        if (newSelected.has(id)) {
            newSelected.delete(id)
        } else {
            newSelected.add(id)
        }
        setSelectedIds(newSelected)
    }

    const handleBulkDelete = async () => {
        if (selectedIds.size === 0) return

        setDeleting(true)
        try {
            const res = await fetch("/api/feedback", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ids: Array.from(selectedIds) }),
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || "Failed to delete")
            }

            toast.success(`${selectedIds.size} entries purged from database`)
            setSelectedIds(new Set())
            setShowDeleteDialog(false)
            fetchFeedback()
        } catch (error) {
            console.error("Delete error:", error)
            toast.error("Failed to delete entries")
        } finally {
            setDeleting(false)
        }
    }

    const handlePrint = () => {
        if (!selectedFeedback) return
        const printWindow = window.open("", "_blank")
        if (!printWindow) return

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Data Report - ${selectedFeedback.subject || selectedFeedback.project?.name}</title>
                <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&family=JetBrains+Mono&display=swap" rel="stylesheet">
                <style>
                    body { 
                        font-family: 'JetBrains Mono', monospace; 
                        max-width: 600px; 
                        margin: 40px auto; 
                        padding: 20px;
                        background: #0a0a12;
                        color: #fff;
                    }
                    h1 { 
                        font-family: 'Orbitron', sans-serif;
                        color: #00f0ff; 
                        border-bottom: 2px solid #00f0ff; 
                        padding-bottom: 10px; 
                        text-transform: uppercase;
                        letter-spacing: 2px;
                    }
                    .info { display: flex; justify-content: space-between; margin: 20px 0; gap: 10px; }
                    .info-item { 
                        text-align: center; 
                        padding: 15px; 
                        background: rgba(0,240,255,0.1); 
                        border: 1px solid rgba(0,240,255,0.3);
                        border-radius: 8px;
                        flex: 1;
                    }
                    .info-item label { font-size: 10px; color: rgba(255,255,255,0.5); display: block; text-transform: uppercase; }
                    .info-item span { font-size: 18px; font-weight: bold; color: #00f0ff; }
                    .ratings { margin: 20px 0; }
                    .rating-row { 
                        display: flex; 
                        justify-content: space-between; 
                        padding: 10px; 
                        border-bottom: 1px solid rgba(255,255,255,0.1);
                    }
                    .rating-row span:last-child { color: #a855f7; }
                    .comment { 
                        background: rgba(168,85,247,0.1); 
                        border: 1px solid rgba(168,85,247,0.3);
                        padding: 15px; 
                        border-radius: 8px; 
                        margin-top: 20px; 
                    }
                    .footer { text-align: center; color: rgba(255,255,255,0.4); margin-top: 30px; font-size: 10px; }
                    @media print {
                        body { background: #fff; color: #000; }
                        h1 { color: #8b5cf6; border-color: #8b5cf6; }
                        .info-item { background: #f5f5f5; border-color: #ddd; }
                        .info-item span { color: #8b5cf6; }
                    }
                </style>
            </head>
            <body>
                <h1>// DATA REPORT</h1>
                <div class="info">
                    <div class="info-item"><label>Subject</label><span>${selectedFeedback.subject || selectedFeedback.project?.name}</span></div>
                    <div class="info-item"><label>Score</label><span>${selectedFeedback.percent}%</span></div>
                    <div class="info-item"><label>Role</label><span>${selectedFeedback.user_role}</span></div>
                </div>
                <div class="ratings">
                    <h3 style="color: #a855f7; font-family: Orbitron;">RATINGS</h3>
                    <div class="rating-row"><span>Topic Selection</span><span>${selectedFeedback.q1}/5</span></div>
                    <div class="rating-row"><span>Communication</span><span>${selectedFeedback.q2}/5</span></div>
                    <div class="rating-row"><span>Creativity</span><span>${selectedFeedback.q3}/5</span></div>
                    <div class="rating-row"><span>Clarity</span><span>${selectedFeedback.q4}/5</span></div>
                    <div class="rating-row"><span>Enthusiasm</span><span>${selectedFeedback.q5}/5</span></div>
                    <div class="rating-row"><span>Overall</span><span>${selectedFeedback.q6}/5</span></div>
                </div>
                ${selectedFeedback.comment ? `<div class="comment"><strong style="color: #a855f7;">// COMMENT:</strong><p>${selectedFeedback.comment}</p></div>` : ""}
                <div class="footer">Submitted: ${formatDate(selectedFeedback.created_at)} • South Point Mission Control</div>
                <script>window.print(); window.close();</script>
            </body>
            </html>
        `)
        printWindow.document.close()
    }

    const uniqueRoles = [...new Set(feedback.map((f) => f.user_role))]

    return (
        <AdminSidebar>
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8"
            >
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <Database className="w-5 h-5 text-cyan-400" />
                        <span className="font-mono text-xs text-cyan-400 uppercase tracking-widest">Data Stream</span>
                    </div>
                    <h1 className="font-orbitron text-2xl lg:text-3xl font-bold text-white tracking-wide">
                        FEEDBACK DATABASE
                    </h1>
                    <p className="font-mono text-white/50 text-sm mt-1">
                        {filteredFeedback.length} of {feedback.length} entries • Real-time sync active
                    </p>
                </div>
                <Link href="/api/export" target="_blank">
                    <Button className="futuristic-btn px-6 py-2">
                        <Download className="w-4 h-4 mr-2" />
                        EXPORT CSV
                    </Button>
                </Link>
            </motion.div>

            {/* Bulk Action Bar */}
            <AnimatePresence>
                {selectedIds.size > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: "auto" }}
                        exit={{ opacity: 0, y: -10, height: 0 }}
                        className="mb-4"
                    >
                        <div className="flex items-center justify-between p-4 rounded-xl bg-pink-500/10 border border-pink-500/30">
                            <div className="flex items-center gap-3">
                                <Zap className="w-5 h-5 text-pink-400 animate-pulse" />
                                <p className="font-mono text-sm text-pink-400">
                                    {selectedIds.size} ITEM{selectedIds.size > 1 ? "S" : ""} SELECTED
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setSelectedIds(new Set())}
                                    className="font-mono text-xs bg-transparent border-white/20 text-white hover:bg-white/10"
                                >
                                    CANCEL
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={() => setShowDeleteDialog(true)}
                                    className="font-mono text-xs bg-pink-600 hover:bg-pink-700 text-white border-0"
                                >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    PURGE DATA
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Search & Filter */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="data-module p-4 mb-6"
            >
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400/50" />
                        <Input
                            placeholder="Search database..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10 input-futuristic"
                        />
                        {search && (
                            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white">
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-purple-400/50" />
                        <Select value={roleFilter} onValueChange={setRoleFilter}>
                            <SelectTrigger className="w-40 input-futuristic">
                                <SelectValue placeholder="All Roles" />
                            </SelectTrigger>
                            <SelectContent className="bg-[#12121f] border-cyan-500/30">
                                <SelectItem value="all" className="font-mono text-white">All Roles</SelectItem>
                                {uniqueRoles.map((role) => (
                                    <SelectItem key={role} value={role} className="font-mono text-white">{role}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </motion.div>

            {/* Data Table */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="data-module overflow-hidden"
            >
                {/* Table Header */}
                <div className="p-4 border-b border-cyan-500/10">
                    <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-cyan-400" />
                        <h3 className="font-orbitron text-sm text-white tracking-wide">DATA ENTRIES</h3>
                        <span className="font-mono text-xs text-white/40">// click row to inspect</span>
                    </div>
                </div>

                {loading ? (
                    <div className="p-6">
                        <TableSkeleton rows={5} />
                    </div>
                ) : filteredFeedback.length === 0 ? (
                    <div className="p-6">
                        <EmptyState
                            type={search || roleFilter !== "all" ? "search" : "feedback"}
                            action={search || roleFilter !== "all" ? { label: "Clear Filters", onClick: () => { setSearch(""); setRoleFilter("all") } } : undefined}
                        />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-cyan-500/10 hover:bg-transparent">
                                    <TableHead className="w-12">
                                        <Checkbox
                                            checked={paginatedFeedback.length > 0 && selectedIds.size === paginatedFeedback.length}
                                            onCheckedChange={toggleSelectAll}
                                            className="border-cyan-500/50 data-[state=checked]:bg-cyan-500 data-[state=checked]:border-cyan-500"
                                        />
                                    </TableHead>
                                    <TableHead className="font-mono text-xs text-cyan-400/60 uppercase tracking-wider">Subject</TableHead>
                                    <TableHead className="font-mono text-xs text-cyan-400/60 uppercase tracking-wider hidden sm:table-cell">Role</TableHead>
                                    <TableHead className="font-mono text-xs text-cyan-400/60 uppercase tracking-wider">Score</TableHead>
                                    <TableHead className="font-mono text-xs text-cyan-400/60 uppercase tracking-wider hidden md:table-cell">Timestamp</TableHead>
                                    <TableHead className="font-mono text-xs text-cyan-400/60 uppercase tracking-wider text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedFeedback.map((f, index) => {
                                    const ratingBadge = getRatingBadge(f.percent)
                                    return (
                                        <motion.tr
                                            key={f.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className={`border-cyan-500/5 hover:bg-cyan-500/5 cursor-pointer transition-colors ${selectedIds.has(f.id) ? "bg-cyan-500/10" : ""}`}
                                            onClick={() => setSelectedFeedback(f)}
                                        >
                                            <TableCell onClick={(e) => e.stopPropagation()}>
                                                <Checkbox
                                                    checked={selectedIds.has(f.id)}
                                                    onCheckedChange={() => {
                                                        const newSelected = new Set(selectedIds)
                                                        if (newSelected.has(f.id)) {
                                                            newSelected.delete(f.id)
                                                        } else {
                                                            newSelected.add(f.id)
                                                        }
                                                        setSelectedIds(newSelected)
                                                    }}
                                                    className="border-cyan-500/50 data-[state=checked]:bg-cyan-500 data-[state=checked]:border-cyan-500"
                                                />
                                            </TableCell>
                                            <TableCell className="font-mono text-sm text-white">
                                                {f.subject || f.project?.name || "Unknown"}
                                            </TableCell>
                                            <TableCell className="hidden sm:table-cell">
                                                <span className="badge-futuristic-purple">{f.user_role}</span>
                                            </TableCell>
                                            <TableCell>
                                                <span className={ratingBadge.class}>
                                                    {f.percent}%
                                                </span>
                                            </TableCell>
                                            <TableCell className="font-mono text-xs text-white/40 hidden md:table-cell">
                                                {formatDate(f.created_at, { dateStyle: "medium" })}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="sm" className="text-cyan-400/60 hover:text-cyan-400 hover:bg-cyan-500/10">
                                                    <Eye className="w-4 h-4" />
                                                </Button>
                                            </TableCell>
                                        </motion.tr>
                                    )
                                })}
                            </TableBody>
                        </Table>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between p-4 border-t border-cyan-500/10">
                                <p className="font-mono text-xs text-white/40">
                                    Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredFeedback.length)} of {filteredFeedback.length}
                                </p>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        className="font-mono text-xs bg-transparent border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 disabled:opacity-30"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </Button>
                                    <span className="font-mono text-xs text-white/60 px-3">
                                        {currentPage} / {totalPages}
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages}
                                        className="font-mono text-xs bg-transparent border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 disabled:opacity-30"
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </motion.div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent className="bg-[#12121f] border-pink-500/30">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="font-orbitron text-white flex items-center gap-2">
                            <Trash2 className="w-5 h-5 text-pink-400" />
                            CONFIRM DATA PURGE
                        </AlertDialogTitle>
                        <AlertDialogDescription className="font-mono text-white/60">
                            You are about to permanently delete {selectedIds.size} data entries. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="font-mono text-xs bg-transparent border-white/20 text-white hover:bg-white/10">
                            ABORT
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleBulkDelete}
                            disabled={deleting}
                            className="font-mono text-xs bg-pink-600 hover:bg-pink-700 text-white"
                        >
                            {deleting ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    PURGING...
                                </>
                            ) : (
                                <>
                                    <Zap className="w-4 h-4 mr-2" />
                                    EXECUTE
                                </>
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Detail Dialog */}
            <Dialog open={!!selectedFeedback} onOpenChange={() => setSelectedFeedback(null)}>
                <DialogContent className="bg-[#0c0c16] border-cyan-500/30 text-white max-w-lg">
                    <DialogHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <DialogTitle className="font-orbitron text-lg tracking-wide flex items-center gap-2">
                                    <Database className="w-5 h-5 text-cyan-400" />
                                    DATA INSPECTION
                                </DialogTitle>
                                <DialogDescription className="font-mono text-white/50 text-xs mt-1">
                                    {selectedFeedback?.subject || selectedFeedback?.project?.name} • {selectedFeedback?.user_role}
                                </DialogDescription>
                            </div>
                            <Button variant="outline" size="sm" onClick={handlePrint} className="font-mono text-xs bg-transparent border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10">
                                <Printer className="w-4 h-4 mr-2" />
                                PRINT
                            </Button>
                        </div>
                    </DialogHeader>
                    {selectedFeedback && (
                        <div ref={printRef} className="space-y-4 pt-4">
                            {/* Score Display */}
                            <div className="flex items-center justify-between p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                                <div>
                                    <p className="font-mono text-xs text-white/50 uppercase">Overall Score</p>
                                    <p className="font-orbitron text-3xl font-bold text-cyan-400">{selectedFeedback.percent}%</p>
                                </div>
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star key={star} className={`w-5 h-5 ${star <= Math.round(selectedFeedback.percent / 20) ? "text-yellow-400 fill-yellow-400" : "text-white/20"}`} />
                                    ))}
                                </div>
                            </div>

                            {/* Ratings Grid */}
                            <div className="grid grid-cols-2 gap-2">
                                {[
                                    { label: "Topic", value: selectedFeedback.q1 },
                                    { label: "Comm", value: selectedFeedback.q2 },
                                    { label: "Creative", value: selectedFeedback.q3 },
                                    { label: "Clarity", value: selectedFeedback.q4 },
                                    { label: "Enthus", value: selectedFeedback.q5 },
                                    { label: "Overall", value: selectedFeedback.q6 },
                                ].map((q) => (
                                    <div key={q.label} className="p-3 rounded-lg bg-white/5 border border-white/5">
                                        <p className="font-mono text-[10px] text-white/40 uppercase mb-1">{q.label}</p>
                                        <p className="font-orbitron text-lg text-purple-400">{q.value}<span className="text-white/30">/5</span></p>
                                    </div>
                                ))}
                            </div>

                            {/* Comment */}
                            {selectedFeedback.comment && (
                                <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
                                    <p className="font-mono text-xs text-purple-400 uppercase mb-2">// Comment</p>
                                    <p className="font-mono text-sm text-white/80">{selectedFeedback.comment}</p>
                                </div>
                            )}

                            {/* Timestamp */}
                            <p className="font-mono text-xs text-white/30 text-center">
                                Recorded: {formatDate(selectedFeedback.created_at)}
                            </p>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </AdminSidebar>
    )
}
