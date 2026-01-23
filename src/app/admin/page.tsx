"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState, useRef } from "react"
import { motion } from "framer-motion"
import { AdminSidebar } from "@/components/admin/sidebar"
import { DashboardSkeleton } from "@/components/admin/skeletons"
import {
    Trophy,
    Users,
    Star,
    BarChart3,
    Download,
    ChevronRight,
    MessageSquare,
    BookOpen,
    Activity,
    Zap,
    Database,
    Clock,
    Atom, Cpu, Calculator, Palette, Globe2, Landmark, Languages, Music, Stethoscope, Briefcase, Dna
} from "lucide-react"
import Link from "next/link"
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from "recharts"
import type { Feedback } from "@/lib/types"

const NEON_COLORS = ["#00f0ff", "#a855f7", "#ff0080", "#00ff88", "#ff6b00"]

// Icon mapping function
const getSubjectIcon = (subject: string) => {
    const s = subject.toLowerCase()
    if (s.includes('computer') || s.includes('tech') || s.includes('code') || s.includes('ai')) return <Cpu className="w-4 h-4 text-cyan-400" />
    if (s.includes('science') || s.includes('physics') || s.includes('chem')) return <Atom className="w-4 h-4 text-purple-400" />
    if (s.includes('bio') || s.includes('eco') || s.includes('nature')) return <Dna className="w-4 h-4 text-green-400" />
    if (s.includes('math') || s.includes('calc')) return <Calculator className="w-4 h-4 text-orange-400" />
    if (s.includes('art') || s.includes('design') || s.includes('paint')) return <Palette className="w-4 h-4 text-pink-400" />
    if (s.includes('history') || s.includes('social')) return <Landmark className="w-4 h-4 text-yellow-400" />
    if (s.includes('geo') || s.includes('earth')) return <Globe2 className="w-4 h-4 text-blue-400" />
    if (s.includes('english') || s.includes('lang')) return <Languages className="w-4 h-4 text-red-400" />
    if (s.includes('music') || s.includes('sound')) return <Music className="w-4 h-4 text-violet-400" />
    if (s.includes('doctor') || s.includes('health') || s.includes('med')) return <Stethoscope className="w-4 h-4 text-teal-400" />
    if (s.includes('business') || s.includes('commerce')) return <Briefcase className="w-4 h-4 text-indigo-400" />
    return <BookOpen className="w-4 h-4 text-white/50" />
}

// Animated counter hook
function useAnimatedCounter(end: number, duration: number = 2500) {
    const [count, setCount] = useState(0)
    const countRef = useRef(0)

    useEffect(() => {
        const startTime = Date.now()
        const animate = () => {
            const elapsed = Date.now() - startTime
            const progress = Math.min(elapsed / duration, 1)
            const eased = 1 - Math.pow(1 - progress, 3) // Ease out cubic
            countRef.current = Math.floor(eased * end)
            setCount(countRef.current)
            if (progress < 1) requestAnimationFrame(animate)
        }
        animate()
    }, [end, duration])

    return count
}

