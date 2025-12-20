"use client"

import { useEffect } from "react"
import { motion } from "framer-motion"
import { Shield, AlertTriangle, CheckCircle2 } from "lucide-react"
import Image from "next/image"
import { toast } from "sonner"

export default function AlreadySubmittedPage() {
    useEffect(() => {
        // Prevent back navigation
        window.history.replaceState(null, "", window.location.href)
        window.history.pushState(null, "", window.location.href)

        const handlePopState = () => {
            window.history.pushState(null, "", window.location.href)
        }

        window.addEventListener("popstate", handlePopState)

        return () => {
            window.removeEventListener("popstate", handlePopState)
        }
    }, [])

    const handleClose = () => {
        // Try to close the tab
        window.close()

        // Check if the window is still open after a small delay
        // If it is, the browser blocked the close, so show a toast
        setTimeout(() => {
            if (!window.closed) {
                toast.info("Automatic closing of tab not allowed. Please close it manually.", {
                    duration: 5000,
                })
            }
        }, 100)
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-amber-950/30 to-slate-950 relative flex items-center justify-center overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-amber-500/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-500/20 rounded-full blur-3xl animate-pulse delay-700" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl" />
            </div>

            {/* Grid pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:100px_100px]" />

            {/* Main Content */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, type: "spring" }}
                className="relative z-10 text-center px-6 max-w-lg"
            >
                {/* Shield Icon */}
                <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 150 }}
                    className="relative mx-auto mb-8"
                >
                    <div className="w-28 h-28 mx-auto rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-2xl shadow-amber-500/40">
                        <Shield className="w-14 h-14 text-white" strokeWidth={2} />
                    </div>
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.5 }}
                        className="absolute -bottom-1 -right-1 w-10 h-10 rounded-full bg-slate-800 border-2 border-amber-500 flex items-center justify-center"
                    >
                        <CheckCircle2 className="w-5 h-5 text-green-400" />
                    </motion.div>
                </motion.div>

                {/* Already Submitted Text */}
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-3xl lg:text-4xl font-bold text-white mb-4"
                >
                    Already Submitted!
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="text-xl text-white/70 mb-6"
                >
                    You have already submitted your feedback.
                </motion.p>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="text-white/50 mb-10 text-sm"
                >
                    Thank you for visiting us! Each visitor can only submit one feedback to ensure fair evaluation.
                </motion.p>

                {/* School Info */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="flex items-center justify-center gap-3 mb-10"
                >
                    <Image src="/logo.png" alt="Logo" width={40} height={40} className="rounded-xl" />
                    <span className="text-white/60 font-medium">South Point High School</span>
                </motion.div>

                {/* Warning Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="bg-amber-500/10 backdrop-blur-xl border border-amber-500/20 rounded-2xl p-6 mb-8"
                >
                    <div className="flex items-center gap-3 text-amber-400 mb-3">
                        <AlertTriangle className="w-5 h-5" />
                        <span className="font-semibold">One Feedback Per Visitor</span>
                    </div>
                    <p className="text-white/60 text-sm leading-relaxed">
                        Our system has detected that you have already submitted feedback from this device.
                        If you believe this is an error, please contact the exhibition desk.
                    </p>
                </motion.div>

                {/* Close Button */}
                <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    onClick={handleClose}
                    className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-semibold transition-all shadow-lg hover:shadow-xl"
                >
                    Close This Page
                </motion.button>

                {/* Footer text */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.1 }}
                    className="mt-8 text-white/30 text-xs"
                >
                    Platinum Exhibition 2025 • South Point High School
                </motion.p>
            </motion.div>
        </div>
    )
}
