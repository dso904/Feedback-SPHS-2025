"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState, useMemo, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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

    const getRatingColor = (percent: number) => {
        if (percent >= 80) return "bg-green-500/20 text-green-400 border-green-500/30"
        if (percent >= 60) return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
        if (percent >= 40) return "bg-orange-500/20 text-orange-400 border-orange-500/30"
        return "bg-red-500/20 text-red-400 border-red-500/30"
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
        e.stopPropagation() // Prevent row click from opening modal
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

            toast.success(`${selectedIds.size} feedback entries deleted`)
            setSelectedIds(new Set())
            setShowDeleteDialog(false)
            fetchFeedback() // Refresh the list
        } catch (error) {
            console.error("Delete error:", error)
            toast.error("Failed to delete feedback entries")
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
        <title>Feedback Report - ${selectedFeedback.subject || selectedFeedback.project?.name}</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 600px; margin: 40px auto; padding: 20px; }
          h1 { color: #333; border-bottom: 2px solid #8b5cf6; padding-bottom: 10px; }
          .info { display: flex; justify-content: space-between; margin: 20px 0; }
          .info-item { text-align: center; padding: 15px; background: #f5f5f5; border-radius: 8px; }
          .info-item label { font-size: 12px; color: #666; display: block; }
          .info-item span { font-size: 20px; font-weight: bold; }
          .ratings { margin: 20px 0; }
          .rating-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
          .comment { background: #f9f9f9; padding: 15px; border-radius: 8px; margin-top: 20px; }
          .footer { text-align: center; color: #999; margin-top: 30px; font-size: 12px; }
        </style>
      </head>
      <body>
        <h1>Feedback Report</h1>
        <div class="info">
          <div class="info-item"><label>Subject</label><span>${selectedFeedback.subject || selectedFeedback.project?.name}</span></div>
          <div class="info-item"><label>Score</label><span>${selectedFeedback.percent}%</span></div>
          <div class="info-item"><label>Role</label><span>${selectedFeedback.user_role}</span></div>
        </div>
        <div class="ratings">
          <h3>Ratings</h3>
          <div class="rating-row"><span>Topic Selection</span><span>${selectedFeedback.q1}/5</span></div>
          <div class="rating-row"><span>Communication</span><span>${selectedFeedback.q2}/5</span></div>
          <div class="rating-row"><span>Creativity</span><span>${selectedFeedback.q3}/5</span></div>
          <div class="rating-row"><span>Clarity</span><span>${selectedFeedback.q4}/5</span></div>
          <div class="rating-row"><span>Enthusiasm</span><span>${selectedFeedback.q5}/5</span></div>
          <div class="rating-row"><span>Overall</span><span>${selectedFeedback.q6}/5</span></div>
        </div>
        ${selectedFeedback.comment ? `<div class="comment"><strong>Comment:</strong><p>${selectedFeedback.comment}</p></div>` : ""}
        <div class="footer">Submitted on ${formatDate(selectedFeedback.created_at)} • South Point High School Feedback System</div>
        <script>window.print(); window.close();</script>
      </body>
      </html>
    `)
        printWindow.document.close()
    }

    const uniqueRoles = [...new Set(feedback.map((f) => f.user_role))]

    return (
        <AdminSidebar>
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white mb-1">All Feedback</h1>
                    <p className="text-slate-600 dark:text-white/60">{filteredFeedback.length} of {feedback.length} entries</p>
                </div>
                <div className="flex gap-2">
                    <Link href="/api/export" target="_blank">
                        <Button className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500">
                            <Download className="w-4 h-4 mr-2" />
                            Export CSV
                        </Button>
                    </Link>
                </div>
            </motion.div>

            {/* Bulk Action Bar - appears when items are selected */}
            <AnimatePresence>
                {selectedIds.size > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: "auto" }}
                        exit={{ opacity: 0, y: -10, height: 0 }}
                        className="mb-4"
                    >
                        <div className="flex items-center justify-between p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                            <p className="text-red-400 font-medium">
                                {selectedIds.size} item{selectedIds.size > 1 ? "s" : ""} selected
                            </p>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setSelectedIds(new Set())}
                                    className="bg-white/5 border-white/10 hover:bg-white/10"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => setShowDeleteDialog(true)}
                                    className="bg-red-600 hover:bg-red-700"
                                >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete Selected
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Search & Filter */}
            <Card className="bg-white dark:bg-slate-900/50 border-slate-200 dark:border-white/5 mb-6">
                <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-white/40" />
                            <Input
                                placeholder="Search by project or comment..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10 bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white"
                            />
                            {search && (
                                <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <Filter className="w-4 h-4 text-slate-400 dark:text-white/40" />
                            <Select value={roleFilter} onValueChange={setRoleFilter}>
                                <SelectTrigger className="w-40 bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white">
                                    <SelectValue placeholder="All Roles" />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-900 border-white/10">
                                    <SelectItem value="all">All Roles</SelectItem>
                                    {uniqueRoles.map((role) => (
                                        <SelectItem key={role} value={role}>{role}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-white dark:bg-slate-900/50 border-slate-200 dark:border-white/5">
                <CardHeader>
                    <CardTitle className="text-slate-900 dark:text-white">Feedback Entries</CardTitle>
                    <CardDescription className="text-slate-500 dark:text-white/40">Click any row to view details, or use checkboxes to select multiple</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <TableSkeleton rows={5} />
                    ) : filteredFeedback.length === 0 ? (
                        <EmptyState
                            type={search || roleFilter !== "all" ? "search" : "feedback"}
                            action={search || roleFilter !== "all" ? { label: "Clear Filters", onClick: () => { setSearch(""); setRoleFilter("all") } } : undefined}
                        />
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-slate-200 dark:border-white/10 hover:bg-transparent">
                                        <TableHead className="w-12">
                                            <Checkbox
                                                checked={paginatedFeedback.length > 0 && selectedIds.size === paginatedFeedback.length}
                                                onCheckedChange={toggleSelectAll}
                                                className="border-slate-300 dark:border-white/30"
                                            />
                                        </TableHead>
                                        <TableHead className="text-slate-600 dark:text-white/60">Subject</TableHead>
                                        <TableHead className="text-slate-600 dark:text-white/60 hidden sm:table-cell">Role</TableHead>
                                        <TableHead className="text-slate-600 dark:text-white/60">Rating</TableHead>
                                        <TableHead className="text-slate-600 dark:text-white/60 hidden md:table-cell">Date</TableHead>
                                        <TableHead className="text-slate-600 dark:text-white/60 text-right">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {paginatedFeedback.map((f) => (
                                        <TableRow
                                            key={f.id}
                                            className={`border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer ${selectedIds.has(f.id) ? "bg-purple-500/10 hover:bg-purple-500/15" : ""}`}
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
                                                    className="border-slate-300 dark:border-white/30"
                                                />
                                            </TableCell>
                                            <TableCell className="text-slate-900 dark:text-white font-medium">{f.subject || f.project?.name || "Unknown"}</TableCell>
                                            <TableCell className="hidden sm:table-cell">
                                                <Badge variant="outline" className="bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-white/80 border-slate-200 dark:border-white/20">{f.user_role}</Badge>
                                            </TableCell>
                                            <TableCell><Badge className={getRatingColor(f.percent)}>{f.percent}%</Badge></TableCell>
                                            <TableCell className="text-slate-500 dark:text-white/60 hidden md:table-cell">{formatDate(f.created_at, { dateStyle: "medium" })}</TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="sm" className="text-slate-600 dark:text-white/60 hover:text-purple-500"><Eye className="w-4 h-4" /></Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>

                            {/* Pagination Controls */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-white/10 mt-4">
                                    <p className="text-sm text-slate-500 dark:text-white/40">
                                        Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredFeedback.length)} of {filteredFeedback.length}
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                            disabled={currentPage === 1}
                                            className="bg-white/5 border-slate-200 dark:border-white/10"
                                        >
                                            <ChevronLeft className="w-4 h-4" />
                                        </Button>
                                        <span className="text-sm text-slate-600 dark:text-white/60 px-2">
                                            Page {currentPage} of {totalPages}
                                        </span>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                            disabled={currentPage === totalPages}
                                            className="bg-white/5 border-slate-200 dark:border-white/10"
                                        >
                                            <ChevronRight className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent className="bg-slate-900 border-white/10">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-white">Delete {selectedIds.size} feedback entries?</AlertDialogTitle>
                        <AlertDialogDescription className="text-white/60">
                            This action cannot be undone. This will permanently delete the selected feedback entries from the database.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="bg-white/5 border-white/10 text-white hover:bg-white/10">
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleBulkDelete}
                            disabled={deleting}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            {deleting ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                <>
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete
                                </>
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Detail Dialog */}
            <Dialog open={!!selectedFeedback} onOpenChange={() => setSelectedFeedback(null)}>
                <DialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white max-w-lg">
                    <DialogHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <DialogTitle className="text-xl">Feedback Details</DialogTitle>
                                <DialogDescription className="text-slate-500 dark:text-white/60">{selectedFeedback?.subject || selectedFeedback?.project?.name} • {selectedFeedback?.user_role}</DialogDescription>
                            </div>
                            <Button variant="outline" size="sm" onClick={handlePrint} className="bg-white/5 border-slate-200 dark:border-white/10">
                                <Printer className="w-4 h-4 mr-2" />
                                Print
                            </Button>
                        </div>
                    </DialogHeader>
                    {selectedFeedback && (
                        <div ref={printRef} className="space-y-6 pt-4">
                            <div className="flex items-center justify-between p-4 bg-slate-100 dark:bg-white/5 rounded-xl">
                                <div>
                                    <p className="text-slate-500 dark:text-white/60 text-sm">Overall Score</p>
                                    <p className="text-3xl font-bold">{selectedFeedback.percent}%</p>
                                </div>
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star key={star} className={`w-6 h-6 ${star <= Math.round(selectedFeedback.percent / 20) ? "text-yellow-400 fill-yellow-400" : "text-slate-300 dark:text-white/20"}`} />
                                    ))}
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { label: "Topic Selection", value: selectedFeedback.q1 },
                                    { label: "Communication", value: selectedFeedback.q2 },
                                    { label: "Creativity", value: selectedFeedback.q3 },
                                    { label: "Clarity", value: selectedFeedback.q4 },
                                    { label: "Enthusiasm", value: selectedFeedback.q5 },
                                    { label: "Overall", value: selectedFeedback.q6 },
                                ].map((q) => (
                                    <div key={q.label} className="p-3 bg-slate-100 dark:bg-white/5 rounded-lg">
                                        <p className="text-slate-500 dark:text-white/60 text-xs mb-1">{q.label}</p>
                                        <p className="font-semibold">{q.value}/5</p>
                                    </div>
                                ))}
                            </div>
                            {selectedFeedback.comment && (
                                <div className="p-4 bg-slate-100 dark:bg-white/5 rounded-xl">
                                    <p className="text-slate-500 dark:text-white/60 text-sm mb-2">Comment</p>
                                    <p>{selectedFeedback.comment}</p>
                                </div>
                            )}
                            <p className="text-slate-400 dark:text-white/40 text-sm text-center">Submitted on {formatDate(selectedFeedback.created_at)}</p>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </AdminSidebar>
    )
}