export default function AdminDashboard() {
    const { status } = useSession()
    const router = useRouter()
    const [feedback, setFeedback] = useState<Feedback[]>([])
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState({
        totalFeedback: 0,
        avgRating: 0,
        thisWeek: 0,
        topProject: "",
    })

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/admin/login")
        }
    }, [status, router])

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const res = await fetch("/api/feedback")
            const data = await res.json()
            setFeedback(data || [])

            if (data && data.length > 0) {
                const avgPercent = data.reduce((acc: number, f: Feedback) => acc + (f.percent || 0), 0) / data.length
                const weekAgo = new Date()
                weekAgo.setDate(weekAgo.getDate() - 7)
                const thisWeekCount = data.filter((f: Feedback) => new Date(f.created_at) > weekAgo).length

                const projectCounts: Record<string, number> = {}
                data.forEach((f: Feedback) => {
                    const name = f.subject || f.project?.name
                    if (name) {
                        projectCounts[name] = (projectCounts[name] || 0) + 1
                    }
                })
                const topProject = Object.entries(projectCounts).sort((a, b) => b[1] - a[1])[0]

                setStats({
                    totalFeedback: data.length,
                    avgRating: Math.round(avgPercent),
                    thisWeek: thisWeekCount,
                    topProject: topProject ? topProject[0] : "N/A",
                })
            }
        } catch (error) {
            console.error("Failed to fetch data:", error)
        } finally {
            setLoading(false)
        }
    }

    // Chart data processing
    const roleDistribution = feedback.reduce((acc: Record<string, number>, f) => {
        acc[f.user_role] = (acc[f.user_role] || 0) + 1
        return acc
    }, {})
    const pieData = Object.entries(roleDistribution).map(([name, value]) => ({ name, value }))

    // Top 5 subjects by total score
    const subjectTotals: Record<string, number> = {}
    feedback.forEach((f) => {
        const subject = f.subject || f.project?.name
        if (subject) {
            subjectTotals[subject] = (subjectTotals[subject] || 0) + f.total
        }
    })
    const topSubjects = Object.entries(subjectTotals)
        .map(([name, totalScore]) => ({ name, totalScore }))
        .sort((a, b) => b.totalScore - a.totalScore)
        .slice(0, 5)
    const maxScore = topSubjects.length > 0 ? topSubjects[0].totalScore : 1

    const weeklyData = Array.from({ length: 7 }, (_, i) => {
        const date = new Date()
        date.setDate(date.getDate() - (6 - i))
        const dayFeedback = feedback.filter((f) => {
            const fDate = new Date(f.created_at)
            return fDate.toDateString() === date.toDateString()
        })
        return { day: date.toLocaleDateString("en-US", { weekday: "short" }), count: dayFeedback.length }
    })

    const recentFeedback = feedback.slice(0, 5)

    if (status === "loading" || loading) {
        return (
            <AdminSidebar>
                <DashboardSkeleton />
            </AdminSidebar>
        )
    }

    return (
        <AdminSidebar>
            {/* Command Center Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <div className="flex items-center gap-3 mb-2">
                    <div className="pulse-dot" />
                    <span className="font-mono text-xs text-cyan-400 uppercase tracking-widest">System Active</span>
                </div>
                <h1 className="font-orbitron text-2xl lg:text-3xl font-bold text-white tracking-wide">
                    COMMAND CENTER
                </h1>
                <p className="font-mono text-white/50 text-sm mt-1">Real-time analytics dashboard • All systems nominal</p>
            </motion.div>

            {/* Data Modules Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5 mb-8">
                <DataModule
                    icon={<Database className="w-5 h-5" />}
                    label="TOTAL ENTRIES"
                    value={stats.totalFeedback}
                    suffix=""
                    color="cyan"
                    href="/admin/feedback"
                    delay={0}
                />
                <DataModule
                    icon={<Activity className="w-5 h-5" />}
                    label="AVG RATING"
                    value={stats.avgRating}
                    suffix="%"
                    color="purple"
                    href="/admin/feedback"
                    delay={0}
                />
                <DataModule
                    icon={<Zap className="w-5 h-5" />}
                    label="THIS WEEK"
                    value={stats.thisWeek}
                    suffix=""
                    color="green"
                    href="/admin/feedback"
                    delay={0}
                />
                <DataModule
                    icon={<Star className="w-5 h-5" />}
                    label="TOP SUBJECT"
                    value={0}
                    suffix=""
                    text={stats.topProject.length > 10 ? stats.topProject.slice(0, 10) + "..." : stats.topProject}
                    color="pink"
                    href="/admin/subjects"
                    delay={0}
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Weekly Trend Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="data-module p-5"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="font-orbitron text-sm text-white tracking-wide">WEEKLY TREND</h3>
                            <p className="font-mono text-xs text-white/40">Last 7 days activity</p>
                        </div>
                        <BarChart3 className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div className="h-56 chart-container rounded-lg">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={weeklyData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,240,255,0.1)" />
                                <XAxis dataKey="day" stroke="rgba(255,255,255,0.4)" fontSize={10} fontFamily="JetBrains Mono" />
                                <YAxis stroke="rgba(255,255,255,0.4)" fontSize={10} fontFamily="JetBrains Mono" />
                                <Tooltip
                                    contentStyle={{
                                        background: 'rgba(12,12,22,0.95)',
                                        border: '1px solid rgba(0,240,255,0.3)',
                                        borderRadius: '8px',
                                        fontFamily: 'JetBrains Mono',
                                        fontSize: '12px'
                                    }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="count"
                                    stroke="#00f0ff"
                                    strokeWidth={2}
                                    dot={{ fill: '#00f0ff', strokeWidth: 2, r: 4 }}
                                    activeDot={{ r: 6, fill: '#00f0ff', stroke: '#0a0a12', strokeWidth: 2 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Top 5 Subjects Leaderboard */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="data-module p-5"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="font-orbitron text-sm text-white tracking-wide">TOP 5 SUBJECTS</h3>
                            <p className="font-mono text-xs text-white/40">Ranked by total score</p>
                        </div>
                        <Trophy className="w-5 h-5 text-yellow-400" />
                    </div>
                    <div className="space-y-3">
                        {topSubjects.length === 0 ? (
                            <p className="font-mono text-sm text-white/40 py-8 text-center">No data available</p>
                        ) : (
                            topSubjects.map((subject, index) => (
                                <motion.div
                                    key={subject.name}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.4 + index * 0.1 }}
                                    className="relative group"
                                >
                                    <div className="flex items-center gap-3 p-2.5 rounded-lg bg-white/[0.02] border border-white/5 hover:border-purple-500/40 transition-all hover:bg-purple-500/5">
                                        {/* Rank Badge */}
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-orbitron text-sm font-bold
                                            ${index === 0 ? 'bg-gradient-to-br from-yellow-500/30 to-orange-500/30 text-yellow-400 shadow-lg shadow-yellow-500/20' :
                                                index === 1 ? 'bg-gradient-to-br from-slate-300/20 to-slate-400/20 text-slate-300' :
                                                    index === 2 ? 'bg-gradient-to-br from-amber-600/20 to-amber-700/20 text-amber-500' :
                                                        'bg-white/5 text-white/40'}`}
                                        >
                                            {index + 1}
                                        </div>
                                        {/* Subject Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                {getSubjectIcon(subject.name)}
                                                <p className="font-mono text-sm text-white truncate">{subject.name}</p>
                                            </div>
                                            {/* Progress Bar */}
                                            <div className="mt-1.5 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${(subject.totalScore / maxScore) * 100}%` }}
                                                    transition={{ delay: 0.5 + index * 0.1, duration: 0.8, ease: "easeOut" }}
                                                    className={`h-full rounded-full ${index === 0 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' : 'bg-gradient-to-r from-cyan-500 to-purple-500'}`}
                                                />
                                            </div>
                                        </div>
                                        {/* Score */}
                                        <div className={`font-orbitron text-lg font-bold ${index === 0 ? 'text-yellow-400' : 'text-cyan-400'}`}>
                                            {subject.totalScore}
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                </motion.div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Role Distribution */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="data-module p-5"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="font-orbitron text-sm text-white tracking-wide">USER ROLES</h3>
                            <p className="font-mono text-xs text-white/40">Distribution</p>
                        </div>
                        <Users className="w-5 h-5 text-pink-400" />
                    </div>
                    <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={40}
                                    outerRadius={70}
                                    paddingAngle={3}
                                    dataKey="value"
                                    strokeWidth={0}
                                >
                                    {pieData.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={NEON_COLORS[index % NEON_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        background: 'rgba(12,12,22,0.95)',
                                        border: '1px solid rgba(0,240,255,0.3)',
                                        borderRadius: '8px',
                                        fontFamily: 'JetBrains Mono',
                                        fontSize: '12px'
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                        {pieData.map((item, i) => (
                            <div key={item.name} className="flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full" style={{ background: NEON_COLORS[i % NEON_COLORS.length] }} />
                                <span className="font-mono text-[10px] text-white/60">{item.name}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Recent Activity */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="data-module p-5 lg:col-span-2"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="font-orbitron text-sm text-white tracking-wide">RECENT ACTIVITY</h3>
                            <p className="font-mono text-xs text-white/40">Latest feedback entries</p>
                        </div>
                        <Clock className="w-5 h-5 text-green-400" />
                    </div>
                    <div className="space-y-2">
                        {recentFeedback.length === 0 ? (
                            <p className="font-mono text-sm text-white/40 py-4 text-center">No data available</p>
                        ) : (
                            recentFeedback.map((f, i) => (
                                <motion.div
                                    key={f.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.6 + i * 0.1 }}
                                    className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/5 hover:border-cyan-500/30 transition-colors group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center">
                                            <MessageSquare className="w-4 h-4 text-cyan-400" />
                                        </div>
                                        <div>
                                            <p className="font-mono text-sm text-white">{f.subject || f.project?.name || "Unknown"}</p>
                                            <p className="font-mono text-[10px] text-white/40">{f.user_role}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-orbitron text-sm text-cyan-400">{f.percent}%</p>
                                        <p className="font-mono text-[10px] text-white/40">
                                            {new Date(f.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                    {feedback.length > 5 && (
                        <Link href="/admin/feedback" className="block mt-4">
                            <div className="flex items-center justify-center gap-2 p-2 rounded-lg border border-cyan-500/20 hover:border-cyan-500/40 hover:bg-cyan-500/5 transition-colors group">
                                <span className="font-mono text-xs text-cyan-400">VIEW ALL DATA</span>
                                <ChevronRight className="w-4 h-4 text-cyan-400 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </Link>
                    )}
                </motion.div>
            </div>

            {/* Quick Actions */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8"
            >
                <QuickAction
                    title="Data Stream"
                    description="Access all feedback entries"
                    href="/admin/feedback"
                    icon={<MessageSquare className="w-5 h-5" />}
                    color="cyan"
                />
                <QuickAction
                    title="Subjects"
                    description="Manage subject database"
                    href="/admin/subjects"
                    icon={<BookOpen className="w-5 h-5" />}
                    color="purple"
                />
                <QuickAction
                    title="Export Data"
                    description="Download CSV report"
                    href="/api/export"
                    icon={<Download className="w-5 h-5" />}
                    color="green"
                />
            </motion.div>
        </AdminSidebar>
    )
}

// Data Module Component
function DataModule({
    icon,
    label,
    value,
    suffix = "",
    text,
    color,
    href,
    delay
}: {
    icon: React.ReactNode
    label: string
    value: number
    suffix?: string
    text?: string
    color: "cyan" | "purple" | "green" | "pink"
    href: string
    delay: number
}) {
    const animatedValue = useAnimatedCounter(value)

    const colors = {
        cyan: { border: "border-cyan-500/30", glow: "shadow-cyan-500/20", text: "text-cyan-400", bg: "from-cyan-500/10" },
        purple: { border: "border-purple-500/30", glow: "shadow-purple-500/20", text: "text-purple-400", bg: "from-purple-500/10" },
        green: { border: "border-green-500/30", glow: "shadow-green-500/20", text: "text-green-400", bg: "from-green-500/10" },
        pink: { border: "border-pink-500/30", glow: "shadow-pink-500/20", text: "text-pink-400", bg: "from-pink-500/10" },
    }

    const c = colors[color]

    return (
        <Link href={href}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay }}
                whileHover={{ scale: 1.02, y: -2 }}
                className={`relative p-4 lg:p-5 rounded-xl bg-[#12121f]/60 border ${c.border} hover:${c.glow} hover:shadow-lg transition-all cursor-pointer group overflow-hidden`}
            >
                {/* Corner accents */}
                <div className={`absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 ${c.border} rounded-tl-xl`} />
                <div className={`absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 ${c.border} rounded-br-xl`} />

                {/* Gradient overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br ${c.bg} to-transparent opacity-0 group-hover:opacity-100 transition-opacity`} />

                {/* Content */}
                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-3">
                        <span className="font-mono text-[10px] text-white/40 uppercase tracking-widest">{label}</span>
                        <div className={c.text}>{icon}</div>
                    </div>
                    <p className={`font-orbitron text-2xl lg:text-3xl font-bold ${c.text}`}>
                        {text || `${animatedValue}${suffix}`}
                    </p>
                </div>
            </motion.div>
        </Link>
    )
}

// Quick Action Component
function QuickAction({
    title,
    description,
    href,
    icon,
    color
}: {
    title: string
    description: string
    href: string
    icon: React.ReactNode
    color: "cyan" | "purple" | "green"
}) {
    const colors = {
        cyan: { border: "hover:border-cyan-500/40", text: "text-cyan-400", glow: "group-hover:shadow-cyan-500/10" },
        purple: { border: "hover:border-purple-500/40", text: "text-purple-400", glow: "group-hover:shadow-purple-500/10" },
        green: { border: "hover:border-green-500/40", text: "text-green-400", glow: "group-hover:shadow-green-500/10" },
    }
    const c = colors[color]

    return (
        <Link href={href}>
            <div className={`p-4 rounded-xl bg-[#12121f]/40 border border-white/5 ${c.border} group transition-all hover:bg-white/[0.02] cursor-pointer ${c.glow} hover:shadow-lg`}>
                <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-lg bg-white/5 ${c.text} group-hover:bg-white/10 transition-colors`}>
                        {icon}
                    </div>
                    <div className="flex-1">
                        <h3 className="font-mono text-sm text-white">{title}</h3>
                        <p className="font-mono text-[10px] text-white/40">{description}</p>
                    </div>
                    <ChevronRight className={`w-4 h-4 text-white/20 ${c.text.replace('text-', 'group-hover:text-')} group-hover:translate-x-1 transition-all`} />
                </div>
            </div>
        </Link>
    )
}
