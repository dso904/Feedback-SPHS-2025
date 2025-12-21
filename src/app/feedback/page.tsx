"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, ArrowRight, Check, Star, Loader2, Zap, Database, Shield, Cpu } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { toast } from "sonner"
import { USER_ROLES, RATING_LABELS, DEFAULT_QUESTIONS } from "@/lib/types"
import { SuccessAnimation } from "@/components/success-animation"
import { hasSubmittedFeedback, markFeedbackSubmitted } from "@/lib/feedback-guard"
import { getDeviceFingerprint, storeFingerprint } from "@/lib/fingerprint"
import ReCAPTCHA from "react-google-recaptcha"

interface Subject {
    id: string
    name: string
    icon: string
}

const STEPS = [
    { id: 1, title: "Identity", icon: "👤" },
    { id: 2, title: "Subject", icon: "📚" },
    { id: 3, title: "Rating", icon: "⭐" },
    { id: 4, title: "Confirm", icon: "✓" },
]

const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ""

export default function FeedbackPage() {
    const router = useRouter()
    const [currentStep, setCurrentStep] = useState(1)
    const [submitting, setSubmitting] = useState(false)
    const [showSuccess, setShowSuccess] = useState(false)
    const [subjects, setSubjects] = useState<Subject[]>([])
    const [loadingSubjects, setLoadingSubjects] = useState(true)
    const [countdown, setCountdown] = useState(20)
    const [captchaVerified, setCaptchaVerified] = useState(false)
    const [checkingStatus, setCheckingStatus] = useState(true)
    const [deviceFingerprint, setDeviceFingerprint] = useState<string | null>(null)

    const [formData, setFormData] = useState({
        userRole: "",
        subject: "",
        ratings: { q1: 0, q2: 0, q3: 0, q4: 0, q5: 0, q6: 0 },
        comment: "",
    })

    useEffect(() => {
        const checkProtectionAndSubmission = async () => {
            try {
                // Generate device fingerprint first
                const fingerprint = await getDeviceFingerprint()
                setDeviceFingerprint(fingerprint)

                // Call protection check API - it handles the toggle internally
                // If protection is OFF, it returns { allowed: true }
                // If protection is ON, it checks fingerprint + localStorage
                const res = await fetch("/api/protection/check", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ fingerprint })
                })
                const data = await res.json()

                // Only block if protection is enabled AND check failed
                if (!data.allowed) {
                    // Also check localStorage as a backup
                    router.replace("/already-submitted")
                } else if (data.reason === "protection_disabled") {
                    // Protection is OFF - allow regardless of localStorage
                    setCheckingStatus(false)
                } else if (hasSubmittedFeedback()) {
                    // Protection is ON and localStorage flag exists
                    router.replace("/already-submitted")
                } else {
                    setCheckingStatus(false)
                }
            } catch (error) {
                console.error("Protection check failed:", error)
                // On error, allow submission (fail open)
                setCheckingStatus(false)
            }
        }
        checkProtectionAndSubmission()
    }, [router])

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
            setLoadingSubjects(false)
        }
    }

    const progress = (currentStep / STEPS.length) * 100

    const canProceed = () => {
        switch (currentStep) {
            case 1: return formData.userRole !== ""
            case 2: return formData.subject !== ""
            case 3: return Object.values(formData.ratings).every(r => r > 0)
            default: return true
        }
    }

    const handleSubmit = async () => {
        if (!captchaVerified) {
            toast.error("Please complete the verification")
            return
        }

        setSubmitting(true)
        try {
            const avgRating = Object.values(formData.ratings).reduce((a, b) => a + b, 0) / 6
            const percent = Math.round((avgRating / 5) * 100)

            const res = await fetch("/api/feedback", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    user_role: formData.userRole,
                    subject: formData.subject,
                    q1: formData.ratings.q1,
                    q2: formData.ratings.q2,
                    q3: formData.ratings.q3,
                    q4: formData.ratings.q4,
                    q5: formData.ratings.q5,
                    q6: formData.ratings.q6,
                    comment: formData.comment,
                    percent,
                    fingerprint: deviceFingerprint, // Include fingerprint for server-side logging
                }),
            })

            if (!res.ok) throw new Error("Failed to submit")

            // Mark as submitted in local storage AND store fingerprint
            markFeedbackSubmitted()
            if (deviceFingerprint) {
                storeFingerprint(deviceFingerprint)
            }
            setShowSuccess(true)
        } catch {
            toast.error("Submission failed. Please try again.")
        } finally {
            setSubmitting(false)
        }
    }

    // Handle countdown and redirect separately
    useEffect(() => {
        if (!showSuccess) return

        if (countdown <= 0) {
            // Redirect to complete page (has "close this page" functionality)
            router.push("/complete")
            return
        }

        const timer = setTimeout(() => {
            setCountdown((c) => c - 1)
        }, 1000)

        return () => clearTimeout(timer)
    }, [showSuccess, countdown, router])

    if (checkingStatus) {
        return (
            <div className="min-h-screen bg-[#050508] flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-cyan-400 mx-auto mb-4" />
                    <p className="font-mono text-sm text-white/50 uppercase tracking-widest">Initializing System...</p>
                </div>
            </div>
        )
    }

    if (showSuccess) {
        const emailSubject = encodeURIComponent("Inquiry about Website Development - From SPHS Exhibition")
        const emailBody = encodeURIComponent(`Hello Team Hackminors,

I saw your work at the South Point High School Platinum Exhibition 2025 and I'm impressed with the feedback system design.

I would like to inquire about:
[ ] Website Development
[ ] Web Application
[ ] UI/UX Design
[ ] Other: ___________

Please get back to me at your earliest convenience.

Best regards,
[Your Name]
[Your Contact]`)
        const mailtoLink = `mailto:teamHackminors@gmail.com?subject=${emailSubject}&body=${emailBody}`

        return (
            <div className="min-h-screen bg-[#050508] flex items-center justify-center p-4 relative overflow-hidden">
                {/* Background */}
                <div className="absolute inset-0">
                    <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-cyan-500/20 rounded-full blur-[150px]" />
                    <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[150px]" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-pink-500/10 to-orange-500/10 rounded-full blur-[200px] animate-pulse" />
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(0,240,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,240,255,.02)_1px,transparent_1px)] bg-[size:50px_50px]" />
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.5, type: "spring" }}
                    className="relative z-10 w-full max-w-md"
                >
                    {/* Main Card */}
                    <div className="relative bg-[#0c0c16]/90 backdrop-blur-xl border border-cyan-500/20 rounded-2xl overflow-hidden">
                        {/* Top glow line */}
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500" />

                        {/* Success Badge */}
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                            className="flex justify-center -mt-1 pt-6"
                        >
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-cyan-500 rounded-full blur-lg opacity-50 animate-pulse" />
                                <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-cyan-500 flex items-center justify-center border-4 border-[#0c0c16]">
                                    <Check className="w-8 h-8 text-white" strokeWidth={3} />
                                </div>
                            </div>
                        </motion.div>

                        <div className="p-6 pt-4 text-center">
                            <motion.h2
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="font-orbitron text-xl font-bold text-white mb-2"
                            >
                                Thank You!
                            </motion.h2>
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                className="font-mono text-sm text-white/50 mb-6"
                            >
                                Your feedback has been recorded successfully
                            </motion.p>

                            {/* Advertisement Section */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                                className="relative p-5 rounded-xl bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-orange-500/10 border border-purple-500/20 mb-6"
                            >
                                {/* Sparkle decorations */}
                                <div className="absolute top-2 right-3 text-yellow-400 text-lg animate-pulse">✨</div>
                                <div className="absolute bottom-2 left-3 text-cyan-400 text-sm animate-pulse delay-300">⚡</div>

                                <p className="font-mono text-xs text-purple-400 uppercase tracking-widest mb-3">
                                    Liked the website design?
                                </p>
                                <p className="text-white/80 text-sm mb-4 leading-relaxed">
                                    This feedback system was crafted by <span className="text-cyan-400 font-semibold">Team Hackminors</span> —
                                    passionate students building amazing digital experiences.
                                </p>
                                <p className="font-mono text-xs text-white/40">
                                    We create websites, web apps, and UI/UX designs
                                </p>
                            </motion.div>

                            {/* Action Buttons */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 }}
                                className="space-y-3"
                            >
                                {/* Contact Us Button */}
                                <a
                                    href={mailtoLink}
                                    className="group relative w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold transition-all shadow-lg hover:shadow-purple-500/25"
                                >
                                    <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-400 to-pink-400 blur opacity-0 group-hover:opacity-30 transition-opacity" />
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    <span className="relative">Contact Us</span>
                                </a>

                                {/* No Thanks Button */}
                                <button
                                    onClick={() => router.push("/complete")}
                                    className="w-full px-6 py-2.5 rounded-lg text-white/50 hover:text-white/80 font-mono text-sm transition-colors hover:bg-white/5"
                                >
                                    No thanks, continue →
                                </button>
                            </motion.div>
                        </div>

                        {/* Footer with countdown */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.7 }}
                            className="px-6 py-4 border-t border-white/5 bg-white/[0.02]"
                        >
                            <div className="flex items-center justify-center gap-2 text-white/30">
                                <Loader2 className="w-3 h-3 animate-spin" />
                                <span className="font-mono text-xs">
                                    Auto-redirecting in {countdown}s...
                                </span>
                            </div>
                        </motion.div>
                    </div>

                    {/* Team Credit */}
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        className="text-center mt-4 font-mono text-xs text-white/20"
                    >
                        teamhackminors@gmail.com
                    </motion.p>
                </motion.div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#050508] relative">
            {/* Futuristic Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 -left-40 w-[500px] h-[500px] bg-cyan-500/15 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 -right-40 w-[500px] h-[500px] bg-purple-500/15 rounded-full blur-[120px]" />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(0,240,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,240,255,.02)_1px,transparent_1px)] bg-[size:50px_50px]" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(5,5,8,0.8)_100%)]" />
            </div>

            {/* Header */}
            <header className="relative z-10 p-4 lg:p-6 border-b border-cyan-500/10">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="relative">
                            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl blur opacity-30 group-hover:opacity-60 transition-opacity" />
                            <div className="relative p-1 rounded-xl bg-[#0a0a12] border border-cyan-500/20">
                                <Image src="/logo.png" alt="Logo" width={40} height={40} className="rounded-lg" />
                            </div>
                        </div>
                        <div className="hidden sm:block">
                            <span className="text-white font-semibold">South Point High School</span>
                            <div className="flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                                <span className="font-mono text-[10px] text-cyan-400/70 uppercase tracking-widest">Feedback System</span>
                            </div>
                        </div>
                    </Link>
                </div>
            </header>

            {/* Main Content */}
            <main className="relative z-10 px-4 pb-12 lg:px-6">
                <div className="max-w-2xl mx-auto">
                    {/* Step Progress */}
                    <div className="py-8">
                        <div className="flex justify-between mb-4">
                            {STEPS.map((step, index) => (
                                <div key={step.id} className="flex flex-col items-center flex-1">
                                    <div className="relative">
                                        {/* Connector line */}
                                        {index > 0 && (
                                            <div className={`absolute right-full top-1/2 -translate-y-1/2 w-[calc(100%-2rem)] h-px mr-4 ${currentStep > index ? 'bg-cyan-500' : 'bg-white/10'}`} />
                                        )}
                                        {/* Step circle */}
                                        <motion.div
                                            initial={{ scale: 0.8 }}
                                            animate={{ scale: currentStep === step.id ? 1.1 : 1 }}
                                            className={`relative w-10 h-10 rounded-full flex items-center justify-center font-orbitron text-sm font-bold transition-all ${currentStep > step.id
                                                ? "bg-gradient-to-br from-cyan-500 to-cyan-600 text-white shadow-[0_0_15px_rgba(0,240,255,0.5)]"
                                                : currentStep === step.id
                                                    ? "bg-[#0a0a12] border-2 border-cyan-500 text-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.3)]"
                                                    : "bg-white/5 border border-white/10 text-white/30"
                                                }`}
                                        >
                                            {currentStep > step.id ? <Check className="w-5 h-5" /> : step.id}
                                        </motion.div>
                                    </div>
                                    <span className={`mt-2 font-mono text-[10px] uppercase tracking-wider ${currentStep >= step.id ? 'text-cyan-400/80' : 'text-white/30'}`}>
                                        {step.title}
                                    </span>
                                </div>
                            ))}
                        </div>
                        {/* Progress bar */}
                        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-gradient-to-r from-cyan-500 to-purple-500"
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.3 }}
                            />
                        </div>
                    </div>

                    {/* Step Content Card */}
                    <div className="relative">
                        {/* Card glow */}
                        <div className="absolute -inset-px bg-gradient-to-r from-cyan-500/20 via-transparent to-purple-500/20 rounded-2xl blur-sm" />

                        <div className="relative bg-[#0c0c16]/80 backdrop-blur-xl border border-cyan-500/10 rounded-2xl p-6 lg:p-8">
                            {/* Corner accents */}
                            <div className="absolute top-0 left-0 w-5 h-5 border-l-2 border-t-2 border-cyan-500/40 rounded-tl-2xl" />
                            <div className="absolute bottom-0 right-0 w-5 h-5 border-r-2 border-b-2 border-cyan-500/40 rounded-br-2xl" />

                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentStep}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    {currentStep === 1 && (
                                        <StepOne
                                            value={formData.userRole}
                                            onChange={(role) => setFormData({ ...formData, userRole: role })}
                                        />
                                    )}
                                    {currentStep === 2 && (
                                        <StepTwo
                                            value={formData.subject}
                                            subjects={subjects}
                                            loading={loadingSubjects}
                                            onChange={(subject) => setFormData({ ...formData, subject })}
                                        />
                                    )}
                                    {currentStep === 3 && (
                                        <StepThree
                                            ratings={formData.ratings}
                                            comment={formData.comment}
                                            onChange={(ratings, comment) => setFormData({ ...formData, ratings: ratings as typeof formData.ratings, comment })}
                                        />
                                    )}
                                    {currentStep === 4 && (
                                        <StepFour
                                            formData={formData}
                                            onCaptchaChange={(verified) => setCaptchaVerified(verified)}
                                            siteKey={RECAPTCHA_SITE_KEY}
                                        />
                                    )}
                                </motion.div>
                            </AnimatePresence>

                            {/* Navigation */}
                            <div className="flex justify-between mt-8 pt-6 border-t border-white/5">
                                <button
                                    onClick={() => {
                                        if (currentStep === 1) {
                                            router.push('/')
                                        } else {
                                            setCurrentStep((s) => s - 1)
                                        }
                                    }}
                                    className="relative group px-5 py-2.5 overflow-hidden"
                                >
                                    <div className="absolute inset-0 border border-white/20 rounded-lg group-hover:border-cyan-500/50 transition-colors" />
                                    <span className="relative flex items-center gap-2 font-mono text-xs text-white/60 group-hover:text-cyan-400 uppercase tracking-wider transition-colors">
                                        <ArrowLeft className="w-4 h-4" />
                                        Back
                                    </span>
                                </button>

                                {currentStep < 4 ? (
                                    <button
                                        onClick={() => setCurrentStep((s) => s + 1)}
                                        disabled={!canProceed()}
                                        className="relative group px-6 py-2.5 overflow-hidden disabled:opacity-30 disabled:cursor-not-allowed"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-purple-600 rounded-lg" />
                                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <span className="relative flex items-center gap-2 font-mono text-xs text-white uppercase tracking-wider">
                                            Next
                                            <ArrowRight className="w-4 h-4" />
                                        </span>
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleSubmit}
                                        disabled={submitting || !captchaVerified}
                                        className="relative group px-6 py-2.5 overflow-hidden disabled:opacity-30 disabled:cursor-not-allowed"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-cyan-600 rounded-lg" />
                                        <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-cyan-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <span className="relative flex items-center gap-2 font-mono text-xs text-white uppercase tracking-wider">
                                            {submitting ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                    Transmitting...
                                                </>
                                            ) : (
                                                <>
                                                    <Zap className="w-4 h-4" />
                                                    Submit
                                                </>
                                            )}
                                        </span>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}

