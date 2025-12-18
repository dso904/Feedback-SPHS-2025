"use client"

import { motion } from "framer-motion"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export function DashboardSkeleton() {
    return (
        <div className="space-y-8">
            {/* Header skeleton */}
            <div>
                <Skeleton className="h-8 w-64 bg-white/5 mb-2" />
                <Skeleton className="h-4 w-48 bg-white/5" />
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                    >
                        <Card className="bg-slate-900/50 border-white/5">
                            <CardContent className="p-6">
                                <div className="flex justify-between">
                                    <div className="space-y-3">
                                        <Skeleton className="h-4 w-24 bg-white/5" />
                                        <Skeleton className="h-8 w-16 bg-white/5" />
                                        <Skeleton className="h-3 w-12 bg-white/5" />
                                    </div>
                                    <Skeleton className="h-12 w-12 rounded-xl bg-white/5" />
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Charts grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {[...Array(2)].map((_, i) => (
                    <Card key={i} className="bg-slate-900/50 border-white/5">
                        <CardHeader>
                            <Skeleton className="h-6 w-48 bg-white/5" />
                            <Skeleton className="h-4 w-32 bg-white/5" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-64 w-full bg-white/5 rounded-lg" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
    return (
        <div className="space-y-3">
            {/* Header */}
            <div className="grid grid-cols-5 gap-4 pb-4 border-b border-white/10">
                {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-4 bg-white/5" />
                ))}
            </div>
            {/* Rows */}
            {[...Array(rows)].map((_, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="grid grid-cols-5 gap-4 py-4 border-b border-white/5"
                >
                    {[...Array(5)].map((_, j) => (
                        <Skeleton key={j} className="h-4 bg-white/5" />
                    ))}
                </motion.div>
            ))}
        </div>
    )
}

export function CardsSkeleton({ count = 6 }: { count?: number }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(count)].map((_, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                >
                    <Card className="bg-slate-900/50 border-white/5">
                        <CardHeader>
                            <div className="flex justify-between">
                                <Skeleton className="h-12 w-12 rounded-xl bg-white/5" />
                                <Skeleton className="h-8 w-8 rounded-lg bg-white/5" />
                            </div>
                            <Skeleton className="h-6 w-32 bg-white/5 mt-4" />
                            <Skeleton className="h-4 w-24 bg-white/5" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-4 w-36 bg-white/5" />
                        </CardContent>
                    </Card>
                </motion.div>
            ))}
        </div>
    )
}
