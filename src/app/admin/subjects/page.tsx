"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Trash2, BookOpen, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { AdminSidebar } from "@/components/admin/sidebar"
import { CardsSkeleton } from "@/components/admin/skeletons"
import { ConfirmDialog } from "@/components/admin/confirm-dialog"
import { EmptyState } from "@/components/admin/empty-state"

interface Subject {
    id: string
    name: string
    icon: string
    created_at: string
}

// Common emoji icons for subjects
const ICONS = ["📚", "⚛️", "🧪", "🧬", "📐", "💻", "📜", "🌍", "📖", "📝", "💰", "📊", "🏛️", "🎨", "🎵", "🔬", "🌱", "🔢"]

export default function SubjectsPage() {
    const { status } = useSession()
    const router = useRouter()
    const [subjects, setSubjects] = useState<Subject[]>([])
    const [loading, setLoading] = useState(true)
    const [adding, setAdding] = useState(false)
    const [newSubject, setNewSubject] = useState({ name: "", icon: "📚" })
    const [dialogOpen, setDialogOpen] = useState(false)
    const [deleteId, setDeleteId] = useState<string | null>(null)
    const [deleting, setDeleting] = useState(false)
    const [errors, setErrors] = useState({ name: "" })

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/admin/login")
        }
    }, [status, router])

    useEffect(() => {
        fetchSubjects()
    }, [])

    const fetchSubjects = async () => {
        try {
            const res = await fetch("/api/subjects")
            const data = await res.json()
            setSubjects(data || [])
        } catch (error) {
            console.error("Failed to fetch subjects:", error)
        } finally {
            setLoading(false)
        }
    }

    const validateForm = () => {
        const newErrors = { name: "" }
        if (!newSubject.name.trim()) {
            newErrors.name = "Subject name is required"
        } else if (newSubject.name.trim().length < 2) {
            newErrors.name = "Subject name must be at least 2 characters"
        }
        setErrors(newErrors)
        return !newErrors.name
    }

    const handleAddSubject = async () => {
        if (!validateForm()) return

        setAdding(true)
        try {
            const res = await fetch("/api/subjects", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: newSubject.name.trim(), icon: newSubject.icon }),
            })

            if (!res.ok) throw new Error("Failed to add")

            toast.success("Subject added successfully!")
            setNewSubject({ name: "", icon: "📚" })
            setDialogOpen(false)
            setErrors({ name: "" })
            fetchSubjects()
        } catch {
            toast.error("Failed to add subject")
        } finally {
            setAdding(false)
        }
    }

    const handleDeleteSubject = async () => {
        if (!deleteId) return

        setDeleting(true)
        try {
            const res = await fetch(`/api/subjects/${deleteId}`, {
                method: "DELETE",
            })

            if (!res.ok) throw new Error("Failed to delete")

            toast.success("Subject deleted successfully!")
            setDeleteId(null)
            fetchSubjects()
        } catch {
            toast.error("Failed to delete subject")
        } finally {
            setDeleting(false)
        }
    }

    return (
        <AdminSidebar>
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white mb-1">Manage Subjects</h1>
                    <p className="text-slate-600 dark:text-white/60">{subjects.length} subjects available for feedback</p>
                </div>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Subject
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white">
                        <DialogHeader>
                            <DialogTitle>Add New Subject</DialogTitle>
                            <DialogDescription className="text-slate-500 dark:text-white/60">
                                Create a new subject for feedback collection
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 pt-4">
                            <div>
                                <Label htmlFor="name" className="text-slate-700 dark:text-white">Subject Name</Label>
                                <Input
                                    id="name"
                                    value={newSubject.name}
                                    onChange={(e) => {
                                        setNewSubject({ ...newSubject, name: e.target.value })
                                        if (errors.name) setErrors({ name: "" })
                                    }}
                                    placeholder="e.g., Physics, Chemistry, History"
                                    className={`mt-1 bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white ${errors.name ? "border-red-500" : ""}`}
                                />
                                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                            </div>
                            <div>
                                <Label className="text-slate-700 dark:text-white">Icon</Label>
                                <div className="grid grid-cols-9 gap-2 mt-2">
                                    {ICONS.map((icon) => (
                                        <button
                                            key={icon}
                                            onClick={() => setNewSubject({ ...newSubject, icon })}
                                            className={`p-2 rounded-lg text-xl transition-all ${newSubject.icon === icon
                                                ? "bg-purple-500/20 border-2 border-purple-500"
                                                : "bg-slate-100 dark:bg-white/5 border-2 border-transparent hover:border-white/20"
                                                }`}
                                        >
                                            {icon}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <Button
                                onClick={handleAddSubject}
                                disabled={adding}
                                className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500"
                            >
                                {adding ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Adding...
                                    </>
                                ) : (
                                    <>
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add Subject
                                    </>
                                )}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </motion.div>

            {loading ? (
                <CardsSkeleton count={6} />
            ) : subjects.length === 0 ? (
                <EmptyState
                    type="projects"
                    title="No Subjects Yet"
                    description="Add subjects for users to give feedback on"
                    action={{ label: "Add Subject", onClick: () => setDialogOpen(true) }}
                />
            ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {subjects.map((subject, index) => (
                        <motion.div
                            key={subject.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Card className="bg-white dark:bg-slate-900/50 border-slate-200 dark:border-white/5 hover:border-purple-500/50 transition-all group">
                                <CardHeader className="flex flex-row items-start justify-between pb-2">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 flex items-center justify-center text-2xl">
                                            {subject.icon}
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg text-slate-900 dark:text-white">{subject.name}</CardTitle>
                                            <CardDescription className="text-slate-500 dark:text-white/40">
                                                <BookOpen className="w-3 h-3 inline mr-1" />
                                                Subject
                                            </CardDescription>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setDeleteId(subject.id)}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-500 hover:bg-red-500/10"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </CardHeader>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            )}

            <ConfirmDialog
                open={!!deleteId}
                onOpenChange={() => setDeleteId(null)}
                onConfirm={handleDeleteSubject}
                title="Delete Subject"
                description="Are you sure you want to delete this subject? This action cannot be undone."
                variant="danger"
            />
        </AdminSidebar>
    )
}