// Step 1: Role Selection
function StepOne({ value, onChange }: { value: string; onChange: (role: string) => void }) {
    return (
        <div>
            <div className="flex items-center gap-2 mb-2">
                <Shield className="w-5 h-5 text-cyan-400" />
                <h2 className="font-orbitron text-xl text-white tracking-wide">IDENTITY VERIFICATION</h2>
            </div>
            <p className="font-mono text-xs text-white/40 mb-6 uppercase tracking-wider">Select your role to proceed</p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {USER_ROLES.map((role, index) => (
                    <motion.button
                        key={role.value}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onChange(role.value)}
                        className={`relative p-4 rounded-xl border transition-all overflow-hidden group ${value === role.value
                            ? "bg-cyan-500/10 border-cyan-500 shadow-[0_0_15px_rgba(0,240,255,0.2)]"
                            : "bg-white/[0.02] border-white/10 hover:border-cyan-500/40"
                            }`}
                    >
                        {/* Corner accent */}
                        <div className={`absolute top-0 right-0 w-3 h-3 border-r border-t rounded-tr-xl transition-colors ${value === role.value ? 'border-cyan-400' : 'border-white/10'}`} />

                        <span className="text-2xl mb-2 block">{role.icon}</span>
                        <span className={`font-mono text-xs uppercase tracking-wider ${value === role.value ? 'text-cyan-400' : 'text-white/60'}`}>
                            {role.label}
                        </span>
                    </motion.button>
                ))}
            </div>
        </div>
    )
}

