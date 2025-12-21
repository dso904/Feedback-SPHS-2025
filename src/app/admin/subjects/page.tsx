"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"
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
import { Plus, Trash2, BookOpen, Loader2, Database, Cpu, Zap } from "lucide-react"
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

            toast.success("Subject module added to database!")
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

            toast.success("Subject module purged from database!")
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
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <Database className="w-5 h-5 text-purple-400" />
                        <span className="font-mono text-xs text-purple-400 uppercase tracking-widest">Subject Registry</span>
                    </div>
                    <h1 className="font-orbitron text-2xl lg:text-3xl font-bold text-white tracking-wide">
                        SUBJECT MODULES
                    </h1>
                    <p className="font-mono text-white/50 text-sm mt-1">{subjects.length} modules registered • Feedback collection points</p>
                </div>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="futuristic-btn px-6 py-2">
                            <Plus className="w-4 h-4 mr-2" />
                            ADD MODULE
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-[#0c0c16] border-cyan-500/30 text-white">
                        <DialogHeader>
                            <DialogTitle className="font-orbitron text-lg tracking-wide flex items-center gap-2">
                                <Cpu className="w-5 h-5 text-cyan-400" />
                                NEW MODULE
                            </DialogTitle>
                            <DialogDescription className="font-mono text-white/50 text-xs">
                                Register a new subject for feedback collection
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 pt-4">
                            <div>
                                <Label htmlFor="name" className="font-mono text-xs text-white/60 uppercase tracking-wider">Module Name</Label>
                                <Input
                                    id="name"
                                    value={newSubject.name}
                                    onChange={(e) => {
                                        setNewSubject({ ...newSubject, name: e.target.value })
                                        if (errors.name) setErrors({ name: "" })
                                    }}
                                    placeholder="e.g., Physics, Chemistry, History"
                                    className={`mt-1 input-futuristic ${errors.name ? "border-red-500" : ""}`}
                                />
                                {errors.name && <p className="font-mono text-xs text-red-400 mt-1">{errors.name}</p>}
                            </div>
                            <div>
                                <Label className="font-mono text-xs text-white/60 uppercase tracking-wider">Module Icon</Label>
                                <div className="grid grid-cols-9 gap-2 mt-2">
                                    {ICONS.map((icon) => (
                                        <button
                                            key={icon}
                                            onClick={() => setNewSubject({ ...newSubject, icon })}
                                            className={`p-2 rounded-lg text-xl transition-all ${newSubject.icon === icon
                                                ? "bg-cyan-500/20 border-2 border-cyan-500 shadow-[0_0_10px_rgba(0,240,255,0.3)]"
                                                : "bg-white/5 border-2 border-transparent hover:border-white/20"
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
                                className="w-full futuristic-btn py-3"
                            >
                                {adding ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        PROCESSING...
                                    </>
                                ) : (
                                    <>
                                        <Zap className="w-4 h-4 mr-2" />
                                        REGISTER MODULE
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
                    title="No Modules Registered"
                    description="Add subject modules for users to give feedback on"
                    action={{ label: "Add Module", onClick: () => setDialogOpen(true) }}
                />
            ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {subjects.map((subject, index) => (
                        <motion.div
                            key={subject.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            whileHover={{ y: -4 }}
                        >
                            <div className="data-module p-5 group relative overflow-hidden">
                                {/* Corner accents */}
                                <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 border-purple-500/40 rounded-tl-xl" />
                                <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 border-purple-500/40 rounded-br-xl" />

                                {/* Content */}
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        {/* Icon with glow */}
                                        <div className="relative">
                                            <div className="absolute -inset-1 bg-purple-500/30 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity" />
                                            <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 flex items-center justify-center text-2xl border border-white/10">
                                                {subject.icon}
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="font-mono text-lg text-white">{subject.name}</h3>
                                            <div className="flex items-center gap-1.5 mt-1">
                                                <BookOpen className="w-3 h-3 text-purple-400" />
                                                <span className="font-mono text-[10px] text-white/40 uppercase tracking-wider">Subject Module</span>
                                            </div>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setDeleteId(subject.id)}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity text-pink-400 hover:text-pink-300 hover:bg-pink-500/10"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>

                                {/* Status indicator */}
                                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-white/5">
                                    <div className="pulse-dot-green" style={{ width: '6px', height: '6px' }} />
                                    <span className="font-mono text-[10px] text-green-400/80 uppercase">Active</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            <ConfirmDialog
                open={!!deleteId}
                onOpenChange={() => setDeleteId(null)}
                onConfirm={handleDeleteSubject}
                title="Purge Module"
                description="Are you sure you want to remove this subject module? This action cannot be undone."
                variant="danger"
            />
        </AdminSidebar>
    )
}
