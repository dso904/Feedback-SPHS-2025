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
    DialogFooter,
} from "@/components/ui/dialog"
import { Plus, Loader2, BookOpen, Trash2 } from "lucide-react"
import { AdminSidebar } from "@/components/admin/sidebar"
import { CardsSkeleton } from "@/components/admin/skeletons"
import { EmptyState } from "@/components/admin/empty-state"
import { ConfirmDialog } from "@/components/admin/confirm-dialog"
import { toast } from "sonner"
import type { Project } from "@/lib/types"

export default function ProjectsPage() {
    const { status } = useSession()
    const router = useRouter()
    const [projects, setProjects] = useState<Project[]>([])
    const [loading, setLoading] = useState(true)
    const [addDialogOpen, setAddDialogOpen] = useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [projectToDelete, setProjectToDelete] = useState<Project | null>(null)
    const [newProject, setNewProject] = useState({ name: "", subject: "" })
    const [submitting, setSubmitting] = useState(false)
    const [errors, setErrors] = useState({ name: "", subject: "" })

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/admin/login")
        }
    }, [status, router])

    useEffect(() => {
        fetchProjects()
    }, [])

    const fetchProjects = async () => {
        try {
            const res = await fetch("/api/projects")
            const data = await res.json()
            setProjects(data || [])
        } catch (error) {
            console.error("Failed to fetch projects:", error)
        } finally {
            setLoading(false)
        }
    }

    const validateForm = () => {
        const newErrors = { name: "", subject: "" }
        let isValid = true

        if (!newProject.name.trim()) {
            newErrors.name = "Project name is required"
            isValid = false
        } else if (newProject.name.length < 3) {
            newErrors.name = "Name must be at least 3 characters"
            isValid = false
        }

        if (!newProject.subject.trim()) {
            newErrors.subject = "Subject is required"
            isValid = false
        }

        setErrors(newErrors)
        return isValid
    }

    const handleAddProject = async () => {
        if (!validateForm()) return

        setSubmitting(true)
        try {
            const res = await fetch("/api/projects", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newProject),
            })

            if (!res.ok) throw new Error("Failed to add project")

            toast.success("Project added successfully!")
            setNewProject({ name: "", subject: "" })
            setErrors({ name: "", subject: "" })
            setAddDialogOpen(false)
            fetchProjects()
        } catch {
            toast.error("Failed to add project")
        } finally {
            setSubmitting(false)
        }
    }

    const handleDeleteProject = async () => {
        if (!projectToDelete) return

        try {
            const res = await fetch(`/api/projects/${projectToDelete.id}`, { method: "DELETE" })
            if (!res.ok) throw new Error("Failed to delete")

            toast.success("Project deleted")
            setProjectToDelete(null)
            fetchProjects()
        } catch {
            toast.error("Failed to delete project")
        }
    }

    const openDeleteDialog = (project: Project) => {
        setProjectToDelete(project)
        setDeleteDialogOpen(true)
    }

    return (
        <AdminSidebar>
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white mb-1">Projects</h1>
                    <p className="text-slate-600 dark:text-white/60">{projects.length} projects available</p>
                </div>
                <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Project
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white">
                        <DialogHeader>
                            <DialogTitle>Add New Project</DialogTitle>
                            <DialogDescription className="text-slate-500 dark:text-white/60">Enter the project details below</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-slate-700 dark:text-white/80">Project Name</Label>
                                <Input
                                    id="name"
                                    placeholder="e.g., Solar System Model"
                                    value={newProject.name}
                                    onChange={(e) => { setNewProject({ ...newProject, name: e.target.value }); setErrors({ ...errors, name: "" }) }}
                                    className={`bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white ${errors.name ? "border-red-500" : ""}`}
                                />
                                {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="subject" className="text-slate-700 dark:text-white/80">Subject</Label>
                                <Input
                                    id="subject"
                                    placeholder="e.g., Science"
                                    value={newProject.subject}
                                    onChange={(e) => { setNewProject({ ...newProject, subject: e.target.value }); setErrors({ ...errors, subject: "" }) }}
                                    className={`bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white ${errors.subject ? "border-red-500" : ""}`}
                                />
                                {errors.subject && <p className="text-red-500 text-sm">{errors.subject}</p>}
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setAddDialogOpen(false)} className="bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10">Cancel</Button>
                            <Button onClick={handleAddProject} disabled={submitting} className="bg-gradient-to-r from-purple-600 to-cyan-600">
                                {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                Add Project
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </motion.div>

            {loading ? (
                <CardsSkeleton count={6} />
            ) : projects.length === 0 ? (
                <Card className="bg-white dark:bg-slate-900/50 border-slate-200 dark:border-white/5">
                    <CardContent className="py-8">
                        <EmptyState type="projects" action={{ label: "Add Your First Project", onClick: () => setAddDialogOpen(true) }} />
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                    {projects.map((project, index) => (
                        <motion.div key={project.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                            <Card className="bg-white dark:bg-slate-900/50 border-slate-200 dark:border-white/5 hover:border-purple-500/30 transition-colors group">
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20">
                                            <BookOpen className="w-6 h-6 text-purple-500" />
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => openDeleteDialog(project)}
                                            className="text-slate-400 dark:text-white/40 hover:text-red-500 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                    <CardTitle className="text-slate-900 dark:text-white mt-4">{project.name}</CardTitle>
                                    <CardDescription className="text-slate-500 dark:text-white/60">{project.subject}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-slate-400 dark:text-white/40 text-sm">Created {new Date(project.created_at).toLocaleDateString()}</p>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Delete Confirmation */}
            <ConfirmDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                title="Delete Project?"
                description={`This will permanently delete "${projectToDelete?.name}" and all associated feedback. This action cannot be undone.`}
                confirmText="Delete"
                variant="danger"
                onConfirm={handleDeleteProject}
            />
        </AdminSidebar>
    )
}