// Step 2: Subject Selection
function StepTwo({ value, subjects, loading, onChange }: { value: string; subjects: Subject[]; loading: boolean; onChange: (subject: string) => void }) {
    return (
        <div>
            <div className="flex items-center gap-2 mb-2">
                <Database className="w-5 h-5 text-purple-400" />
                <h2 className="font-orbitron text-xl text-white tracking-wide">SELECT MODULE</h2>
            </div>
            <p className="font-mono text-xs text-white/40 mb-6 uppercase tracking-wider">Choose the subject to evaluate</p>

            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
                    <span className="font-mono text-xs text-white/40 ml-3 uppercase">Loading modules...</span>
                </div>
            ) : subjects.length === 0 ? (
                <div className="text-center py-12 text-white/40">
                    <p className="font-mono text-sm">No subjects available</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[400px] overflow-y-auto pr-2">
                    {subjects.map((subject, index) => (
                        <motion.button
                            key={subject.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.03 }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => onChange(subject.name)}
                            className={`relative p-4 rounded-xl border transition-all ${value === subject.name
                                ? "bg-purple-500/10 border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.2)]"
                                : "bg-white/[0.02] border-white/10 hover:border-purple-500/40"
                                }`}
                        >
                            <span className="text-2xl mb-2 block">{subject.icon}</span>
                            <span className={`font-mono text-xs uppercase tracking-wider ${value === subject.name ? 'text-purple-400' : 'text-white/60'}`}>
                                {subject.name}
                            </span>
                        </motion.button>
                    ))}
                </div>
            )}
        </div>
    )
}

