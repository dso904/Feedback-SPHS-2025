"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { AdminSidebar } from "@/components/admin/sidebar"
import { Trophy, Medal, TrendingUp, Hash, Loader2, Atom, Cpu, Calculator, Palette, Globe2, Landmark, Languages, Music, BookOpen, Stethoscope, Briefcase, Dna, X, Star, User, Calendar, MessageSquare } from "lucide-react"
import type { Feedback } from "@/lib/types"

interface SubjectScore {
    name: string
    totalScore: number
    feedbackCount: number
    avgPercent: number
}

// Icon mapping function
const getSubjectIcon = (subject: string, size: string = "w-5 h-5") => {
    const s = subject.toLowerCase()
    if (s.includes('computer') || s.includes('tech') || s.includes('code') || s.includes('ai')) return <Cpu className={`${size} text-cyan-400`} />
    if (s.includes('science') || s.includes('physics') || s.includes('chem')) return <Atom className={`${size} text-purple-400`} />
    if (s.includes('bio') || s.includes('eco') || s.includes('nature')) return <Dna className={`${size} text-green-400`} />
    if (s.includes('math') || s.includes('calc')) return <Calculator className={`${size} text-orange-400`} />
    if (s.includes('art') || s.includes('design') || s.includes('paint')) return <Palette className={`${size} text-pink-400`} />
    if (s.includes('history') || s.includes('social')) return <Landmark className={`${size} text-yellow-400`} />
    if (s.includes('geo') || s.includes('earth')) return <Globe2 className={`${size} text-blue-400`} />
    if (s.includes('english') || s.includes('lang')) return <Languages className={`${size} text-red-400`} />
    if (s.includes('music') || s.includes('sound')) return <Music className={`${size} text-violet-400`} />
    if (s.includes('doctor') || s.includes('health') || s.includes('med')) return <Stethoscope className={`${size} text-teal-400`} />
    if (s.includes('business') || s.includes('commerce')) return <Briefcase className={`${size} text-indigo-400`} />
    return <BookOpen className={`${size} text-white/50`} />
}

