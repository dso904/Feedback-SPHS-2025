"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import confetti from "canvas-confetti"

interface SuccessAnimationProps {
    show: boolean
    onComplete?: () => void
    message?: string
}

export function SuccessAnimation({ show, onComplete, message = "Success!" }: SuccessAnimationProps) {
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        if (show) {
            setVisible(true)
            // Trigger confetti
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                colors: ["#8b5cf6", "#06b6d4", "#ec4899", "#f59e0b"],
            })

            // Auto hide after 2 seconds
            const timer = setTimeout(() => {
                setVisible(false)
                onComplete?.()
            }, 2000)

            return () => clearTimeout(timer)
        }
    }, [show, onComplete])

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
                >
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.5, opacity: 0 }}
                        className="bg-slate-900 border border-white/10 rounded-2xl p-8 text-center"
                    >
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", damping: 10, delay: 0.1 }}
                            className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center"
                        >
                            <motion.svg
                                viewBox="0 0 24 24"
                                className="w-10 h-10 text-white"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                            >
                                <motion.path
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M5 13l4 4L19 7"
                                />
                            </motion.svg>
                        </motion.div>
                        <motion.h2
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="text-2xl font-bold text-white"
                        >
                            {message}
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="text-white/60 mt-2"
                        >
                            Thank you for your feedback!
                        </motion.p>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