// Step 3: Rating
function StepThree({ ratings, comment, onChange }: { ratings: Record<string, number>; comment: string; onChange: (ratings: Record<string, number>, comment: string) => void }) {
    const updateRating = (key: string, value: number) => {
        onChange({ ...ratings, [key]: value }, comment)
    }

    const questions = [
        { key: 'q1', question: DEFAULT_QUESTIONS.q1 },
        { key: 'q2', question: DEFAULT_QUESTIONS.q2 },
        { key: 'q3', question: DEFAULT_QUESTIONS.q3 },
        { key: 'q4', question: DEFAULT_QUESTIONS.q4 },
        { key: 'q5', question: DEFAULT_QUESTIONS.q5 },
        { key: 'q6', question: DEFAULT_QUESTIONS.q6 },
    ]

    const getRatingLabel = (rating: number): string => {
        if (rating >= 1 && rating <= 5) {
            return RATING_LABELS[rating - 1]
        }
        return "Not rated"
    }

    return (
        <div>
            <div className="flex items-center gap-2 mb-2">
                <Star className="w-5 h-5 text-yellow-400" />
                <h2 className="font-orbitron text-xl text-white tracking-wide">RATE EXPERIENCE</h2>
            </div>
            <p className="font-mono text-xs text-white/40 mb-6 uppercase tracking-wider">Provide your evaluation metrics</p>

            <div className="space-y-4">
                {questions.map((q, index) => (
                    <motion.div
                        key={q.key}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="p-4 rounded-xl bg-white/[0.02] border border-white/5"
                    >
                        <p className="font-mono text-xs text-white/50 uppercase tracking-wider mb-3">{q.question}</p>
                        <div className="flex items-center justify-between">
                            <div className="flex gap-1.5">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <motion.button
                                        key={star}
                                        whileHover={{ scale: 1.2 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => updateRating(q.key, star)}
                                        className="p-1"
                                    >
                                        <Star
                                            className={`w-7 h-7 transition-colors ${star <= (ratings[q.key] || 0)
                                                ? "text-yellow-400 fill-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]"
                                                : "text-white/20 hover:text-yellow-400/50"
                                                }`}
                                        />
                                    </motion.button>
                                ))}
                            </div>
                            <span className={`font-mono text-xs uppercase tracking-wider ${ratings[q.key] ? 'text-cyan-400' : 'text-white/30'}`}>
                                {getRatingLabel(ratings[q.key] || 0)}
                            </span>
                        </div>
                    </motion.div>
                ))}

                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                    <p className="font-mono text-xs text-white/50 uppercase tracking-wider mb-3">Additional Notes (Optional)</p>
                    <Textarea
                        value={comment}
                        onChange={(e) => onChange(ratings, e.target.value)}
                        placeholder="Enter additional observations..."
                        className="bg-transparent border-white/10 text-white placeholder:text-white/20 font-mono text-sm min-h-20 focus:border-cyan-500/50"
                    />
                </div>
            </div>
        </div>
    )
}