export default function LeaderboardPage() {
    const { status } = useSession()
    const router = useRouter()
    const [subjects, setSubjects] = useState<SubjectScore[]>([])
    const [allFeedback, setAllFeedback] = useState<Feedback[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedSubject, setSelectedSubject] = useState<string | null>(null)

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/admin/login")
        }
    }, [status, router])

    useEffect(() => {
        fetchLeaderboard()
    }, [])

    const fetchLeaderboard = async () => {
        try {
            const res = await fetch("/api/feedback")
            const data: Feedback[] = await res.json()
            setAllFeedback(data)

            // Calculate total scores per subject
            const subjectStats: Record<string, { total: number; count: number; percentSum: number }> = {}
            data.forEach((f) => {
                const subject = f.subject || f.project?.name
                if (subject) {
                    if (!subjectStats[subject]) {
                        subjectStats[subject] = { total: 0, count: 0, percentSum: 0 }
                    }
                    subjectStats[subject].total += f.total
                    subjectStats[subject].count += 1
                    subjectStats[subject].percentSum += f.percent
                }
            })

            const sorted = Object.entries(subjectStats)
                .map(([name, { total, count, percentSum }]) => ({
                    name,
                    totalScore: total,
                    feedbackCount: count,
                    avgPercent: Math.round(percentSum / count)
                }))
                .sort((a, b) => b.totalScore - a.totalScore)

            setSubjects(sorted)
        } catch (error) {
            console.error("Failed to fetch leaderboard:", error)
        } finally {
            setLoading(false)
        }
    }

    const maxScore = subjects.length > 0 ? subjects[0].totalScore : 1

    // Get feedback for selected subject
    const subjectFeedback = selectedSubject
        ? allFeedback.filter(f => (f.subject || f.project?.name) === selectedSubject)
        : []

    const getRankStyle = (index: number) => {
        if (index === 0) return {
            badge: "bg-gradient-to-br from-yellow-400 to-orange-500 text-black shadow-lg shadow-yellow-500/30",
            row: "bg-gradient-to-r from-yellow-500/10 via-orange-500/5 to-transparent border-yellow-500/30",
            text: "text-yellow-400",
            bar: "from-yellow-500 to-orange-500"
        }
        if (index === 1) return {
            badge: "bg-gradient-to-br from-slate-300 to-slate-400 text-black",
            row: "bg-gradient-to-r from-slate-400/10 to-transparent border-slate-400/20",
            text: "text-slate-300",
            bar: "from-slate-300 to-slate-500"
        }
        if (index === 2) return {
            badge: "bg-gradient-to-br from-amber-600 to-amber-700 text-white",
            row: "bg-gradient-to-r from-amber-600/10 to-transparent border-amber-600/20",
            text: "text-amber-500",
            bar: "from-amber-500 to-amber-700"
        }
        return {
            badge: "bg-white/10 text-white/60",
            row: "bg-white/[0.02] border-white/5 hover:border-purple-500/30",
            text: "text-cyan-400",
            bar: "from-cyan-500 to-purple-500"
        }
    }

    if (status === "loading" || loading) {
        return (
            <AdminSidebar>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
                </div>
            </AdminSidebar>
        )
    }

    return (
        <AdminSidebar>
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <div className="flex items-center gap-3 mb-2">
                    <div className="pulse-dot" />
                    <span className="font-mono text-xs text-cyan-400 uppercase tracking-widest">Rankings Active</span>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <div className="absolute -inset-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl blur opacity-30 animate-pulse" />
                        <div className="relative p-3 bg-[#12121f] rounded-xl border border-yellow-500/30">
                            <Trophy className="w-8 h-8 text-yellow-400" />
                        </div>
                    </div>
                    <div>
                        <h1 className="font-orbitron text-2xl lg:text-3xl font-bold text-white tracking-wide">
                            LEADERBOARD
                        </h1>
                        <p className="font-mono text-white/50 text-sm mt-1">
                            All subjects ranked by total score • {subjects.length} entries
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Stats Bar */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
            >
                <div className="data-module p-4">
                    <div className="flex items-center gap-2 mb-1">
                        <Hash className="w-4 h-4 text-cyan-400" />
                        <span className="font-mono text-[10px] text-white/40 uppercase">Total Subjects</span>
                    </div>
                    <p className="font-orbitron text-2xl text-cyan-400">{subjects.length}</p>
                </div>
                <div className="data-module p-4">
                    <div className="flex items-center gap-2 mb-1">
                        <Trophy className="w-4 h-4 text-yellow-400" />
                        <span className="font-mono text-[10px] text-white/40 uppercase">Top Score</span>
                    </div>
                    <p className="font-orbitron text-2xl text-yellow-400">{maxScore}</p>
                </div>
                <div className="data-module p-4">
                    <div className="flex items-center gap-2 mb-1">
                        <Medal className="w-4 h-4 text-purple-400" />
                        <span className="font-mono text-[10px] text-white/40 uppercase">Leader</span>
                    </div>
                    <p className="font-orbitron text-lg text-purple-400 truncate">
                        {subjects[0]?.name || "N/A"}
                    </p>
                </div>
                <div className="data-module p-4">
                    <div className="flex items-center gap-2 mb-1">
                        <TrendingUp className="w-4 h-4 text-green-400" />
                        <span className="font-mono text-[10px] text-white/40 uppercase">Avg Rating</span>
                    </div>
                    <p className="font-orbitron text-2xl text-green-400">
                        {subjects.length > 0
                            ? Math.round(subjects.reduce((a, s) => a + s.avgPercent, 0) / subjects.length)
                            : 0}%
                    </p>
                </div>
            </motion.div>

            {/* Leaderboard Table */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="data-module p-6"
            >
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-4 px-4 py-3 mb-4 border-b border-white/10">
                    <div className="col-span-1 font-mono text-[10px] text-white/40 uppercase">Rank</div>
                    <div className="col-span-5 font-mono text-[10px] text-white/40 uppercase">Subject</div>
                    <div className="col-span-2 font-mono text-[10px] text-white/40 uppercase text-center">Entries</div>
                    <div className="col-span-2 font-mono text-[10px] text-white/40 uppercase text-center">Avg %</div>
                    <div className="col-span-2 font-mono text-[10px] text-white/40 uppercase text-right">Total Score</div>
                </div>

                {/* Rows */}
                <div className="space-y-2">
                    {subjects.length === 0 ? (
                        <p className="font-mono text-sm text-white/40 py-12 text-center">No data available</p>
                    ) : (
                        subjects.map((subject, index) => {
                            const style = getRankStyle(index)
                            return (
                                <motion.div
                                    key={subject.name}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 + index * 0.03 }}
                                    onClick={() => setSelectedSubject(subject.name)}
                                    className={`grid grid-cols-12 gap-4 items-center p-4 rounded-lg border transition-all hover:scale-[1.01] cursor-pointer ${style.row}`}
                                >
                                    {/* Rank */}
                                    <div className="col-span-1">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-orbitron text-sm font-bold ${style.badge}`}>
                                            {index + 1}
                                        </div>
                                    </div>

                                    {/* Subject Name & Progress Bar */}
                                    <div className="col-span-5">
                                        <div className="flex items-center gap-2 mb-2">
                                            {getSubjectIcon(subject.name)}
                                            <p className="font-mono text-sm text-white truncate">{subject.name}</p>
                                        </div>
                                        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${(subject.totalScore / maxScore) * 100}%` }}
                                                transition={{ delay: 0.5 + index * 0.03, duration: 0.8, ease: "easeOut" }}
                                                className={`h-full rounded-full bg-gradient-to-r ${style.bar}`}
                                            />
                                        </div>
                                    </div>

                                    {/* Feedback Count */}
                                    <div className="col-span-2 text-center">
                                        <span className="font-mono text-sm text-white/60">{subject.feedbackCount}</span>
                                    </div>

                                    {/* Average Percent */}
                                    <div className="col-span-2 text-center">
                                        <span className={`font-mono text-sm ${subject.avgPercent >= 80 ? 'text-green-400' : subject.avgPercent >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                                            {subject.avgPercent}%
                                        </span>
                                    </div>

                                    {/* Total Score */}
                                    <div className="col-span-2 text-right">
                                        <span className={`font-orbitron text-xl font-bold ${style.text}`}>
                                            {subject.totalScore}
                                        </span>
                                    </div>
                                </motion.div>
                            )
                        })
                    )}
                </div>
            </motion.div>

            {/* Full-page Modal for Subject Feedback */}
            <AnimatePresence>
                {selectedSubject && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 lg:p-8"
                        onClick={() => setSelectedSubject(null)}
                    >
                        {/* Backdrop */}
                        <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />

                        {/* Modal Content */}
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            onClick={(e) => e.stopPropagation()}
                            className="relative w-full max-w-5xl max-h-[85vh] overflow-hidden rounded-2xl bg-[#0c0c16] border border-cyan-500/30 shadow-2xl shadow-cyan-500/10"
                        >
                            {/* Neon edge glow */}
                            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
                            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent" />

                            {/* Header */}
                            <div className="sticky top-0 z-10 bg-[#0c0c16]/95 backdrop-blur-xl border-b border-white/10 p-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/30">
                                            {getSubjectIcon(selectedSubject, "w-6 h-6")}
                                        </div>
                                        <div>
                                            <h2 className="font-orbitron text-xl lg:text-2xl font-bold text-white">
                                                {selectedSubject}
                                            </h2>
                                            <p className="font-mono text-sm text-white/50">
                                                {subjectFeedback.length} feedback entries
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setSelectedSubject(null)}
                                        className="relative px-5 py-2.5 rounded-lg font-orbitron text-sm font-bold tracking-wider uppercase
                                            bg-[#12121f] border border-cyan-500/50 text-cyan-400 
                                            hover:border-red-500/70 hover:text-red-400 hover:shadow-[0_0_20px_rgba(239,68,68,0.3)]
                                            active:border-pink-500 active:text-pink-300 active:shadow-[0_0_25px_rgba(236,72,153,0.5)] active:scale-95
                                            transition-all duration-200 group"
                                    >
                                        {/* Gradient background on hover */}
                                        <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-red-500/0 via-red-500/10 to-red-500/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <span className="relative z-10 flex items-center gap-2">
                                            <X className="w-4 h-4" />
                                            CLOSE
                                        </span>
                                    </button>
                                </div>
                            </div>

                            {/* Table Content */}
                            <div className="overflow-auto max-h-[calc(85vh-120px)] p-6">
                                {/* Table Header */}
                                <div className="grid grid-cols-12 gap-4 px-4 py-3 mb-4 bg-white/5 rounded-lg border border-white/10">
                                    <div className="col-span-1 font-mono text-[10px] text-white/40 uppercase">#</div>
                                    <div className="col-span-2 font-mono text-[10px] text-white/40 uppercase">Role</div>
                                    <div className="col-span-4 font-mono text-[10px] text-white/40 uppercase">Ratings (Q1-Q6)</div>
                                    <div className="col-span-1 font-mono text-[10px] text-white/40 uppercase text-center">Total</div>
                                    <div className="col-span-2 font-mono text-[10px] text-white/40 uppercase text-center">Rating</div>
                                    <div className="col-span-2 font-mono text-[10px] text-white/40 uppercase text-right">Date</div>
                                </div>

                                {/* Feedback Rows */}
                                <div className="space-y-2">
                                    {subjectFeedback.length === 0 ? (
                                        <p className="font-mono text-sm text-white/40 py-12 text-center">No feedback found</p>
                                    ) : (
                                        subjectFeedback.map((feedback, index) => (
                                            <motion.div
                                                key={feedback.id}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.02 }}
                                                className="grid grid-cols-12 gap-4 items-center p-4 rounded-lg bg-white/[0.02] border border-white/5 hover:border-cyan-500/30 transition-all"
                                            >
                                                {/* Index */}
                                                <div className="col-span-1">
                                                    <span className="font-mono text-xs text-white/40">{index + 1}</span>
                                                </div>

                                                {/* User Role */}
                                                <div className="col-span-2">
                                                    <div className="flex items-center gap-2">
                                                        <User className="w-4 h-4 text-purple-400" />
                                                        <span className="font-mono text-sm text-white/80">{feedback.user_role}</span>
                                                    </div>
                                                </div>

                                                {/* Individual Ratings */}
                                                <div className="col-span-4">
                                                    <div className="flex gap-1.5">
                                                        {[feedback.q1, feedback.q2, feedback.q3, feedback.q4, feedback.q5, feedback.q6].map((q, i) => (
                                                            <div
                                                                key={i}
                                                                className={`w-8 h-8 rounded-md flex items-center justify-center font-mono text-xs font-bold
                                                                    ${q >= 4 ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                                                                        q >= 3 ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                                                                            'bg-red-500/20 text-red-400 border border-red-500/30'}`}
                                                            >
                                                                {q}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Total */}
                                                <div className="col-span-1 text-center">
                                                    <span className="font-orbitron text-sm font-bold text-cyan-400">{feedback.total}</span>
                                                </div>

                                                {/* Percent */}
                                                <div className="col-span-2 text-center">
                                                    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-mono
                                                        ${feedback.percent >= 80 ? 'bg-green-500/20 text-green-400' :
                                                            feedback.percent >= 60 ? 'bg-yellow-500/20 text-yellow-400' :
                                                                'bg-red-500/20 text-red-400'}`}>
                                                        <Star className="w-3 h-3" />
                                                        {feedback.percent}%
                                                    </div>
                                                </div>

                                                {/* Date */}
                                                <div className="col-span-2 text-right">
                                                    <div className="flex items-center justify-end gap-1.5 text-white/40">
                                                        <Calendar className="w-3 h-3" />
                                                        <span className="font-mono text-xs">
                                                            {new Date(feedback.created_at).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </AdminSidebar>
    )
}
