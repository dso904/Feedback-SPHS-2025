"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AdminSidebar } from "@/components/admin/sidebar"
import { DashboardSkeleton } from "@/components/admin/skeletons"
import {
    TrendingUp,
    Users,
    Star,
    BarChart3,
    Download,
    ChevronRight,
    MessageSquare,
    BookOpen,
    Clock,
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
    BarChart,
    Bar,
} from "recharts"
import type { Feedback } from "@/lib/types"
import { formatDate } from "@/lib/utils"

const COLORS = ["#8b5cf6", "#06b6d4", "#ec4899", "#f59e0b", "#10b981"]

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
                    if (f.project?.name) {
                        projectCounts[f.project.name] = (projectCounts[f.project.name] || 0) + 1
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

    // Chart data
    const roleDistribution = feedback.reduce((acc: Record<string, number>, f) => {
        acc[f.user_role] = (acc[f.user_role] || 0) + 1
        return acc
    }, {})
    const pieData = Object.entries(roleDistribution).map(([name, value]) => ({ name, value }))

    const questionAvg = {
        q1: feedback.length ? feedback.reduce((a, f) => a + f.q1, 0) / feedback.length : 0,
        q2: feedback.length ? feedback.reduce((a, f) => a + f.q2, 0) / feedback.length : 0,
        q3: feedback.length ? feedback.reduce((a, f) => a + f.q3, 0) / feedback.length : 0,
        q4: feedback.length ? feedback.reduce((a, f) => a + f.q4, 0) / feedback.length : 0,
        q5: feedback.length ? feedback.reduce((a, f) => a + f.q5, 0) / feedback.length : 0,
        q6: feedback.length ? feedback.reduce((a, f) => a + f.q6, 0) / feedback.length : 0,
    }
    const barData = [
        { name: "Topic", rating: questionAvg.q1.toFixed(1) },
        { name: "Comm.", rating: questionAvg.q2.toFixed(1) },
        { name: "Creative", rating: questionAvg.q3.toFixed(1) },
        { name: "Clarity", rating: questionAvg.q4.toFixed(1) },
        { name: "Enthus.", rating: questionAvg.q5.toFixed(1) },
        { name: "Overall", rating: questionAvg.q6.toFixed(1) },
    ]

    const weeklyData = Array.from({ length: 7 }, (_, i) => {
        const date = new Date()
        date.setDate(date.getDate() - (6 - i))
        const dayFeedback = feedback.filter((f) => {
            const fDate = new Date(f.created_at)
            return fDate.toDateString() === date.toDateString()
        })
        return { day: date.toLocaleDateString("en-US", { weekday: "short" }), count: dayFeedback.length }
    })

    // Recent activity
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
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white mb-2">Dashboard Overview</h1>
                <p className="text-slate-600 dark:text-white/60">Welcome back! Here&apos;s what&apos;s happening.</p>
            </motion.div>

            {/* Stats Cards - Clickable */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
                <StatCard
                    icon={<MessageSquare className="w-5 h-5 lg:w-6 lg:h-6" />}
                    title="Total Feedback"
                    value={stats.totalFeedback.toString()}
                    change="+12%"
                    color="purple"
                    href="/admin/feedback"
                />
                <StatCard
                    icon={<Star className="w-5 h-5 lg:w-6 lg:h-6" />}
                    title="Avg Rating"
                    value={`${stats.avgRating}%`}
                    change="+5%"
                    color="cyan"
                    href="/admin/feedback"
                />
                <StatCard
                    icon={<TrendingUp className="w-5 h-5 lg:w-6 lg:h-6" />}
                    title="This Week"
                    value={stats.thisWeek.toString()}
                    change="New"
                    color="pink"
                    href="/admin/feedback"
                />
                <StatCard
                    icon={<Users className="w-5 h-5 lg:w-6 lg:h-6" />}
                    title="Top Subject"
                    value={stats.topProject.length > 12 ? stats.topProject.slice(0, 12) + "..." : stats.topProject}
                    change="Most rated"
                    color="amber"
                    href="/admin/subjects"
                />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <Card className="bg-white dark:bg-slate-900/50 border-slate-200 dark:border-white/5">
                    <CardHeader>
                        <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-purple-500" />
                            Weekly Trend
                        </CardTitle>
                        <CardDescription className="text-slate-500 dark:text-white/40">Last 7 days</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-48 lg:h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={weeklyData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                                    <XAxis dataKey="day" stroke="#ffffff40" fontSize={12} />
                                    <YAxis stroke="#ffffff40" fontSize={12} />
                                    <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #ffffff10", borderRadius: "8px" }} />
                                    <Line type="monotone" dataKey="count" stroke="url(#lineGradient)" strokeWidth={3} dot={{ fill: "#8b5cf6" }} />
                                    <defs>
                                        <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                                            <stop offset="0%" stopColor="#8b5cf6" />
                                            <stop offset="100%" stopColor="#06b6d4" />
                                        </linearGradient>
                                    </defs>
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white dark:bg-slate-900/50 border-slate-200 dark:border-white/5">
                    <CardHeader>
                        <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2">
                            <Users className="w-5 h-5 text-cyan-500" />
                            User Roles
                        </CardTitle>
                        <CardDescription className="text-slate-500 dark:text-white/40">Who&apos;s giving feedback</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-48 lg:h-64 flex items-center justify-center">
                            {pieData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value">
                                            {pieData.map((_, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #ffffff10", borderRadius: "8px" }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <p className="text-slate-400 dark:text-white/40">No data yet</p>
                            )}
                        </div>
                        <div className="flex flex-wrap justify-center gap-3 mt-2">
                            {pieData.map((item, i) => (
                                <div key={item.name} className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                                    <span className="text-slate-600 dark:text-white/60 text-xs">{item.name}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Ratings & Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Ratings Chart */}
                <Card className="lg:col-span-2 bg-white dark:bg-slate-900/50 border-slate-200 dark:border-white/5">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2">
                                <Star className="w-5 h-5 text-amber-500" />
                                Average Ratings
                            </CardTitle>
                            <CardDescription className="text-slate-500 dark:text-white/40">By question</CardDescription>
                        </div>
                        <Link href="/api/export" target="_blank">
                            <Button variant="outline" size="sm" className="bg-white/5 dark:border-white/10 dark:text-white dark:hover:bg-white/10">
                                <Download className="w-4 h-4 mr-2" />
                                Export
                            </Button>
                        </Link>
                    </CardHeader>
                    <CardContent>
                        <div className="h-48 lg:h-56">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={barData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                                    <XAxis dataKey="name" stroke="#ffffff40" fontSize={11} />
                                    <YAxis domain={[0, 5]} stroke="#ffffff40" fontSize={12} />
                                    <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #ffffff10", borderRadius: "8px" }} />
                                    <Bar dataKey="rating" fill="url(#barGradient)" radius={[4, 4, 0, 0]} />
                                    <defs>
                                        <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#8b5cf6" />
                                            <stop offset="100%" stopColor="#ec4899" />
                                        </linearGradient>
                                    </defs>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card className="bg-white dark:bg-slate-900/50 border-slate-200 dark:border-white/5">
                    <CardHeader>
                        <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2">
                            <Clock className="w-5 h-5 text-green-500" />
                            Recent Activity
                        </CardTitle>
                        <CardDescription className="text-slate-500 dark:text-white/40">Latest feedback</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {recentFeedback.length === 0 ? (
                            <p className="text-slate-400 dark:text-white/40 text-center py-4">No activity yet</p>
                        ) : (
                            recentFeedback.map((f, i) => (
                                <motion.div
                                    key={f.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                                >
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-white text-xs font-bold">
                                        {f.percent}%
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-slate-900 dark:text-white text-sm font-medium truncate">{f.project?.name}</p>
                                        <p className="text-slate-500 dark:text-white/40 text-xs">{f.user_role}</p>
                                    </div>
                                    <span className="text-slate-400 dark:text-white/30 text-xs whitespace-nowrap">
                                        {formatDate(f.created_at, { dateStyle: "short" })}
                                    </span>
                                </motion.div>
                            ))
                        )}
                        {recentFeedback.length > 0 && (
                            <Link href="/admin/feedback">
                                <Button variant="ghost" className="w-full text-slate-600 dark:text-white/60 hover:text-purple-500 dark:hover:text-purple-400">
                                    View All
                                    <ChevronRight className="w-4 h-4 ml-1" />
                                </Button>
                            </Link>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                <QuickAction title="View Feedback" description="See all entries" href="/admin/feedback" icon={<MessageSquare className="w-5 h-5" />} />
                <QuickAction title="Subjects" description="Manage subjects" href="/admin/subjects" icon={<BookOpen className="w-5 h-5" />} />
                <QuickAction title="Export" description="Download CSV" href="/api/export" icon={<Download className="w-5 h-5" />} />
            </div>
        </AdminSidebar>
    )
}

function StatCard({ icon, title, value, change, color, href }: { icon: React.ReactNode; title: string; value: string; change: string; color: string; href: string }) {
    const colors: Record<string, string> = {
        purple: "from-purple-500 to-purple-600",
        cyan: "from-cyan-500 to-cyan-600",
        pink: "from-pink-500 to-pink-600",
        amber: "from-amber-500 to-amber-600",
    }

    return (
        <Link href={href}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} whileHover={{ scale: 1.02 }} className="cursor-pointer">
                <Card className="bg-white dark:bg-slate-900/50 border-slate-200 dark:border-white/5 hover:border-purple-500/30 transition-colors">
                    <CardContent className="p-4 lg:p-6">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-slate-500 dark:text-white/60 text-xs lg:text-sm">{title}</p>
                                <p className="text-xl lg:text-2xl font-bold text-slate-900 dark:text-white mt-1">{value}</p>
                                <p className="text-xs text-purple-500 mt-1">{change}</p>
                            </div>
                            <div className={`p-2 lg:p-3 rounded-xl bg-gradient-to-br ${colors[color]} text-white`}>{icon}</div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </Link>
    )
}

function QuickAction({ title, description, href, icon }: { title: string; description: string; href: string; icon: React.ReactNode }) {
    return (
        <Link href={href}>
            <Card className="bg-white dark:bg-slate-900/50 border-slate-200 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group">
                <CardContent className="p-4 flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-white/60 group-hover:text-purple-500 transition-colors">{icon}</div>
                    <div className="flex-1">
                        <h3 className="text-slate-900 dark:text-white font-medium text-sm">{title}</h3>
                        <p className="text-slate-500 dark:text-white/40 text-xs">{description}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 dark:text-white/20 group-hover:text-slate-500 dark:group-hover:text-white/60 transition-colors" />
                </CardContent>
            </Card>
        </Link>
    )
}