// Step 4: Confirmation
function StepFour({
    formData,
    onCaptchaChange,
    siteKey
}: {
    formData: { userRole: string; subject: string; ratings: Record<string, number>; comment: string }
    onCaptchaChange: (verified: boolean) => void
    siteKey: string
}) {
    const avgRating = Object.values(formData.ratings).reduce((a, b) => a + b, 0) / 6
    const percent = Math.round((avgRating / 5) * 100)

    const handleCaptcha = (token: string | null) => {
        onCaptchaChange(!!token)
    }

    return (
        <div>
            <div className="flex items-center gap-2 mb-2">
                <Cpu className="w-5 h-5 text-green-400" />
                <h2 className="font-orbitron text-xl text-white tracking-wide">CONFIRM TRANSMISSION</h2>
            </div>
            <p className="font-mono text-xs text-white/40 mb-6 uppercase tracking-wider">Review data before submission</p>

            <div className="space-y-4">
                {/* Summary Grid */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/20">
                        <p className="font-mono text-[10px] text-cyan-400/60 uppercase tracking-widest mb-1">Identity</p>
                        <p className="font-mono text-sm text-white">{formData.userRole}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/20">
                        <p className="font-mono text-[10px] text-purple-400/60 uppercase tracking-widest mb-1">Module</p>
                        <p className="font-mono text-sm text-white">{formData.subject}</p>
                    </div>
                </div>

                {/* Score Display */}
                <div className="p-5 rounded-xl bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-cyan-500/20">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-mono text-xs text-white/40 uppercase tracking-widest mb-1">Overall Score</p>
                            <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                        key={star}
                                        className={`w-5 h-5 ${star <= Math.round(avgRating) ? "text-yellow-400 fill-yellow-400" : "text-white/20"}`}
                                    />
                                ))}
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="font-orbitron text-4xl font-bold text-cyan-400">{percent}%</p>
                        </div>
                    </div>
                </div>

                {formData.comment && (
                    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                        <p className="font-mono text-[10px] text-white/40 uppercase tracking-widest mb-2">Notes</p>
                        <p className="font-mono text-sm text-white/70">{formData.comment}</p>
                    </div>
                )}

                {/* reCAPTCHA */}
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col items-center">
                    <p className="font-mono text-xs text-white/40 uppercase tracking-widest mb-3">Human Verification Required</p>
                    {siteKey ? (
                        <ReCAPTCHA
                            sitekey={siteKey}
                            onChange={handleCaptcha}
                            theme="dark"
                        />
                    ) : (
                        <p className="font-mono text-xs text-yellow-400">⚠️ reCAPTCHA not configured</p>
                    )}
                </div>
            </div>
        </div>
    )
}
